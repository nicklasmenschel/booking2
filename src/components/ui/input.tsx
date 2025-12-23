"use client";

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, hint, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    className={`
            w-full h-12 px-4
            bg-white
            border ${error ? 'border-[#FF5722]' : 'border-gray-300'}
            rounded-xl
            text-base text-gray-900
            placeholder:text-gray-500
            transition-all duration-200
            hover:border-gray-400
            focus:border-[#C9A76B]
            focus:outline-none
            focus:ring-2 focus:ring-[#F7F3ED]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50
            ${className}
          `.replace(/\s+/g, ' ').trim()}
                    {...props}
                />
                {hint && !error && (
                    <p className="mt-1 text-xs text-gray-600">{hint}</p>
                )}
                {error && (
                    <p className="mt-1 text-sm text-[#FF5722]">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
