import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookingByNumber } from "@/actions/bookings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Check,
    Download,
    Share2,
    ArrowLeft
} from "lucide-react";

interface BookingPageProps {
    params: Promise<{ bookingNumber: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
    const { bookingNumber } = await params;
    const booking = await getBookingByNumber(bookingNumber);

    if (!booking) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b border-border">
                <div className="container flex h-16 items-center">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                </div>
            </header>

            <main className="container py-8">
                <div className="max-w-lg mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 mb-4">
                            <Check className="h-8 w-8 text-success" />
                        </div>
                        <h1 className="text-2xl font-bold">You're confirmed!</h1>
                        <p className="text-muted-foreground mt-1">
                            Booking #{booking.bookingNumber}
                        </p>
                    </div>

                    {/* QR Code */}
                    {booking.qrCode && (
                        <Card className="p-6 text-center mb-6">
                            <p className="text-sm text-muted-foreground mb-3">Show this at check-in</p>
                            <img
                                src={booking.qrCode}
                                alt="Booking QR Code"
                                className="w-48 h-48 mx-auto rounded-xl"
                            />
                        </Card>
                    )}

                    {/* Event Details */}
                    <Card className="p-6 space-y-4 mb-6">
                        {/* Cover Image */}
                        <div className="relative h-32 -mx-6 -mt-6 mb-4">
                            <img
                                src={booking.offering.coverImage}
                                alt={booking.offering.name}
                                className="w-full h-full object-cover rounded-t-2xl"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
                            <div className="absolute bottom-3 left-3 right-3">
                                <h2 className="font-semibold text-white">{booking.offering.name}</h2>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{formatDate(booking.instance.date)}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {formatTime(booking.instance.startTime)} - {formatTime(booking.instance.endTime)}
                                    </p>
                                </div>
                            </div>

                            {booking.offering.address && (
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">{booking.offering.address}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {booking.offering.city}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">
                                        {booking.guestCount} {booking.guestCount === 1 ? "guest" : "guests"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-border pt-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total paid</span>
                                <span className="font-semibold">
                                    {formatCurrency(Number(booking.totalAmount), "USD")}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Button size="lg" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Add to Calendar
                        </Button>

                        {booking.offering.address && (
                            <Button variant="outline" size="lg" className="w-full" asChild>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                        `${booking.offering.address}, ${booking.offering.city}`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Get Directions
                                </a>
                            </Button>
                        )}

                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Save Ticket
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                            </Button>
                        </div>
                    </div>

                    {/* Confirmation Note */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Confirmation sent to {booking.guestEmail}
                    </p>
                </div>
            </main>
        </div>
    );
}
