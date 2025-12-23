"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getGuestProfile(guestId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const guest = await db.guest.findFirst({
        where: {
            id: guestId,
            restaurant: {
                hostId: userId,
            },
        },
        include: {
            bookings: {
                include: {
                    instance: {
                        select: {
                            startTime: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: 20,
            },
        },
    });

    if (!guest) {
        throw new Error("Guest not found or unauthorized");
    }

    return guest;
}

export async function searchGuests(restaurantId: string, query?: string) {
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

    const where: any = {
        restaurantId,
    };

    if (query) {
        where.OR = [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
        ];
    }

    const guests = await db.guest.findMany({
        where,
        orderBy: {
            lastVisit: "desc",
        },
        take: 50,
    });

    return guests;
}

export async function updateGuestPreferences(
    guestId: string,
    data: {
        dietaryRestrictions?: string[];
        allergies?: string[];
        preferences?: any;
        specialOccasions?: any;
    }
) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const guest = await db.guest.findFirst({
        where: {
            id: guestId,
            restaurant: {
                hostId: userId,
            },
        },
    });

    if (!guest) {
        throw new Error("Guest not found or unauthorized");
    }

    const updated = await db.guest.update({
        where: { id: guestId },
        data,
    });

    revalidatePath(`/dashboard/restaurant/guests/${guestId}`);
    return updated;
}

export async function getGuestHistory(guestId: string, limit = 20) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const bookings = await db.booking.findMany({
        where: {
            guestId,
            offering: {
                hostId: userId,
            },
        },
        include: {
            instance: {
                select: {
                    startTime: true,
                },
            },
            table: {
                select: {
                    tableNumber: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: limit,
    });

    return bookings;
}

export async function calculateGuestMetrics(guestId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const guest = await db.guest.findFirst({
        where: {
            id: guestId,
            restaurant: {
                hostId: userId,
            },
        },
        include: {
            bookings: true,
        },
    });

    if (!guest) {
        throw new Error("Guest not found or unauthorized");
    }

    const totalBookings = guest.bookings.length;
    const completedBookings = guest.bookings.filter((b) => b.status === "COMPLETED").length;
    const cancelledBookings = guest.bookings.filter((b) => b.status === "CANCELLED").length;
    const noShows = guest.bookings.filter((b) => b.status === "NO_SHOW").length;

    const totalSpent = guest.bookings
        .filter((b) => b.status === "COMPLETED")
        .reduce((sum, b) => sum + Number(b.totalAmount), 0);

    const averageSpend = completedBookings > 0 ? totalSpent / completedBookings : 0;

    const reliabilityScore =
        totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : "0.0";

    return {
        totalBookings,
        completedBookings,
        cancelledBookings,
        noShows,
        totalSpent,
        averageSpend,
        reliabilityScore,
    };
}

export async function createGuestNote(guestId: string, note: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify ownership
    const guest = await db.guest.findFirst({
        where: {
            id: guestId,
            restaurant: {
                hostId: userId,
            },
        },
    });

    if (!guest) {
        throw new Error("Guest not found or unauthorized");
    }

    // For now, store notes in preferences JSON
    const currentPreferences = (guest.preferences as any) || {};
    const notes = currentPreferences.notes || [];
    notes.push({
        text: note,
        createdAt: new Date().toISOString(),
        createdBy: userId,
    });

    await db.guest.update({
        where: { id: guestId },
        data: {
            preferences: {
                ...currentPreferences,
                notes,
            },
        },
    });

    revalidatePath(`/dashboard/restaurant/guests/${guestId}`);
    return { success: true };
}
