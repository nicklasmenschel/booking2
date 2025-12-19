"use server";

import { db } from "@/lib/db";
// Prisma type no longer needed, using `any` for transaction client
import { generateBookingNumber } from "@/lib/utils";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import QRCode from "qrcode";

// ============================================================================
// BOOKING CREATION
// ============================================================================

export async function createBooking(input: CreateBookingInput) {
    try {
        // Validate input
        const validatedData = createBookingSchema.parse(input);

        // Get authenticated user (optional for guest checkout)
        const { userId: clerkId } = await auth();
        let userId: string | null = null;

        if (clerkId) {
            const user = await db.user.findUnique({
                where: { clerkId },
            });
            userId = user?.id || null;
        }

        // Use transaction with optimistic locking
        const result = await db.$transaction(async (tx: any) => {
            // Get instance with current version
            const instance = await tx.eventInstance.findUnique({
                where: { id: validatedData.instanceId },
                include: {
                    offering: true,
                    bookingHolds: {
                        where: {
                            expiresAt: { gt: new Date() },
                        },
                    },
                },
            });

            if (!instance) {
                throw new Error("Event not found");
            }

            if (instance.status === "CANCELLED") {
                throw new Error("This event has been cancelled");
            }

            // Calculate effective available spots (accounting for holds)
            const totalHeld = instance.bookingHolds.reduce(
                (sum: number, hold: { guestCount: number }) => sum + hold.guestCount,
                0
            );
            const effectiveAvailable = instance.availableSpots - totalHeld;

            if (effectiveAvailable < validatedData.guestCount) {
                throw new Error(
                    effectiveAvailable === 0
                        ? "This event is sold out"
                        : `Only ${effectiveAvailable} spots available`
                );
            }

            // Check party size limits
            const offering = instance.offering;
            if (offering.minPartySize && validatedData.guestCount < offering.minPartySize) {
                throw new Error(`Minimum party size is ${offering.minPartySize}`);
            }
            if (offering.maxPartySize && validatedData.guestCount > offering.maxPartySize) {
                throw new Error(`Maximum party size is ${offering.maxPartySize}`);
            }

            // Calculate pricing
            let unitPrice = Number(offering.basePrice);
            if (validatedData.ticketTierId) {
                const tier = await tx.ticketTier.findUnique({
                    where: { id: validatedData.ticketTierId },
                });
                if (tier) {
                    unitPrice = Number(tier.price);
                }
            }

            const baseAmount = unitPrice * validatedData.guestCount;
            const taxAmount = 0; // TODO: Implement tax calculation
            const serviceFeeAmount = 0; // Absorbed by host in free tier
            const totalAmount = baseAmount + taxAmount + serviceFeeAmount;

            // Generate unique booking number
            let bookingNumber = generateBookingNumber();
            let attempts = 0;
            while (attempts < 5) {
                const existing = await tx.booking.findUnique({
                    where: { bookingNumber },
                });
                if (!existing) break;
                bookingNumber = generateBookingNumber();
                attempts++;
            }

            // Generate QR code
            const qrData = JSON.stringify({
                bn: bookingNumber,
                iid: instance.id,
            });
            const qrCode = await QRCode.toDataURL(qrData, {
                width: 300,
                margin: 2,
                color: {
                    dark: "#000000",
                    light: "#ffffff",
                },
            });

            // Create Stripe PaymentIntent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(totalAmount * 100), // Amount in cents
                currency: offering.currency.toLowerCase(),
                metadata: {
                    bookingNumber,
                    instanceId: instance.id,
                    offeringId: offering.id,
                    userId: userId || "",
                    guestName: validatedData.guestName,
                    guestEmail: validatedData.guestEmail,
                    guestCount: validatedData.guestCount.toString(),
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            // Create booking with PENDING status and stripePaymentIntentId
            const newBooking = await tx.booking.create({
                data: {
                    bookingNumber,
                    instanceId: instance.id,
                    offeringId: offering.id,
                    userId,
                    guestName: validatedData.guestName,
                    guestEmail: validatedData.guestEmail,
                    guestPhone: validatedData.guestPhone,
                    guestCount: validatedData.guestCount,
                    specialRequests: validatedData.specialRequests,
                    tags: validatedData.tags || [],
                    ticketTierId: validatedData.ticketTierId,
                    customAnswers: validatedData.customAnswers as any,
                    baseAmount,
                    taxAmount,
                    serviceFeeAmount,
                    totalAmount,
                    stripePaymentIntentId: paymentIntent.id,
                    paymentStatus: "PENDING", // Confirmed via webhook or client-side check
                    status: "CONFIRMED", // We reserve the spot immediately
                    qrCode,
                },
            });

            // Update instance with optimistic locking
            const newAvailable = instance.availableSpots - validatedData.guestCount;
            const newStatus =
                newAvailable === 0
                    ? "SOLD_OUT"
                    : newAvailable < instance.capacity * 0.3
                        ? "LIMITED"
                        : "AVAILABLE";

            const updated = await tx.eventInstance.updateMany({
                where: {
                    id: instance.id,
                    version: instance.version,
                },
                data: {
                    availableSpots: newAvailable,
                    status: newStatus,
                    version: { increment: 1 },
                },
            });

            if (updated.count === 0) {
                throw new Error("Please try again - another booking was made simultaneously");
            }

            // Update offering stats
            await tx.offering.update({
                where: { id: offering.id },
                data: {
                    totalBookings: { increment: 1 },
                    totalRevenue: { increment: totalAmount },
                },
            });

            // Update user stats if logged in
            if (userId) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        totalBookings: { increment: 1 },
                        totalSpent: { increment: totalAmount },
                    },
                });
            }

            return {
                booking: newBooking,
                clientSecret: paymentIntent.client_secret,
            };
        });

        // Revalidate paths
        const instance = await db.eventInstance.findUnique({
            where: { id: validatedData.instanceId },
            include: { offering: true },
        });

        if (instance) {
            revalidatePath(`/e/${instance.offering.slug}`);
            revalidatePath("/dashboard");
        }

        return {
            success: true,
            data: {
                id: result.booking.id,
                bookingNumber: result.booking.bookingNumber,
                qrCode: result.booking.qrCode,
                clientSecret: result.clientSecret,
            },
        };

    } catch (error) {
        console.error("Error creating booking:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create booking",
        };
    }
}

// ============================================================================
// BOOKING HOLDS (for checkout flow)
// ============================================================================

export async function createBookingHold(
    instanceId: string,
    guestCount: number,
    sessionId: string
) {
    try {
        const instance = await db.eventInstance.findUnique({
            where: { id: instanceId },
            include: {
                bookingHolds: {
                    where: {
                        expiresAt: { gt: new Date() },
                    },
                },
            },
        });

        if (!instance) {
            return { success: false, error: "Event not found" };
        }

        // Calculate effective available
        const totalHeld = instance.bookingHolds.reduce(
            (sum: number, hold: { guestCount: number }) => sum + hold.guestCount,
            0
        );
        const effectiveAvailable = instance.availableSpots - totalHeld;

        if (effectiveAvailable < guestCount) {
            return { success: false, error: "Not enough spots available" };
        }

        // Delete any existing hold for this session
        await db.bookingHold.deleteMany({
            where: { sessionId },
        });

        // Create new hold (10 minutes)
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);

        const hold = await db.bookingHold.create({
            data: {
                instanceId,
                sessionId,
                guestCount,
                expiresAt,
            },
        });

        return {
            success: true,
            data: {
                holdId: hold.id,
                expiresAt: hold.expiresAt,
            },
        };

    } catch (error) {
        console.error("Error creating booking hold:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to reserve spots",
        };
    }
}

export async function releaseBookingHold(sessionId: string) {
    try {
        await db.bookingHold.deleteMany({
            where: { sessionId },
        });
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

// ============================================================================
// BOOKING RETRIEVAL
// ============================================================================

export async function getBookingByNumber(bookingNumber: string) {
    try {
        const booking = await db.booking.findUnique({
            where: { bookingNumber },
            include: {
                instance: true,
                offering: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        coverImage: true,
                        address: true,
                        city: true,
                        state: true,
                        isVirtual: true,
                        virtualUrl: true,
                    },
                },
                ticketTier: true,
            },
        });

        return booking;

    } catch (error) {
        console.error("Error fetching booking:", error);
        return null;
    }
}

export async function getUserBookings() {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found", data: [] };
        }

        const bookings = await db.booking.findMany({
            where: { userId: user.id },
            include: {
                instance: true,
                offering: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        coverImage: true,
                        address: true,
                        city: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return { success: true, data: bookings };

    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch bookings",
            data: [],
        };
    }
}

export async function getInstanceBookings(instanceId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found", data: [] };
        }

        // Verify user is host of this instance
        const instance = await db.eventInstance.findUnique({
            where: { id: instanceId },
            include: { offering: true },
        });

        if (!instance || instance.offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized", data: [] };
        }

        const bookings = await db.booking.findMany({
            where: { instanceId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        dietaryRestrictions: true,
                        allergies: true,
                    },
                },
                ticketTier: true,
                notes: true,
            },
            orderBy: { createdAt: "asc" },
        });

        return { success: true, data: bookings };

    } catch (error) {
        console.error("Error fetching instance bookings:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch bookings",
            data: [],
        };
    }
}

// ============================================================================
// BOOKING MANAGEMENT
// ============================================================================

export async function checkInGuest(bookingId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                offering: true,
            },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await db.booking.update({
            where: { id: bookingId },
            data: {
                checkedIn: true,
                checkedInAt: new Date(),
                status: "CHECKED_IN",
            },
        });

        revalidatePath("/dashboard");

        return { success: true };

    } catch (error) {
        console.error("Error checking in guest:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to check in guest",
        };
    }
}

export async function cancelBooking(bookingId: string, reason?: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                instance: true,
                offering: true,
            },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        // Check if user is either the guest or the host
        const isGuest = booking.userId === user.id;
        const isHost = booking.offering.hostId === user.id;

        if (!isGuest && !isHost) {
            return { success: false, error: "Unauthorized" };
        }

        // Calculate refund based on cancellation policy
        let refundAmount = 0;
        const now = new Date();
        const eventDate = booking.instance.startTime;
        const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (booking.offering.cancellationPolicy === "FLEXIBLE" && hoursUntilEvent > 24) {
            refundAmount = Number(booking.totalAmount);
        } else if (booking.offering.cancellationPolicy === "MODERATE" && hoursUntilEvent > 168) { // 7 days
            refundAmount = Number(booking.totalAmount);
        } else if (booking.offering.cancellationPolicy === "STRICT" && hoursUntilEvent > 336) { // 14 days
            refundAmount = Number(booking.totalAmount);
        } else if (isHost) {
            // Host cancellation = full refund
            refundAmount = Number(booking.totalAmount);
        }

        // Use transaction to update booking and instance
        const updatedInstance = await db.$transaction(async (tx: any) => {
            // Cancel booking
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CANCELLED",
                    cancelledAt: new Date(),
                },
            });

            // Restore available spots
            const instance = await tx.eventInstance.update({
                where: { id: booking.instanceId },
                data: {
                    availableSpots: { increment: booking.guestCount },
                    status: "AVAILABLE",
                },
            });

            // Record modification
            await tx.bookingModification.create({
                data: {
                    bookingId,
                    modificationType: isHost ? "HOST_CANCELLATION" : "CANCELLATION",
                    oldValue: { status: booking.status },
                    newValue: { status: "CANCELLED" },
                    reason,
                    modifiedBy: isHost ? "HOST" : "USER",
                    refundAmount: refundAmount > 0 ? refundAmount : null,
                    refundStatus: refundAmount > 0 ? "PENDING" : null,
                },
            });

            // Update offering stats
            await tx.offering.update({
                where: { id: booking.offeringId },
                data: {
                    totalBookings: { decrement: 1 },
                    totalRevenue: { decrement: Number(booking.totalAmount) },
                },
            });

            return instance;
        });

        // Process Stripe refund
        if (refundAmount > 0 && booking.stripePaymentIntentId) {
            try {
                const { stripe } = await import("@/lib/stripe");
                await stripe.refunds.create({
                    payment_intent: booking.stripePaymentIntentId,
                    amount: Math.round(refundAmount * 100), // Stripe uses cents
                });

                // Update refund status
                await db.bookingModification.updateMany({
                    where: { bookingId, refundStatus: "PENDING" },
                    data: { refundStatus: "COMPLETED", refundedAt: new Date() }
                });
            } catch (refundError) {
                console.error("Refund failed:", refundError);
                await db.bookingModification.updateMany({
                    where: { bookingId, refundStatus: "PENDING" },
                    data: { refundStatus: "FAILED" }
                });
            }
        }

        // Send cancellation email
        const { sendEmail } = await import("@/lib/email");
        await sendEmail({
            to: booking.guestEmail,
            subject: `Booking Cancelled: ${booking.offering.name}`,
            html: `
                <h1>Your booking has been cancelled</h1>
                <p>Your booking #${booking.bookingNumber} for ${booking.offering.name} has been cancelled.</p>
                ${refundAmount > 0 ? `<p>A refund of $${refundAmount.toFixed(2)} will be processed within 5-10 business days.</p>` : ''}
            `
        });

        // Trigger waitlist processing
        const { processWaitlist } = await import("@/jobs/process-waitlist");
        await processWaitlist({
            instanceId: booking.instanceId,
            spotsAvailable: updatedInstance.availableSpots
        });

        revalidatePath("/dashboard");
        revalidatePath(`/e/${booking.offering.slug}`);

        return { success: true, refunded: refundAmount > 0 };

    } catch (error) {
        console.error("Error cancelling booking:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel booking",
        };
    }
}

export async function markNoShow(bookingId: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { offering: true },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await db.booking.update({
            where: { id: bookingId },
            data: {
                status: "NO_SHOW",
            },
        });

        // Increment guest's no-show count
        if (booking.userId) {
            await db.user.update({
                where: { id: booking.userId },
                data: {
                    noShowCount: { increment: 1 },
                },
            });
        }

        revalidatePath("/dashboard");

        return { success: true };

    } catch (error) {
        console.error("Error marking no-show:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to mark no-show",
        };
    }
}

// ============================================================================
// BOOKING NOTES
// ============================================================================

export async function addBookingNote(bookingId: string, note: string) {
    try {
        const { userId: clerkId } = await auth();
        if (!clerkId) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await db.user.findUnique({
            where: { clerkId },
        });

        if (!user) {
            return { success: false, error: "User not found" };
        }

        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: { offering: true },
        });

        if (!booking) {
            return { success: false, error: "Booking not found" };
        }

        if (booking.offering.hostId !== user.id) {
            return { success: false, error: "Unauthorized" };
        }

        await db.bookingNote.create({
            data: {
                bookingId,
                note,
                addedBy: user.id,
            },
        });

        return { success: true };

    } catch (error) {
        console.error("Error adding booking note:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to add note",
        };
    }
}
