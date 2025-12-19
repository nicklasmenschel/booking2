import { notFound } from "next/navigation";
import { getOfferingBySlug } from "@/actions/offerings";
import { EventHero } from "./event-hero";
import { EventDetails } from "./event-details";
import { BookingWidget } from "./booking-widget";
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

    const nextInstance = offering.instances[0];

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <EventHero
                name={offering.name}
                coverImage={offering.coverImage}
                host={offering.host}
            />

            {/* Main Content */}
            <div className="container py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Event Details - Left Column */}
                    <div className="lg:col-span-2">
                        <EventDetails offering={offering} />
                    </div>

                    {/* Booking Widget - Right Column */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
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
                                }}
                                instances={offering.instances.map(inst => ({
                                    id: inst.id,
                                    date: inst.date,
                                    startTime: inst.startTime,
                                    endTime: inst.endTime,
                                    availableSpots: inst.availableSpots,
                                    status: inst.status,
                                }))}
                                ticketTiers={offering.ticketTiers}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer with Report */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex justify-center">
                        <ReportButton targetType="OFFERING" targetId={offering.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
