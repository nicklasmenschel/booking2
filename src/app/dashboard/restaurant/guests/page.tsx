import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { GuestList } from "@/components/restaurant/guest-list";

export default async function GuestsPage() {
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

    // Get all guests for this restaurant
    const guests = await db.guest.findMany({
        where: {
            restaurantId: offering.id,
        },
        orderBy: {
            lastVisit: "desc",
        },
        take: 50,
    });

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Guest Directory</h1>
                <p className="text-slate-600 mt-1">
                    Manage your guest profiles and view visit history
                </p>
            </div>

            <GuestList restaurantId={offering.id} initialGuests={guests} />
        </div>
    );
}
