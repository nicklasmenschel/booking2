import * as React from "react";
import { cn } from "@/lib/utils";

const Avatar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        size?: "sm" | "md" | "lg" | "xl";
    }
>(({ className, size = "md", ...props }, ref) => {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-lg",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "relative flex shrink-0 overflow-hidden rounded-full",
                sizeClasses[size],
                className
            )}
            {...props}
        />
    );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
    HTMLImageElement,
    React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, alt, ...props }, ref) => (
    <img
        ref={ref}
        alt={alt}
        className={cn("aspect-square h-full w-full object-cover", className)}
        {...props}
    />
));
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
            className
        )}
        {...props}
    />
));
AvatarFallback.displayName = "AvatarFallback";

interface AvatarWithFallbackProps {
    src?: string | null;
    alt: string;
    fallback: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const AvatarWithFallback = ({
    src,
    alt,
    fallback,
    size = "md",
    className,
}: AvatarWithFallbackProps) => {
    const [hasError, setHasError] = React.useState(false);

    return (
        <Avatar size={size} className={className}>
            {src && !hasError ? (
                <AvatarImage
                    src={src}
                    alt={alt}
                    onError={() => setHasError(true)}
                />
            ) : (
                <AvatarFallback>{fallback}</AvatarFallback>
            )}
        </Avatar>
    );
};

export { Avatar, AvatarImage, AvatarFallback, AvatarWithFallback };
