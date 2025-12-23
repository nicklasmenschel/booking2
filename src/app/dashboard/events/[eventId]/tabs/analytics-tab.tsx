"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, Users, DollarSign, Calendar, Star } from "lucide-react";

interface AnalyticsTabProps {
    offering: any;
    bookings: any[];
    instances: any[];
}

export function AnalyticsTab({ offering, bookings, instances }: AnalyticsTabProps) {
    const confirmedBookings = bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");
    const cancelledBookings = bookings.filter(b => b.status === "CANCELLED");

    // Calculate metrics
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
    const totalGuests = confirmedBookings.reduce((sum, b) => sum + b.guestCount, 0);
    const avgPartySize = confirmedBookings.length > 0 ? totalGuests / confirmedBookings.length : 0;
    const cancellationRate = bookings.length > 0 ? (cancelledBookings.length / bookings.length) * 100 : 0;

    // Booking velocity (bookings over time)
    const bookingsByDate = confirmedBookings.reduce((acc, booking) => {
        const date = formatDate(booking.createdAt);
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Revenue by instance
    const revenueByInstance = instances.map(instance => {
        const instanceBookings = confirmedBookings.filter(b => b.instanceId === instance.id);
        const revenue = instanceBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const guests = instanceBookings.reduce((sum, b) => sum + b.guestCount, 0);
        const fillRate = instance.capacity > 0 ? (guests / instance.capacity) * 100 : 0;

        return {
            instance,
            revenue,
            guests,
            fillRate,
            bookingCount: instanceBookings.length,
        };
    });

    // Calculate booking velocity
    const sortedDates = Object.keys(bookingsByDate).sort();
    const firstBookingDate = sortedDates[0];
    const daysSinceFirst = firstBookingDate
        ? Math.ceil((new Date().getTime() - new Date(firstBookingDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
    const bookingVelocity = daysSinceFirst > 0 ? confirmedBookings.length / daysSinceFirst : 0;

    return (
        <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatCurrency(totalRevenue, offering.currency)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                of {formatCurrency(instances.reduce((sum, i) => sum + (i.capacity * Number(offering.basePrice)), 0), offering.currency)} potential
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Bookings</p>
                            <p className="text-2xl font-bold">{confirmedBookings.length}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {cancelledBookings.length} cancelled ({cancellationRate.toFixed(1)}%)
                            </p>
                        </div>
                        <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Avg. Party Size</p>
                            <p className="text-2xl font-bold">{avgPartySize.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {totalGuests} total guests
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Booking Velocity</p>
                            <p className="text-2xl font-bold">{bookingVelocity.toFixed(1)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                bookings per day
                            </p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>
            </div>

            {/* Revenue by Instance */}
            {offering.type === "RECURRING" && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Revenue by Instance</h3>
                    <div className="space-y-3">
                        {revenueByInstance
                            .sort((a, b) => b.revenue - a.revenue)
                            .slice(0, 10)
                            .map(({ instance, revenue, guests, fillRate, bookingCount }) => (
                                <div
                                    key={instance.id}
                                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {formatDate(instance.date)} at {formatDate(instance.startTime).split(" ")[1]}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {bookingCount} bookings • {guests} guests • {fillRate.toFixed(0)}% full
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{formatCurrency(revenue, offering.currency)}</p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </Card>
            )}

            {/* Reviews Summary */}
            {offering.averageRating && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                            <div>
                                <p className="text-3xl font-bold">
                                    {Number(offering.averageRating).toFixed(1)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {offering.reviewCount} {offering.reviewCount === 1 ? "review" : "reviews"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

