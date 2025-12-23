"use client";

import Link from "next/link";
import { AvatarWithFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { ArrowLeft, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

interface EventHeroProps {
    name: string;
    coverImage: string;
    host: {
        id: string;
        name: string | null;
        avatar: string | null;
    };
}

export function EventHero({ name, coverImage, host }: EventHeroProps) {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: name,
                    url: window.location.href,
                });
            } catch {
                // User cancelled
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast.success("Link copied to clipboard!");
        }
    };

    return (
        <div className="relative">
            {/* Navigation Bar - Floating */}
            <div className="absolute top-0 left-0 right-0 z-20 p-6">
                <div className="max-w-[1280px] mx-auto flex items-center justify-between">
                    <Link href="/">
                        <Button variant="ghost" size="md" className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="md"
                        onClick={handleShare}
                        className="bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                    >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                    </Button>
                </div>
            </div>

            {/* Hero Image & Title */}
            <div className="relative h-[70vh] min-h-[600px] max-h-[800px]">
                <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay - not heavy */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                {/* Content - Bottom positioned */}
                <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-16">
                    <div className="max-w-[1280px] mx-auto">
                        <div className="max-w-[800px]">
                            <h1 className="text-6xl md:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
                                {name}
                            </h1>
                            {/* Host Info - Clean pill */}
                            <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full pl-5 pr-3 py-3 shadow-lg">
                                <span className="text-gray-900 text-base font-medium">
                                    Hosted by {host.name || "Host"}
                                </span>
                                <AvatarWithFallback
                                    src={host.avatar}
                                    alt={host.name || "Host"}
                                    fallback={getInitials(host.name || "H")}
                                    size="md"
                                    className="border-2 border-white shadow"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
