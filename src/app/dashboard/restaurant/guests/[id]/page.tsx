import { auth } from "@clerk/nextjs/server";
import { getGuestProfile, calculateGuestMetrics } from "@/actions/guests";
import { GuestProfile } from "@/components/restaurant/guest-profile";

export default async function GuestProfilePage({ params }: { params: { id: string } }) {
    const { userId } = await auth();

    if (!userId) {
        return <div>Unauthorized</div>;
    }

    const guest = await getGuestProfile(params.id);
    const metrics = await calculateGuestMetrics(params.id);

    return (
        <div className="p-8">
            <GuestProfile guest={guest} metrics={metrics} />
        </div>
    );
}
