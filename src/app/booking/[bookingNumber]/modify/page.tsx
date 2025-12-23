"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { modifyPartySize, changeBookingDate, cancelBookingWithRefund } from "@/actions/modifications";
import { getBookingByNumber } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Users, Loader2, Calendar, XCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";

interface ModifyPageProps {
    params: Promise<{ bookingNumber: string }>;
}

type Tab = "party-size" | "change-date" | "cancel";

export default function ModifyBookingPage({ params }: ModifyPageProps) {
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>("party-size");
    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    // Party size state
    const [newPartySize, setNewPartySize] = useState(0);

    // Date change state  
    const [availableInstances, setAvailableInstances] = useState<any[]>([]);
    const [selectedInstanceId, setSelectedInstanceId] = useState("");

    // Cancellation state
    const [cancelReason, setCancelReason] = useState("");

    // Load booking on mount
    useEffect(() => {
        params.then(async ({ bookingNumber }) => {
            const data = await getBookingByNumber(bookingNumber);
            if (!data) {
                notFound();
            }
            setBooking(data);
            setNewPartySize(data.guestCount);

            // Fetch available instances for the same offering
            // This would be a separate server action in production
            setAvailableInstances([data.instance]); // Simplified - just show current for now
            setSelectedInstanceId(data.instance.id);

            setLoading(false);
        });
    }, [params]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!booking) {
        notFound();
    }

    const handlePartySizeChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPartySize === booking.guestCount) {
            toast.error("No changes", {
                description: "Party size is the same",
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await modifyPartySize(booking.id, newPartySize);

            if (result.success) {
                toast.success("Booking updated!", {
                    description: `Party size changed from ${booking.guestCount} to ${newPartySize} guests`,
                });
                router.push(`/booking/${booking.bookingNumber}`);
            } else {
                toast.error("Modification failed", {
                    description: result.error,
                });
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to modify booking",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDateChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedInstanceId === booking.instance.id) {
            toast.error("No changes", {
                description: "Same date selected",
            });
            return;
        }

        setSubmitting(true);

        try {
            const result = await changeBookingDate(booking.id, selectedInstanceId);

            if (result.success) {
                toast.success("Date changed!", {
                    description: "Your booking has been moved to the new date",
                });
                router.push(`/booking/${booking.bookingNumber}`);
            } else {
                toast.error("Modification failed", {
                    description: result.error,
                });
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to change date",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancellation = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
            return;
        }

        setSubmitting(true);

        try {
            const result = await cancelBookingWithRefund(booking.id, cancelReason || undefined);

            if (result.success) {
                toast.success("Booking cancelled", {
                    description: result.message || "Your booking has been cancelled and refund processed",
                });
                router.push("/");
            } else {
                toast.error("Cancellation failed", {
                    description: result.error,
                });
            }
        } catch (error: any) {
            toast.error("Error", {
                description: error.message || "Failed to cancel booking",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="sticky top-0 z-50 bg-background border-b border-border">
                <div className="container flex h-16 items-center">
                    <Link
                        href={`/booking/${booking.bookingNumber}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to booking
                    </Link>
                </div>
            </header>

            <main className="container py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold mb-6">Modify Booking</h1>

                    <Card className="p-6 mb-6">
                        <h2 className="font-semibold mb-2">{booking.offering.name}</h2>
                        <p className="text-sm text-muted-foreground mb-1">
                            Booking #{booking.bookingNumber}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                            {formatDate(booking.instance.date)} at {formatTime(booking.instance.startTime)}
                        </p>
                        <p className="text-sm text-muted-foreground mb-1">
                            Current: {booking.guestCount} guests • {formatCurrency(Number(booking.totalAmount), "USD")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Available spots: {booking.instance.availableSpots}
                        </p>
                    </Card>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-border">
                        <button
                            onClick={() => setActiveTab("party-size")}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "party-size"
                                    ? "border-foreground text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Users className="h-4 w-4 inline mr-2" />
                            Change Party Size
                        </button>
                        <button
                            onClick={() => setActiveTab("change-date")}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "change-date"
                                    ? "border-foreground text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <Calendar className="h-4 w-4 inline mr-2" />
                            Change Date
                        </button>
                        <button
                            onClick={() => setActiveTab("cancel")}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === "cancel"
                                    ? "border-destructive text-destructive"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <XCircle className="h-4 w-4 inline mr-2" />
                            Cancel Booking
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === "party-size" && (
                        <form onSubmit={handlePartySizeChange} className="space-y-6">
                            <Card className="p-6">
                                <label className="block text-sm font-medium mb-4">
                                    New Party Size
                                </label>
                                <div className="flex items-center gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setNewPartySize(Math.max(1, newPartySize - 1))}
                                        disabled={newPartySize <= 1}
                                    >
                                        -
                                    </Button>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={newPartySize}
                                        onChange={(e) => setNewPartySize(parseInt(e.target.value) || 1)}
                                        className="text-center w-20"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setNewPartySize(newPartySize + 1)}
                                    >
                                        +
                                    </Button>
                                    <span className="text-sm text-muted-foreground">
                                        {newPartySize} {newPartySize === 1 ? "guest" : "guests"}
                                    </span>
                                </div>

                                {newPartySize !== booking.guestCount && (
                                    <div className="mt-4 p-3 rounded-lg bg-muted">
                                        <p className="text-sm">
                                            {newPartySize > booking.guestCount ? (
                                                <>Adding {newPartySize - booking.guestCount} guests (additional charge may apply)</>
                                            ) : (
                                                <>Removing {booking.guestCount - newPartySize} guests (refund will be processed)</>
                                            )}
                                        </p>
                                    </div>
                                )}
                            </Card>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={submitting || newPartySize === booking.guestCount}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    "Update Party Size"
                                )}
                            </Button>
                        </form>
                    )}

                    {activeTab === "change-date" && (
                        <form onSubmit={handleDateChange} className="space-y-6">
                            <Card className="p-6">
                                <p className="text-sm text-muted-foreground mb-4">
                                    Select a new date for your booking. Price differences will be calculated automatically.
                                </p>

                                <div className="space-y-2">
                                    {availableInstances.map((instance) => (
                                        <label
                                            key={instance.id}
                                            className="flex items-center gap-3 p-4 border-2 border-border rounded-lg cursor-pointer hover:border-foreground transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="instance"
                                                value={instance.id}
                                                checked={selectedInstanceId === instance.id}
                                                onChange={(e) => setSelectedInstanceId(e.target.value)}
                                                className="text-primary"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium">
                                                    {formatDate(instance.date)} at {formatTime(instance.startTime)}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {instance.availableSpots} spots available
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <p className="text-xs text-muted-foreground mt-4">
                                    Note: In production, this would show all available dates for this offering.
                                </p>
                            </Card>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full"
                                disabled={submitting || selectedInstanceId === booking.instance.id}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Change Date"
                                )}
                            </Button>
                        </form>
                    )}

                    {activeTab === "cancel" && (
                        <form onSubmit={handleCancellation} className="space-y-6">
                            <Card className="p-6 bg-destructive/5 border-destructive/20">
                                <h3 className="font-semibold text-destructive mb-2">Cancel Booking</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Cancelling this booking will process a refund according to the cancellation policy.
                                </p>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Reason for cancellation (optional)
                                        </label>
                                        <Textarea
                                            value={cancelReason}
                                            onChange={(e) => setCancelReason(e.target.value)}
                                            placeholder="Let us know why you're cancelling..."
                                            className="min-h-[100px]"
                                        />
                                    </div>

                                    <div className="p-3 rounded-lg bg-background">
                                        <p className="text-sm font-medium mb-1">Refund Policy</p>
                                        <p className="text-sm text-muted-foreground">
                                            Full refund if cancelled 24+ hours before the event.
                                            50% refund if cancelled within 24 hours.
                                            No refund if cancelled within 2 hours of event start.
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Button
                                type="submit"
                                size="lg"
                                variant="destructive"
                                className="w-full"
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Cancelling...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Cancel Booking
                                    </>
                                )}
                            </Button>
                        </form>
                    )}
                </div>
            </main>
        </div>
    );
}
