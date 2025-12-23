import { redirect, notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { getInstanceBookings } from "@/actions/bookings";
import { EventDashboardHeader } from "./event-dashboard-header";
import { EventOverviewTab } from "./tabs/overview-tab";
import { BookingsTab } from "./tabs/bookings-tab";
import { WaitlistTab } from "./tabs/waitlist-tab";
import { AnalyticsTab } from "./tabs/analytics-tab";
import { CommunicationTab } from "./tabs/communication-tab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface EventDashboardPageProps {
    params: Promise<{ eventId: string }>;
    searchParams: Promise<{ tab?: string; instance?: string }>;
}

export default async function EventDashboardPage({ params, searchParams }: EventDashboardPageProps) {
    const { userId } = await auth();
    if (!userId) redirect("/sign-in");

    const { eventId } = await params;
    const { tab = "overview", instance } = await searchParams;

    const user = await db.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user) redirect("/sign-in");

    const offering = await db.offering.findUnique({
        where: { id: eventId },
        include: {
            host: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                },
            },
            instances: {
                where: {
                    date: { gte: new Date() },
                    status: { not: "CANCELLED" },
                },
                orderBy: { date: "asc" },
                take: 50,
            },
            recurrenceRule: true,
            _count: {
                select: {
                    bookings: true,
                    reviews: true,
                },
            },
        },
    });

    if (!offering) notFound();

    if (offering.hostId !== user.id) {
        redirect("/dashboard");
    }

    // Get all bookings for this offering
    const allBookings = await db.booking.findMany({
        where: { offeringId: eventId },
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
    });

    // Get waitlist entries
    const waitlist = await db.waitlist.findMany({
        where: {
            offeringId: eventId,
            status: "ACTIVE",
        },
        orderBy: { createdAt: "asc" },
    });

    // Calculate stats
    const confirmedBookings = allBookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.guestCount, 0);
    const checkedInCount = allBookings.filter(b => b.checkedIn).length;

    // Get today's instances if any
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayInstances = offering.instances.filter(inst => {
        const instDate = new Date(inst.date);
        return instDate >= today && instDate < tomorrow;
    });

    return (
        <div className="min-h-screen bg-background">
            <EventDashboardHeader
                offering={offering}
                totalBookings={allBookings.length}
                totalRevenue={totalRevenue}
                totalGuests={totalGuests}
                waitlistCount={waitlist.length}
            />

            <main className="container py-6">
                <Tabs defaultValue={tab} className="w-full">
                    <TabsList className="grid w-full grid-cols-5">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="bookings">
                            Bookings
                            {confirmedBookings.length > 0 && (
                                <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                                    {confirmedBookings.length}
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
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="communication">Communication</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <EventOverviewTab
                            offering={offering}
                            instances={offering.instances}
                            todayInstances={todayInstances}
                            bookings={allBookings}
                            waitlist={waitlist}
                            stats={{
                                totalBookings: allBookings.length,
                                confirmedBookings: confirmedBookings.length,
                                totalRevenue,
                                totalGuests,
                                checkedInCount,
                                waitlistCount: waitlist.length,
                            }}
                        />
                    </TabsContent>

                    <TabsContent value="bookings" className="mt-6">
                        <BookingsTab
                            bookings={allBookings}
                            offering={offering}
                            selectedInstanceId={instance}
                        />
                    </TabsContent>

                    <TabsContent value="waitlist" className="mt-6">
                        <WaitlistTab
                            waitlist={waitlist}
                            offering={offering}
                            instances={offering.instances}
                        />
                    </TabsContent>

                    <TabsContent value="analytics" className="mt-6">
                        <AnalyticsTab
                            offering={offering}
                            bookings={allBookings}
                            instances={offering.instances}
                        />
                    </TabsContent>

                    <TabsContent value="communication" className="mt-6">
                        <CommunicationTab
                            offering={offering}
                            bookings={allBookings}
                        />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

