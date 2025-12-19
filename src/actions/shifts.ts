"use server";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function createShift(data: {
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
            }
        });

        revalidatePath("/dashboard/restaurant/shifts");
        return { success: true };
    } catch (error) {
        console.error("Error creating shift", error);
        return { success: false, error: "Failed to create shift" };
    }
}

export async function deleteShift(shiftId: string) {
    try {
        const { userId } = await auth();
        if (!userId) return { success: false, error: "Unauthorized" };

        // Verify ownership
        const shift = await db.servicePeriod.findUnique({
            where: { id: shiftId },
            include: { offering: true }
        });

        if (!shift || shift.offering.hostId !== userId) {
            return { success: false, error: "Unauthorized" };
        }

        await db.servicePeriod.delete({ where: { id: shiftId } });
        revalidatePath("/dashboard/restaurant/shifts");
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete shift" };
    }
}
