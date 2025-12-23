import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { BookingAvailabilitySettings } from "@/components/restaurant/booking-availability-settings";

interface BookingAvailabilityPageProps {
    params: Promise<{ restaurantId: string }>;
}

export default async function BookingAvailabilityPage({ params }: BookingAvailabilityPageProps) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { restaurantId } = await params;

    const user = await db.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) redirect("/sign-in");

    const offering = await db.offering.findUnique({
        where: { id: restaurantId, type: "RESTAURANT" },
        include: {
            servicePeriods: {
                where: { isActive: true },
            },
            blockedDates: true,
        },
    });

    if (!offering) notFound();

    if (offering.hostId !== user.id) {
        redirect("/dashboard");
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="container py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-2">Booking Availability</h1>
                        <p className="text-muted-foreground">
                            Configure how far in advance guests can book and when bookings open/close
                        </p>
                    </div>

                    <BookingAvailabilitySettings
                        offering={offering}
                        servicePeriods={offering.servicePeriods}
                        blockedDates={offering.blockedDates}
                    />
                </div>
            </div>
        </div>
    );
}

