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
                        className="block text-sm font-medium text-gray-900 mb-2"
                    >
                        {label}
                    </label>
                )}
                <textarea
                    id={textareaId}
                    className={cn(
                        "flex min-h-[120px] w-full rounded-xl border-2 border-gray-300 bg-white px-4 py-3 text-base transition-colors",
                        "placeholder:text-gray-500",
                        "focus:border-[#C9A76B] focus:outline-none focus:ring-2 focus:ring-[#F7F3ED]",
                        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
                        "resize-none",
                        error && "border-[#FF5722] focus:border-[#FF5722] focus:ring-[#FFF3F0]",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {hint && !error && (
                    <p className="mt-1.5 text-sm text-gray-600">{hint}</p>
                )}
                {error && (
                    <p className="mt-1.5 text-sm text-[#FF5722]">{error}</p>
                )}
            </div>
        );
    }
);
Textarea.displayName = "Textarea";

export { Textarea };
