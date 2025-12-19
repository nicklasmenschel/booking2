"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8",
    };

    return (
        <Loader2
            className={cn("animate-spin text-muted-foreground", sizeClasses[size], className)}
        />
    );
}

interface LoadingProps {
    text?: string;
    className?: string;
}

export function Loading({ text = "Loading...", className }: LoadingProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">{text}</p>
        </div>
    );
}

interface LoadingOverlayProps {
    isLoading: boolean;
    text?: string;
    className?: string;
    children: React.ReactNode;
}

export function LoadingOverlay({
    isLoading,
    text,
    className,
    children,
}: LoadingOverlayProps) {
    return (
        <div className={cn("relative", className)}>
            {children}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                    <Loading text={text} />
                </div>
            )}
        </div>
    );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Skeleton({ className, ...props }: SkeletonProps) {
    return (
        <div
            className={cn(
                "animate-pulse rounded-lg bg-muted",
                className
            )}
            {...props}
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-2xl border-2 border-border p-6 space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
            </div>
        </div>
    );
}

export function SkeletonEventCard() {
    return (
        <div className="rounded-2xl border-2 border-border overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl mt-4" />
            </div>
        </div>
    );
}

export function SkeletonBookingRow() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-border">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
    );
}
