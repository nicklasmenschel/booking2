"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    confirmReservation,
    checkInGuest,
    checkOutGuest,
    markNoShow,
    addWalkIn,
} from "@/actions/reservations";
import { toast } from "@/components/ui/toast";
import {
    Search,
    Filter,
    UserPlus,
    Check,
    X,
    UserCheck,
    DoorOpen,
    Ban,
    Clock,
    Users,
    Phone,
    Mail,
} from "lucide-react";
import { format } from "date-fns";

interface Booking {
    id: string;
    bookingNumber: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    partySize: number;
    status: string;
    confirmationMode?: string;
    isWalkIn: boolean;
    checkInTime?: Date;
    guestNotes?: string;
    staffNotes?: string;
    instance: {
        startTime: Date;
    };
    table?: {
        tableNumber: string;
    };
}

interface ReservationListProps {
    bookings: Booking[];
    restaurantId: string;
    instanceId: string;
}

export function ReservationList({ bookings: initialBookings, restaurantId, instanceId }: ReservationListProps) {
    const [bookings, setBookings] = useState(initialBookings);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showWalkInModal, setShowWalkInModal] = useState(false);

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.guestPhone?.includes(searchQuery);

        const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleConfirm = async (bookingId: string) => {
        try {
            await confirmReservation(bookingId);
            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: "CONFIRMED" } : b))
            );
            toast({
                title: "Reservation confirmed",
                description: "Confirmation email sent to guest.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to confirm reservation.",
                variant: "destructive",
            });
        }
    };

    const handleCheckIn = async (bookingId: string) => {
        try {
            await checkInGuest(bookingId);
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === bookingId ? { ...b, status: "CHECKED_IN", checkInTime: new Date() } : b
                )
            );
            toast({
                title: "Guest checked in",
                description: "Table status updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to check in guest.",
                variant: "destructive",
            });
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        try {
            await checkOutGuest(bookingId);
            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: "COMPLETED" } : b))
            );
            toast({
                title: "Guest checked out",
                description: "Table is now available.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to check out guest.",
                variant: "destructive",
            });
        }
    };

    const handleNoShow = async (bookingId: string) => {
        try {
            await markNoShow(bookingId);
            setBookings((prev) =>
                prev.map((b) => (b.id === bookingId ? { ...b, status: "NO_SHOW" } : b))
            );
            toast({
                title: "Marked as no-show",
                description: "Guest record updated.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to mark as no-show.",
                variant: "destructive",
            });
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            CONFIRMED: "bg-blue-100 text-blue-700",
            CHECKED_IN: "bg-green-100 text-green-700",
            COMPLETED: "bg-slate-100 text-slate-700",
            NO_SHOW: "bg-red-100 text-red-700",
            CANCELLED: "bg-orange-100 text-orange-700",
        };

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || "bg-slate-100 text-slate-700"
                    }`}
            >
                {status.replace("_", " ")}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                >
                    <option value="all">All Statuses</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CHECKED_IN">Checked In</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="NO_SHOW">No Show</option>
                </select>

                <Button onClick={() => setShowWalkInModal(true)} className="gap-2">
                    <UserPlus className="h-4 w-4" />
                    Add Walk-In
                </Button>
            </div>

            {/* Reservations List */}
            <div className="bg-white rounded-lg shadow-sm divide-y">
                {filteredBookings.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">
                        No reservations found
                    </div>
                ) : (
                    filteredBookings.map((booking) => (
                        <div key={booking.id} className="p-4 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-slate-900">
                                            {booking.guestName}
                                        </h3>
                                        {getStatusBadge(booking.status)}
                                        {booking.isWalkIn && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                Walk-In
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {format(new Date(booking.instance.startTime), "h:mm a")}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {booking.partySize} guests
                                        </div>
                                        {booking.table && (
                                            <div className="flex items-center gap-1">
                                                Table {booking.table.tableNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-600">
                                        {booking.guestEmail && (
                                            <div className="flex items-center gap-1">
                                                <Mail className="h-4 w-4" />
                                                {booking.guestEmail}
                                            </div>
                                        )}
                                        {booking.guestPhone && (
                                            <div className="flex items-center gap-1">
                                                <Phone className="h-4 w-4" />
                                                {booking.guestPhone}
                                            </div>
                                        )}
                                    </div>

                                    {booking.guestNotes && (
                                        <div className="text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                            <strong>Guest Notes:</strong> {booking.guestNotes}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    {booking.status === "CONFIRMED" && (
                                        <>
                                            <Button
                                                onClick={() => handleCheckIn(booking.id)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <UserCheck className="h-4 w-4" />
                                                Check In
                                            </Button>
                                            <Button
                                                onClick={() => handleNoShow(booking.id)}
                                                size="sm"
                                                variant="outline"
                                                className="gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <Ban className="h-4 w-4" />
                                                No Show
                                            </Button>
                                        </>
                                    )}

                                    {booking.status === "CHECKED_IN" && (
                                        <Button
                                            onClick={() => handleCheckOut(booking.id)}
                                            size="sm"
                                            variant="outline"
                                            className="gap-2"
                                        >
                                            <DoorOpen className="h-4 w-4" />
                                            Check Out
                                        </Button>
                                    )}

                                    {booking.confirmationMode === "MANUAL" &&
                                        booking.status === "CONFIRMED" && (
                                            <Button
                                                onClick={() => handleConfirm(booking.id)}
                                                size="sm"
                                                className="gap-2"
                                            >
                                                <Check className="h-4 w-4" />
                                                Confirm
                                            </Button>
                                        )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Walk-In Modal */}
            {showWalkInModal && (
                <WalkInModal
                    restaurantId={restaurantId}
                    instanceId={instanceId}
                    onClose={() => setShowWalkInModal(false)}
                    onSuccess={(newBooking) => {
                        setBookings([newBooking as any, ...bookings]);
                        setShowWalkInModal(false);
                        toast({
                            title: "Walk-in added",
                            description: "Guest has been checked in.",
                        });
                    }}
                />
            )}
        </div>
    );
}

function WalkInModal({
    restaurantId,
    instanceId,
    onClose,
    onSuccess,
}: {
    restaurantId: string;
    instanceId: string;
    onClose: () => void;
    onSuccess: (booking: any) => void;
}) {
    const [formData, setFormData] = useState({
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        partySize: 2,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const booking = await addWalkIn({
                restaurantId,
                instanceId,
                ...formData,
            });
            onSuccess(booking);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add walk-in.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
                <h2 className="text-xl font-bold text-slate-900">Add Walk-In</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Guest Name *
                        </label>
                        <Input
                            required
                            value={formData.guestName}
                            onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Email (optional)
                        </label>
                        <Input
                            type="email"
                            value={formData.guestEmail}
                            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                            placeholder="john@example.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Phone (optional)
                        </label>
                        <Input
                            type="tel"
                            value={formData.guestPhone}
                            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-900 mb-1">
                            Party Size *
                        </label>
                        <Input
                            type="number"
                            required
                            min="1"
                            value={formData.partySize}
                            onChange={(e) =>
                                setFormData({ ...formData, partySize: parseInt(e.target.value) || 1 })
                            }
                        />
                    </div>

                    <div className="flex gap-2 justify-end">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Adding..." : "Add Walk-In"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
