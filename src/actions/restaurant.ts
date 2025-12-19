"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// TABLE MANAGEMENT
// ============================================================================

export async function createTable(data: {
    offeringId: string;
    tableNumber: string;
    capacity: number;
    minCapacity?: number;
    maxCapacity: number;
    section: string;
    shape?: "ROUND" | "SQUARE" | "RECTANGLE" | "BOOTH";
}) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const offering = await db.offering.findUnique({
            where: { id: data.offeringId },
        });

        if (!offering || offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.table.create({
            data: {
                offeringId: data.offeringId,
                tableNumber: data.tableNumber,
                capacity: data.capacity,
                minCapacity: data.minCapacity ?? 2,
                maxCapacity: data.maxCapacity,
                section: data.section,
                shape: data.shape ?? "RECTANGLE",
            },
        });

        revalidatePath("/dashboard/restaurant/tables");
        return { success: true };
    } catch (error) {
        console.error("Error creating table:", error);
        return { success: false, error: "Failed to create table" };
    }
}

export async function deleteTable(tableId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const table = await db.table.findUnique({
            where: { id: tableId },
            include: { offering: true },
        });

        if (!table || table.offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.table.delete({
            where: { id: tableId },
        });

        revalidatePath("/dashboard/restaurant/tables");
        return { success: true };
    } catch (error) {
        console.error("Error deleting table:", error);
        return { success: false, error: "Failed to delete table" };
    }
}

export async function getTables(offeringId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const tables = await db.table.findMany({
            where: { offeringId },
            orderBy: { tableNumber: 'asc' }
        });

        return { success: true, data: tables };
    } catch (error) {
        console.error("Error fetching tables", error);
        return { success: false, error: "Failed to fetch tables" };
    }
}

// ============================================================================
// SERVICE PERIOD MANAGEMENT
// ============================================================================

export async function createServicePeriod(data: {
    offeringId: string;
    name: string;
    startTime: string;
    endTime: string;
    lastSeating: string;
    daysOfWeek: number[];
    intervalMinutes: number;
    maxCoversPerSlot: number;
}) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const offering = await db.offering.findUnique({
            where: { id: data.offeringId },
        });

        if (!offering || offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.servicePeriod.create({
            data: {
                offeringId: data.offeringId,
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                lastSeating: data.lastSeating,
                daysOfWeek: data.daysOfWeek,
                intervalMinutes: data.intervalMinutes,
                maxCoversPerSlot: data.maxCoversPerSlot,
                isActive: true,
            },
        });

        revalidatePath("/dashboard/restaurant/service-periods");
        return { success: true };
    } catch (error) {
        console.error("Error creating service period:", error);
        return { success: false, error: "Failed to create service period" };
    }
}

export async function updateServicePeriod(
    periodId: string,
    data: Partial<{
        name: string;
        startTime: string;
        endTime: string;
        lastSeating: string;
        daysOfWeek: number[];
        intervalMinutes: number;
        maxCoversPerSlot: number;
        isActive: boolean;
    }>
) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const period = await db.servicePeriod.findUnique({
            where: { id: periodId },
            include: { offering: true },
        });

        if (!period || period.offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.servicePeriod.update({
            where: { id: periodId },
            data,
        });

        revalidatePath("/dashboard/restaurant/service-periods");
        return { success: true };
    } catch (error) {
        console.error("Error updating service period:", error);
        return { success: false, error: "Failed to update service period" };
    }
}

export async function deleteServicePeriod(periodId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const period = await db.servicePeriod.findUnique({
            where: { id: periodId },
            include: { offering: true },
        });

        if (!period || period.offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.servicePeriod.delete({
            where: { id: periodId },
        });

        revalidatePath("/dashboard/restaurant/service-periods");
        return { success: true };
    } catch (error) {
        console.error("Error deleting service period:", error);
        return { success: false, error: "Failed to delete service period" };
    }
}

export async function getServicePeriods(offeringId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const periods = await db.servicePeriod.findMany({
            where: { offeringId },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: periods };
    } catch (error) {
        console.error("Error fetching service periods", error);
        return { success: false, error: "Failed to fetch service periods" };
    }
}

// ============================================================================
// WALK-IN MANAGEMENT
// ============================================================================

export async function createWalkIn(data: {
    offeringId: string;
    instanceId?: string;
    guestName: string;
    guestCount: number;
    guestPhone?: string;
    guestEmail?: string;
    tableId?: string;
    notes?: string;
}) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const offering = await db.offering.findUnique({
            where: { id: data.offeringId },
        });

        if (!offering || offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        const walkIn = await db.walkIn.create({
            data: {
                offeringId: data.offeringId,
                instanceId: data.instanceId,
                guestName: data.guestName,
                partySize: data.guestCount,
                quotedWait: 0,
                notes: data.notes,
                status: 'SEATED',
            },
        });

        revalidatePath("/dashboard/restaurant/walk-ins");
        return { success: true, data: walkIn };
    } catch (error) {
        console.error("Error creating walk-in:", error);
        return { success: false, error: "Failed to create walk-in" };
    }
}

export async function getWalkIns(offeringId: string, date?: Date) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        const targetDate = date || new Date();
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const walkIns = await db.walkIn.findMany({
            where: {
                offeringId,
                joinedAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            orderBy: { joinedAt: 'desc' },
        });

        return { success: true, data: walkIns };
    } catch (error) {
        console.error("Error fetching walk-ins", error);
        return { success: false, error: "Failed to fetch walk-ins" };
    }
}
