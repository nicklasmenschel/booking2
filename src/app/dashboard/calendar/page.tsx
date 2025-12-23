import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CalendarView } from "@/components/calendar/calendar-view";

export default async function CalendarPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Get all user's offerings
    const offerings = await db.offering.findMany({
        where: {
            hostId: userId,
        },
        include: {
            instances: {
                where: {
                    startTime: {
                        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
                    },
                },
                orderBy: {
                    startTime: "asc",
                },
            },
        },
    });

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
                <p className="text-slate-600 mt-1">View all your events and reservations</p>
            </div>

            <CalendarView offerings={offerings} />
        </div>
    );
}
