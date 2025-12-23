"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatDate } from "@/lib/utils";
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    QrCode,
    MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface TodaysServiceTabProps {
    offering: any;
    instances: any[];
    servicePeriods: any[];
    tables: any[];
}

export function TodaysServiceTab({
    offering,
    instances,
    servicePeriods,
    tables,
}: TodaysServiceTabProps) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // Group instances by service period
    const instancesByPeriod = servicePeriods.map(period => {
        const periodInstances = instances.filter(inst => {
            const instTime = new Date(inst.startTime);
            const instHour = instTime.getHours();
            const instMinute = instTime.getMinutes();
            const instTimeMinutes = instHour * 60 + instMinute;

            const periodStart = period.startTime.split(":").map(Number);
            const periodStartMinutes = periodStart[0] * 60 + periodStart[1];
            const periodEnd = period.endTime.split(":").map(Number);
            const periodEndMinutes = periodEnd[0] * 60 + periodEnd[1];

            return instTimeMinutes >= periodStartMinutes && instTimeMinutes <= periodEndMinutes;
        });

        return {
            period,
            instances: periodInstances,
        };
    }).filter(group => group.instances.length > 0);

    // Get upcoming arrivals (next 30 minutes)
    const upcomingArrivals = instances
        .flatMap(inst =>
            inst.bookings
                .filter((b: any) => !b.checkedIn)
                .map((b: any) => ({
                    ...b,
                    instanceTime: inst.startTime,
                    instanceId: inst.id,
                }))
        )
        .sort((a, b) => new Date(a.instanceTime).getTime() - new Date(b.instanceTime).getTime())
        .filter((booking: any) => {
            const bookingTime = new Date(booking.instanceTime);
            const timeDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 60);
            return timeDiff >= -15 && timeDiff <= 30; // Show arrivals from 15 min ago to 30 min ahead
        })
        .slice(0, 10);

    // Get current diners (checked in but not completed)
    const currentDiners = instances
        .flatMap(inst =>
            inst.bookings
                .filter((b: any) => b.checkedIn && b.status !== "COMPLETED")
                .map((b: any) => ({
                    ...b,
                    instanceTime: inst.startTime,
                    instanceId: inst.id,
                }))
        );

    return (
        <div className="space-y-6">
            {/* Service Period Stats */}
            {instancesByPeriod.map(({ period, instances: periodInstances }) => {
                const totalBookings = periodInstances.reduce(
                    (sum, inst) => sum + inst.bookings.length,
                    0
                );
                const totalGuests = periodInstances.reduce(
                    (sum, inst) => sum + inst.bookings.reduce((s: number, b: any) => s + b.guestCount, 0),
                    0
                );
                const checkedIn = periodInstances.reduce(
                    (sum, inst) => sum + inst.bookings.filter((b: any) => b.checkedIn).length,
                    0
                );

                return (
                    <Card key={period.id} className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-semibold">{period.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {period.startTime} - {period.endTime}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Reservations</p>
                                <p className="text-2xl font-bold">{totalBookings}</p>
                                <p className="text-xs text-muted-foreground">
                                    {totalGuests} guests • {checkedIn} checked in
                                </p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2">
                            {periodInstances.slice(0, 20).map((instance) => {
                                const instanceTime = new Date(instance.startTime);
                                const isNow = instanceTime.getTime() <= now.getTime() &&
                                    new Date(instance.endTime).getTime() >= now.getTime();
                                const isPast = new Date(instance.endTime).getTime() < now.getTime();
                                const isUpcoming = instanceTime.getTime() > now.getTime();

                                const booked = instance.bookings.reduce(
                                    (sum: number, b: any) => sum + b.guestCount,
                                    0
                                );
                                const checkedInCount = instance.bookings.filter(
                                    (b: any) => b.checkedIn
                                ).length;

                                return (
                                    <div
                                        key={instance.id}
                                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                                            isNow
                                                ? "border-primary bg-primary/5"
                                                : isPast
                                                    ? "border-border bg-muted/30 opacity-60"
                                                    : "border-border hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 text-sm font-medium">
                                                {formatTime(instance.startTime)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">
                                                        {booked}/{instance.capacity} covers
                                                    </span>
                                                    {instance.status === "SOLD_OUT" && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Full
                                                        </Badge>
                                                    )}
                                                    {instance.status === "LIMITED" && (
                                                        <Badge variant="warning" className="text-xs">
                                                            Limited
                                                        </Badge>
                                                    )}
                                                    {isNow && (
                                                        <Badge variant="primary" className="text-xs">
                                                            ● NOW
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {checkedInCount} checked in
                                                </p>
                                            </div>
                                        </div>
                                        <Link href={`/dashboard/restaurant/${offering.id}?tab=reservations&instance=${instance.id}`}>
                                            <Button variant="outline" size="sm">
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                );
            })}

            {/* Upcoming Arrivals */}
            {upcomingArrivals.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Upcoming Arrivals (Next 30 min)</h3>
                    <div className="space-y-3">
                        {upcomingArrivals.map((booking: any) => {
                            const bookingTime = new Date(booking.instanceTime);
                            const timeDiff = (bookingTime.getTime() - now.getTime()) / (1000 * 60);
                            const minutesUntil = Math.round(timeDiff);

                            return (
                                <div
                                    key={booking.id}
                                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-center">
                                            <p className="text-sm font-medium">
                                                {formatTime(booking.instanceTime)}
                                            </p>
                                            <p className={`text-xs ${minutesUntil < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                                                {minutesUntil < 0
                                                    ? `${Math.abs(minutesUntil)} min ago`
                                                    : `${minutesUntil} min`}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {booking.guestName} • Party of {booking.guestCount}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {booking.guestEmail}
                                            </p>
                                            {booking.specialRequests && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {booking.specialRequests}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="outline" size="sm">
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Check In
                                        </Button>
                                        <Button variant="ghost" size="sm">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            )}

            {/* Current Diners */}
            {currentDiners.length > 0 && (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Current Diners</h3>
                    <div className="space-y-2">
                        {currentDiners.map((booking: any) => (
                            <div
                                key={booking.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-border"
                            >
                                <div>
                                    <p className="font-medium">
                                        {booking.guestName} • Party of {booking.guestCount}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Seated at {formatTime(new Date(booking.checkedInAt || booking.instanceTime))}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    View Details
                                </Button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Quick Actions */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link href={`/dashboard/restaurant/${offering.id}?tab=walkins`}>
                        <Button variant="outline" className="w-full justify-start">
                            <Users className="h-4 w-4 mr-2" />
                            Seat Walk-in
                        </Button>
                    </Link>
                    <Link href={`/dashboard/restaurant/${offering.id}?tab=waitlist`}>
                        <Button variant="outline" className="w-full justify-start">
                            <Clock className="h-4 w-4 mr-2" />
                            View Waitlist
                        </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Emergency Close Tonight
                    </Button>
                </div>
            </Card>
        </div>
    );
}

