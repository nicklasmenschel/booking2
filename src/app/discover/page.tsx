import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { SearchFilters } from "@/components/discover/search-filters";
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
}

export default async function DiscoverPage(props: { searchParams: Promise<SearchParams> }) {
    const searchParams = await props.searchParams;
    const { q, category, city } = searchParams;

    // Build query
    const where: any = {
        status: "PUBLISHED",
    };

    if (q) {
        where.OR = [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { city: { contains: q, mode: "insensitive" } },
            { cuisineTypes: { has: q } } // Exact match for array elements, simplistic but works for some cases
        ];
    }

    if (category) {
        where.OR = [
            ...((where.OR as any[]) || []),
            { category: { equals: category, mode: "insensitive" } },
            { features: { has: category } }
        ]
        // Actually, if we want specific category filter AND search query, we should use AND.
        // But for simplicity let's refine this properly.
    }

    // Better logic:
    const andConditions: any[] = [
        { status: "PUBLISHED" }
    ];

    if (q) {
        andConditions.push({
            OR: [
                { name: { contains: q, mode: "insensitive" } },
                { description: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
            ]
        });
    }

    if (category) {
        // Search in category field OR features array
        andConditions.push({
            OR: [
                { category: { equals: category, mode: "insensitive" } },
                { features: { has: category } }
            ]
        });
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
        orderBy: [
            { popularityScore: "desc" },
            { createdAt: "desc" },
        ],
        take: 20,
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border bg-background">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="font-bold">Garden Table</span>
                    </Link>
                    <Link href="/sign-in">
                        <Button variant="ghost" size="sm">Sign in</Button>
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="py-12 bg-muted/30">
                <div className="container">
                    <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
                        Find something delicious
                    </h1>

                    <SearchFilters />

                </div>
            </section>

            {/* Results */}
            <section className="py-8">
                <div className="container">
                    <h2 className="text-xl font-semibold mb-6">
                        {offerings.length > 0 ? "Popular experiences" : "No events found"}
                    </h2>

                    {offerings.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {offerings.map((offering: any) => {
                                const nextInstance = offering.instances[0];
                                const averageRating = offering.averageRating ? Number(offering.averageRating) : null;

                                return (
                                    <Link key={offering.id} href={`/e/${offering.slug}`}>
                                        <Card interactive className="overflow-hidden h-full hover:shadow-md transition-shadow">
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
                                                            className="h-10 w-10 rounded-full border-2 border-white"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="p-4 space-y-2">
                                                <h3 className="font-semibold line-clamp-1">{offering.name}</h3>

                                                {/* Meta info */}
                                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                    {nextInstance && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {formatDate(nextInstance.date)}
                                                        </span>
                                                    )}
                                                    {offering.city && (
                                                        <span className="flex items-center gap-1">
                                                            <MapPin className="h-3.5 w-3.5" />
                                                            {offering.city}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Rating */}
                                                {averageRating && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                                                        <span className="text-muted-foreground">({offering.reviewCount})</span>
                                                    </div>
                                                )}

                                                {/* Price */}
                                                <div className="pt-2 border-t border-border mt-2">
                                                    <span className="font-semibold">
                                                        {formatCurrency(Number(offering.basePrice), offering.currency)}
                                                    </span>
                                                    <span className="text-sm text-muted-foreground"> / person</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">
                                No events found matching your criteria.
                            </p>
                            <Link href="/discover">
                                <Button variant="outline">Clear Filters</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
