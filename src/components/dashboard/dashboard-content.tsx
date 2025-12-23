"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Utensils, Sparkles } from "lucide-react";

interface DashboardContentProps {
    offerings: any[];
    hasRestaurant: boolean;
}

export function DashboardContent({ offerings, hasRestaurant }: DashboardContentProps) {
    const router = useRouter();
    const [showOnboarding, setShowOnboarding] = useState(offerings.length === 0);

    if (showOnboarding) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <Sparkles className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">
                            Welcome to Garden Table!
                        </h1>
                        <p className="text-lg text-slate-600">
                            What would you like to create?
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Event Option */}
                        <button
                            onClick={() => {
                                setShowOnboarding(false);
                                router.push("/create?type=event");
                            }}
                            className="group p-8 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                        >
                            <Calendar className="h-12 w-12 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Create an Event
                            </h2>
                            <p className="text-slate-600 mb-4">
                                Host cooking classes, workshops, wine tastings, and more
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>✓ One-time or recurring events</li>
                                <li>✓ Accept bookings & payments</li>
                                <li>✓ Manage guest lists</li>
                                <li>✓ Send automated reminders</li>
                            </ul>
                        </button>

                        {/* Restaurant Option */}
                        <button
                            onClick={() => {
                                setShowOnboarding(false);
                                router.push("/create?type=restaurant");
                            }}
                            className="group p-8 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left"
                        >
                            <Utensils className="h-12 w-12 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">
                                Setup Restaurant
                            </h2>
                            <p className="text-slate-600 mb-4">
                                Full restaurant management system with reservations & CRM
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>✓ Floor plan editor</li>
                                <li>✓ Reservation management</li>
                                <li>✓ Guest CRM & analytics</li>
                                <li>✓ Table QR payments</li>
                            </ul>
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            You can create both types later from your dashboard
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Manage your events and restaurant</p>
                </div>
                <Button
                    onClick={() => setShowOnboarding(true)}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Create New
                </Button>
            </div>

            {/* Offerings List */}
            <div className="grid gap-4">
                {offerings.map((offering) => (
                    <div
                        key={offering.id}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/e/${offering.slug}`)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {offering.type === "RESTAURANT" ? (
                                        <Utensils className="h-5 w-5 text-purple-600" />
                                    ) : (
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                    )}
                                    <h3 className="text-xl font-semibold text-slate-900">
                                        {offering.name}
                                    </h3>
                                </div>
                                <p className="text-slate-600 line-clamp-2">
                                    {offering.description}
                                </p>
                                <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
                                    <span>{offering._count.bookings} bookings</span>
                                    {offering.instances.length > 0 && (
                                        <span>
                                            Next: {new Date(offering.instances[0].startTime).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {offerings.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-slate-600">No offerings yet. Create your first one!</p>
                </div>
            )}
        </div>
    );
}
