"use server";

import { db } from "@/lib/db";

interface AvailableSlot {
    id: string;
    startTime: Date;
    endTime: Date;
    availableSpots: number;
    status: string;
}

/**
 * Get available time slots for a restaurant on a specific date
 */
export async function getRestaurantAvailableSlots(
    offeringId: string,
    date: Date
): Promise<{ success: boolean; slots: AvailableSlot[]; error?: string }> {
    try {
        // Set date boundaries
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Get instances for this date
        const instances = await db.eventInstance.findMany({
            where: {
                offeringId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { not: "CANCELLED" },
            },
            orderBy: { startTime: "asc" },
            select: {
                id: true,
                startTime: true,
                endTime: true,
                availableSpots: true,
                status: true,
            },
        });

        // If no instances, check if we need to generate them from service periods
        if (instances.length === 0) {
            // Try to generate instances dynamically
            const offering = await db.offering.findUnique({
                where: { id: offeringId },
                include: {
                    servicePeriods: {
                        where: { isActive: true },
                    },
                },
            });

            if (offering?.servicePeriods && offering.servicePeriods.length > 0) {
                const dayOfWeek = date.getDay();
                const dynamicSlots: AvailableSlot[] = [];

                for (const period of offering.servicePeriods) {
                    // Check if this period runs on the requested day
                    if (!period.daysOfWeek.includes(dayOfWeek)) continue;

                    // Parse times
                    const [startHour, startMin] = period.startTime.split(":").map(Number);
                    const [endHour, endMin] = period.endTime.split(":").map(Number);
                    const interval = period.intervalMinutes || 30;

                    // Generate slots
                    let currentTime = new Date(date);
                    currentTime.setHours(startHour, startMin, 0, 0);

                    const endTime = new Date(date);
                    endTime.setHours(endHour, endMin, 0, 0);

                    while (currentTime < endTime) {
                        const slotEnd = new Date(currentTime);
                        slotEnd.setMinutes(slotEnd.getMinutes() + interval);

                        // Create instance on-the-fly in database
                        const instance = await db.eventInstance.create({
                            data: {
                                offeringId,
                                date: new Date(date),
                                startTime: new Date(currentTime),
                                endTime: slotEnd,
                                capacity: period.maxCoversPerSlot,
                                availableSpots: period.maxCoversPerSlot,
                                status: "AVAILABLE",
                            },
                        });

                        dynamicSlots.push({
                            id: instance.id,
                            startTime: instance.startTime,
                            endTime: instance.endTime,
                            availableSpots: instance.availableSpots,
                            status: instance.status,
                        });

                        currentTime.setMinutes(currentTime.getMinutes() + interval);
                    }
                }

                return { success: true, slots: dynamicSlots };
            }
        }

        return {
            success: true,
            slots: instances.map((i) => ({
                id: i.id,
                startTime: i.startTime,
                endTime: i.endTime,
                availableSpots: i.availableSpots,
                status: i.status,
            })),
        };
    } catch (error) {
        console.error("Error fetching available slots:", error);
        return {
            success: false,
            slots: [],
            error: error instanceof Error ? error.message : "Failed to fetch slots",
        };
    }
}
