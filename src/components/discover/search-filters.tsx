"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initial state from URL
    const initialQuery = searchParams.get("q") || "";
    const [query, setQuery] = useState(initialQuery);
    const activeCategory = searchParams.get("category");

    // Debounce search input to avoid too many URL updates
    // Simplified debounce effect since I might not have the hook
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query === initialQuery) return;

            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set("q", query);
            } else {
                params.delete("q");
            }
            router.push(`/discover?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timer);
    }, [query, router, searchParams, initialQuery]);

    const handleCategoryClick = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (activeCategory === category) {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        router.push(`/discover?${params.toString()}`);
    };

    const categories = ["Wine Tasting", "Cooking Class", "Brunch", "Dinner Party", "Private Chef"];

    return (
        <div>
            {/* Search */}
            <div className="max-w-2xl mx-auto mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for events, cuisines, or locations..."
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

            {/* Filter Pills */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((category) => (
                    <Badge
                        key={category}
                        variant={activeCategory === category ? "default" : "secondary"}
                        className="px-4 py-2 cursor-pointer hover:bg-primary/90 hover:text-primary-foreground transition-colors"
                        onClick={() => handleCategoryClick(category)}
                    >
                        {category}
                    </Badge>
                ))}
            </div>
        </div>
    );
}
