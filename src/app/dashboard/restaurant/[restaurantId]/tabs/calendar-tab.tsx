"use client";

import { Card } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";

interface CalendarTabProps {
    offering: any;
    reservations: any[];
}

export function CalendarTab({ offering, reservations }: CalendarTabProps) {
    // Group reservations by date
    const reservationsByDate = reservations.reduce((acc, booking) => {
        const date = formatDate(booking.instance.date);
        if (!acc[date]) {
            acc[date] = {
                bookings: [],
                revenue: 0,
                guests: 0,
            };
        }
        acc[date].bookings.push(booking);
        acc[date].revenue += Number(booking.totalAmount);
        acc[date].guests += booking.guestCount;
        return acc;
    }, {} as Record<string, { bookings: any[]; revenue: number; guests: number }>);

    return (
        <div className="space-y-4">
            <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Reservations by Date</h3>
                <div className="space-y-3">
                    {Object.entries(reservationsByDate)
                        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
                        .map(([date, data]) => (
                            <div
                                key={date}
                                className="flex items-center justify-between p-4 rounded-lg border border-border"
                            >
                                <div>
                                    <p className="font-medium">{date}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {data.bookings.length} reservations • {data.guests} guests
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        {formatCurrency(data.revenue, offering.currency)}
                                    </p>
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
        </div>
    );
}

