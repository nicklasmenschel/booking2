import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string;
    label?: string;
    hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, hint, id, ...props }, ref) => {
        const inputId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {label}
                    </label>
                )}
                <input
                    type={type}
                    id={inputId}
                    className={cn(
                        "flex h-12 w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base transition-colors",
                        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
                        "placeholder:text-muted-foreground",
                        "focus:border-foreground focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        error && "border-destructive focus:border-destructive",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {hint && !error && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
                )}
                {error && (
                    <p className="mt-1.5 text-sm text-destructive">{error}</p>
                )}
            </div>
        );
    }
);
Input.displayName = "Input";

export { Input };
