import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ReservationSettingsForm } from "@/components/restaurant/reservation-settings-form";
import { getReservationSettings } from "@/actions/reservations";

export default async function ReservationSettingsPage() {
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
                    <p className="text-slate-600">
                        Please create a restaurant offering first.
                    </p>
                </div>
            </div>
        );
    }

    const settings = await getReservationSettings(offering.id);

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Reservation Settings</h1>
                <p className="text-slate-600 mt-1">
                    Configure how reservations are confirmed and managed
                </p>
            </div>

            <ReservationSettingsForm restaurantId={offering.id} settings={settings} />
        </div>
    );
}
