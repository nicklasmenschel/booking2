"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingProgress } from "@/components/ui/progress";
import { formatTime } from "@/lib/utils";
import { Users, QrCode, MessageSquare } from "lucide-react";

interface TodayEvent {
    id: string;
    offeringId: string;
    name: string;
    slug: string;
    coverImage: string;
    startTime: Date;
    endTime: Date;
    capacity: number;
    booked: number;
    checkedIn: number;
}

interface TodayEventsProps {
    events: TodayEvent[];
}

export function TodayEvents({ events }: TodayEventsProps) {
    if (events.length === 0) {
        return null;
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                    {/* Cover Image */}
                    <div className="relative h-32">
                        <img
                            src={event.coverImage}
                            alt={event.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-semibold text-white truncate">{event.name}</h3>
                            <p className="text-sm text-white/80">
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                            </p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        {/* Progress */}
                        <div className="flex items-center justify-between mb-4">
                            <BookingProgress
                                booked={event.booked}
                                capacity={event.capacity}
                                size={50}
                            />
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Checked in</p>
                                <p className="text-lg font-semibold">
                                    {event.checkedIn}/{event.booked}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Link href={`/dashboard/events/${event.offeringId}?instance=${event.id}`} className="flex-1">
                                <Button variant="outline" size="sm" className="w-full">
                                    <Users className="h-4 w-4 mr-2" />
                                    Guest List
                                </Button>
                            </Link>
                            <Link href={`/dashboard/events/${event.offeringId}/checkin?instance=${event.id}`}>
                                <Button size="sm">
                                    <QrCode className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
