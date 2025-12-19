import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { ShiftManager } from "@/components/restaurant/shift-manager";
import { redirect } from "next/navigation";

export default async function ShiftsPage() {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const offering = await db.offering.findFirst({
        where: { hostId: userId, type: "RESTAURANT" },
    });

    if (!offering) {
        return (
            <div className="container py-8">
                <h1 className="text-2xl font-bold mb-4">Shift Management</h1>
                <p>You don't have any restaurant offerings set up.</p>
            </div>
        );
    }

    const shifts = await db.servicePeriod.findMany({
        where: { offeringId: offering.id },
        orderBy: { startTime: 'asc' }
    });

    return (
        <div className="container py-8">
            <h1 className="text-2xl font-bold mb-6">Shift Management</h1>
            <p className="text-muted-foreground mb-8">Configure your service hours (e.g., Dinner, Lunch) for {offering.name}.</p>

            <ShiftManager
                offeringId={offering.id}
                initialShifts={shifts.map(s => ({
                    id: s.id,
                    name: s.name,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    daysOfWeek: s.daysOfWeek,
                    intervalMinutes: s.intervalMinutes,
                    maxCoversPerSlot: s.maxCoversPerSlot
                }))}
            />
        </div>
    );
}
