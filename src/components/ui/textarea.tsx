import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
    hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, label, hint, id, ...props }, ref) => {
        const textareaId = id || React.useId();

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-foreground mb-2"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        "flex min-h-[120px] w-full rounded-xl border-2 border-input bg-background px-4 py-3 text-base transition-colors",
                        "placeholder:text-muted-foreground",
                        "focus:border-foreground focus:outline-none",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
