"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Share2, BarChart3 } from "lucide-react";

interface QuickActionsProps {
    hasOfferings: boolean;
}

export function QuickActions({ hasOfferings }: QuickActionsProps) {
    if (!hasOfferings) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-3">
            <Link href="/create">
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Event
                </Button>
            </Link>
        </div>
    );
}
