"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getReservationSettings(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify user owns this restaurant
    const restaurant = await db.offering.findFirst({
        where: {
            id: restaurantId,
            hostId: userId,
        },
    });

    if (!restaurant) {
        throw new Error("Restaurant not found or unauthorized");
    }

    // Get or create settings
    let settings = await db.reservationSettings.findUnique({
        where: { restaurantId },
    });

    if (!settings) {
        // Create default settings
        settings = await db.reservationSettings.create({
            data: {
                restaurantId,
                confirmationMode: "AUTO",
                requireCreditCard: false,
                requirePrepayment: false,
                noShowCharge: 0,
                send24hReminder: true,
                send2hReminder: true,
                sendReviewRequest: true,
                reviewRequestDelay: 24,
            },
        });
    }

    return settings;
}

export async function updateReservationSettings(
    restaurantId: string,
    data: {
        confirmationMode: "MANUAL" | "AUTO" | "AUTO_GUARANTEE";
        requireCreditCard: boolean;
        requirePrepayment: boolean;
        noShowCharge: number;
        send24hReminder: boolean;
        send2hReminder: boolean;
        sendReviewRequest: boolean;
        reviewRequestDelay: number;
        cancellationPolicy?: any;
    }
) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const restaurant = await db.offering.findFirst({
        where: {
            id: restaurantId,
            hostId: userId,
        },
    });

    if (!restaurant) {
        throw new Error("Restaurant not found or unauthorized");
    }

    const settings = await db.reservationSettings.upsert({
        where: { restaurantId },
        create: {
            restaurantId,
            ...data,
        },
        update: data,
    });

    revalidatePath(`/dashboard/restaurant/settings`);
    return settings;
}

export async function confirmReservation(bookingId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const booking = await db.booking.findFirst({
        where: {
            id: bookingId,
            offering: {
                hostId: userId,
            },
        },
        include: {
            offering: true,
            instance: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    // Update booking status
    const updated = await db.booking.update({
        where: { id: bookingId },
        data: {
            status: "CONFIRMED",
            confirmationMode: "MANUAL",
        },
    });

    // TODO: Send confirmation email
    // await sendEmail({
    //     to: booking.guestEmail,
    //     subject: "Reservation Confirmed",
    //     template: getReservationConfirmationEmail(booking)
    // });

    revalidatePath(`/dashboard/restaurant/reservations`);
    return updated;
}

export async function checkInGuest(bookingId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const booking = await db.booking.findFirst({
        where: {
            id: bookingId,
            offering: {
                hostId: userId,
            },
        },
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    const updated = await db.booking.update({
        where: { id: bookingId },
        data: {
            status: "CHECKED_IN",
            checkInTime: new Date(),
        },
    });

    revalidatePath(`/dashboard/restaurant/reservations`);
    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return updated;
}

export async function checkOutGuest(bookingId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const booking = await db.booking.findFirst({
        where: {
            id: bookingId,
            offering: {
                hostId: userId,
            },
        },
        include: {
            guest: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    const updated = await db.booking.update({
        where: { id: bookingId },
        data: {
            status: "COMPLETED",
            checkOutTime: new Date(),
        },
    });

    // Update guest metrics if guest exists
    if (booking.guestId) {
        await db.guest.update({
            where: { id: booking.guestId },
            data: {
                completedBookings: { increment: 1 },
                totalSpent: { increment: booking.totalAmount },
                lastVisit: new Date(),
            },
        });

        // Recalculate average spend
        const guest = await db.guest.findUnique({
            where: { id: booking.guestId },
        });

        if (guest && guest.completedBookings > 0) {
            await db.guest.update({
                where: { id: booking.guestId },
                data: {
                    averageSpend: Number(guest.totalSpent) / guest.completedBookings,
                },
            });
        }
    }

    revalidatePath(`/dashboard/restaurant/reservations`);
    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return updated;
}

export async function markNoShow(bookingId: string, chargeAmount?: number) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const booking = await db.booking.findFirst({
        where: {
            id: bookingId,
            offering: {
                hostId: userId,
            },
        },
        include: {
            guest: true,
        },
    });

    if (!booking) {
        throw new Error("Booking not found or unauthorized");
    }

    const updated = await db.booking.update({
        where: { id: bookingId },
        data: {
            status: "NO_SHOW",
        },
    });

    // Update guest metrics
    if (booking.guestId) {
        await db.guest.update({
            where: { id: booking.guestId },
            data: {
                noShows: { increment: 1 },
            },
        });
    }

    // TODO: Process no-show charge if chargeAmount provided and payment method available
    // if (chargeAmount && booking.stripePaymentIntentId) {
    //     await stripe.paymentIntents.capture(booking.stripePaymentIntentId, {
    //         amount_to_capture: chargeAmount * 100
    //     });
    // }

    revalidatePath(`/dashboard/restaurant/reservations`);
    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return updated;
}

export async function addWalkIn(data: {
    restaurantId: string;
    instanceId: string;
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
    partySize: number;
    tableId?: string;
}) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const restaurant = await db.offering.findFirst({
        where: {
            id: data.restaurantId,
            hostId: userId,
        },
    });

    if (!restaurant) {
        throw new Error("Restaurant not found or unauthorized");
    }

    // Split name into first and last
    const nameParts = data.guestName.trim().split(" ");
    const firstName = nameParts[0] || "Guest";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Create or find guest
    let guest = null;
    if (data.guestEmail) {
        guest = await db.guest.upsert({
            where: {
                email_restaurantId: {
                    email: data.guestEmail,
                    restaurantId: data.restaurantId,
                },
            },
            create: {
                email: data.guestEmail,
                phone: data.guestPhone,
                firstName,
                lastName,
                restaurantId: data.restaurantId,
                totalBookings: 1,
            },
            update: {
                totalBookings: { increment: 1 },
                phone: data.guestPhone || undefined,
            },
        });
    }

    // Create booking
    const booking = await db.booking.create({
        data: {
            instanceId: data.instanceId,
            offeringId: data.restaurantId,
            guestName: data.guestName,
            guestEmail: data.guestEmail || `walkin-${Date.now()}@temp.local`,
            guestPhone: data.guestPhone,
            partySize: data.partySize,
            isWalkIn: true,
            status: "CHECKED_IN",
            checkInTime: new Date(),
            tableId: data.tableId,
            guestId: guest?.id,
            baseAmount: 0,
            totalAmount: 0,
            paymentStatus: "CAPTURED", // Walk-ins pay at table
        },
    });

    revalidatePath(`/dashboard/restaurant/reservations`);
    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return booking;
}
