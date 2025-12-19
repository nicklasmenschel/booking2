import { db } from "@/lib/db";
import { processWaitlist } from "./process-waitlist";

export async function cleanupHolds() {
    console.log("[JOB] Running cleanup-holds...");

    try {
        // 1. Release expired booking holds (checkout flow)
        const expiredHolds = await db.bookingHold.deleteMany({
            where: {
                expiresAt: { lt: new Date() },
            },
        });

        if (expiredHolds.count > 0) {
            console.log(`[JOB] Released ${expiredHolds.count} expired booking holds.`);
        }

        // 2. Release pending bookings that are older than 15 minutes (abandoned checkout)
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

        const abandonedBookings = await db.booking.findMany({
            where: {
                paymentStatus: "PENDING",
                createdAt: { lt: fifteenMinutesAgo },
                status: { not: "CANCELLED" }
            },
            include: { instance: true }
        });

        for (const booking of abandonedBookings) {
            const result = await db.$transaction(async (tx: any) => {
                // Cancel booking
                await tx.booking.update({
                    where: { id: booking.id },
                    data: {
                        status: "CANCELLED",
                        paymentStatus: "EXPIRED"
                    }
                });

                // Restore spots
                const updatedInstance = await tx.eventInstance.update({
                    where: { id: booking.instanceId },
                    data: {
                        availableSpots: { increment: booking.guestCount },
                        status: "AVAILABLE"
                    }
                });

                return {
                    instanceId: booking.instanceId,
                    spotsAvailable: updatedInstance.availableSpots
                };
            });

            // Trigger waitlist processing (outside transaction)
            if (result) {
                await processWaitlist({
                    instanceId: result.instanceId,
                    spotsAvailable: result.spotsAvailable
                });
            }
            console.log(`[JOB] Expired abandoned booking ${booking.bookingNumber}`);
        }

    } catch (error) {
        console.error("[JOB] Error in cleanup-holds:", error);
        throw error;
    }
}
