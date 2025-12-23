import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { AnalyticsDashboard } from "@/components/restaurant/analytics-dashboard";
import {
    getDashboardMetrics,
    getRevenueTrends,
    getBookingSourceBreakdown,
    getPeakHours,
    getTableTurnoverRate,
} from "@/actions/analytics";

export default async function AnalyticsPage() {
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    const offering = await db.offering.findFirst({
        where: {
            hostId: userId,
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

    const [metrics, revenueTrends, bookingSources, peakHours, turnoverRate] = await Promise.all([
        getDashboardMetrics(offering.id),
        getRevenueTrends(offering.id, 30),
        getBookingSourceBreakdown(offering.id),
        getPeakHours(offering.id),
        getTableTurnoverRate(offering.id),
    ]);

    return (
        <div className="p-8">
            <AnalyticsDashboard
                metrics={metrics}
                revenueTrends={revenueTrends}
                bookingSources={bookingSources}
                peakHours={peakHours}
                turnoverRate={turnoverRate}
            />
        </div>
    );
}
