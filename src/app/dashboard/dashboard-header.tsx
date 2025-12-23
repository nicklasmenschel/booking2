"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutDashboard, Calendar } from "lucide-react";

export function DashboardHeader() {
    const router = useRouter();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">GT</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900">Garden Table</span>
                    </Link>

                    {/* Main Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/dashboard"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                        <Link
                            href="/dashboard/calendar"
                            className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                            <Calendar className="h-4 w-4" />
                            Calendar
                        </Link>
                    </nav>

                    {/* Right Side */}
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => router.push("/create")}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Create
                        </Button>
                        <UserButton afterSignOutUrl="/" />
                    </div>
                </div>
            </div>
        </header>
    );
}
