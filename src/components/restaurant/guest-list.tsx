"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { searchGuests } from "@/actions/guests";
import { Search, User, Mail, Phone, TrendingUp, Calendar } from "lucide-react";
import { format } from "date-fns";

interface GuestListProps {
    restaurantId: string;
    initialGuests: any[];
}

export function GuestList({ restaurantId, initialGuests }: GuestListProps) {
    const router = useRouter();
    const [guests, setGuests] = useState(initialGuests);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery) {
                setIsSearching(true);
                try {
                    const results = await searchGuests(restaurantId, searchQuery);
                    setGuests(results);
                } catch (error) {
                    console.error("Search failed:", error);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setGuests(initialGuests);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, restaurantId, initialGuests]);

    const getReliabilityColor = (guest: any) => {
        if (guest.totalBookings === 0) return "text-slate-600";
        const score = (guest.completedBookings / guest.totalBookings) * 100;
        return score >= 80 ? "text-green-600" : score >= 60 ? "text-yellow-600" : "text-red-600";
    };

    const getReliabilityScore = (guest: any) => {
        if (guest.totalBookings === 0) return "N/A";
        return ((guest.completedBookings / guest.totalBookings) * 100).toFixed(0) + "%";
    };

    return (
        <div className="space-y-4">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search by name, email, or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Guest List */}
            <div className="bg-white rounded-lg shadow-sm divide-y">
                {guests.length === 0 ? (
                    <div className="p-8 text-center text-slate-600">
                        {searchQuery ? "No guests found" : "No guests yet"}
                    </div>
                ) : (
                    guests.map((guest: any) => (
                        <div
                            key={guest.id}
                            onClick={() => router.push(`/dashboard/restaurant/guests/${guest.id}`)}
                            className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {guest.firstName[0]}
                                        {guest.lastName[0]}
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {guest.firstName} {guest.lastName}
                                        </h3>

                                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                                            {guest.email && (
                                                <div className="flex items-center gap-1">
                                                    <Mail className="h-3 w-3" />
                                                    {guest.email}
                                                </div>
                                            )}
                                            {guest.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {guest.phone}
                                                </div>
                                            )}
                                        </div>

                                        {guest.lastVisit && (
                                            <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                                                <Calendar className="h-3 w-3" />
                                                Last visit: {format(new Date(guest.lastVisit), "MMM d, yyyy")}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right space-y-2">
                                    <div className={`text-lg font-bold ${getReliabilityColor(guest)}`}>
                                        {getReliabilityScore(guest)}
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        {guest.totalBookings} visits
                                    </div>
                                    <div className="text-xs text-slate-600">
                                        ${Number(guest.totalSpent).toFixed(0)} spent
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
