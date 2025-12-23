import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ReservationList } from "@/components/restaurant/reservation-list";
import { format } from "date-fns";

export default async function ReservationsPage({
    searchParams,
}: {
    searchParams: { date?: string };
}) {
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    // Get user's first restaurant offering
    const offering = await db.offering.findFirst({
        where: {
            host: {
                clerkId: userId,
            },
            type: "RESTAURANT",
        },
    });

    if (!offering) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">No Restaurant Found</h1>
                    <p className="text-slate-600">Please create a restaurant offering first.</p>
                </div>
            </div>
        );
    }

    // Get today's date or specified date
    const targetDate = searchParams.date ? new Date(searchParams.date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get today's instance
    const instance = await db.eventInstance.findFirst({
        where: {
            offeringId: offering.id,
            startTime: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    if (!instance) {
        return (
            <div className="p-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">No Service Today</h1>
                    <p className="text-slate-600">
                        No service periods scheduled for {format(targetDate, "MMMM d, yyyy")}
                    </p>
                </div>
            </div>
        );
    }

    // Get all bookings for this instance
    const bookings = await db.booking.findMany({
        where: {
            instanceId: instance.id,
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
    });

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Reservations - {format(targetDate, "MMMM d, yyyy")}
                </h1>
                <p className="text-slate-600 mt-1">
                    Manage today's reservations and walk-ins
                </p>
            </div>

            <ReservationList
                bookings={bookings as any}
                restaurantId={offering.id}
                instanceId={instance.id}
            />
        </div>
    );
}
