import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET(
    request: NextRequest,
    { params }: { params: { restaurantId: string } }
) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify ownership
        const restaurant = await db.offering.findFirst({
            where: {
                id: params.restaurantId,
                hostId: userId,
            },
        });

        if (!restaurant) {
            return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
        }

        // Get all tables for this restaurant
        const tables = await db.table.findMany({
            where: {
                offeringId: params.restaurantId,
                isActive: true,
            },
        });

        // Get today's bookings for these tables
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await db.booking.findMany({
            where: {
                tableId: {
                    in: tables.map((t) => t.id),
                },
                instance: {
                    startTime: {
                        gte: startOfDay,
                        lte: endOfDay,
                    },
                },
                status: {
                    in: ["CONFIRMED", "CHECKED_IN"],
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

        // Determine status for each table
        const tableStatuses = tables.map((table) => {
            const tableBooking = bookings.find((b) => b.tableId === table.id);

            if (!tableBooking) {
                return {
                    tableId: table.id,
                    status: "AVAILABLE",
                };
            }

            if (tableBooking.status === "CHECKED_IN") {
                return {
                    tableId: table.id,
                    status: "OCCUPIED",
                    booking: {
                        id: tableBooking.id,
                        guestName: tableBooking.guestName,
                        partySize: tableBooking.partySize,
                        checkInTime: tableBooking.checkInTime,
                    },
                };
            }

            // Status is CONFIRMED - check if reservation time is soon
            const reservationTime = new Date(tableBooking.instance.startTime);
            const timeDiff = reservationTime.getTime() - now.getTime();
            const minutesUntil = timeDiff / (1000 * 60);

            if (minutesUntil <= 30) {
                return {
                    tableId: table.id,
                    status: "RESERVED",
                    booking: {
                        id: tableBooking.id,
                        guestName: tableBooking.guestName,
                        partySize: tableBooking.partySize,
                    },
                };
            }

            return {
                tableId: table.id,
                status: "AVAILABLE",
            };
        });

        return NextResponse.json(tableStatuses);
    } catch (error) {
        console.error("Table status error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
