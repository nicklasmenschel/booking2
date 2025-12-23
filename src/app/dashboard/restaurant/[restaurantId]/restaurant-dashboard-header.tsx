import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import {
    ArrowLeft,
    Edit,
    Eye,
    MoreVertical,
    Users,
    DollarSign,
    CheckCircle2,
    Clock,
} from "lucide-react";

interface RestaurantDashboardHeaderProps {
    offering: {
        id: string;
        name: string;
        status: string;
        slug: string;
        coverImage: string;
        city?: string | null;
        priceLevel: number;
    };
    stats: {
        totalBookings: number;
        totalGuests: number;
        checkedInCount: number;
        walkInCount: number;
        estimatedRevenue: number;
    };
}

export function RestaurantDashboardHeader({
    offering,
    stats,
}: RestaurantDashboardHeaderProps) {
    const statusColors = {
        PUBLISHED: "bg-green-500",
        DRAFT: "bg-gray-500",
        PAUSED: "bg-yellow-500",
        ARCHIVED: "bg-gray-400",
    };

    const priceLevelLabels = ["$", "$$", "$$$", "$$$$"];

    return (
        <div className="border-b border-border bg-card">
            <div className="container py-6">
                {/* Top Bar */}
                <div className="flex items-center justify-between mb-4">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Link>

                    <div className="flex items-center gap-2">
                        <Link href={`/e/${offering.slug}`} target="_blank">
                            <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Public Page
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Restaurant
                        </Button>
                        <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Restaurant Info */}
                <div className="flex gap-6">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-border">
                        <img
                            src={offering.coverImage}
                            alt={offering.name}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h1 className="text-2xl font-bold mb-1">{offering.name}</h1>
                                <div className="flex items-center gap-3">
                                    <Badge
                                        className={`${statusColors[offering.status as keyof typeof statusColors] || "bg-gray-500"} text-white`}
                                    >
                                        {offering.status}
                                    </Badge>
                                    <Badge variant="secondary">
                                        🍽️ Restaurant
                                    </Badge>
                                    {offering.city && (
                                        <span className="text-sm text-muted-foreground">
                                            {offering.city}
                                        </span>
                                    )}
                                    {offering.priceLevel > 0 && (
                                        <span className="text-sm font-medium">
                                            {priceLevelLabels[offering.priceLevel - 1] || "$"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Today's Stats */}
                        <div className="grid grid-cols-5 gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Reservations</p>
                                    <p className="font-semibold">{stats.totalBookings}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Guests</p>
                                    <p className="font-semibold">{stats.totalGuests}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Checked In</p>
                                    <p className="font-semibold">{stats.checkedInCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Walk-ins</p>
                                    <p className="font-semibold">{stats.walkInCount}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Est. Revenue</p>
                                    <p className="font-semibold">{formatCurrency(stats.estimatedRevenue, "USD")}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

