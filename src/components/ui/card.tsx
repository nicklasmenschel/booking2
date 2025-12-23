"use client";

import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'borderless';
    interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({
        className = '',
        variant = 'default',
        interactive = false,
        children,
        ...props
    }, ref) => {
        const baseStyles = 'bg-white rounded-2xl';

        const variantStyles = {
            default: 'border-2 border-gray-200',
            borderless: 'shadow-sm',
        };

        const interactiveStyles = interactive
            ? 'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg cursor-pointer'
            : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variantStyles[variant]} ${interactiveStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';
