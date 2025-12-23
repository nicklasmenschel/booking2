"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateOffering } from "@/actions/offerings";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

interface OfferingEditModalProps {
    offering: {
        id: string;
        name: string;
        description?: string | null;
        basePrice: number | { toNumber(): number };
        capacity: number;
        cancellationPolicy: string;
        bookingWindowDays?: number | null;
        lastMinuteBookingHours?: number | null;
    };
    currentBookingCount?: number;
    onClose: () => void;
    onSuccess?: () => void;
}

export function OfferingEditModal({
    offering,
    currentBookingCount = 0,
    onClose,
    onSuccess,
}: OfferingEditModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [name, setName] = useState(offering.name);
    const [description, setDescription] = useState(offering.description || "");
    const basePrice = Number(offering.basePrice);
    const [price, setPrice] = useState(basePrice.toString());
    const [capacity, setCapacity] = useState(offering.capacity.toString());
    const [cancellationPolicy, setCancellationPolicy] = useState(offering.cancellationPolicy);
    const [bookingWindowDays, setBookingWindowDays] = useState(
        offering.bookingWindowDays?.toString() || "30"
    );
    const [lastMinuteHours, setLastMinuteHours] = useState(
        offering.lastMinuteBookingHours?.toString() || "2"
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        const newCapacity = parseInt(capacity);
        if (newCapacity < currentBookingCount) {
            toast.error("Cannot reduce capacity", {
                description: `Current bookings (${currentBookingCount}) exceed new capacity (${newCapacity})`,
            });
            return;
        }

        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        const newPrice = parseFloat(price);
        if (isNaN(newPrice) || newPrice < 0) {
            toast.error("Invalid price");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await updateOffering(offering.id, {
                name: name.trim(),
                description: description.trim() || undefined,
                basePrice: newPrice,
                capacity: newCapacity,
                cancellationPolicy: cancellationPolicy as any,
                bookingWindowDays: parseInt(bookingWindowDays),
                lastMinuteBookingHours: parseInt(lastMinuteHours),
            });

            if (result.success) {
                toast.success("Event updated", {
                    description: "Your changes have been saved",
                });
                onSuccess?.();
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            toast.error("Failed to update", {
                description: error instanceof Error ? error.message : "Please try again",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal open={true} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Edit Event</h2>
                    <p className="text-sm text-muted-foreground">
                        Update your event details. Price changes will only affect new bookings.
                    </p>
                </div>

                {/* Name */}
                <Input
                    label="Event Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name your event"
                    required
                />

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your event..."
                        className="min-h-[100px]"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Price */}
                    <div>
                        <Input
                            label="Price per Person"
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                        {basePrice !== parseFloat(price) && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Only affects new bookings
                            </p>
                        )}
                    </div>

                    {/* Capacity */}
                    <div>
                        <Input
                            label="Capacity"
                            type="number"
                            min={currentBookingCount}
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="10"
                            required
                        />
                        {currentBookingCount > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                                Current bookings: {currentBookingCount}
                            </p>
                        )}
                    </div>
                </div>

                {/* Cancellation Policy */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Cancellation Policy
                    </label>
                    <select
                        value={cancellationPolicy}
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background"
                    >
                        <option value="FLEXIBLE">Flexible (24h before)</option>
                        <option value="MODERATE">Moderate (7 days before)</option>
                        <option value="STRICT">Strict (14 days before)</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Booking Window */}
                    <Input
                        label="Booking Window (days)"
                        type="number"
                        min="1"
                        max="365"
                        value={bookingWindowDays}
                        onChange={(e) => setBookingWindowDays(e.target.value)}
                        hint="How far in advance guests can book"
                    />

                    {/* Last Minute */}
                    <Input
                        label="Last Minute Cutoff (hours)"
                        type="number"
                        min="0"
                        max="72"
                        value={lastMinuteHours}
                        onChange={(e) => setLastMinuteHours(e.target.value)}
                        hint="Minimum notice required"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
