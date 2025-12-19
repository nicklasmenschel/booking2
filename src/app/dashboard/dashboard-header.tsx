"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Calendar, Settings } from "lucide-react";

export function DashboardHeader() {
    const router = useRouter();

    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <span className="text-xl font-bold">Garden Table</span>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-sm font-medium hover:text-accent-500 transition-colors"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/dashboard/calendar"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        Calendar
                    </Link>
                    <Link
                        href="/dashboard/restaurant/tables"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Settings className="h-4 w-4" /> {/* Reuse icon... */}
                        Tables
                    </Link>
                    <Link
                        href="/dashboard/restaurant/shifts"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Calendar className="h-4 w-4" />
                        Shifts
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/create">
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Event
                        </Button>
                    </Link>
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                avatarBox: "h-9 w-9",
                            },
                        }}
                    />
                </div>
            </div>
        </header>
    );
}
