"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Calendar, Plus, X, Clock } from "lucide-react";
import { updateOffering } from "@/actions/offerings";
import { toast } from "@/components/ui/toast";

interface BookingAvailabilitySettingsProps {
    offering: any;
    servicePeriods: any[];
    blockedDates: any[];
}

export function BookingAvailabilitySettings({
    offering,
    servicePeriods,
    blockedDates,
}: BookingAvailabilitySettingsProps) {
    const [bookingWindowDays, setBookingWindowDays] = useState(
        offering.bookingWindowDays || offering.advanceBookingDays || 60
    );
    const [bookingOpensAt, setBookingOpensAt] = useState(offering.bookingOpensAt || "08:00");
    const [lastMinuteHours, setLastMinuteHours] = useState(offering.lastMinuteBookingHours || 2);
    const [newBlockedDate, setNewBlockedDate] = useState("");
    const [blockedDateReason, setBlockedDateReason] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateOffering(offering.id, {
                bookingWindowDays: bookingWindowDays,
                bookingOpensAt: bookingOpensAt,
                lastMinuteBookingHours: lastMinuteHours,
            });

            if (result.success) {
                toast.success("Settings saved", {
                    description: "Booking availability settings have been updated",
                });
            } else {
                throw new Error(result.error || "Failed to save");
            }
        } catch (error) {
            toast.error("Failed to save", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">General Booking Settings</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            How far in advance can guests book?
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="1"
                                max="365"
                                value={bookingWindowDays}
                                onChange={(e) => setBookingWindowDays(parseInt(e.target.value) || 60)}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">days ahead</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Bookings open at (time of day)
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="time"
                                value={bookingOpensAt}
                                onChange={(e) => setBookingOpensAt(e.target.value)}
                                className="w-32"
                            />
                            <span className="text-sm text-muted-foreground">
                                (e.g., 8:00 AM - bookings become available at this time each day)
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Last minute bookings close
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                min="0"
                                max="24"
                                value={lastMinuteHours}
                                onChange={(e) => setLastMinuteHours(parseInt(e.target.value) || 2)}
                                className="w-24"
                            />
                            <span className="text-sm text-muted-foreground">
                                hours before the time slot
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Example: If set to 2 hours, a 7:00 PM slot closes for booking at 5:00 PM
                        </p>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Settings"}
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Service Period Settings */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Period Settings</h3>
                <div className="space-y-4">
                    {servicePeriods.map((period) => (
                        <div
                            key={period.id}
                            className="p-4 rounded-lg border border-border space-y-2"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{period.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {period.startTime} - {period.endTime} • {period.daysOfWeek.length} days/week
                                    </p>
                                </div>
                                <Badge variant="secondary">Active</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>• Bookings open: {bookingWindowDays} days ahead at {bookingOpensAt}</p>
                                <p>• Bookings close: {lastMinuteHours} hours before each time slot</p>
                                <p>• Same-day reservations: {lastMinuteHours > 0 ? "Allowed until " + lastMinuteHours + " hours before" : "Not allowed"}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Blocked Dates */}
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Blocked Dates</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Dates when you're closed or not taking reservations
                </p>

                <div className="space-y-3 mb-4">
                    {blockedDates.map((blocked) => (
                        <div
                            key={blocked.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border"
                        >
                            <div>
                                <p className="font-medium">
                                    {formatDate(blocked.startDate)}
                                    {blocked.endDate && blocked.endDate !== blocked.startDate && (
                                        <> - {formatDate(blocked.endDate)}</>
                                    )}
                                </p>
                                {blocked.reason && (
                                    <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                                )}
                            </div>
                            <Button variant="ghost" size="sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="space-y-3 p-4 border border-border rounded-lg">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Add Blocked Date</label>
                        <Input
                            type="date"
                            value={newBlockedDate}
                            onChange={(e) => setNewBlockedDate(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="Reason (optional, e.g., 'Christmas - Closed')"
                            value={blockedDateReason}
                            onChange={(e) => setBlockedDateReason(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Blocked Date
                    </Button>
                </div>
            </Card>
        </div>
    );
}

