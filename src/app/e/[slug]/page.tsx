import { notFound } from "next/navigation";
import { getOfferingBySlug } from "@/actions/offerings";
import { EventHero } from "./event-hero";
import { EventDetails } from "./event-details";
import { BookingWidget } from "./booking-widget";
import { RestaurantReservationWidget } from "./restaurant-reservation-widget";
import { ReportButton } from "@/components/safety/report-button";
import { ReviewsSection } from "@/components/reviews/review-card";
import { getOfferingReviews } from "@/actions/reviews";
import type { Metadata } from "next";

interface EventPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const { slug } = await params;
    const offering = await getOfferingBySlug(slug);

    if (!offering) {
        return {
            title: "Event Not Found",
        };
    }

    return {
        title: offering.name,
        description: offering.description.slice(0, 160),
        openGraph: {
            title: offering.name,
            description: offering.description.slice(0, 160),
            images: [offering.coverImage],
        },
    };
}

export default async function EventPage({ params }: EventPageProps) {
    const { slug } = await params;
    const offering = await getOfferingBySlug(slug);

    if (!offering) {
        notFound();
    }

    const isRestaurant = offering.type === "RESTAURANT";
    const nextInstance = offering.instances[0];

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <EventHero
                name={offering.name}
                coverImage={offering.coverImage}
                host={offering.host}
            />

            {/* Main Content - Generous Spacing */}
            <div className="px-6 md:px-10 py-20">
                <div className="max-w-[1280px] mx-auto">
                    <div className="grid lg:grid-cols-3 gap-16">
                        {/* Event Details - Left Column */}
                        <div className="lg:col-span-2">
                            <EventDetails offering={{
                                ...offering,
                                basePrice: Number(offering.basePrice) as any,
                                averageRating: offering.averageRating ? Number(offering.averageRating) as any : null,
                                ticketTiers: offering.ticketTiers.map(t => ({
                                    ...t,
                                    price: Number(t.price) as any
                                }))
                            }} />
                        </div>

                        {/* Booking Widget - Right Column */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                {isRestaurant ? (
                                    <RestaurantReservationWidget
                                        offering={{
                                            id: offering.id,
                                            name: offering.name,
                                            basePrice: Number(offering.basePrice),
                                            currency: offering.currency,
                                            capacity: offering.capacity,
                                            minPartySize: offering.minPartySize,
                                            maxPartySize: offering.maxPartySize,
                                            cancellationPolicy: offering.cancellationPolicy,
                                        }}
                                    />
                                ) : (
                                    <BookingWidget
                                        offering={{
                                            id: offering.id,
                                            name: offering.name,
                                            basePrice: Number(offering.basePrice),
                                            currency: offering.currency,
                                            capacity: offering.capacity,
                                            minPartySize: offering.minPartySize,
                                            maxPartySize: offering.maxPartySize,
                                            cancellationPolicy: offering.cancellationPolicy,
                                            type: offering.type,
                                        }}
                                        instances={offering.instances.map(inst => ({
                                            id: inst.id,
                                            date: inst.date,
                                            startTime: inst.startTime,
                                            endTime: inst.endTime,
                                            availableSpots: inst.availableSpots,
                                            status: inst.status,
                                        }))}
                                        ticketTiers={offering.ticketTiers.map(t => ({
                                            ...t,
                                            price: Number(t.price)
                                        }))}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer with Report */}
                    <div className="mt-32 pt-12 border-t border-gray-200">
                        <div className="flex justify-center">
                            <ReportButton targetType="OFFERING" targetId={offering.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
