import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getHostGuests } from '@/actions/crm';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Search, User } from 'lucide-react';

export default async function GuestsPage() {
    const { userId } = await auth();

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

    const { guests, total } = await getHostGuests();

    return (
        <div className="container max-w-6xl py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Guest Management</h1>
                <p className="text-gray-600">
                    View and manage your relationship with {total} guests
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search guests..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-black focus:ring-0"
                    />
                </div>
            </div>

            {/* Guest List */}
            <div className="space-y-3">
                {guests.length === 0 ? (
                    <Card className="p-12 text-center">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold mb-2">No guests yet</h2>
                        <p className="text-gray-600">
                            Your guest list will appear here once you start receiving bookings.
                        </p>
                    </Card>
                ) : (
                    guests.map((guest: any) => (
                        <Link
                            key={guest.id}
                            href={`/dashboard/guests/${guest.id}`}
                            className="block"
                        >
                            <Card className="p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{guest.name || 'Guest'}</h3>
                                            <p className="text-sm text-gray-600">{guest.email}</p>
                                            <p className="text-xs text-gray-500">
                                                Last booking:{' '}
                                                {new Date(guest.lastBooking).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold text-lg">
                                            ${guest.totalSpent.toFixed(2)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {guest.bookingCount}{' '}
                                            {guest.bookingCount === 1 ? 'booking' : 'bookings'}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
