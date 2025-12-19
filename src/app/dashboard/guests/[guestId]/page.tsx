import { redirect, notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getGuestHistory } from '@/actions/crm';
import { GuestProfile } from '@/components/crm/guest-profile';

interface GuestDetailPageProps {
    params: Promise<{ guestId: string }>;
}

export default async function GuestDetailPage({ params }: GuestDetailPageProps) {
    const { userId } = await auth();
    const { guestId } = await params;

    if (!userId) {
        redirect('/sign-in');
    }

    const host = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
    });

    if (host?.role !== 'HOST') {
        redirect('/');
    }

    try {
        const guestHistory = await getGuestHistory(guestId);
        return <GuestProfile guestHistory={guestHistory} />;
    } catch (error) {
        notFound();
    }
}
