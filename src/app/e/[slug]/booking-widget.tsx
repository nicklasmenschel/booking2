"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { BookingModal } from "@/components/booking/booking-modal";
import { joinWaitlist } from "@/actions/waitlist";
import { toast } from "@/components/ui/toast";
import { Modal } from "@/components/ui/dialog";
import {
    Calendar,
    Clock,
    Users,
    Minus,
    Plus,
    ChevronDown,
    Loader2,
    Check
} from "lucide-react";

interface Instance {
    id: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    availableSpots: number;
    status: string;
}

interface TicketTier {
    id: string;
    name: string;
    description?: string | null;
    price: number | { toNumber(): number };
}

interface BookingWidgetProps {
    offering: {
        id: string;
        name: string;
        basePrice: number;
        currency: string;
        capacity: number;
        minPartySize: number;
        maxPartySize?: number | null;
        cancellationPolicy: string;
        type?: string;
    };
    instances: Instance[];
    ticketTiers?: TicketTier[];
}

export function BookingWidget({
    offering,
    instances,
    ticketTiers = []
}: BookingWidgetProps) {
    const [selectedInstance, setSelectedInstance] = useState<Instance | null>(
        instances.length > 0 ? instances[0] : null
    );
    const [guestCount, setGuestCount] = useState(offering.minPartySize);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showMultiDateModal, setShowMultiDateModal] = useState(false);
    const [selectedMultipleDates, setSelectedMultipleDates] = useState<Set<string>>(new Set());
    const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);

    // I need to check how toast is used in other files. 
    // In BookingModal it was compatible with `toast.error(...)`.
    // Let's assume `import { toast } from "@/components/ui/toast"` works as an object with methods.

    const handleJoinWaitlist = async () => {
        if (!offering.id || !selectedInstance) return;
        setIsWaitlistLoading(true);
        try {
            const result = await joinWaitlist(offering.id, selectedInstance.id, guestCount);
            if (result.success) {
                toast.success("Added to waitlist", {
                    description: "We'll notify you if a spot opens up!",
                });
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error("Failed to join waitlist", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsWaitlistLoading(false);
        }
    };

    const minGuests = offering.minPartySize;
    const maxGuests = Math.min(
        offering.maxPartySize || 20,
        selectedInstance?.availableSpots || 20
    );

    const totalPrice = offering.basePrice * guestCount;
    const isSoldOut = selectedInstance?.status === "SOLD_OUT" || !selectedInstance;
    const isLimited = selectedInstance?.status === "LIMITED";

    const handleDecreaseGuests = () => {
        setGuestCount((prev) => Math.max(minGuests, prev - 1));
    };

    const handleIncreaseGuests = () => {
        setGuestCount((prev) => Math.min(maxGuests, prev + 1));
    };

    return (
        <>
            <div className="rounded-2xl border-2 border-border bg-card p-6 space-y-6">
                {/* Price */}
                <div className="flex items-baseline justify-between">
                    <div>
                        <span className="text-3xl font-bold">
                            {formatCurrency(offering.basePrice, offering.currency)}
                        </span>
                        <span className="text-muted-foreground ml-1">per person</span>
                    </div>
                    {isLimited && (
                        <Badge variant="warning">Limited spots</Badge>
                    )}
                </div>

                {/* Date Selection */}
                {instances.length > 1 && (
                    <div>
                        <label className="text-sm font-medium mb-2 block">Date</label>
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className="w-full flex items-center justify-between p-3 rounded-xl border-2 border-input hover:border-foreground transition-colors"
                        >
                            {selectedInstance ? (
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{formatDate(selectedInstance.date)}</span>
                                    <span className="text-muted-foreground">
                                        at {formatTime(selectedInstance.startTime)}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">Select a date</span>
                            )}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </button>

                        {showDatePicker && (
                            <div className="mt-2 p-2 rounded-xl border-2 border-border bg-background max-h-48 overflow-y-auto">
                                {instances.map((instance) => (
                                    <button
                                        key={instance.id}
                                        onClick={() => {
                                            setSelectedInstance(instance);
                                            setShowDatePicker(false);
                                            // Reset guest count if needed
                                            if (guestCount > instance.availableSpots) {
                                                setGuestCount(Math.min(guestCount, instance.availableSpots));
                                            }
                                        }}
                                        disabled={instance.status === "SOLD_OUT"}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${selectedInstance?.id === instance.id
                                            ? "bg-foreground/5"
                                            : "hover:bg-muted"
                                            } ${instance.status === "SOLD_OUT" ? "opacity-50 cursor-not-allowed" : ""}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{formatDate(instance.date)}</span>
                                            <span className="text-muted-foreground text-sm">
                                                {formatTime(instance.startTime)}
                                            </span>
                                        </div>
                                        <span className={`text-sm ${instance.status === "SOLD_OUT"
                                            ? "text-destructive"
                                            : instance.status === "LIMITED"
                                                ? "text-warning"
                                                : "text-muted-foreground"
                                            }`}>
                                            {instance.status === "SOLD_OUT"
                                                ? "Sold out"
                                                : `${instance.availableSpots} left`}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Single Instance Display */}
                {instances.length === 1 && selectedInstance && (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-muted">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{formatDate(selectedInstance.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{formatTime(selectedInstance.startTime)}</span>
                        </div>
                    </div>
                )}

                {/* Guest Count */}
                <div>
                    <label className="text-sm font-medium mb-2 block">Guests</label>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleDecreaseGuests}
                            disabled={guestCount <= minGuests}
                            className="h-12 w-12 rounded-xl border-2 border-border flex items-center justify-center hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-2xl font-bold">{guestCount}</span>
                            <p className="text-sm text-muted-foreground">
                                {guestCount === 1 ? "guest" : "guests"}
                            </p>
                        </div>
                        <button
                            onClick={handleIncreaseGuests}
                            disabled={guestCount >= maxGuests}
                            className="h-12 w-12 rounded-xl border-2 border-border flex items-center justify-center hover:border-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                    {selectedInstance && (
                        <p className="text-center text-sm text-muted-foreground mt-2">
                            {selectedInstance.availableSpots} spots available
                        </p>
                    )}
                </div>

                {/* Total */}
                <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-lg">
                        <span>Total</span>
                        <span className="font-bold">
                            {formatCurrency(totalPrice, offering.currency)}
                        </span>
                    </div>
                </div>

                {/* Reserve / Waitlist Button */}
                <Button
                    size="xl"
                    className="w-full"
                    onClick={isSoldOut ? handleJoinWaitlist : () => setShowBookingModal(true)}
                    disabled={(!isSoldOut && !selectedInstance) || isWaitlistLoading}
                    variant={isSoldOut ? "secondary" : "default"}
                >
                    {isWaitlistLoading ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Joining Waitlist...
                        </>
                    ) : isSoldOut ? (
                        "Join Waitlist"
                    ) : (
                        "Reserve"
                    )}
                </Button>

                {/* Book Multiple Dates (for recurring events) */}
                {offering.type === "RECURRING" && instances.length > 1 && !isSoldOut && (
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={() => setShowMultiDateModal(true)}
                    >
                        Book Multiple Dates
                    </Button>
                )}

                {/* Cancellation Policy */}
                <p className="text-center text-sm text-muted-foreground">
                    {offering.cancellationPolicy === "FLEXIBLE" && "Free cancellation up to 24 hours before"}
                    {offering.cancellationPolicy === "MODERATE" && "Full refund up to 7 days before"}
                    {offering.cancellationPolicy === "STRICT" && "Full refund up to 14 days before"}
                </p>
                {offering.type === "RECURRING" && (
                    <p className="text-center text-xs text-muted-foreground mt-2">
                        This is a recurring event. You're booking only this date.
                    </p>
                )}
            </div>

            {/* Booking Modal */}
            {showBookingModal && selectedInstance && (
                <BookingModal
                    open={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                    offering={{
                        ...offering,
                        type: offering.type,
                    }}
                    instance={selectedInstance}
                    guestCount={guestCount}
                    unitPrice={offering.basePrice}
                />
            )}

            {/* Multi-Date Booking Modal */}
            {showMultiDateModal && offering.type === "RECURRING" && (
                <Modal open={showMultiDateModal} onClose={() => setShowMultiDateModal(false)} className="max-w-2xl">
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold">Book Multiple Dates</h2>
                            <p className="text-sm text-muted-foreground">
                                Select up to 10 dates to book at once
                            </p>
                        </div>

                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {instances.slice(0, 20).map((instance) => {
                                const isSelected = selectedMultipleDates.has(instance.id);
                                const isSoldOut = instance.status === "SOLD_OUT";

                                return (
                                    <button
                                        key={instance.id}
                                        onClick={() => {
                                            if (isSoldOut) return;
                                            const newSelected = new Set(selectedMultipleDates);
                                            if (isSelected) {
                                                newSelected.delete(instance.id);
                                            } else if (newSelected.size < 10) {
                                                newSelected.add(instance.id);
                                            }
                                            setSelectedMultipleDates(newSelected);
                                        }}
                                        disabled={isSoldOut || (!isSelected && selectedMultipleDates.size >= 10)}
                                        className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${isSelected
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50"
                                            } ${isSoldOut ? "opacity-50 cursor-not-allowed" : ""} ${!isSelected && selectedMultipleDates.size >= 10 ? "opacity-50" : ""
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                    <Check className="h-3 w-3 text-white" />
                                                </div>
                                            )}
                                            {!isSelected && !isSoldOut && (
                                                <div className="w-5 h-5 rounded-full border-2 border-border" />
                                            )}
                                            <div>
                                                <p className="font-medium">
                                                    {formatDate(instance.date)} at {formatTime(instance.startTime)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {instance.availableSpots} spots available
                                                </p>
                                            </div>
                                        </div>
                                        {isSoldOut && (
                                            <span className="text-sm text-destructive">Sold Out</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {selectedMultipleDates.size > 0 && (
                            <div className="p-4 rounded-lg bg-muted">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedMultipleDates.size} {selectedMultipleDates.size === 1 ? "date" : "dates"} selected
                                    </span>
                                    <span className="font-semibold">
                                        {formatCurrency(offering.basePrice * guestCount * selectedMultipleDates.size, offering.currency)}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {guestCount} {guestCount === 1 ? "guest" : "guests"} × {selectedMultipleDates.size} dates
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowMultiDateModal(false);
                                    setSelectedMultipleDates(new Set());
                                }}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => {
                                    // TODO: Implement multi-date booking
                                    toast.success("Multi-date booking coming soon!", {
                                        description: "This feature will allow you to book multiple dates at once.",
                                    });
                                    setShowMultiDateModal(false);
                                }}
                                disabled={selectedMultipleDates.size === 0}
                                className="flex-1"
                            >
                                Book {selectedMultipleDates.size} {selectedMultipleDates.size === 1 ? "Date" : "Dates"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
}
