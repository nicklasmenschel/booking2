import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { RestaurantDashboardHeader } from "./restaurant-dashboard-header";
import { TodaysServiceTab } from "./tabs/todays-service-tab";
import { ReservationsTab } from "./tabs/reservations-tab";
import { CalendarTab } from "./tabs/calendar-tab";
import { WalkInsTab } from "./tabs/walkins-tab";
import { WaitlistTab } from "./tabs/waitlist-tab";
import { SettingsTab } from "./tabs/settings-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface RestaurantDashboardPageProps {
    params: Promise<{ restaurantId: string }>;
    searchParams: Promise<{ tab?: string; date?: string }>;
}

export default async function RestaurantDashboardPage({ params, searchParams }: RestaurantDashboardPageProps) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { restaurantId } = await params;
    const { tab = "today", date } = await searchParams;

    const user = await db.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) redirect("/sign-in");

    const offering = await db.offering.findUnique({
        where: { id: restaurantId, type: "RESTAURANT" },
        include: {
            host: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            servicePeriods: {
                where: { isActive: true },
                orderBy: { startTime: "asc" },
            },
            tables: {
                where: { isActive: true },
                orderBy: { tableNumber: "asc" },
            },
        },
    });

    if (!offering) notFound();

    if (offering.hostId !== user.id) {
        redirect("/dashboard");
    }

    // Get today's date or specified date
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get instances for today
    const todayInstances = await db.eventInstance.findMany({
        where: {
            offeringId: restaurantId,
            date: {
                gte: targetDate,
                lt: nextDay,
            },
            status: { not: "CANCELLED" },
        },
        include: {
            bookings: {
                where: {
                    status: { in: ["CONFIRMED", "CHECKED_IN"] },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            walkIns: {
                where: {
                    status: { in: ["WAITING", "SEATED"] },
                },
            },
        },
        orderBy: { startTime: "asc" },
    });

    // Get all reservations
    const allReservations = await db.booking.findMany({
        where: {
            offeringId: restaurantId,
            status: { in: ["CONFIRMED", "CHECKED_IN", "COMPLETED"] },
        },
        include: {
            instance: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
    });

    // Get waitlist
    const waitlist = await db.waitlist.findMany({
        where: {
            offeringId: restaurantId,
            status: "ACTIVE",
        },
        orderBy: { createdAt: "asc" },
    });

    // Get walk-ins for today
    const walkIns = await db.walkIn.findMany({
        where: {
            offeringId: restaurantId,
            joinedAt: {
                gte: targetDate,
                lt: nextDay,
            },
        },
        include: {
            instance: true,
        },
        orderBy: { joinedAt: "desc" },
    });

    // Calculate stats
    const totalBookings = todayInstances.reduce((sum, inst) => sum + inst.bookings.length, 0);
    const totalGuests = todayInstances.reduce(
        (sum, inst) => sum + inst.bookings.reduce((s, b) => s + b.guestCount, 0),
        0
    );
    const checkedInCount = todayInstances.reduce(
        (sum, inst) => sum + inst.bookings.filter(b => b.checkedIn).length,
        0
    );
    const walkInCount = walkIns.length;
    const estimatedRevenue = todayInstances.reduce(
        (sum, inst) => sum + inst.bookings.reduce((s, b) => s + Number(b.totalAmount), 0),
        0
    );

    // Serialize offering to convert Decimal to number (required for Client Components)
    const serializedOffering = {
        ...offering,
        basePrice: Number(offering.basePrice),
        averageRating: offering.averageRating ? Number(offering.averageRating) : null,
        totalRevenue: offering.totalRevenue ? Number(offering.totalRevenue) : 0,
    };

    return (
        <div className="min-h-screen bg-background">
            <RestaurantDashboardHeader
                offering={serializedOffering}
                stats={{
                    totalBookings,
                    totalGuests,
                    checkedInCount,
                    walkInCount,
                    estimatedRevenue,
                }}
            />

            <main className="container py-6">
                <Tabs defaultValue={tab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6">
                        <TabsTrigger value="today">
                            Today's Service
                        </TabsTrigger>
                        <TabsTrigger value="reservations">
                            Reservations
                            {allReservations.length > 0 && (
                                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {allReservations.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calendar">Calendar</TabsTrigger>
                        <TabsTrigger value="walkins">
                            Walk-ins
                            {walkIns.length > 0 && (
                                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {walkIns.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="waitlist">
                            Waitlist
                            {waitlist.length > 0 && (
                                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {waitlist.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="today" className="mt-6">
                        <TodaysServiceTab
                            offering={serializedOffering}
                            instances={todayInstances}
                            servicePeriods={offering.servicePeriods}
                            tables={offering.tables}
                        />
                    </TabsContent>

                    <TabsContent value="reservations" className="mt-6">
                        <ReservationsTab
                            reservations={allReservations}
                            offering={serializedOffering}
                        />
                    </TabsContent>

                    <TabsContent value="calendar" className="mt-6">
                        <CalendarTab
                            offering={serializedOffering}
                            reservations={allReservations}
                        />
                    </TabsContent>

                    <TabsContent value="walkins" className="mt-6">
                        <WalkInsTab
                            walkIns={walkIns}
                            offering={serializedOffering}
                            instances={todayInstances}
                        />
                    </TabsContent>

                    <TabsContent value="waitlist" className="mt-6">
                        <WaitlistTab
                            waitlist={waitlist}
                            offering={serializedOffering}
                        />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-6">
                        <SettingsTab
                            offering={serializedOffering}
                            servicePeriods={offering.servicePeriods}
                            tables={offering.tables}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

