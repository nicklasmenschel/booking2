"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface TablePosition {
    id: string;
    tableNumber: string;
    capacity: number;
    shape: "ROUND" | "SQUARE" | "RECTANGLE";
    xPosition: number;
    yPosition: number;
    rotation: number;
    color: string;
}

export async function saveTablePositions(
    offeringId: string,
    tables: TablePosition[]
) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    // Verify user owns this offering
    const offering = await db.offering.findFirst({
        where: {
            id: offeringId,
            hostId: userId,
        },
    });

    if (!offering) {
        throw new Error("Offering not found or unauthorized");
    }

    // Update all tables with their positions
    await Promise.all(
        tables.map((table: TablePosition) =>
            db.table.update({
                where: { id: table.id },
                data: {
                    xPosition: table.xPosition,
                    yPosition: table.yPosition,
                    rotation: table.rotation,
                    color: table.color,
                    shape: table.shape,
                },
            })
        )
    );

    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return { success: true };
}

export async function getTablePositions(offeringId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const tables = await db.table.findMany({
        where: {
            offeringId,
            offering: {
                hostId: userId,
            },
        },
        select: {
            id: true,
            tableNumber: true,
            capacity: true,
            shape: true,
            xPosition: true,
            yPosition: true,
            rotation: true,
            color: true,
        },
    });

    return tables.map((table) => ({
        id: table.id,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        shape: table.shape as "ROUND" | "SQUARE" | "RECTANGLE",
        xPosition: table.xPosition || 0,
        yPosition: table.yPosition || 0,
        rotation: table.rotation || 0,
        color: table.color || "#3b82f6",
    }));
}

export async function generateTableQRCodes(offeringId: string) {
    const { userId } = await auth();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const tables = await db.table.findMany({
        where: {
            offeringId,
            offering: {
                hostId: userId,
            },
        },
    });

    // Generate unique QR codes for each table
    const updates = tables.map((table: any) => {
        const qrCode = `${process.env.NEXT_PUBLIC_APP_URL}/restaurant/${offeringId}/table/${table.id}/pay`;
        return db.table.update({
            where: { id: table.id },
            data: { qrCode },
        });
    });

    await Promise.all(updates);

    revalidatePath(`/dashboard/restaurant/floor-plan`);
    return { success: true };
}
