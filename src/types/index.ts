// Type definitions for Garden Table
// These extend or supplement the Prisma-generated types

import type {
    User,
    Offering,
    EventInstance,
    Booking,
    Review,
    TicketTier,
    CustomQuestion,
} from "@prisma/client";

// ============================================================================
// OFFERING TYPES
// ============================================================================

export type OfferingWithHost = Offering & {
    host: Pick<User, "id" | "name" | "avatar">;
};

export type OfferingWithDetails = Offering & {
    host: Pick<User, "id" | "name" | "email" | "avatar">;
    instances: EventInstance[];
    ticketTiers: TicketTier[];
    customQuestions: CustomQuestion[];
    reviews: Review[];
    _count: {
        bookings: number;
        reviews: number;
    };
};

export type OfferingCard = Pick<
    Offering,
    | "id"
    | "slug"
    | "name"
    | "coverImage"
    | "city"
    | "basePrice"
    | "currency"
    | "averageRating"
    | "reviewCount"
    | "type"
> & {
    host: Pick<User, "name" | "avatar">;
    nextInstance?: Pick<EventInstance, "date" | "startTime" | "availableSpots">;
};

// ============================================================================
// INSTANCE TYPES
// ============================================================================

export type InstanceWithOffering = EventInstance & {
    offering: Pick<Offering, "id" | "name" | "slug" | "coverImage" | "basePrice" | "currency">;
};

export type InstanceWithBookings = EventInstance & {
    bookings: Booking[];
    _count: {
        bookings: number;
    };
};

// ============================================================================
// BOOKING TYPES
// ============================================================================

export type BookingWithDetails = Booking & {
    instance: EventInstance;
    offering: Pick<Offering, "id" | "name" | "slug" | "coverImage" | "address" | "city">;
    user?: Pick<User, "id" | "name" | "email" | "avatar">;
    ticketTier?: Pick<TicketTier, "id" | "name" | "price">;
};

export type BookingListItem = Pick<
    Booking,
    | "id"
    | "bookingNumber"
    | "guestName"
    | "guestEmail"
    | "guestCount"
    | "status"
    | "checkedIn"
    | "specialRequests"
    | "tags"
    | "createdAt"
>;

export type GuestBooking = BookingWithDetails & {
    canModify: boolean;
    canCancel: boolean;
    refundAmount?: number;
};

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

export interface DashboardStats {
    totalBookings: number;
    totalRevenue: number;
    upcomingEvents: number;
    averageRating: number;
    bookingsThisMonth: number;
    revenueThisMonth: number;
    percentChangeBookings: number;
    percentChangeRevenue: number;
}

export interface TodayEvent {
    id: string;
    name: string;
    startTime: Date;
    endTime: Date;
    booked: number;
    capacity: number;
    checkedIn: number;
}

export interface CalendarEvent {
    id: string;
    instanceId: string;
    name: string;
    date: Date;
    startTime: Date;
    endTime: Date;
    status: "AVAILABLE" | "LIMITED" | "SOLD_OUT" | "COMPLETED" | "CANCELLED";
    booked: number;
    capacity: number;
}

// ============================================================================
// SEARCH & DISCOVERY TYPES
// ============================================================================

export interface SearchFilters {
    query?: string;
    city?: string;
    type?: "ONE_TIME" | "RECURRING" | "RESTAURANT";
    priceRange?: [number, number];
    dateRange?: [Date, Date];
    cuisineTypes?: string[];
    dietaryOptions?: string[];
    features?: string[];
    rating?: number;
}

export interface SearchResult {
    offerings: OfferingCard[];
    total: number;
    page: number;
    totalPages: number;
    facets: {
        cities: { value: string; count: number }[];
        cuisineTypes: { value: string; count: number }[];
        priceRanges: { value: string; count: number }[];
    };
}

export interface NearbyOffering extends OfferingCard {
    distance: number; // in miles
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface PaymentBreakdown {
    baseAmount: number;
    taxAmount: number;
    serviceFee: number;
    totalAmount: number;
    currency: string;
}

export interface PaymentIntent {
    id: string;
    clientSecret: string;
    amount: number;
    currency: string;
}

export interface RefundResult {
    success: boolean;
    refundId?: string;
    amount?: number;
    error?: string;
}

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export interface NotificationPayload {
    type: "NEW_BOOKING" | "CANCELLATION" | "MODIFICATION" | "REMINDER" | "REVIEW";
    title: string;
    body: string;
    data?: Record<string, string>;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
}

// ============================================================================
// FORM STEP TYPES (for multi-step creation)
// ============================================================================

export interface CreateOfferingFormData {
    // Step 1: Name
    name: string;

    // Step 2: When
    type: "ONE_TIME" | "RECURRING" | "RESTAURANT";
    date?: string;
    startTime?: string;
    endTime?: string;
    recurrencePattern?: {
        frequency: "DAILY" | "WEEKLY" | "MONTHLY";
        dayOfWeek?: number;
        startTime: string;
        endTime: string;
    };

    // Step 3: Where
    isVirtual: boolean;
    address?: string;
    city?: string;
    state?: string;
    country: string;
    virtualUrl?: string;

    // Step 4: Photos
    coverImage: string;
    images: string[];

    // Step 5: Description
    description: string;

    // Step 6: Capacity & Price
    capacity: number;
    basePrice: number;
    currency: string;
}

// ============================================================================
// RESTAURANT-SPECIFIC TYPES
// ============================================================================

export interface TimeSlot {
    time: string;
    available: boolean;
    availableSpots: number;
    instanceId?: string;
}

export interface FloorPlanTable {
    id: string;
    tableNumber: string;
    capacity: number;
    position: { x: number; y: number };
    shape: "ROUND" | "SQUARE" | "RECTANGLE" | "BOOTH";
    section: string;
    status: "AVAILABLE" | "SEATED" | "RESERVED" | "DIRTY";
    currentBooking?: Pick<Booking, "id" | "guestName" | "guestCount" | "checkedInAt">;
}

export interface WaitlistEntry {
    id: string;
    guestName: string;
    partySize: number;
    quotedWait: number;
    joinedAt: Date;
    status: "WAITING" | "NOTIFIED" | "SEATED" | "LEFT";
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface BookingTrend {
    date: string;
    bookings: number;
    revenue: number;
}

export interface PopularTime {
    hour: number;
    bookings: number;
}

export interface GuestDemographics {
    averagePartySize: number;
    repeatRate: number;
    topCities: { city: string; count: number }[];
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export interface FeatureFlags {
    enableWaitlist: boolean;
    enableReviews: boolean;
    enableSMS: boolean;
    enableInstantPayouts: boolean;
    enableApplePay: boolean;
    enableGooglePay: boolean;
}
