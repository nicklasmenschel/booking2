'use server';

import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';

/**
 * Add a note to a guest's profile
 */
export async function addGuestNote(guestUserId: string, note: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Verify user is a host
        const host = await db.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true },
        });

        if (!host || host.role !== 'HOST') {
            return { success: false, error: 'Only hosts can add guest notes' };
        }

        // Create guest note
        await db.guestNote.create({
            data: {
                userId: guestUserId,
                hostId: host.id,
                note,
            },
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Add guest note error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Add a tag to a guest
 */
export async function addGuestTag(guestUserId: string, tag: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const host = await db.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true },
        });

        if (!host || host.role !== 'HOST') {
            return { success: false, error: 'Only hosts can add guest tags' };
        }

        // Check if tag already exists for this guest
        const existing = await db.guestTag.findFirst({
            where: {
                userId: guestUserId,
                hostId: host.id,
                tag,
            },
        });

        if (existing) {
            return { success: false, error: 'Tag already exists' };
        }

        await db.guestTag.create({
            data: {
                userId: guestUserId,
                hostId: host.id,
                tag,
            },
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Add guest tag error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Remove a tag from a guest
 */
export async function removeGuestTag(tagId: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const host = await db.user.findUnique({
            where: { clerkId: userId },
            select: { id: true },
        });

        if (!host) {
            return { success: false, error: 'Unauthorized' };
        }

        // Verify ownership before deleting
        const tag = await db.guestTag.findUnique({
            where: { id: tagId },
        });

        if (!tag || tag.hostId !== host.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await db.guestTag.delete({
            where: { id: tagId },
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Remove guest tag error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get complete guest history and stats
 */
export async function getGuestHistory(guestUserId: string) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const host = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true },
    });

    if (!host || host.role !== 'HOST') {
        throw new Error('Only hosts can view guest history');
    }

    // Get guest info
    const guest = await db.user.findUnique({
        where: { id: guestUserId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });

    if (!guest) {
        throw new Error('Guest not found');
    }

    // Get all bookings for this guest with host's offerings
    const bookings = await db.booking.findMany({
        where: {
            userId: guestUserId,
            offering: {
                hostId: host.id,
            },
        },
        include: {
            offering: {
                select: {
                    name: true,
                    slug: true,
                },
            },
            instance: {
                select: {
                    date: true,
                    startTime: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Calculate stats
    const totalBookings = bookings.length;
    const completedBookings = bookings.filter((b) =>
        ['COMPLETED', 'CHECKED_IN'].includes(b.status)
    ).length;
    const cancelledBookings = bookings.filter((b) => b.status === 'CANCELLED').length;
    const totalSpent = bookings
        .filter((b) => ['CONFIRMED', 'COMPLETED', 'CHECKED_IN'].includes(b.status))
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    const cancellationRate =
        totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Get notes
    const notes = await db.guestNote.findMany({
        where: {
            userId: guestUserId,
            hostId: host.id,
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // Get tags
    const tags = await db.guestTag.findMany({
        where: {
            userId: guestUserId,
            hostId: host.id,
        },
        orderBy: {
            addedAt: "asc",
        },
    });

    return {
        guest,
        bookings,
        stats: {
            totalBookings,
            completedBookings,
            cancelledBookings,
            totalSpent,
            cancellationRate,
            averagePartySize:
                bookings.length > 0
                    ? bookings.reduce((sum, b) => sum + b.guestCount, 0) / bookings.length
                    : 0,
        },
        notes,
        tags,
    };
}

/**
 * Add a note to a specific booking
 */
export async function addBookingNote(bookingId: string, note: string) {
    const { userId } = await auth();

    if (!userId) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        const host = await db.user.findUnique({
            where: { clerkId: userId },
            select: { id: true, role: true },
        });

        if (!host || host.role !== 'HOST') {
            return { success: false, error: 'Only hosts can add booking notes' };
        }

        // Verify booking belongs to host's offering
        const booking = await db.booking.findUnique({
            where: { id: bookingId },
            include: {
                offering: {
                    select: {
                        hostId: true,
                    },
                },
            },
        });

        if (!booking || booking.offering.hostId !== host.id) {
            return { success: false, error: 'Unauthorized' };
        }

        await db.bookingNote.create({
            data: {
                bookingId,
                note,
                addedBy: host.id,
            },
        });

        revalidatePath(`/booking/${booking.bookingNumber}`);
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error: any) {
        console.error('Add booking note error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get all guests for a host with basic stats
 */
export async function getHostGuests(page = 1, limit = 20) {
    const { userId } = await auth();

    if (!userId) {
        throw new Error('Unauthorized');
    }

    const host = await db.user.findUnique({
        where: { clerkId: userId },
        select: { id: true, role: true },
    });

    if (!host || host.role !== 'HOST') {
        throw new Error('Only hosts can view guest list');
    }

    const skip = (page - 1) * limit;

    // Get unique guests who have booked host's offerings
    const bookings = await db.booking.findMany({
        where: {
            offering: {
                hostId: host.id,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    // Group by guest and calculate stats
    const guestMap = new Map();

    for (const booking of bookings) {
        if (!booking.user) continue;

        const guestId = booking.user.id;

        if (!guestMap.has(guestId)) {
            guestMap.set(guestId, {
                ...booking.user,
                bookingCount: 0,
                totalSpent: 0,
                lastBooking: booking.createdAt,
            });
        }

        const guestData = guestMap.get(guestId);
        guestData.bookingCount++;

        if (['CONFIRMED', 'COMPLETED', 'CHECKED_IN'].includes(booking.status)) {
            guestData.totalSpent += Number(booking.totalAmount);
        }

        if (booking.createdAt > guestData.lastBooking) {
            guestData.lastBooking = booking.createdAt;
        }
    }

    const guests = Array.from(guestMap.values())
        .sort((a, b) => b.lastBooking.getTime() - a.lastBooking.getTime())
        .slice(skip, skip + limit);

    return {
        guests,
        total: guestMap.size,
        pages: Math.ceil(guestMap.size / limit),
        currentPage: page,
    };
}
