"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import {
    Calendar,
    Users,
    ExternalLink,
    MoreVertical,
    Plus,
    Sparkles
} from "lucide-react";

interface EventInstance {
    id: string;
    date: Date;
    startTime: Date;
    availableSpots: number;
}

interface Offering {
    id: string;
    slug: string;
    name: string;
    coverImage: string;
    status: string;
    basePrice: number;
    currency: string;
    capacity: number;
    instances: EventInstance[];
    _count: {
        bookings: number;
    };
}

interface EventsListProps {
    offerings: Offering[];
}

export function EventsList({ offerings }: EventsListProps) {
    if (offerings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create your first event</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                    Host wine tastings, cooking classes, private dinners, and more.
                </p>
                <Link href="/create">
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offerings.map((offering) => {
                const nextInstance = offering.instances[0];
                const bookedCount = offering._count.bookings;

                return (
                    <Card key={offering.id} hover className="overflow-hidden">
                        <Link href={`/dashboard/events/${offering.id}`}>
                            {/* Cover Image */}
                            <div className="relative h-40">
                                <img
                                    src={offering.coverImage}
                                    alt={offering.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-3 right-3">
                                    <Badge
                                        variant={
                                            offering.status === "PUBLISHED"
                                                ? "success"
                                                : offering.status === "DRAFT"
                                                    ? "secondary"
                                                    : "default"
                                        }
                                    >
                                        {offering.status.toLowerCase()}
                                    </Badge>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 space-y-3">
                                <h3 className="font-semibold truncate">{offering.name}</h3>

                                {/* Next Instance */}
                                {nextInstance ? (
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(nextInstance.date)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3.5 w-3.5" />
                                            {bookedCount} booked
                                        </span>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No upcoming dates</p>
                                )}

                                {/* Price */}
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                    <span className="font-semibold">
                                        {formatCurrency(Number(offering.basePrice), offering.currency)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">per person</span>
                                </div>
                            </div>
                        </Link>
                    </Card>
                );
            })}

            {/* Create New Card */}
            <Link href="/create">
                <Card className="h-full min-h-[280px] flex flex-col items-center justify-center text-center p-6 border-dashed hover:border-foreground transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="font-medium">Create new event</p>
                    <p className="text-sm text-muted-foreground">Takes less than 60 seconds</p>
                </Card>
            </Link>
        </div>
    );
}
