import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getTodayEvents, getHostOfferings } from "@/actions/offerings";
import { DashboardHeader } from "./dashboard-header";
import { TodayEvents } from "./today-events";
import { EventsList } from "./events-list";
import { QuickActions } from "./quick-actions";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const [todayResult, offeringsResult] = await Promise.all([
        getTodayEvents(),
        getHostOfferings(),
    ]);

    const todayEvents = todayResult.success ? todayResult.data : [];
    const offerings = offeringsResult.success ? offeringsResult.data : [];

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader />

            <main className="container py-8 space-y-8">
                {/* Today's Events */}
                {todayEvents.length > 0 && (
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Today's Events</h2>
                        <TodayEvents events={todayEvents} />
                    </section>
                )}

                {/* Quick Actions */}
                <QuickActions hasOfferings={offerings.length > 0} />

                {/* All Events */}
                <section>
                    <h2 className="text-xl font-semibold mb-4">
                        {offerings.length > 0 ? "Your Events" : "Get Started"}
                    </h2>
                    <EventsList offerings={offerings} />
                </section>
            </main>
        </div>
    );
}
