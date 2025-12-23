import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border font-medium transition-colors",
    {
        variants: {
            variant: {
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                success:
                    "border-transparent bg-[#9CAF6E] text-white",
                warning:
                    "border-transparent bg-warning text-white",
                error:
                    "border-transparent bg-[#FF5722] text-white",
                info:
                    "border-transparent bg-info text-white",
            },
            size: {
                sm: "px-3 py-1.5 text-xs",       // 12px horizontal, 6px vertical
                md: "px-4 py-2 text-sm",         // 16px horizontal, 8px vertical
                lg: "px-5 py-2.5 text-sm",       // 20px horizontal, 10px vertical
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    size?: 'sm' | 'md' | 'lg';
}

function Badge({ className, variant, size, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
    );
}

export { Badge, badgeVariants };
