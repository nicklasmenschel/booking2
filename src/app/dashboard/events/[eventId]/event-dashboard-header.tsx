"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { OfferingEditModal } from "@/components/dashboard/offering-edit-modal";
import {
    ArrowLeft,
    Edit,
    Copy,
    MoreVertical,
    Calendar,
    DollarSign,
    Users,
    Clock,
} from "lucide-react";

interface EventDashboardHeaderProps {
    offering: {
        id: string;
        name: string;
        description?: string | null;
        status: string;
        type: string;
        slug: string;
        coverImage: string;
        basePrice: number | { toNumber(): number };
        capacity: number;
        cancellationPolicy: string;
        bookingWindowDays?: number | null;
        lastMinuteBookingHours?: number | null;
        recurrenceRule?: {
            frequency: string;
            interval: number;
            byWeekDay: string[];
        } | null;
    };
    totalBookings: number;
    totalRevenue: number;
    totalGuests: number;
    waitlistCount: number;
}

export function EventDashboardHeader({
    offering,
    totalBookings,
    totalRevenue,
    totalGuests,
    waitlistCount,
}: EventDashboardHeaderProps) {
    const [showEditModal, setShowEditModal] = useState(false);

    const statusColors = {
        PUBLISHED: "bg-green-500",
        DRAFT: "bg-gray-500",
        PAUSED: "bg-yellow-500",
        ARCHIVED: "bg-gray-400",
    };

    return (
        <div className="border-b border-border bg-card">
            <div className="container py-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href={`/e/${offering.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                                View Public Page
                            </Button>
                        </Link>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowEditModal(true)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Event
                        </Button>
                        <Button variant="outline" size="sm">
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                        </Button>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Event Info */}
                <div className="flex gap-6">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                        <img
                            src={offering.coverImage}
                            alt={offering.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{offering.name}</h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        className={`${statusColors[offering.status as keyof typeof statusColors] || "bg-gray-500"} text-white`}
                                    >
                                        {offering.status}
                                    </Badge>
                                    {offering.type === "RECURRING" && (
                                        <Badge variant="secondary">
                                            🔄 Recurring Event
                                        </Badge>
                                    )}
                                    {offering.type === "RESTAURANT" && (
                                        <Badge variant="secondary">
                                            🍽️ Restaurant
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {offering.type === "RECURRING" && offering.recurrenceRule && (
                            <p className="text-sm text-muted-foreground mb-4">
                                Pattern: Every {offering.recurrenceRule.interval}{" "}
                                {offering.recurrenceRule.frequency.toLowerCase()}
                                {offering.recurrenceRule.byWeekDay.length > 0 &&
                                    ` on ${offering.recurrenceRule.byWeekDay.join(", ")}`}
                            </p>
                        )}

                        {/* Quick Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Guests</p>
                                    <p className="font-semibold">{totalGuests}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Bookings</p>
                                    <p className="font-semibold">{totalBookings}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Revenue</p>
                                    <p className="font-semibold">{formatCurrency(totalRevenue, "USD")}</p>
                                </div>
                            </div>
                            {waitlistCount > 0 && (
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Waitlist</p>
                                        <p className="font-semibold">{waitlistCount}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <OfferingEditModal
                    offering={offering}
                    currentBookingCount={totalBookings}
                    onClose={() => setShowEditModal(false)}
                />
            )}
        </div>
    );
}

