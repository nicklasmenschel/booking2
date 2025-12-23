"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { Search, Mail, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";

interface ReservationsTabProps {
    reservations: any[];
    offering: any;
}

export function ReservationsTab({ reservations, offering }: ReservationsTabProps) {
    return (
        <div className="space-y-4">
            <Card className="p-4">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, phone, or booking number..."
                            className="pl-10"
                        />
                    </div>
                    <Button variant="outline">
                        Export CSV
                    </Button>
                </div>
            </Card>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="p-4 text-left text-sm font-medium">Guest</th>
                                <th className="p-4 text-left text-sm font-medium">Date & Time</th>
                                <th className="p-4 text-left text-sm font-medium">Party Size</th>
                                <th className="p-4 text-left text-sm font-medium">Amount</th>
                                <th className="p-4 text-left text-sm font-medium">Status</th>
                                <th className="p-4 text-left text-sm font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        No reservations found
                                    </td>
                                </tr>
                            ) : (
                                reservations.map((booking) => (
                                    <tr
                                        key={booking.id}
                                        className="border-b border-border hover:bg-muted/50 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div>
                                                <p className="font-medium">{booking.guestName}</p>
                                                <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
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
                                                className={
                                                    booking.checkedIn
                                                        ? "bg-blue-500 text-white"
                                                        : booking.status === "CONFIRMED"
                                                            ? "bg-green-500 text-white"
                                                            : "bg-gray-500 text-white"
                                                }
                                            >
                                                {booking.checkedIn ? "Checked In" : booking.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/booking/${booking.bookingNumber}`}>
                                                    <Button variant="ghost" size="sm">
                                                        View
                                                    </Button>
                                                </Link>
                                                {!booking.checkedIn && (
                                                    <Button variant="outline" size="sm">
                                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                                        Check In
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

