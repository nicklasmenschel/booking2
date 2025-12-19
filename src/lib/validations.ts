import { z } from "zod";

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    dietaryRestrictions: z.array(z.string()).optional(),
    allergies: z.array(z.string()).optional(),
    accessibilityNeeds: z.string().optional(),
});

export type UserProfileInput = z.infer<typeof userProfileSchema>;

// ============================================================================
// OFFERING SCHEMAS
// ============================================================================

export const offeringTypeSchema = z.enum(["ONE_TIME", "RECURRING", "RESTAURANT"]);

export const cancellationPolicySchema = z.enum(["FLEXIBLE", "MODERATE", "STRICT"]);

export const createOfferingSchema = z.object({
    name: z.string().min(1, "Event name is required").max(200),
    description: z.string().min(10, "Description must be at least 10 characters").max(5000),
    coverImage: z.string().url("Cover image is required"),
    images: z.array(z.string().url()).max(5).optional(),

    // Location
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().default("US"),
    isVirtual: z.boolean().default(false),
    virtualUrl: z.string().url().optional(),

    // Type
    type: offeringTypeSchema.default("ONE_TIME"),

    // Pricing
    basePrice: z.number().min(0, "Price must be positive"),
    currency: z.string().default("USD"),

    // Capacity
    capacity: z.number().int().min(1, "Capacity must be at least 1"),

    // Date/time for one-time events
    date: z.string().optional(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),

    // Advanced settings
    cancellationPolicy: cancellationPolicySchema.optional(),
    minPartySize: z.number().int().min(1).optional(),
    maxPartySize: z.number().int().optional(),
    advanceBookingDays: z.number().int().optional(),

    // Customization
    accentColor: z.string().optional(),

    // Recurrence fields
    recurrence: z.object({
        frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
        interval: z.number().min(1).default(1),
        count: z.number().min(1).optional(),
        until: z.date().optional(),
        byWeekDay: z.array(z.string()).optional(),
        byMonthDay: z.array(z.number()).optional(),
        byMonth: z.array(z.number()).optional(),
    }).optional(),
});

export type CreateOfferingInput = z.input<typeof createOfferingSchema>;

export const updateOfferingSchema = createOfferingSchema.partial();

export type UpdateOfferingInput = z.infer<typeof updateOfferingSchema>;

// ============================================================================
// BOOKING SCHEMAS
// ============================================================================

export const createBookingSchema = z.object({
    instanceId: z.string().min(1, "Instance is required"),
    guestName: z.string().min(1, "Name is required").max(100),
    guestEmail: z.string().email("Invalid email address"),
    guestPhone: z.string().optional(),
    guestCount: z.number().int().min(1, "At least 1 guest required"),
    specialRequests: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),
    ticketTierId: z.string().optional(),
    customAnswers: z.record(z.string(), z.string()).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const modifyBookingSchema = z.object({
    bookingId: z.string().min(1),
    guestCount: z.number().int().min(1).optional(),
    newInstanceId: z.string().optional(),
    specialRequests: z.string().max(1000).optional(),
});

export type ModifyBookingInput = z.infer<typeof modifyBookingSchema>;

export const cancelBookingSchema = z.object({
    bookingId: z.string().min(1),
    reason: z.string().optional(),
});

export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;

// ============================================================================
// GUEST CHECKOUT SCHEMA
// ============================================================================

export const guestCheckoutSchema = z.object({
    // Guest info
    name: z.string().min(1, "Name is required").max(100),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),

    // Booking details
    instanceId: z.string().min(1),
    guestCount: z.number().int().min(1),
    specialRequests: z.string().max(1000).optional(),
    tags: z.array(z.string()).optional(),

    // Payment
    paymentMethodId: z.string().optional(), // For saved cards
});

export type GuestCheckoutInput = z.infer<typeof guestCheckoutSchema>;

// ============================================================================
// REVIEW SCHEMA
// ============================================================================

export const createReviewSchema = z.object({
    bookingId: z.string().min(1),
    rating: z.number().int().min(1).max(5),
    comment: z.string().max(2000).optional(),
    photos: z.array(z.string().url()).max(5).optional(),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// ============================================================================
// WAITLIST SCHEMA
// ============================================================================

export const joinWaitlistSchema = z.object({
    instanceId: z.string().min(1),
    guestEmail: z.string().email(),
    guestName: z.string().min(1).max(100),
    guestPhone: z.string().optional(),
    partySize: z.number().int().min(1),
});

export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>;

// ============================================================================
// TICKET TIER SCHEMA
// ============================================================================

export const createTicketTierSchema = z.object({
    offeringId: z.string().min(1),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    price: z.number().min(0),
    capacity: z.number().int().min(1).optional(),
});

export type CreateTicketTierInput = z.infer<typeof createTicketTierSchema>;

// ============================================================================
// CUSTOM QUESTION SCHEMA
// ============================================================================

export const questionTypeSchema = z.enum(["TEXT", "TEXTAREA", "SELECT", "CHECKBOX"]);

export const createCustomQuestionSchema = z.object({
    offeringId: z.string().min(1),
    question: z.string().min(1).max(500),
    type: questionTypeSchema.default("TEXT"),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(), // For SELECT type
});

export type CreateCustomQuestionInput = z.infer<typeof createCustomQuestionSchema>;

// ============================================================================
// RECURRENCE RULE SCHEMA
// ============================================================================

export const recurrencePatternSchema = z.object({
    frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
    dayOfWeek: z.number().int().min(0).max(6).optional(), // 0 = Sunday
    startTime: z.string(), // HH:MM format
    endTime: z.string(),
});

export const createRecurrenceRuleSchema = z.object({
    offeringId: z.string().min(1),
    pattern: recurrencePatternSchema,
    generateUntil: z.string().optional(), // ISO date string
});

export type CreateRecurrenceRuleInput = z.infer<typeof createRecurrenceRuleSchema>;

// ============================================================================
// RESTAURANT SCHEMAS
// ============================================================================

export const tableShapeSchema = z.enum(["ROUND", "SQUARE", "RECTANGLE", "BOOTH"]);

export const createTableSchema = z.object({
    offeringId: z.string().min(1),
    tableNumber: z.string().min(1),
    capacity: z.number().int().min(1),
    minCapacity: z.number().int().min(1).optional(),
    maxCapacity: z.number().int().min(1),
    section: z.string().min(1),
    shape: tableShapeSchema.optional(),
    features: z.array(z.string()).optional(),
    accessibility: z.boolean().optional(),
    canCombine: z.boolean().optional(),
    turnTime: z.number().int().min(15).optional(),
    bufferTime: z.number().int().min(0).optional(),
});

export type CreateTableInput = z.infer<typeof createTableSchema>;

export const createServicePeriodSchema = z.object({
    offeringId: z.string().min(1),
    name: z.string().min(1),
    startTime: z.string(),
    endTime: z.string(),
    lastSeating: z.string(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)),
    intervalMinutes: z.number().int().min(5).optional(),
    maxCoversPerSlot: z.number().int().min(1),
});

export type CreateServicePeriodInput = z.infer<typeof createServicePeriodSchema>;

// ============================================================================
// WALK-IN SCHEMA
// ============================================================================

export const createWalkInSchema = z.object({
    offeringId: z.string().min(1),
    guestName: z.string().min(1).max(100),
    partySize: z.number().int().min(1),
    notes: z.string().max(500).optional(),
});

export type CreateWalkInInput = z.infer<typeof createWalkInSchema>;

// ============================================================================
// GUEST NOTE SCHEMA
// ============================================================================

export const createGuestNoteSchema = z.object({
    userId: z.string().min(1),
    note: z.string().min(1).max(2000),
    private: z.boolean().default(true),
});

export type CreateGuestNoteInput = z.infer<typeof createGuestNoteSchema>;

// ============================================================================
// SEARCH SCHEMA
// ============================================================================

export const searchOfferingsSchema = z.object({
    query: z.string().optional(),
    city: z.string().optional(),
    type: offeringTypeSchema.optional(),
    priceMin: z.number().optional(),
    priceMax: z.number().optional(),
    dateFrom: z.string().optional(),
    dateTo: z.string().optional(),
    cuisineTypes: z.array(z.string()).optional(),
    dietaryOptions: z.array(z.string()).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    radiusMiles: z.number().optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(50).default(20),
});

export type SearchOfferingsInput = z.infer<typeof searchOfferingsSchema>;
