'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
    processRefund,
    processPartialRefund,
    chargeAdditionalAmount,
    calculateRefundAmount
} from '@/lib/stripe';
import { sendEmail } from '@/lib/email';
import { differenceInHours } from 'date-fns';

/**
 * Modify party size for a booking
 */
export async function modifyPartySize(bookingId: string, newPartySize: number) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Get booking with relations
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                instance: true,
                offering: true,
                user: true,
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        //Verify ownership
        if (booking.user?.clerkId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Check if modification is allowed (not within 48 hours)
        const hoursUntilEvent = differenceInHours(
            booking.instance.startTime,
            new Date()
        );

        if (hoursUntilEvent < 48) {
            return {
                success: false,
                error: 'Changes not allowed within 48 hours of event'
            };
        }

        const oldPartySize = booking.guestCount;
        const sizeDifference = newPartySize - oldPartySize;

        // If increasing, check availability
        if (sizeDifference > 0) {
            if (booking.instance.availableSpots < sizeDifference) {
                return {
                    success: false,
                    error: `Only ${booking.instance.availableSpots} spots available`
                };
            }
        }

        // Calculate price difference
        const pricePerPerson = Number(booking.offering.basePrice);
        const priceDifference = sizeDifference * pricePerPerson;

        // Use transaction for atomic updates
        const result = await db.$transaction(async (tx) => {
            // Update booking
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    guestCount: newPartySize,
                    baseAmount: pricePerPerson * newPartySize,
                    totalAmount: {
                        increment: priceDifference,
                    },
                },
            });

            // Update instance capacity
            await tx.eventInstance.update({
                where: { id: booking.instanceId },
                data: {
                    availableSpots: {
                        increment: -sizeDifference, // Positive if increasing, negative if decreasing
                    },
                },
            });

            // Create modification record
            await tx.bookingModification.create({
                data: {
                    bookingId,
                    modificationType: sizeDifference > 0
                        ? 'PARTY_SIZE_INCREASE'
                        : 'PARTY_SIZE_DECREASE',
                    oldValue: { partySize: oldPartySize },
                    newValue: { partySize: newPartySize },
                    modifiedBy: userId,
                },
            });

            return { updatedBooking, priceDifference };
        });

        // Process payment/refund
        if (priceDifference > 0) {
            // Charge additional amount
            if (booking.user?.stripeCustomerId && booking.user.defaultPaymentMethod) {
                const chargeResult = await chargeAdditionalAmount(
                    booking.user.stripeCustomerId,
                    booking.user.defaultPaymentMethod,
                    priceDifference,
                    {
                        bookingId,
                        type: 'party_size_increase',
                    }
                );

                if (!chargeResult.success) {
                    return { success: false, error: 'Payment failed. Please update payment method.' };
                }
            }
        } else if (priceDifference < 0) {
            // Process refund
            if (booking.stripePaymentIntentId) {
                await processPartialRefund(
                    booking.stripePaymentIntentId,
                    Math.abs(priceDifference)
                );


                await db.bookingModification.updateMany({
                    where: { bookingId },
                    data: {
                        refundAmount: Math.abs(priceDifference),
                        refundStatus: 'COMPLETED',
                        refundedAt: new Date(),
                    },
                });
            }
        }

        // Send confirmation email
        await sendEmail({
            to: booking.guestEmail,
            subject: 'Booking Updated',
            html: `
        <h2>Your booking has been updated</h2>
        <p>Party size changed from ${oldPartySize} to ${newPartySize} guests.</p>
        ${priceDifference > 0
                    ? `<p>Additional charge: $${priceDifference.toFixed(2)}</p>`
                    : priceDifference < 0
                        ? `<p>Refund: $${Math.abs(priceDifference).toFixed(2)}</p>`
                        : ''
                }
      `,
        });

        revalidatePath(`/booking/${booking.bookingNumber}`);
        revalidatePath('/dashboard');

        return { success: true, priceDifference };
    } catch (error: any) {
        console.error('Modify party size error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Change booking date/time
 */
export async function changeBookingDate(bookingId: string, newInstanceId: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                instance: true,
                offering: true,
                user: true,
            },
        });

        if (!booking) {
            return { success: false, error: 'Booking not found' };
        }

        if (booking.user?.clerkId !== userId) {
            return { success: false, error: 'Unauthorized' };
        }

        // Check if modification is allowed
        const hoursUntilEvent = differenceInHours(
            booking.instance.startTime,
            new Date()
        );

        if (hoursUntilEvent < 48) {
            return {
                success: false,
                error: 'Changes not allowed within 48 hours of event'
            };
        }

        // Get new instance
        const newInstance = await db.eventInstance.findUnique({
            where: { id: newInstanceId },
        });

        if (!newInstance) {
            return { success: false, error: 'New date not found' };
        }

        // Check availability
        if (newInstance.availableSpots < booking.guestCount) {
            return { success: false, error: 'Not enough spots available for new date' };
        }

        // Calculate price difference if any
        const oldPrice = Number(booking.baseAmount);
        const newPrice = newInstance.priceOverride
            ? Number(newInstance.priceOverride) * booking.guestCount
            : Number(booking.offering.basePrice) * booking.guestCount;
        const priceDifference = newPrice - oldPrice;

        // Transaction
        const result = await db.$transaction(async (tx) => {
            // Restore spots to old instance
            await tx.eventInstance.update({
                where: { id: booking.instanceId },
                data: {
                    availableSpots: { increment: booking.guestCount },
                },
            });

            // Take spots from new instance
            await tx.eventInstance.update({
                where: { id: newInstanceId },
                data: {
                    availableSpots: { decrement: booking.guestCount },
                },
            });

            // Update booking
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    instanceId: newInstanceId,
                    baseAmount: newPrice,
                    totalAmount: { increment: priceDifference },
                    qrCode: `QR-${Date.now()}-${bookingId.slice(0, 8)}`, // Generate new QR
                },
            });

            // Create modification record
            await tx.bookingModification.create({
                data: {
                    bookingId,
                    modificationType: 'DATE_CHANGE',
                    oldValue: { instanceId: booking.instanceId },
                    newValue: { instanceId: newInstanceId },
                    modifiedBy: userId,
                },
            });

            return { updatedBooking, priceDifference };
        });

        // Handle payment difference
        if (priceDifference > 0 && booking.user?.stripeCustomerId) {
            const chargeResult = await chargeAdditionalAmount(
                booking.user.stripeCustomerId,
                booking.user.defaultPaymentMethod!,
                priceDifference,
                { bookingId, type: 'date_change' }
            );

            if (!chargeResult.success) {
                return { success: false, error: 'Payment failed' };
            }
        } else if (priceDifference < 0 && booking.stripePaymentIntentId) {
            await processPartialRefund(
                booking.stripePaymentIntentId,
                Math.abs(priceDifference)
            );
        }

        // Send confirmation
        await sendEmail({
            to: booking.guestEmail,
            subject: 'Booking Date Changed',
            html: `
        <h2>Your booking date has been changed</h2>
        <p>New date: ${newInstance.date.toLocaleDateString()}</p>
        <p>New time: ${newInstance.startTime.toLocaleTimeString()}</p>
        ${priceDifference !== 0
                    ? `<p>Price difference: ${priceDifference > 0 ? '+' : ''}$${priceDifference.toFixed(2)}</p>`
                    : ''
                }
      `,
        });

        revalidatePath(`/booking/${booking.bookingNumber}`);
        return { success: true };
    } catch (error: any) {
        console.error('Change date error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Cancel booking with automatic refund based on policy
 */
export async function cancelBookingWithRefund(bookingId: string, reason?: string) {
    const { userId } = await auth();

    const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
            instance: true,
            offering: true,
            user: true,
        },
    });

    if (!booking) {
        return { success: false, error: 'Booking not found' };
    }

    // Verify ownership or admin
    const user = await db.user.findUnique({
        where: { clerkId: userId! },
        select: { role: true },
    });

    if (booking.user?.clerkId !== userId && user?.role !== 'ADMIN') {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Calculate refund amount
        const hoursUntilEvent = differenceInHours(
            booking.instance.startTime,
            new Date()
        );

        const refundAmount = calculateRefundAmount(
            Number(booking.totalAmount),
            hoursUntilEvent,
            booking.offering.cancellationPolicy
        );

        // Transaction
        await db.$transaction(async (tx) => {
            // Cancel booking
            await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED',
                    cancelledAt: new Date(),
                },
            });

            // Restore spots
            await tx.eventInstance.update({
                where: { id: booking.instanceId },
                data: {
                    availableSpots: { increment: booking.guestCount },
                },
            });

            // Create modification record
            await tx.bookingModification.create({
                data: {
                    bookingId,
                    modificationType: 'CANCELLATION',
                    oldValue: { status: booking.status },
                    newValue: { status: 'CANCELLED' },
                    reason,
                    modifiedBy: userId!,
                    refundAmount,
                    refundStatus: refundAmount > 0 ? 'PENDING' : undefined,
                },
            });
        });

        // Process refund if applicable
        if (refundAmount > 0 && booking.stripePaymentIntentId) {
            const refundResult = await processPartialRefund(
                booking.stripePaymentIntentId,
                refundAmount
            );

            if (refundResult.success) {
                await db.bookingModification.updateMany({
                    where: { bookingId },
                    data: {
                        refundStatus: 'COMPLETED',
                        refundedAt: new Date(),
                    },
                });
            }
        }

        // Send confirmation
        await sendEmail({
            to: booking.guestEmail,
            subject: 'Booking Cancelled',
            html: `
        <h2>Your booking has been cancelled</h2>
        <p>Event: ${booking.offering.name}</p>
        ${refundAmount > 0
                    ? `<p>Refund: $${refundAmount.toFixed(2)} (processing within 5-10 business days)</p>`
                    : '<p>No refund available per cancellation policy.</p>'
                }
      `,
        });

        revalidatePath(`/booking/${booking.bookingNumber}`);
        revalidatePath('/dashboard');

        return { success: true, refundAmount };
    } catch (error: any) {
        console.error('Cancel booking error:', error);
        return { success: false, error: error.message };
    }
}
