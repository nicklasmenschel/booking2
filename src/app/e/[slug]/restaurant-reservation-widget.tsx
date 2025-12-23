"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatTime } from "@/lib/utils";
import { BookingModal } from "@/components/booking/booking-modal";
import { getRestaurantAvailableSlots } from "@/actions/availability";
import { toast } from "@/components/ui/toast";
import {
    Calendar,
    Clock,
    Users,
    Minus,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
} from "lucide-react";

interface RestaurantReservationWidgetProps {
    offering: {
        id: string;
        name: string;
        basePrice: number;
        currency: string;
        capacity: number;
        minPartySize: number;
        maxPartySize?: number | null;
        cancellationPolicy: string;
    };
}

interface TimeSlot {
    id: string;
    startTime: Date;
    endTime: Date;
    availableSpots: number;
    status: string;
}

export function RestaurantReservationWidget({ offering }: RestaurantReservationWidgetProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
    const [guestCount, setGuestCount] = useState(offering.minPartySize || 2);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [weekOffset, setWeekOffset] = useState(0);

    // Generate dates for the next 14 days
    const generateDates = () => {
        const dates: Date[] = [];
        const today = new Date();
        const startOffset = weekOffset * 7;

        for (let i = startOffset; i < startOffset + 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }
        return dates;
    };

    const dates = generateDates();

    // Fetch slots when date changes
    useEffect(() => {
        if (!selectedDate) return;

        const fetchSlots = async () => {
            setIsLoadingSlots(true);
            setSelectedSlot(null);

            try {
                const result = await getRestaurantAvailableSlots(offering.id, selectedDate);
                if (result.success) {
                    setAvailableSlots(result.slots);
                } else {
                    toast.error("Failed to load times", { description: result.error });
                    setAvailableSlots([]);
                }
            } catch {
                toast.error("Failed to load available times");
                setAvailableSlots([]);
            } finally {
                setIsLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [selectedDate, offering.id]);

    const minGuests = offering.minPartySize || 1;
    const maxGuests = Math.min(
        offering.maxPartySize || 12,
        selectedSlot?.availableSpots || 12
    );

    const totalPrice = offering.basePrice * guestCount;

    const formatDateShort = (date: Date) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
            day: days[date.getDay()],
            date: date.getDate(),
            month: months[date.getMonth()],
        };
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    return (
        <>
            <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-6">
                {/* Header */}
                <div>
                    <h3 className="text-lg font-semibold">Make a Reservation</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        Select date, time and party size
                    </p>
                </div>

                {/* Guest Count */}
                <div>
                    <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Party Size
                    </label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setGuestCount((prev) => Math.max(minGuests, prev - 1))}
                            disabled={guestCount <= minGuests}
                            className="h-10 w-10 rounded-lg border-2 border-border flex items-center justify-center hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-xl font-bold">{guestCount}</span>
                            <span className="text-muted-foreground ml-1">
                                {guestCount === 1 ? "guest" : "guests"}
                            </span>
                        </div>
                        <button
                            onClick={() => setGuestCount((prev) => Math.min(maxGuests, prev + 1))}
                            disabled={guestCount >= maxGuests}
                            className="h-10 w-10 rounded-lg border-2 border-border flex items-center justify-center hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Date Selection */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Select Date
                        </label>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                                disabled={weekOffset === 0}
                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setWeekOffset(weekOffset + 1)}
                                disabled={weekOffset >= 4}
                                className="p-1 rounded hover:bg-muted disabled:opacity-50"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {dates.map((date) => {
                            const { day, date: dateNum } = formatDateShort(date);
                            const isSelected = selectedDate?.toDateString() === date.toDateString();

                            return (
                                <button
                                    key={date.toISOString()}
                                    onClick={() => setSelectedDate(date)}
                                    className={`p-2 rounded-lg text-center transition-colors ${isSelected
                                            ? "bg-foreground text-background"
                                            : "hover:bg-muted"
                                        }`}
                                >
                                    <div className="text-xs text-muted-foreground">
                                        {isToday(date) ? "Today" : day}
                                    </div>
                                    <div className="font-semibold">{dateNum}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                    <div>
                        <label className="text-sm font-medium mb-3 block flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Available Times
                        </label>

                        {isLoadingSlots ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                <p>No available times for this date</p>
                                <p className="text-sm mt-1">Try selecting a different date</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {availableSlots.map((slot) => {
                                    const isSelected = selectedSlot?.id === slot.id;
                                    const isAvailable = slot.availableSpots >= guestCount;

                                    return (
                                        <button
                                            key={slot.id}
                                            onClick={() => isAvailable && setSelectedSlot(slot)}
                                            disabled={!isAvailable}
                                            className={`p-3 rounded-lg text-sm font-medium transition-colors ${isSelected
                                                    ? "bg-foreground text-background"
                                                    : isAvailable
                                                        ? "border-2 border-border hover:border-foreground"
                                                        : "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                                                }`}
                                        >
                                            {formatTime(slot.startTime)}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Price Summary */}
                {selectedSlot && (
                    <div className="pt-4 border-t border-border">
                        <div className="flex justify-between items-center text-lg">
                            <span>Total</span>
                            <span className="font-bold">
                                {formatCurrency(totalPrice, offering.currency)}
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {guestCount} {guestCount === 1 ? "guest" : "guests"} × {formatCurrency(offering.basePrice, offering.currency)}
                        </p>
                    </div>
                )}

                {/* Reserve Button */}
                <Button
                    size="lg"
                    className="w-full"
                    onClick={() => setShowBookingModal(true)}
                    disabled={!selectedSlot}
                >
                    {!selectedDate
                        ? "Select a date"
                        : !selectedSlot
                            ? "Select a time"
                            : "Reserve Now"}
                </Button>

                {/* Cancellation Policy */}
                <p className="text-center text-sm text-muted-foreground">
                    {offering.cancellationPolicy === "FLEXIBLE" && "Free cancellation up to 24 hours before"}
                    {offering.cancellationPolicy === "MODERATE" && "Full refund up to 7 days before"}
                    {offering.cancellationPolicy === "STRICT" && "Full refund up to 14 days before"}
                </p>
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedSlot && (
                <BookingModal
                    open={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    offering={{
                        ...offering,
                        type: "RESTAURANT",
                    }}
                    instance={{
                        id: selectedSlot.id,
                        date: selectedDate!,
                        startTime: selectedSlot.startTime,
                        endTime: selectedSlot.endTime,
                        availableSpots: selectedSlot.availableSpots,
                        status: selectedSlot.status,
                    }}
                    guestCount={guestCount}
                    unitPrice={offering.basePrice}
                />
            )}
        </>
    );
}
