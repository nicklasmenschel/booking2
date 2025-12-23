"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, X, Filter, ChevronDown, MapPin } from "lucide-react";
import { useState, useEffect } from "react";

export function EnhancedSearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State from URL
    const [query, setQuery] = useState(searchParams.get("q") || "");
    const [showFilters, setShowFilters] = useState(false);
    const [dateRange, setDateRange] = useState({
        start: searchParams.get("dateStart") || "",
        end: searchParams.get("dateEnd") || "",
    });
    const [priceRange, setPriceRange] = useState({
        min: searchParams.get("priceMin") || "0",
        max: searchParams.get("priceMax") || "500",
    });
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        searchParams.get("categories")?.split(",").filter(Boolean) || []
    );
    const [eventTypes, setEventTypes] = useState<string[]>(
        searchParams.get("eventTypes")?.split(",").filter(Boolean) || ["ONE_TIME", "RECURRING", "RESTAURANT"]
    );
    const [distance, setDistance] = useState(searchParams.get("distance") || "25");
    const [guestCount, setGuestCount] = useState(searchParams.get("guestCount") || "");
    const [minRating, setMinRating] = useState(searchParams.get("minRating") || "0");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
        searchParams.get("amenities")?.split(",").filter(Boolean) || []
    );
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "recommended");

    const categories = [
        "Cooking Class",
        "Wine Tasting",
        "Concert",
        "Workshop",
        "Sports",
        "Fitness & Wellness",
        "Arts & Crafts",
        "Live Music",
        "Brunch",
        "Dinner Party",
        "Private Chef",
    ];

    const amenities = [
        "Wheelchair Accessible",
        "Family Friendly",
        "Vegetarian Options",
        "Vegan Options",
        "Gluten-Free Options",
        "BYOB Allowed",
        "Free Parking",
        "Outdoor Seating",
        "Bar Available",
        "Live Music",
    ];

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (query) params.set("q", query);
        if (dateRange.start) params.set("dateStart", dateRange.start);
        if (dateRange.end) params.set("dateEnd", dateRange.end);
        if (priceRange.min !== "0") params.set("priceMin", priceRange.min);
        if (priceRange.max !== "500") params.set("priceMax", priceRange.max);
        if (selectedCategories.length > 0) params.set("categories", selectedCategories.join(","));
        if (eventTypes.length < 3) params.set("eventTypes", eventTypes.join(","));
        if (distance !== "25") params.set("distance", distance);
        if (guestCount) params.set("guestCount", guestCount);
        if (minRating !== "0") params.set("minRating", minRating);
        if (selectedAmenities.length > 0) params.set("amenities", selectedAmenities.join(","));
        if (sortBy !== "recommended") params.set("sortBy", sortBy);

        router.push(`/discover?${params.toString()}`);
    };

    const clearFilters = () => {
        setQuery("");
        setDateRange({ start: "", end: "" });
        setPriceRange({ min: "0", max: "500" });
        setSelectedCategories([]);
        setEventTypes(["ONE_TIME", "RECURRING", "RESTAURANT"]);
        setDistance("25");
        setGuestCount("");
        setMinRating("0");
        setSelectedAmenities([]);
        setSortBy("recommended");
        router.push("/discover");
    };

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
        );
    };

    const toggleEventType = (type: string) => {
        setEventTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleAmenity = (amenity: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
        );
    };

    const activeFilterCount =
        (dateRange.start ? 1 : 0) +
        (dateRange.end ? 1 : 0) +
        (priceRange.min !== "0" || priceRange.max !== "500" ? 1 : 0) +
        selectedCategories.length +
        (eventTypes.length < 3 ? 1 : 0) +
        (distance !== "25" ? 1 : 0) +
        (guestCount ? 1 : 0) +
        (minRating !== "0" ? 1 : 0) +
        selectedAmenities.length;

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                applyFilters();
                            }
                        }}
                        placeholder="What are you looking for?"
                        className="pl-12 h-14 text-lg bg-background shadow-sm"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                        <Badge variant="primary" className="ml-1">
                            {activeFilterCount}
                        </Badge>
                    )}
                    <ChevronDown
                        className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
                    />
                </Button>

                <select
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        applyFilters();
                    }}
                    className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                    <option value="recommended">Recommended</option>
                    <option value="highest-rated">Highest Rated</option>
                    <option value="nearest">Nearest First</option>
                    <option value="lowest-price">Lowest Price</option>
                    <option value="soonest">Soonest Date</option>
                </select>

                {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                    </Button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
                <Card className="p-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Date Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Date Range</label>
                            <div className="space-y-2">
                                <Input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                                    placeholder="Start date"
                                />
                                <Input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                                    placeholder="End date"
                                />
                            </div>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const today = new Date();
                                        const tomorrow = new Date(today);
                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                        setDateRange({
                                            start: today.toISOString().split("T")[0],
                                            end: tomorrow.toISOString().split("T")[0],
                                        });
                                    }}
                                >
                                    Today
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const today = new Date();
                                        const weekend = new Date(today);
                                        weekend.setDate(today.getDate() + (6 - today.getDay()));
                                        setDateRange({
                                            start: today.toISOString().split("T")[0],
                                            end: weekend.toISOString().split("T")[0],
                                        });
                                    }}
                                >
                                    This Weekend
                                </Button>
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">
                                Price Range: ${priceRange.min} - ${priceRange.max}
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="10"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                    className="w-full"
                                />
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    step="10"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Event Types */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Event Type</label>
                            <div className="space-y-2">
                                {["ONE_TIME", "RECURRING", "RESTAURANT"].map((type) => (
                                    <label key={type} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={eventTypes.includes(type)}
                                            onChange={() => toggleEventType(type)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">
                                            {type === "ONE_TIME" && "One-time Events"}
                                            {type === "RECURRING" && "Recurring Events"}
                                            {type === "RESTAURANT" && "Restaurants"}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Category</label>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                                {categories.map((category) => (
                                    <Badge
                                        key={category}
                                        variant={selectedCategories.includes(category) ? "default" : "secondary"}
                                        className="cursor-pointer"
                                        onClick={() => toggleCategory(category)}
                                    >
                                        {category}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Guest Count */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Party Size</label>
                            <Input
                                type="number"
                                min="1"
                                value={guestCount}
                                onChange={(e) => setGuestCount(e.target.value)}
                                placeholder="Any size"
                            />
                        </div>

                        {/* Distance */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Distance</label>
                            <select
                                value={distance}
                                onChange={(e) => setDistance(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="5">Within 5 miles</option>
                                <option value="10">Within 10 miles</option>
                                <option value="25">Within 25 miles</option>
                                <option value="50">Within 50 miles</option>
                                <option value="100">Within 100 miles</option>
                                <option value="any">Any distance</option>
                            </select>
                        </div>

                        {/* Rating */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                            >
                                <option value="0">Any rating</option>
                                <option value="4.5">4.5+ stars</option>
                                <option value="4.0">4.0+ stars</option>
                                <option value="3.5">3.5+ stars</option>
                                <option value="3.0">3.0+ stars</option>
                            </select>
                        </div>

                        {/* Amenities */}
                        <div className="md:col-span-2 lg:col-span-3">
                            <label className="text-sm font-medium mb-2 block">Amenities & Features</label>
                            <div className="flex flex-wrap gap-2">
                                {amenities.map((amenity) => (
                                    <Badge
                                        key={amenity}
                                        variant={selectedAmenities.includes(amenity) ? "default" : "secondary"}
                                        className="cursor-pointer"
                                        onClick={() => toggleAmenity(amenity)}
                                    >
                                        {amenity}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear
                        </Button>
                        <Button onClick={applyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}

