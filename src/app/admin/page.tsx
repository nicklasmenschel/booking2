import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { getPlatformStats, getRecentBookings } from '@/actions/admin';
import { getPendingReports } from '@/actions/safety';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function AdminDashboard() {
    const { userId } = await auth();

    if (!userId) {
        redirect('/sign-in');
    }

    const user = await db.user.findUnique({
        where: { clerkId: userId },
        select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
        redirect('/');
    }

    const stats = await getPlatformStats();
    const recentBookings = await getRecentBookings(5);
    const pendingReports = await getPendingReports();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-gray-600">Platform management and moderation</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Hosts</div>
                        <div className="text-3xl font-bold">{stats.totalHosts}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Guests</div>
                        <div className="text-3xl font-bold">{stats.totalGuests}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-sm text-gray-600 mb-1">Published Events</div>
                        <div className="text-3xl font-bold">{stats.totalOfferings}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
                        <div className="text-3xl font-bold">{stats.totalBookings}</div>
                    </Card>

                    <Card className="p-6">
                        <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                        <div className="text-3xl font-bold">
                            ${Number(stats.totalRevenue).toLocaleString()}
                        </div>
                    </Card>

                    <Card className="p-6 border-2 border-orange-500">
                        <div className="text-sm text-gray-600 mb-1">Pending Reports</div>
                        <div className="text-3xl font-bold text-orange-600">
                            {stats.pendingReports}
                        </div>
                    </Card>
                </div>

                {/* Pending Reports */}
                {pendingReports.length > 0 && (
                    <Card className="p-6 mb-8">
                        <h2 className="text-xl font-bold mb-4">Pending Reports</h2>
                        <div className="space-y-4">
                            {pendingReports.slice(0, 5).map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <div className="font-semibold">{report.category}</div>
                                        <div className="text-sm text-gray-600">
                                            {report.targetType} · {report.targetId.slice(0, 8)}...
                                        </div>
                                        {report.details && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                {report.details.slice(0, 100)}...
                                            </div>
                                        )}
                                    </div>
                                    <Link href={`/admin/reports/${report.id}`}>
                                        <Button variant="outline" size="sm">
                                            Review
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}

                {/* Recent Bookings */}
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
                    <div className="space-y-3">
                        {recentBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                                <div>
                                    <div className="font-semibold">{booking.offering.name}</div>
                                    <div className="text-sm text-gray-600">
                                        {booking.guestName} · {booking.guestCount} guests · $
                                        {Number(booking.totalAmount)}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(booking.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span
                                        className={`px-3 py-1 rounded-full ${booking.status === 'CONFIRMED'
                                                ? 'bg-green-100 text-green-700'
                                                : booking.status === 'CANCELLED'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
