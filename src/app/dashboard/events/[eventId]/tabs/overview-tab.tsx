"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import Link from "next/link";
import {
    Users,
    DollarSign,
    Calendar,
    Clock,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    MessageSquare,
} from "lucide-react";

interface OverviewTabProps {
    offering: any;
    instances: any[];
    todayInstances: any[];
    bookings: any[];
    waitlist: any[];
    stats: {
        totalBookings: number;
        confirmedBookings: number;
        totalRevenue: number;
        totalGuests: number;
        checkedInCount: number;
        waitlistCount: number;
    };
}

export function EventOverviewTab({
    offering,
    instances,
    todayInstances,
    bookings,
    waitlist,
    stats,
}: OverviewTabProps) {
    const nextInstance = instances[0];
    const capacity = nextInstance?.capacity || offering.capacity;
    const booked = nextInstance
        ? bookings
              .filter(b => b.instanceId === nextInstance.id && (b.status === "CONFIRMED" || b.status === "CHECKED_IN"))
              .reduce((sum, b) => sum + b.guestCount, 0)
        : 0;
    const fillRate = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;

    // Calculate time until next event
    let timeUntilEvent = null;
    if (nextInstance) {
        const now = new Date();
        const eventTime = new Date(nextInstance.startTime);
        const diff = eventTime.getTime() - now.getTime();
        if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            timeUntilEvent = { hours, minutes };
        }
    }

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Confirmed</p>
                            <p className="text-2xl font-bold">
                                {stats.confirmedBookings}/{capacity}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {fillRate}% full
                            </p>
                        </div>
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="text-2xl font-bold">
                                {formatCurrency(stats.totalRevenue, offering.currency)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                of {formatCurrency(capacity * Number(offering.basePrice), offering.currency)} potential
                            </p>
                        </div>
                        <DollarSign className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Waitlist</p>
                            <p className="text-2xl font-bold">{stats.waitlistCount}</p>
                            <p className="text-xs text-muted-foreground mt-1">people waiting</p>
                        </div>
                        <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Checked In</p>
                            <p className="text-2xl font-bold">
                                {stats.checkedInCount}/{stats.confirmedBookings}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats.confirmedBookings > 0
                                    ? Math.round((stats.checkedInCount / stats.confirmedBookings) * 100)
                                    : 0}% attendance
                            </p>
                        </div>
                        <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                </Card>
            </div>

            {/* Today's Timeline */}
            {todayInstances.length > 0 && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Today's Timeline</h2>
                        {timeUntilEvent && (
                            <Badge variant="secondary">
                                {timeUntilEvent.hours}h {timeUntilEvent.minutes}m until next event
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-3">
                        {todayInstances.map((instance) => {
                            const instanceBookings = bookings.filter(
                                b => b.instanceId === instance.id && (b.status === "CONFIRMED" || b.status === "CHECKED_IN")
                            );
                            const instanceBooked = instanceBookings.reduce((sum, b) => sum + b.guestCount, 0);
                            const instanceCheckedIn = instanceBookings.filter(b => b.checkedIn).length;

                            return (
                                <div
                                    key={instance.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                                >
                                    <div className="flex items-center gap-4">
                                        <div>
                                            <p className="font-medium">
                                                {formatTime(instance.startTime)} - {formatTime(instance.endTime)}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(instance.date)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Booked</p>
                                            <p className="font-semibold">
                                                {instanceBooked}/{instance.capacity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Checked In</p>
                                            <p className="font-semibold">
                                                {instanceCheckedIn}/{instanceBookings.length}
                                            </p>
                                        </div>
                                        <Link href={`/dashboard/events/${offering.id}?tab=bookings&instance=${instance.id}`}>
                                            <Button variant="outline" size="sm">
                                                View Bookings
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Next Upcoming Instances */}
            {instances.length > 0 && (
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {offering.type === "RECURRING" ? "Upcoming Instances" : "Next Event"}
                        </h2>
                        <Link href={`/dashboard/events/${offering.id}?tab=bookings`}>
                            <Button variant="outline" size="sm">
                                View All
                            </Button>
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {instances.slice(0, 5).map((instance) => {
                            const instanceBookings = bookings.filter(
                                b => b.instanceId === instance.id && (b.status === "CONFIRMED" || b.status === "CHECKED_IN")
                            );
                            const instanceBooked = instanceBookings.reduce((sum, b) => sum + b.guestCount, 0);
                            const instanceFillRate = instance.capacity > 0
                                ? Math.round((instanceBooked / instance.capacity) * 100)
                                : 0;

                            return (
                                <div
                                    key={instance.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {formatDate(instance.date)} at {formatTime(instance.startTime)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {instanceBooked}/{instance.capacity} booked ({instanceFillRate}%)
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {instance.status === "SOLD_OUT" && (
                                            <Badge variant="destructive">Sold Out</Badge>
                                        )}
                                        {instance.status === "LIMITED" && (
                                            <Badge variant="warning">Limited</Badge>
                                        )}
                                        <Link href={`/dashboard/events/${offering.id}?tab=bookings&instance=${instance.id}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href={`/dashboard/events/${offering.id}?tab=bookings`}>
                        <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Check-in Guests
                        </Button>
                    </Link>
                    <Link href={`/dashboard/events/${offering.id}?tab=communication`}>
                        <Button variant="outline" className="w-full justify-start">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Message All Guests
                        </Button>
                    </Link>
                    {offering.type === "RESTAURANT" && (
                        <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Add Walk-in
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}

