import { notFound } from "next/navigation";
import Link from "next/link";
import { getBookingByNumber } from "@/actions/bookings";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatDate, formatTime, formatCurrency, cn } from "@/lib/utils";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Check,
    Download,
    Share2,
    ArrowLeft,
    User,
    MessageSquare,
    HelpCircle,
} from "lucide-react";

interface BookingPageProps {
    params: Promise<{ bookingNumber: string }>;
    searchParams: Promise<{ tab?: string }>;
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
    const { bookingNumber } = await params;
    const { tab = "details" } = await searchParams;
    const booking = await getBookingByNumber(bookingNumber);

    if (!booking) {
        notFound();
    }

    const isPastEvent = new Date(booking.instance.startTime) < new Date();
    const canModify = !isPastEvent && booking.status === "CONFIRMED";

    return (
        <div className="min-h-screen bg-muted/30">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-background border-b border-border">
                <div className="container flex h-16 items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to home
                    </Link>
                    <Badge
                        className={
                            booking.status === "CONFIRMED" || booking.status === "CHECKED_IN"
                                ? "bg-green-500 text-white"
                                : booking.status === "CANCELLED"
                                    ? "bg-red-500 text-white"
                                    : "bg-gray-500 text-white"
                        }
                    >
                        {booking.status}
                    </Badge>
                </div>
            </header>

            <main className="container py-8">
                <div className="max-w-2xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#9CAF6E]/10 mb-4">
                            <Check className="h-8 w-8 text-[#9CAF6E]" />
                        </div>
                        <h1 className="text-2xl font-bold">You're confirmed!</h1>
                        <p className="text-muted-foreground mt-1">
                            Booking #{booking.bookingNumber}
                        </p>
                    </div>

                    {/* QR Code - Always visible */}
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

                    {/* Tabs */}
                    <Tabs defaultValue={tab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="host">Host Info</TabsTrigger>
                            <TabsTrigger value="modify">Modify</TabsTrigger>
                            <TabsTrigger value="help">Get Help</TabsTrigger>
                        </TabsList>

                        <TabsContent value="details" className="mt-6">
                            <Card className="p-6 space-y-4">
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

                                    {booking.specialRequests && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Special Requests</p>
                                            <p className="text-sm text-muted-foreground">{booking.specialRequests}</p>
                                        </div>
                                    )}

                                    {booking.seatingPreferences && Array.isArray(booking.seatingPreferences) && booking.seatingPreferences.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Seating Preferences</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(booking.seatingPreferences as string[]).map((pref) => (
                                                    <Badge key={pref} variant="secondary">
                                                        {pref}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {booking.occasion && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Occasion</p>
                                            <p className="text-sm text-muted-foreground">{booking.occasion}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border pt-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total paid</span>
                                        <span className="font-semibold">
                                            {formatCurrency(Number(booking.totalAmount), booking.offering.currency || "USD")}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Booked on {formatDate(booking.createdAt)}
                                    </p>
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <div className="mt-6 space-y-3">
                                <Button size="lg" className="w-full">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Add to Calendar
                                </Button>

                                {booking.offering.address && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                            `${booking.offering.address}, ${booking.offering.city}`
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Get Directions
                                    </a>
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
                        </TabsContent>

                        <TabsContent value="host" className="mt-6">
                            <Card className="p-6 space-y-4">
                                <div className="flex items-center gap-4">
                                    {booking.offering.host?.avatar ? (
                                        <img
                                            src={booking.offering.host.avatar}
                                            alt={booking.offering.host.name || "Host"}
                                            className="w-16 h-16 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold text-lg">
                                            {booking.offering.host?.name || "Host"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Response time: &lt; 1 hour
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-border">
                                    <Button variant="outline" className="w-full">
                                        <MessageSquare className="h-4 w-4 mr-2" />
                                        Message Host
                                    </Button>
                                    {!isPastEvent && (
                                        <p className="text-xs text-muted-foreground">
                                            Phone number revealed 24 hours before event
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>

                        <TabsContent value="modify" className="mt-6">
                            <Card className="p-6">
                                <p className="text-sm text-muted-foreground mb-4">
                                    {canModify
                                        ? "You can modify your booking below. Changes may affect pricing."
                                        : "This booking cannot be modified."}
                                </p>
                                {canModify && (
                                    <Link href={`/booking/${booking.bookingNumber}/modify`}>
                                        <Button size="lg" className="w-full">
                                            <Users className="h-4 w-4 mr-2" />
                                            Modify Booking
                                        </Button>
                                    </Link>
                                )}
                            </Card>
                        </TabsContent>

                        <TabsContent value="help" className="mt-6">
                            <Card className="p-6 space-y-4">
                                <h3 className="font-semibold">Need Help?</h3>
                                <div className="space-y-3">
                                    <Button variant="outline" className="w-full justify-start">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        Report an Issue
                                    </Button>
                                </div>
                                <div className="pt-4 border-t border-border">
                                    <h4 className="font-medium mb-2">FAQ</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Common questions and answers about bookings, cancellations, and refunds.
                                    </p>
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Confirmation Note */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        Confirmation sent to {booking.guestEmail}
                    </p>
                </div>
            </main>
        </div>
    );
}
