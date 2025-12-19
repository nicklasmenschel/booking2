"use client";

import { formatDate, formatTime, getInitials } from "@/lib/utils";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Star,
    Utensils,
    Leaf
} from "lucide-react";
import type { Offering, EventInstance, Review, User } from "@prisma/client";

type OfferingWithDetails = Offering & {
    host: Pick<User, "id" | "name" | "email" | "avatar">;
    instances: EventInstance[];
    reviews: Review[];
};

interface EventDetailsProps {
    offering: OfferingWithDetails;
}

export function EventDetails({ offering }: EventDetailsProps) {
    const nextInstance = offering.instances[0];
    const averageRating = offering.averageRating ? Number(offering.averageRating) : null;
    const publishedReviews = offering.reviews.filter(r => r.status === "PUBLISHED");

    return (
        <div className="space-y-8">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap gap-4">
                {nextInstance && (
                    <>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(nextInstance.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>
                                {formatTime(nextInstance.startTime)} - {formatTime(nextInstance.endTime)}
                            </span>
                        </div>
                    </>
                )}
                {offering.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{offering.city}, {offering.state}</span>
                    </div>
                )}
                {averageRating && (
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({offering.reviewCount} reviews)</span>
                    </div>
                )}
            </div>

            {/* Tags */}
            {(offering.cuisineTypes.length > 0 || offering.dietaryOptions.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {offering.cuisineTypes.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary">
                            <Utensils className="h-3 w-3 mr-1" />
                            {cuisine}
                        </Badge>
                    ))}
                    {offering.dietaryOptions.map((dietary) => (
                        <Badge key={dietary} variant="secondary">
                            <Leaf className="h-3 w-3 mr-1" />
                            {dietary}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Description */}
            <section>
                <h2 className="text-xl font-semibold mb-4">About this experience</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                        {offering.description}
                    </p>
                </div>
            </section>

            {/* Features */}
            {offering.features.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">What's included</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {offering.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-2">
                                <div className="h-5 w-5 rounded-full bg-accent-100 flex items-center justify-center">
                                    <span className="text-accent-600 text-xs">✓</span>
                                </div>
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Location */}
            {offering.address && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">Location</h2>
                    <div className="rounded-xl border-2 border-border overflow-hidden">
                        {/* Map placeholder */}
                        <div className="h-48 bg-muted flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="p-4">
                            <p className="font-medium">{offering.address}</p>
                            <p className="text-muted-foreground">
                                {offering.city}, {offering.state}
                            </p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${offering.address}, ${offering.city}, ${offering.state}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-2 text-sm text-accent-600 hover:underline"
                            >
                                Get directions →
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* Host Info */}
            <section>
                <h2 className="text-xl font-semibold mb-4">About your host</h2>
                <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-border">
                    <AvatarWithFallback
                        src={offering.host.avatar}
                        alt={offering.host.name || "Host"}
                        fallback={getInitials(offering.host.name || "H")}
                        size="lg"
                    />
                    <div className="flex-1">
                        <h3 className="font-semibold">{offering.host.name || "Host"}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Hosting since {new Date().getFullYear()}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {offering.totalBookings} bookings
                            </span>
                            {averageRating && (
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {averageRating.toFixed(1)} rating
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews */}
            {publishedReviews.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4">
                        Reviews ({publishedReviews.length})
                    </h2>
                    <div className="space-y-4">
                        {publishedReviews.slice(0, 5).map((review) => (
                            <div key={review.id} className="p-4 rounded-xl border-2 border-border">
                                <div className="flex items-center gap-2 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-4 w-4 ${star <= review.rating
                                                    ? "fill-yellow-400 text-yellow-400"
                                                    : "text-muted"
                                                }`}
                                        />
                                    ))}
                                    <span className="text-sm text-muted-foreground ml-2">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-muted-foreground">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Cancellation Policy */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Cancellation policy</h2>
                <div className="p-4 rounded-xl bg-muted">
                    {offering.cancellationPolicy === "FLEXIBLE" && (
                        <div>
                            <p className="font-medium">Flexible cancellation</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Full refund if cancelled 24 hours before the event.
                            </p>
                        </div>
                    )}
                    {offering.cancellationPolicy === "MODERATE" && (
                        <div>
                            <p className="font-medium">Moderate cancellation</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Full refund if cancelled 7 days before. 50% refund within 7 days.
                            </p>
                        </div>
                    )}
                    {offering.cancellationPolicy === "STRICT" && (
                        <div>
                            <p className="font-medium">Strict cancellation</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Full refund if cancelled 14 days before. No refund within 14 days.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
