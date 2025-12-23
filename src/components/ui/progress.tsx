"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressRingProps {
    progress: number; // 0 to 100
    size?: number;
    strokeWidth?: number;
    className?: string;
    showPercentage?: boolean;
    color?: string;
}

export function ProgressRing({
    progress,
    size = 80,
    strokeWidth = 8,
    className,
    showPercentage = false,
    color = "currentColor",
}: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className={cn("relative inline-flex", className)}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-muted"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    className="transition-[stroke-dashoffset] duration-500 ease-out"
                    style={{ color }}
                />
            </svg>
            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                </div>
            )}
        </div>
    );
}

interface ProgressBarProps {
    progress: number; // 0 to 100
    className?: string;
    showPercentage?: boolean;
    variant?: "default" | "success" | "warning" | "danger";
}

export function ProgressBar({
    progress,
    className,
    showPercentage = false,
    variant = "default",
}: ProgressBarProps) {
    const variantColors = {
        default: "bg-primary",
        success: "bg-[#9CAF6E]",
        warning: "bg-warning",
        danger: "bg-destructive",
    };

    return (
        <div className={cn("w-full", className)}>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-500 ease-out",
                        variantColors[variant]
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
            </div>
            {showPercentage && (
                <p className="mt-1 text-right text-sm text-muted-foreground">
                    {Math.round(progress)}%
                </p>
            )}
        </div>
    );
}

interface BookingProgressProps {
    booked: number;
    capacity: number;
    size?: number;
    className?: string;
}

export function BookingProgress({
    booked,
    capacity,
    size = 60,
    className,
}: BookingProgressProps) {
    const progress = (booked / capacity) * 100;
    const remaining = capacity - booked;

    let color = "#22c55e"; // Green - plenty available
    if (progress >= 90) {
        color = "#ef4444"; // Red - almost sold out
    } else if (progress >= 70) {
        color = "#f59e0b"; // Orange - filling up
    }

    return (
        <div className={cn("flex flex-col items-center gap-1", className)}>
            <ProgressRing progress={progress} size={size} color={color} />
            <div className="text-center">
                <p className="text-lg font-semibold">
                    {booked}/{capacity}
                </p>
                <p className="text-xs text-muted-foreground">
                    {remaining === 0 ? "Sold out" : `${remaining} left`}
                </p>
            </div>
        </div>
    );
}
