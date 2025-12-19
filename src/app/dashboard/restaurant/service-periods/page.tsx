import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getServicePeriods } from '@/actions/restaurant';
import { ServicePeriodConfig } from '@/components/restaurant/service-period-config';

export default async function ServicePeriodsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const user = await db.user.findUnique({
        where: { clerkId: userId },
    });

    if (!user || user.role !== 'HOST') {
        redirect('/');
    }

    const offering = await db.offering.findFirst({
        where: {
            hostId: user.id,
            type: 'RESTAURANT'
        },
        select: { id: true, name: true },
    });

    if (!offering) {
        return (
            <div className="container py-12">
                <h1 className="text-2xl font-bold mb-4">Service Periods</h1>
                <p className="text-gray-600">
                    Create a restaurant offering first to configure service periods.
                </p>
            </div>
        );
    }

    const result = await getServicePeriods(offering.id);
    const periods = result.success ? result.data : [];

    return (
        <div className="container max-w-4xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Service Periods</h1>
                <p className="text-gray-600">
                    Configure lunch, dinner, and other service times for {offering.name}
                </p>
            </div>

            <ServicePeriodConfig offeringId={offering.id} initialPeriods={periods || []} />
        </div>
    );
}
