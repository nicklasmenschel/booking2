"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function getDashboardMetrics(restaurantId: string, dateRange?: { start: Date; end: Date }) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const start = dateRange?.start || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = dateRange?.end || new Date();

    // Get all bookings in date range
    const bookings = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            offering: {
                hostId: userId,
            },
            createdAt: {
                gte: start,
                lte: end,
            },
        },
        include: {
            instance: {
                select: {
                    startTime: true,
                },
            },
        },
    });

    const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
    const totalCovers = completedBookings.reduce((sum, b) => sum + (b.partySize || 0), 0);
    const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const averageSpend = totalCovers > 0 ? totalRevenue / totalCovers : 0;
    const noShowRate = bookings.length > 0
        ? (bookings.filter((b) => b.status === "NO_SHOW").length / bookings.length) * 100
        : 0;

    return {
        totalCovers,
        totalRevenue,
        averageSpend,
        totalBookings: bookings.length,
        completedBookings: completedBookings.length,
        noShowRate: noShowRate.toFixed(1),
    };
}

export async function getRevenueTrends(restaurantId: string, days = 30) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const bookings = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            offering: {
                hostId: userId,
            },
            status: "COMPLETED",
            createdAt: {
                gte: startDate,
            },
        },
        include: {
            instance: {
                select: {
                    startTime: true,
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    // Group by date
    const revenueByDate: any = {};
    bookings.forEach((booking) => {
        const date = new Date(booking.instance.startTime).toISOString().split("T")[0];
        if (!revenueByDate[date]) {
            revenueByDate[date] = { date, revenue: 0, covers: 0 };
        }
        revenueByDate[date].revenue += Number(booking.totalAmount);
        revenueByDate[date].covers += booking.partySize || 0;
    });

    return Object.values(revenueByDate);
}

export async function getBookingSourceBreakdown(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const bookings = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            offering: {
                hostId: userId,
            },
        },
    });

    const walkIns = bookings.filter((b) => b.isWalkIn).length;
    const online = bookings.filter((b) => !b.isWalkIn).length;

    return [
        { source: "Online Bookings", count: online, percentage: (online / bookings.length) * 100 },
        { source: "Walk-Ins", count: walkIns, percentage: (walkIns / bookings.length) * 100 },
    ];
}

export async function getPeakHours(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const bookings = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            offering: {
                hostId: userId,
            },
            status: "COMPLETED",
        },
        include: {
            instance: {
                select: {
                    startTime: true,
                },
            },
        },
    });

    // Group by hour
    const hourCounts: any = {};
    bookings.forEach((booking) => {
        const hour = new Date(booking.instance.startTime).getHours();
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    return Object.entries(hourCounts)
        .map(([hour, count]) => ({
            hour: parseInt(hour),
            count,
        }))
        .sort((a, b) => a.hour - b.hour);
}

export async function getTableTurnoverRate(restaurantId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const bookings = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            offering: {
                hostId: userId,
            },
            status: "COMPLETED",
            checkInTime: { not: null },
            checkOutTime: { not: null },
        },
    });

    if (bookings.length === 0) return 0;

    const totalMinutes = bookings.reduce((sum, b) => {
        const checkIn = new Date(b.checkInTime!).getTime();
        const checkOut = new Date(b.checkOutTime!).getTime();
        return sum + (checkOut - checkIn) / (1000 * 60);
    }, 0);

    return Math.round(totalMinutes / bookings.length);
}
