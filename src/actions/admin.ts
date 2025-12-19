'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, id: true },
    });

    if (user?.role !== 'ADMIN') {
        throw new Error('Unauthorized: Admin access required');
    }

    return user.id;
}

export async function getPlatformStats() {
    await requireAdmin();

    const [
        totalHosts,
        totalGuests,
        totalOfferings,
        totalBookings,
        totalRevenue,
        pendingReports,
    ] = await Promise.all([
        db.user.count({ where: { role: 'HOST' } }),
        db.user.count({ where: { role: 'GUEST' } }),
        db.offering.count({ where: { status: 'PUBLISHED' } }),
        db.booking.count(),
        db.booking.aggregate({
            _sum: { totalAmount: true },
            where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
        }),
        db.report.count({ where: { status: 'PENDING' } }),
    ]);

    return {
        totalHosts,
        totalGuests,
        totalOfferings,
        totalBookings,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingReports,
    };
}

export async function forceRefund(bookingId: string, reason: string) {
    const adminId = await requireAdmin();

    const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: { offering: true, user: true },
    });

    if (!booking) {
        throw new Error('Booking not found');
    }

    // TODO: Process actual Stripe refund
    // const stripe = require('@/lib/stripe');
    // await stripe.refunds.create({
    //   payment_intent: booking.stripePaymentIntentId,
    //   reason: 'requested_by_customer',
    // });

    await db.booking.update({
        where: { id: bookingId },
        data: {
            status: 'CANCELLED',
            paymentStatus: 'FULLY_REFUNDED',
        },
    });

    await db.bookingModification.create({
        data: {
            bookingId,
            modificationType: 'HOST_CANCELLATION',
            oldValue: { status: booking.status },
            newValue: { status: 'CANCELLED' },
            reason: `Admin override: ${reason}`,
            modifiedBy: `ADMIN:${adminId}`,
            refundAmount: booking.totalAmount,
            refundStatus: 'COMPLETED',
            refundedAt: new Date(),
        },
    });

    revalidatePath('/admin');
    return { success: true };
}

export async function moderateContent(
    type: 'offering' | 'review' | 'user',
    id: string,
    action: 'hide' | 'delete' | 'restore',
    reason?: string
) {
    await requireAdmin();

    switch (type) {
        case 'offering':
            if (action === 'hide') {
                await db.offering.update({
                    where: { id },
                    data: { status: 'ARCHIVED' },
                });
            } else if (action === 'delete') {
                await db.offering.delete({ where: { id } });
            } else if (action === 'restore') {
                await db.offering.update({
                    where: { id },
                    data: { status: 'PUBLISHED' },
                });
            }
            break;

        case 'review':
            if (action === 'hide') {
                await db.review.update({
                    where: { id },
                    data: { status: 'HIDDEN' },
                });
            } else if (action === 'delete') {
                await db.review.delete({ where: { id } });
            } else if (action === 'restore') {
                await db.review.update({
                    where: { id },
                    data: { status: 'PUBLISHED' },
                });
            }
            break;

        case 'user':
            // For users, we just change role or mark as archived
            if (action === 'hide') {
                // Could implement a "banned" status
                // For now, just log it
                console.log(`User ${id} moderated: ${action} - ${reason}`);
            }
            break;
    }

    revalidatePath('/admin');
    return { success: true };
}

export async function getRecentBookings(limit = 10) {
    await requireAdmin();

    const bookings = await db.booking.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            offering: { select: { name: true, slug: true } },
            user: { select: { name: true, email: true } },
        },
    });

    return bookings;
}
