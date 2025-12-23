import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnhancedSearchFilters } from "@/components/discover/enhanced-search-filters";
import {
    MapPin,
    Calendar,
    Star,
    ArrowLeft
} from "lucide-react";

interface SearchParams {
    q?: string;
    category?: string;
    city?: string;
    dateStart?: string;
    dateEnd?: string;
    priceMin?: string;
    priceMax?: string;
    categories?: string;
    eventTypes?: string;
    distance?: string;
    guestCount?: string;
    minRating?: string;
    amenities?: string;
    sortBy?: string;
}

export default async function DiscoverPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const {
        q,
        category,
        city,
        dateStart,
        dateEnd,
        priceMin,
        priceMax,
        categories,
        eventTypes,
        distance,
        guestCount,
        minRating,
        amenities,
        sortBy,
    } = searchParams;

    // Build query with enhanced filters
    const andConditions: any[] = [
        { status: "PUBLISHED" }
    ];

    // Search query
    if (q) {
        andConditions.push({
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
                { tagline: { contains: q, mode: "insensitive" } },
            ]
        });
    }

    // Category filter (legacy single category)
    if (category) {
        andConditions.push({
            OR: [
                { category: { equals: category, mode: "insensitive" } },
                { features: { has: category } }
            ]
        });
    }

    // Multiple categories
    if (categories) {
        const categoryList = categories.split(",").filter(Boolean);
        if (categoryList.length > 0) {
            andConditions.push({
                OR: [
                    { category: { in: categoryList } },
                    { features: { hasSome: categoryList } }
                ]
            });
        }
    }

    // Event types
    if (eventTypes) {
        const typeList = eventTypes.split(",").filter(Boolean);
        if (typeList.length < 3) {
            andConditions.push({
                type: { in: typeList }
            });
        }
    }

    // Price range
    if (priceMin || priceMax) {
        const min = priceMin ? parseFloat(priceMin) : 0;
        const max = priceMax ? parseFloat(priceMax) : 999999;
        andConditions.push({
            basePrice: {
                gte: min,
                lte: max,
            }
        });
    }

    // Rating
    if (minRating) {
        const rating = parseFloat(minRating);
        andConditions.push({
            averageRating: {
                gte: rating
            }
        });
    }

    // Amenities
    if (amenities) {
        const amenityList = amenities.split(",").filter(Boolean);
        if (amenityList.length > 0) {
            andConditions.push({
                features: { hasSome: amenityList }
            });
        }
    }

    // Fetch published offerings
    const offerings = await db.offering.findMany({
        where: {
            AND: andConditions
        },
        include: {
            host: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
            instances: {
                where: {
                    date: { gte: new Date() },
                    status: { not: "CANCELLED" },
                },
                orderBy: { date: "asc" },
                take: 1,
            },
        },
        orderBy: (() => {
            switch (sortBy) {
                case "highest-rated":
                    return [{ averageRating: "desc" }, { reviewCount: "desc" }];
                case "lowest-price":
                    return [{ basePrice: "asc" }];
                case "soonest":
                    return [{ instances: { _count: "desc" } }];
                case "nearest":
                    // Would need location data for this
                    return [{ popularityScore: "desc" }];
                default:
                    return [{ popularityScore: "desc" }, { createdAt: "desc" }];
            }
        })(),
        take: 50,
    });

    // Filter instances by date range if provided
    let filteredOfferings = offerings;
    if (dateStart || dateEnd) {
        filteredOfferings = offerings.filter(offering => {
            if (offering.instances.length === 0) return false;
            const instanceDate = new Date(offering.instances[0].date);
            if (dateStart && instanceDate < new Date(dateStart)) return false;
            if (dateEnd && instanceDate > new Date(dateEnd)) return false;
            return true;
        });
    }

    // Filter by guest count if provided
    if (guestCount) {
        const count = parseInt(guestCount);
        filteredOfferings = filteredOfferings.filter(offering => {
            return offering.maxPartySize ? offering.maxPartySize >= count : offering.capacity >= count;
        });
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header - Premium */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">
                <div className="max-w-[1280px] mx-auto px-6 md:px-10 flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-lg font-semibold">Garden Table</span>
                    </Link>
                    <Link href="/sign-in">
                        <Button variant="ghost" size="md">Sign in</Button>
                    </Link>
                </div>
            </header>

            {/* Hero - Bold & Generous */}
            <section className="py-20 px-6 md:px-10 bg-gray-50">
                <div className="max-w-[1280px] mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 text-center mb-12 tracking-tight">
                        Find something delicious
                    </h1>

                    <EnhancedSearchFilters />

                </div>
            </section>

            {/* Results - Clean Grid */}
            <section className="py-16 px-6 md:px-10">
                <div className="max-w-[1280px] mx-auto">
                    <h2 className="text-2xl font-semibold mb-10 text-gray-900">
                        {filteredOfferings.length > 0
                            ? `${filteredOfferings.length} ${filteredOfferings.length === 1 ? "experience" : "experiences"} found`
                            : "No events found"}
                    </h2>

                    {filteredOfferings.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredOfferings.map((offering: any) => {
                                const nextInstance = offering.instances[0];
                                const averageRating = offering.averageRating ? Number(offering.averageRating) : null;

                                return (
                                    <Link key={offering.id} href={`/e/${offering.slug}`}>
                                        <Card interactive className="overflow-hidden h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border-2 border-gray-200 rounded-2xl">
                                            {/* Cover Image */}
                                            <div className="relative aspect-[4/3]">
                                                <img
                                                    src={offering.coverImage}
                                                    alt={offering.name}
                                                    className="w-full h-full object-cover"
                                                />
                                                {/* Host Avatar */}
                                                {offering.host.avatar && (
                                                    <div className="absolute bottom-3 right-3">
                                                        <img
                                                            src={offering.host.avatar}
                                                            alt={offering.host.name || "Host"}
                                                            className="h-12 w-12 rounded-full border-2 border-white shadow-lg"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-5 space-y-3">
                                                <h3 className="text-lg font-semibold line-clamp-2 text-gray-900">{offering.name}</h3>

                                                {/* Meta info */}
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    {nextInstance && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(nextInstance.date)}
                                                        </span>
                                                    )}
                                                    {offering.city && (
                                                        <span className="flex items-center gap-1.5">
                                                            <MapPin className="h-4 w-4" />
                                                            {offering.city}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                {averageRating && (
                                                    <div className="flex items-center gap-1.5 text-sm">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium text-gray-900">{averageRating.toFixed(1)}</span>
                                                        <span className="text-gray-600">({offering.reviewCount})</span>
                                                    </div>
                                                )}

                                                {/* Price */}
                                                <div className="pt-3 border-t border-gray-200 mt-3">
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {formatCurrency(Number(offering.basePrice), offering.currency)}
                                                    </span>
                                                    <span className="text-sm text-gray-600"> / person</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <p className="text-lg text-gray-600 mb-6">
                                No events found matching your criteria.
                            </p>
                            <Link href="/discover">
                                <Button variant="secondary" size="lg">Clear Filters</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
