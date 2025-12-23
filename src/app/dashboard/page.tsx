import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Utensils, ExternalLink } from "lucide-react";
import { DeleteOfferingButton } from "./delete-offering-button";

export default async function DashboardPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    // Get user's offerings
    const offerings = await db.offering.findMany({
        where: {
            host: {
                clerkId: userId,
            },
        },
        include: {
            instances: {
                where: {
                    startTime: {
                        gte: new Date(),
                    },
                },
                orderBy: {
                    startTime: "asc",
                },
                take: 5,
            },
            _count: {
                select: {
                    bookings: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Helper to get the management dashboard URL
    const getManagementUrl = (offering: typeof offerings[0]) => {
        if (offering.type === "RESTAURANT") {
            return `/dashboard/restaurant/${offering.id}`;
        }
        return `/dashboard/events/${offering.id}`;
    };

    // Helper to get the public page URL
    const getPublicUrl = (offering: typeof offerings[0]) => {
        return `/e/${offering.slug}`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="px-6 md:px-10 py-20">
                <div className="max-w-[1280px] mx-auto">
                    {/* Header with generous spacing like homepage */}
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h1 className="text-6xl font-bold text-gray-900 mb-3 tracking-tight">
                                Dashboard
                            </h1>
                            <p className="text-xl text-gray-600">
                                Manage your events and services
                            </p>
                        </div>
                        <Link href="/create">
                            <Button size="lg" variant="primary">
                                <Plus className="h-5 w-5 mr-2" />
                                Create
                            </Button>
                        </Link>
                    </div>

                    {offerings.length === 0 ? (
                        /* Empty state with generous spacing */
                        <div className="bg-white rounded-2xl border-2 border-gray-300 p-20 text-center">
                            <div className="max-w-lg mx-auto">
                                <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
                                    Get Started
                                </h2>
                                <p className="text-lg text-gray-600 mb-10 leading-relaxed">
                                    Create your first event or service to start accepting bookings
                                </p>
                                <Link href="/create">
                                    <Button size="lg" variant="primary">
                                        <Plus className="h-5 w-5 mr-2" />
                                        Create Now
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Offerings grid with generous gaps */
                        <div className="grid gap-8">
                            {offerings.map((offering) => (
                                <div
                                    key={offering.id}
                                    className="bg-white rounded-2xl border-2 border-gray-300 p-10 hover:shadow-xl hover:border-[#C9A76B] transition-all duration-200"
                                >
                                    <div className="flex items-start justify-between">
                                        <Link
                                            href={getManagementUrl(offering)}
                                            className="flex-1 group"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                {offering.type === "RESTAURANT" ? (
                                                    <Utensils className="h-8 w-8 text-[#C9A76B]" />
                                                ) : (
                                                    <Calendar className="h-8 w-8 text-[#C9A76B]" />
                                                )}
                                                <h3 className="text-3xl font-semibold text-gray-900 group-hover:text-[#C9A76B] transition-colors">
                                                    {offering.name}
                                                </h3>
                                                <span className={`px-4 py-2 text-sm font-medium rounded-full ${offering.status === "PUBLISHED"
                                                    ? "bg-[#9CAF6E] text-white"
                                                    : "bg-amber-100 text-amber-700"
                                                    }`}>
                                                    {offering.status === "PUBLISHED" ? "Live" : "Draft"}
                                                </span>
                                            </div>
                                            <p className="text-lg text-gray-600 line-clamp-2 leading-relaxed mb-6">
                                                {offering.description}
                                            </p>
                                            <div className="flex items-center gap-8 text-base text-gray-600">
                                                <span className="font-medium">{offering._count.bookings} bookings</span>
                                                {offering.type === "RESTAURANT" ? (
                                                    <span className="text-[#C9A76B] font-medium">Ongoing Service</span>
                                                ) : offering.instances.length > 0 ? (
                                                    <span>
                                                        Next: {new Date(offering.instances[0].startTime).toLocaleDateString()}
                                                    </span>
                                                ) : (
                                                    <span className="text-amber-600">No dates scheduled</span>
                                                )}
                                            </div>
                                        </Link>
                                        <div className="flex items-center gap-3 ml-8">
                                            <Link
                                                href={getPublicUrl(offering)}
                                                target="_blank"
                                                className="p-3 text-gray-500 hover:text-[#C9A76B] hover:bg-gray-100 rounded-xl transition-colors"
                                                title="View public page"
                                            >
                                                <ExternalLink className="h-6 w-6" />
                                            </Link>
                                            <DeleteOfferingButton
                                                offeringId={offering.id}
                                                offeringName={offering.name}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
