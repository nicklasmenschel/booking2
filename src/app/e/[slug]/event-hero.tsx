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
            {/* Cover Image */}
            <div className="relative h-[50vh] min-h-[400px] max-h-[600px]">
                <img
                    src={coverImage}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Navigation */}
                <div className="absolute top-0 left-0 right-0 p-4">
                    <div className="container flex items-center justify-between">
                        <Link href="/">
                            <Button variant="ghost" size="sm" className="glass text-white hover:bg-white/20">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleShare}
                            className="glass text-white hover:bg-white/20"
                        >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="container">
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                                    {name}
                                </h1>
                            </div>
                            <div className="flex-shrink-0">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full pl-4 pr-2 py-2">
                                    <span className="text-white text-sm font-medium">
                                        Hosted by {host.name || "Host"}
                                    </span>
                                    <AvatarWithFallback
                                        src={host.avatar}
                                        alt={host.name || "Host"}
                                        fallback={getInitials(host.name || "H")}
                                        size="md"
                                        className="border-2 border-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
