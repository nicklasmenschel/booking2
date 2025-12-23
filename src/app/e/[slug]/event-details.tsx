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
        <div className="space-y-16">
            {/* Quick Info Bar */}
            <div className="flex flex-wrap gap-6">
                {nextInstance && (
                    <>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-5 w-5" />
                            <span className="text-base">{formatDate(nextInstance.date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="h-5 w-5" />
                            <span className="text-base">
                                {formatTime(nextInstance.startTime)} - {formatTime(nextInstance.endTime)}
                            </span>
                        </div>
                    </>
                )}
                {offering.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-5 w-5" />
                        <span className="text-base">{offering.city}, {offering.state}</span>
                    </div>
                )}
                {averageRating && (
                    <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium text-base">{averageRating.toFixed(1)}</span>
                        <span className="text-gray-600 text-base">({offering.reviewCount} reviews)</span>
                    </div>
                )}
            </div>

            {/* Tags */}
            {(offering.cuisineTypes.length > 0 || offering.dietaryOptions.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {offering.cuisineTypes.map((cuisine) => (
                        <Badge key={cuisine} variant="secondary" className="text-sm px-3 py-1">
                            <Utensils className="h-3 w-3 mr-1" />
                            {cuisine}
                        </Badge>
                    ))}
                    {offering.dietaryOptions.map((dietary) => (
                        <Badge key={dietary} variant="secondary" className="text-sm px-3 py-1">
                            <Leaf className="h-3 w-3 mr-1" />
                            {dietary}
                        </Badge>
                    ))}
                </div>
            )}

            {/* Description */}
            <section>
                <h2 className="text-3xl font-semibold mb-6 text-gray-900">About this experience</h2>
                <div className="prose prose-gray max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {offering.description}
                    </p>
                </div>
            </section>

            {/* Features */}
            {offering.features.length > 0 && (
                <section>
                    <h2 className="text-3xl font-semibold mb-6 text-gray-900">What's included</h2>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {offering.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3">
                                <div className="h-6 w-6 rounded-full bg-[#F7F3ED] flex items-center justify-center flex-shrink-0">
                                    <span className="text-[#C9A76B] text-sm font-semibold">✓</span>
                                </div>
                                <span className="text-base text-gray-700">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Location */}
            {offering.address && (
                <section>
                    <h2 className="text-3xl font-semibold mb-6 text-gray-900">Location</h2>
                    <div className="rounded-2xl border-2 border-gray-200 overflow-hidden">
                        {/* Map placeholder */}
                        <div className="h-64 bg-gray-100 flex items-center justify-center">
                            <MapPin className="h-10 w-10 text-gray-400" />
                        </div>
                        <div className="p-6">
                            <p className="font-semibold text-lg text-gray-900">{offering.address}</p>
                            <p className="text-gray-600 mt-1">
                                {offering.city}, {offering.state}
                            </p>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${offering.address}, ${offering.city}, ${offering.state}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block mt-4 text-base text-[#C9A76B] hover:underline font-medium"
                            >
                                Get directions →
                            </a>
                        </div>
                    </div>
                </section>
            )}

            {/* Host Info */}
            <section>
                <h2 className="text-3xl font-semibold mb-6 text-gray-900">About your host</h2>
                <div className="flex items-start gap-6 p-8 rounded-2xl border-2 border-gray-200">
                    <AvatarWithFallback
                        src={offering.host.avatar}
                        alt={offering.host.name || "Host"}
                        fallback={getInitials(offering.host.name || "H")}
                        size="lg"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">{offering.host.name || "Host"}</h3>
                        <p className="text-base text-gray-600 mt-1">
                            Hosting since {new Date().getFullYear()}
                        </p>
                        <div className="flex items-center gap-6 mt-3 text-base text-gray-600">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                {offering.totalBookings} bookings
                            </span>
                            {averageRating && (
                                <span className="flex items-center gap-2">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
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
                    <h2 className="text-3xl font-semibold mb-6 text-gray-900">
                        Reviews ({publishedReviews.length})
                    </h2>
                    <div className="space-y-4">
                        {publishedReviews.slice(0, 5).map((review) => (
                            <div key={review.id} className="p-6 rounded-2xl border-2 border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= review.rating
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                                }`}
                                        />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-base text-gray-600 leading-relaxed">{review.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Cancellation Policy */}
            <section>
                <h2 className="text-3xl font-semibold mb-6 text-gray-900">Cancellation policy</h2>
                <div className="p-6 rounded-2xl bg-gray-50">
                    {offering.cancellationPolicy === "FLEXIBLE" && (
                        <div>
                            <p className="font-semibold text-lg text-gray-900">Flexible cancellation</p>
                            <p className="text-base text-gray-600 mt-2">
                                Full refund if cancelled 24 hours before the event.
                            </p>
                        </div>
                    )}
                    {offering.cancellationPolicy === "MODERATE" && (
                        <div>
                            <p className="font-semibold text-lg text-gray-900">Moderate cancellation</p>
                            <p className="text-base text-gray-600 mt-2">
                                Full refund if cancelled 7 days before. 50% refund within 7 days.
                            </p>
                        </div>
                    )}
                    {offering.cancellationPolicy === "STRICT" && (
                        <div>
                            <p className="font-semibold text-lg text-gray-900">Strict cancellation</p>
                            <p className="text-base text-gray-600 mt-2">
                                Full refund if cancelled 14 days before. No refund within 14 days.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
