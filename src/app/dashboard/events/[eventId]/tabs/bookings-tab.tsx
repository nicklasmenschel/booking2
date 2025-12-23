"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import {
    Search,
    Filter,
    Download,
    Mail,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    Users,
} from "lucide-react";
import Link from "next/link";

interface BookingsTabProps {
    bookings: any[];
    offering: any;
    selectedInstanceId?: string;
}

export function BookingsTab({ bookings, offering, selectedInstanceId }: BookingsTabProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());

    // Filter bookings
    const filteredBookings = useMemo(() => {
        let filtered = bookings;

        // Filter by selected instance if provided
        if (selectedInstanceId) {
            filtered = filtered.filter(b => b.instanceId === selectedInstanceId);
        }

        // Filter by status
        if (statusFilter !== "all") {
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                b =>
                    b.guestName.toLowerCase().includes(query) ||
                    b.guestEmail.toLowerCase().includes(query) ||
                    b.bookingNumber.toLowerCase().includes(query) ||
                    (b.guestPhone && b.guestPhone.includes(query))
            );
        }

        return filtered;
    }, [bookings, selectedInstanceId, statusFilter, searchQuery]);

    const statusColors = {
        CONFIRMED: "bg-green-500",
        CANCELLED: "bg-red-500",
        CHECKED_IN: "bg-blue-500",
        NO_SHOW: "bg-gray-500",
        COMPLETED: "bg-purple-500",
    };

    const toggleBookingSelection = (bookingId: string) => {
        const newSelected = new Set(selectedBookings);
        if (newSelected.has(bookingId)) {
            newSelected.delete(bookingId);
        } else {
            newSelected.add(bookingId);
        }
        setSelectedBookings(newSelected);
    };

    const toggleAll = () => {
        if (selectedBookings.size === filteredBookings.length) {
            setSelectedBookings(new Set());
        } else {
            setSelectedBookings(new Set(filteredBookings.map(b => b.id)));
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters and Actions */}
            <Card className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, phone, or booking number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                        >
                            <option value="all">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="NO_SHOW">No Show</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedBookings.size > 0 && (
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Mail className="h-4 w-4 mr-2" />
                                Message ({selectedBookings.size})
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Export
                            </Button>
                        </div>
                    )}

                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                </div>
            </Card>

            {/* Bookings Table */}
            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedBookings.size === filteredBookings.length && filteredBookings.length > 0}
                                        onChange={toggleAll}
                                        className="rounded"
                                    />
                                </th>
                                <th className="p-4 text-left text-sm font-medium">Guest</th>
                                <th className="p-4 text-left text-sm font-medium">Date & Time</th>
                                <th className="p-4 text-left text-sm font-medium">Party Size</th>
                                <th className="p-4 text-left text-sm font-medium">Amount</th>
                                <th className="p-4 text-left text-sm font-medium">Status</th>
                                <th className="p-4 text-left text-sm font-medium">Booked</th>
                                <th className="p-4 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                        No bookings found
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-b border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedBookings.has(booking.id)}
                                                onChange={() => toggleBookingSelection(booking.id)}
                                                className="rounded"
                                            />
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{booking.guestName}</p>
                                                <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                                                {booking.guestPhone && (
                                                    <p className="text-xs text-muted-foreground">{booking.guestPhone}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {formatDate(booking.instance.date)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatTime(booking.instance.startTime)}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{booking.guestCount}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-medium">
                                                {formatCurrency(Number(booking.totalAmount), offering.currency)}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                className={`${statusColors[booking.status as keyof typeof statusColors] || "bg-gray-500"} text-white`}
                                            >
                                                {booking.status.replace("_", " ")}
                                            </Badge>
                                            {booking.checkedIn && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Checked In
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(booking.createdAt)}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/booking/${booking.bookingNumber}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                                {booking.status === "CONFIRMED" && !booking.checkedIn && (
                                                    <Button variant="outline" size="sm">
                                                        Check In
                                                    </Button>
                                                )}
                                                <Button variant="ghost" size="sm">
                                                    <Mail className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                {filteredBookings.length > 0 && (
                    <div className="border-t border-border p-4 bg-muted/30">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Showing {filteredBookings.length} of {bookings.length} bookings
                            </span>
                            <span className="font-medium">
                                Total: {formatCurrency(
                                    filteredBookings
                                        .filter(b => b.status !== "CANCELLED")
                                        .reduce((sum, b) => sum + Number(b.totalAmount), 0),
                                    offering.currency
                                )}
                            </span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

