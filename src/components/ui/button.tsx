"use client";

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className = '',
        variant = 'primary',
        size = 'md',
        disabled,
        children,
        ...props
    }, ref) => {
        // Base styles
        const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-base disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

        // Size styles - generous padding with floating text effect from all angles
        const sizeStyles = {
            sm: 'h-12 px-8 text-sm rounded-xl',     // 48px height, 32px horizontal - balanced float
            md: 'h-13 px-10 text-base rounded-xl',  // 52px height, 40px horizontal - generous all around
            lg: 'h-14 px-12 text-lg rounded-xl',    // 56px height, 48px horizontal - premium floating
        };

        // Variant styles - New Color Scheme
        const variantStyles = {
            primary: "bg-[#C9A76B] text-white hover:bg-[#B8955A] hover:-translate-y-px hover:shadow-md active:translate-y-0 shadow-sm focus-visible:ring-[#F7F3ED]",
            secondary: "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-300",
            ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-200",
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
                disabled={disabled}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
