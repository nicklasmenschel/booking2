import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Generate a unique booking number like "GT-ABC123"
 */
export function generateBookingNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'GT-';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        ...options,
    }).format(d);
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(d);
}

/**
 * Format date and time together
 */
export function formatDateTime(date: Date | string): string {
    return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative time (e.g., "in 2 days", "3 hours ago")
 */
export function getRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((d.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

    if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (Math.abs(diffInMinutes) < 60) {
        return rtf.format(diffInMinutes, 'minute');
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (Math.abs(diffInHours) < 24) {
        return rtf.format(diffInHours, 'hour');
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (Math.abs(diffInDays) < 30) {
        return rtf.format(diffInDays, 'day');
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    return rtf.format(diffInMonths, 'month');
}

/**
 * Calculate available spots accounting for holds
 */
export function calculateAvailableSpots(
    capacity: number,
    bookedCount: number,
    holdCount: number
): number {
    return Math.max(0, capacity - bookedCount - holdCount);
}

/**
 * Determine instance status based on availability
 */
export function getInstanceStatus(
    availableSpots: number,
    capacity: number
): 'AVAILABLE' | 'LIMITED' | 'SOLD_OUT' {
    if (availableSpots <= 0) return 'SOLD_OUT';
    if (availableSpots / capacity < 0.3) return 'LIMITED';
    return 'AVAILABLE';
}

/**
 * Parse and validate price input
 */
export function parsePrice(value: string): number | null {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : Math.round(parsed * 100) / 100;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
    if (count === 1) return singular;
    return plural || `${singular}s`;
}

/**
 * Delay for async operations
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
    );
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d > new Date();
}

/**
 * Get price level display ($ to $$$$)
 */
export function getPriceLevelDisplay(level: number): string {
    return '$'.repeat(Math.min(Math.max(level, 1), 4));
}

/**
 * Format guest count display
 */
export function formatGuestCount(count: number): string {
    return `${count} ${pluralize(count, 'guest')}`;
}

/**
 * Calculate tax amount
 */
export function calculateTax(amount: number, rate: number): number {
    return Math.round(amount * rate * 100) / 100;
}

/**
 * Calculate total with tax
 */
export function calculateTotal(
    baseAmount: number,
    taxRate: number = 0,
    serviceFee: number = 0
): { base: number; tax: number; fee: number; total: number } {
    const tax = calculateTax(baseAmount, taxRate);
    return {
        base: baseAmount,
        tax,
        fee: serviceFee,
        total: baseAmount + tax + serviceFee,
    };
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (basic)
 */
export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
}

/**
 * Clean phone number for storage
 */
export function cleanPhoneNumber(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Safe JSON parse
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Get browser-friendly date string for input[type="date"]
 */
export function toDateInputValue(date: Date): string {
    return date.toISOString().split('T')[0];
}

/**
 * Get browser-friendly time string for input[type="time"]
 */
export function toTimeInputValue(date: Date): string {
    return date.toTimeString().slice(0, 5);
}

/**
 * Combine date and time inputs into a Date object
 */
export function combineDateAndTime(dateStr: string, timeStr: string): Date {
    return new Date(`${dateStr}T${timeStr}`);
}
