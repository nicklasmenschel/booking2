-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('GUEST', 'HOST', 'ADMIN');

-- CreateEnum
CREATE TYPE "OfferingType" AS ENUM ('ONE_TIME', 'RECURRING', 'RESTAURANT');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PUBLISHED', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CancellationPolicy" AS ENUM ('FLEXIBLE', 'MODERATE', 'STRICT');

-- CreateEnum
CREATE TYPE "InstanceStatus" AS ENUM ('AVAILABLE', 'LIMITED', 'SOLD_OUT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'NO_SHOW', 'CHECKED_IN', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingPaymentStatus" AS ENUM ('PENDING', 'AUTHORIZED', 'CAPTURED', 'PARTIALLY_REFUNDED', 'FULLY_REFUNDED', 'FAILED', 'DISPUTED', 'CHARGEBACK');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'SELECT', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "WaitlistStatus" AS ENUM ('ACTIVE', 'NOTIFIED', 'CONVERTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ModificationType" AS ENUM ('PARTY_SIZE_INCREASE', 'PARTY_SIZE_DECREASE', 'DATE_CHANGE', 'CANCELLATION', 'HOST_CANCELLATION');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TableShape" AS ENUM ('ROUND', 'SQUARE', 'RECTANGLE', 'BOOTH');

-- CreateEnum
CREATE TYPE "WalkInStatus" AS ENUM ('WAITING', 'SEATED', 'LEFT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('CONFIRMATION', 'REMINDER_24H', 'REMINDER_2H', 'THANK_YOU', 'REVIEW_REQUEST', 'WAITLIST_AVAILABLE', 'BOOKING_MODIFIED', 'BOOKING_CANCELLED', 'HOST_NEW_BOOKING', 'HOST_CANCELLATION');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'FAILED');

-- CreateEnum
CREATE TYPE "SMSStatus" AS ENUM ('SENT', 'DELIVERED', 'FAILED', 'UNDELIVERED');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SEND_EMAIL', 'SEND_SMS', 'SEND_REMINDER', 'GENERATE_INSTANCES', 'PROCESS_WAITLIST', 'SEND_REVIEW_REQUEST', 'CLEANUP_EXPIRED_HOLDS', 'PROCESS_FAILED_PAYMENT', 'SEND_PAYOUT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaxType" AS ENUM ('VAT', 'SALES_TAX', 'GST', 'SERVICE_TAX');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'GUEST',
    "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessibilityNeeds" TEXT,
    "stripeCustomerId" TEXT,
    "defaultPaymentMethod" TEXT,
    "emailOptIn" BOOLEAN NOT NULL DEFAULT true,
    "smsOptIn" BOOLEAN NOT NULL DEFAULT false,
    "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "cancellationRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "noShowCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offering" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverImage" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'US',
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "isVirtual" BOOLEAN NOT NULL DEFAULT false,
    "virtualUrl" TEXT,
    "type" "OfferingType" NOT NULL DEFAULT 'ONE_TIME',
    "basePrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "priceLevel" INTEGER NOT NULL DEFAULT 2,
    "capacity" INTEGER NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "category" TEXT,
    "cuisineTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dietaryOptions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "hostId" TEXT NOT NULL,
    "accentColor" TEXT NOT NULL DEFAULT '#22c55e',
    "logoUrl" TEXT,
    "cancellationPolicy" "CancellationPolicy" NOT NULL DEFAULT 'FLEXIBLE',
    "minPartySize" INTEGER NOT NULL DEFAULT 1,
    "maxPartySize" INTEGER,
    "advanceBookingDays" INTEGER NOT NULL DEFAULT 60,
    "lastMinuteBookingHours" INTEGER NOT NULL DEFAULT 2,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "averageRating" DECIMAL(3,2),
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "popularityScore" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offering_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventInstance" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "availableSpots" INTEGER NOT NULL,
    "status" "InstanceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "priceOverride" DECIMAL(10,2),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT,
    "guestCount" INTEGER NOT NULL DEFAULT 1,
    "ticketTierId" TEXT,
    "customAnswers" JSONB,
    "specialRequests" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "baseAmount" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "serviceFeeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "stripePaymentIntentId" TEXT,
    "paymentStatus" "BookingPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "depositAmount" DECIMAL(10,2),
    "depositPaidAt" TIMESTAMP(3),
    "remainingAmount" DECIMAL(10,2),
    "remainingDueDate" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'CONFIRMED',
    "qrCode" TEXT,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "confirmationSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder24hSent" BOOLEAN NOT NULL DEFAULT false,
    "reminder2hSent" BOOLEAN NOT NULL DEFAULT false,
    "thankYouSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "photos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "hostResponse" TEXT,
    "hostRespondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketTier" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL,
    "capacity" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomQuestion" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL DEFAULT 'TEXT',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceRule" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "pattern" JSONB NOT NULL,
    "generateUntil" TIMESTAMP(3),

    CONSTRAINT "RecurrenceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waitlist" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestName" TEXT NOT NULL,
    "guestPhone" TEXT,
    "partySize" INTEGER NOT NULL,
    "status" "WaitlistStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "notifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingHold" (
    "id" TEXT NOT NULL,
    "instanceId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "guestCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookingHold_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingModification" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "modificationType" "ModificationType" NOT NULL,
    "oldValue" JSONB NOT NULL,
    "newValue" JSONB NOT NULL,
    "reason" TEXT,
    "modifiedBy" TEXT NOT NULL,
    "refundAmount" DECIMAL(10,2),
    "refundStatus" "RefundStatus",
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingModification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestNote" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuestTag" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingNote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Table" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "tableNumber" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "minCapacity" INTEGER NOT NULL DEFAULT 2,
    "maxCapacity" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "position" JSONB,
    "shape" "TableShape" NOT NULL DEFAULT 'RECTANGLE',
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "accessibility" BOOLEAN NOT NULL DEFAULT false,
    "canCombine" BOOLEAN NOT NULL DEFAULT false,
    "adjacentTables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "turnTime" INTEGER NOT NULL DEFAULT 90,
    "bufferTime" INTEGER NOT NULL DEFAULT 15,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicePeriod" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "lastSeating" TEXT NOT NULL,
    "daysOfWeek" INTEGER[],
    "intervalMinutes" INTEGER NOT NULL DEFAULT 15,
    "maxCoversPerSlot" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ServicePeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalkIn" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "instanceId" TEXT,
    "guestName" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "quotedWait" INTEGER NOT NULL,
    "status" "WalkInStatus" NOT NULL DEFAULT 'WAITING',
    "pagerNumber" TEXT,
    "notes" TEXT,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seatedAt" TIMESTAMP(3),
    "leftAt" TIMESTAMP(3),

    CONSTRAINT "WalkIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "dietaryInfo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "prepTime" INTEGER NOT NULL DEFAULT 20,
    "available" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" TEXT NOT NULL,
    "offeringId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "type" "EmailType" NOT NULL,
    "status" "EmailStatus" NOT NULL DEFAULT 'SENT',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "error" TEXT,
    "retries" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SMSLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "cost" DECIMAL(10,4) NOT NULL,
    "status" "SMSStatus" NOT NULL DEFAULT 'SENT',
    "provider" TEXT NOT NULL DEFAULT 'Twilio',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,

    CONSTRAINT "SMSLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobQueue" (
    "id" TEXT NOT NULL,
    "type" "JobType" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3),
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "error" TEXT,
    "retries" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxRate" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT,
    "county" TEXT,
    "city" TEXT,
    "rate" DECIMAL(5,4) NOT NULL,
    "type" "TaxType" NOT NULL,
    "inclusive" BOOLEAN NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataProcessingAgreement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "agreedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT NOT NULL,

    CONSTRAINT "DataProcessingAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataDeletionLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataDeletionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchIndexSync" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "syncedAt" TIMESTAMP(3),

    CONSTRAINT "SearchIndexSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Offering_slug_key" ON "Offering"("slug");

-- CreateIndex
CREATE INDEX "Offering_slug_idx" ON "Offering"("slug");

-- CreateIndex
CREATE INDEX "Offering_hostId_idx" ON "Offering"("hostId");

-- CreateIndex
CREATE INDEX "Offering_status_idx" ON "Offering"("status");

-- CreateIndex
CREATE INDEX "Offering_type_idx" ON "Offering"("type");

-- CreateIndex
CREATE INDEX "Offering_city_status_idx" ON "Offering"("city", "status");

-- CreateIndex
CREATE INDEX "EventInstance_offeringId_idx" ON "EventInstance"("offeringId");

-- CreateIndex
CREATE INDEX "EventInstance_date_idx" ON "EventInstance"("date");

-- CreateIndex
CREATE INDEX "EventInstance_status_idx" ON "EventInstance"("status");

-- CreateIndex
CREATE INDEX "EventInstance_date_status_idx" ON "EventInstance"("date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "EventInstance_offeringId_date_startTime_key" ON "EventInstance"("offeringId", "date", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_qrCode_key" ON "Booking"("qrCode");

-- CreateIndex
CREATE INDEX "Booking_instanceId_idx" ON "Booking"("instanceId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_guestEmail_idx" ON "Booking"("guestEmail");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Booking_paymentStatus_idx" ON "Booking"("paymentStatus");

-- CreateIndex
CREATE INDEX "Booking_bookingNumber_idx" ON "Booking"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");

-- CreateIndex
CREATE INDEX "Review_offeringId_rating_idx" ON "Review"("offeringId", "rating");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "TicketTier_offeringId_idx" ON "TicketTier"("offeringId");

-- CreateIndex
CREATE INDEX "CustomQuestion_offeringId_idx" ON "CustomQuestion"("offeringId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrenceRule_offeringId_key" ON "RecurrenceRule"("offeringId");

-- CreateIndex
CREATE INDEX "Waitlist_instanceId_status_priority_idx" ON "Waitlist"("instanceId", "status", "priority");

-- CreateIndex
CREATE INDEX "Waitlist_status_idx" ON "Waitlist"("status");

-- CreateIndex
CREATE UNIQUE INDEX "BookingHold_sessionId_key" ON "BookingHold"("sessionId");

-- CreateIndex
CREATE INDEX "BookingHold_instanceId_expiresAt_idx" ON "BookingHold"("instanceId", "expiresAt");

-- CreateIndex
CREATE INDEX "BookingHold_expiresAt_idx" ON "BookingHold"("expiresAt");

-- CreateIndex
CREATE INDEX "BookingModification_bookingId_idx" ON "BookingModification"("bookingId");

-- CreateIndex
CREATE INDEX "GuestNote_userId_hostId_idx" ON "GuestNote"("userId", "hostId");

-- CreateIndex
CREATE INDEX "GuestTag_userId_hostId_idx" ON "GuestTag"("userId", "hostId");

-- CreateIndex
CREATE INDEX "GuestTag_hostId_tag_idx" ON "GuestTag"("hostId", "tag");

-- CreateIndex
CREATE INDEX "BookingNote_bookingId_idx" ON "BookingNote"("bookingId");

-- CreateIndex
CREATE INDEX "Table_offeringId_idx" ON "Table"("offeringId");

-- CreateIndex
CREATE INDEX "Table_offeringId_isActive_idx" ON "Table"("offeringId", "isActive");

-- CreateIndex
CREATE INDEX "ServicePeriod_offeringId_idx" ON "ServicePeriod"("offeringId");

-- CreateIndex
CREATE INDEX "WalkIn_offeringId_status_idx" ON "WalkIn"("offeringId", "status");

-- CreateIndex
CREATE INDEX "WalkIn_joinedAt_idx" ON "WalkIn"("joinedAt");

-- CreateIndex
CREATE INDEX "MenuItem_offeringId_idx" ON "MenuItem"("offeringId");

-- CreateIndex
CREATE INDEX "BlockedDate_offeringId_idx" ON "BlockedDate"("offeringId");

-- CreateIndex
CREATE INDEX "EmailLog_type_idx" ON "EmailLog"("type");

-- CreateIndex
CREATE INDEX "EmailLog_sentAt_idx" ON "EmailLog"("sentAt");

-- CreateIndex
CREATE INDEX "EmailLog_to_idx" ON "EmailLog"("to");

-- CreateIndex
CREATE INDEX "SMSLog_userId_idx" ON "SMSLog"("userId");

-- CreateIndex
CREATE INDEX "SMSLog_sentAt_idx" ON "SMSLog"("sentAt");

-- CreateIndex
CREATE INDEX "JobQueue_status_idx" ON "JobQueue"("status");

-- CreateIndex
CREATE INDEX "JobQueue_scheduledFor_idx" ON "JobQueue"("scheduledFor");

-- CreateIndex
CREATE INDEX "JobQueue_type_status_idx" ON "JobQueue"("type", "status");

-- CreateIndex
CREATE INDEX "TaxRate_country_state_city_idx" ON "TaxRate"("country", "state", "city");

-- CreateIndex
CREATE INDEX "DataProcessingAgreement_userId_idx" ON "DataProcessingAgreement"("userId");

-- CreateIndex
CREATE INDEX "DataDeletionLog_deletedAt_idx" ON "DataDeletionLog"("deletedAt");

-- CreateIndex
CREATE INDEX "SearchIndexSync_status_idx" ON "SearchIndexSync"("status");

-- AddForeignKey
ALTER TABLE "Offering" ADD CONSTRAINT "Offering_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInstance" ADD CONSTRAINT "EventInstance_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "EventInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomQuestion" ADD CONSTRAINT "CustomQuestion_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceRule" ADD CONSTRAINT "RecurrenceRule_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingHold" ADD CONSTRAINT "BookingHold_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "EventInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingModification" ADD CONSTRAINT "BookingModification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestNote" ADD CONSTRAINT "GuestNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuestTag" ADD CONSTRAINT "GuestTag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingNote" ADD CONSTRAINT "BookingNote_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicePeriod" ADD CONSTRAINT "ServicePeriod_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalkIn" ADD CONSTRAINT "WalkIn_instanceId_fkey" FOREIGN KEY ("instanceId") REFERENCES "EventInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "Offering"("id") ON DELETE CASCADE ON UPDATE CASCADE;
