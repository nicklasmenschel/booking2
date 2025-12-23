import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { ReviewManagement } from "@/components/restaurant/review-management";
import { getReviews } from "@/actions/marketing";

export default async function ReviewsPage() {
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

    const reviews = await getReviews(offering.id);

    return (
        <div className="p-8">
            <ReviewManagement reviews={reviews} />
        </div>
    );
}
