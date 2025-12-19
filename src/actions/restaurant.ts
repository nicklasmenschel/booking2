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
