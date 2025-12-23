/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('EMAIL', 'SMS', 'BOTH');

-- CreateEnum
CREATE TYPE "ConfirmationMode" AS ENUM ('MANUAL', 'AUTO', 'AUTO_GUARANTEE');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "checkInTime" TIMESTAMP(3),
ADD COLUMN     "checkOutTime" TIMESTAMP(3),
ADD COLUMN     "confirmationMode" TEXT,
ADD COLUMN     "guestId" TEXT,
ADD COLUMN     "guestNotes" TEXT,
ADD COLUMN     "isWalkIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "occasion" TEXT,
ADD COLUMN     "referralSource" TEXT,
ADD COLUMN     "seatingPreferences" JSONB,
ADD COLUMN     "staffNotes" TEXT,
ADD COLUMN     "tableId" TEXT;

-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#3b82f6',
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "rotation" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "xPosition" DOUBLE PRECISION,
ADD COLUMN     "yPosition" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dietaryRestrictions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferences" JSONB,
    "specialOccasions" JSONB,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "completedBookings" INTEGER NOT NULL DEFAULT 0,
    "cancelledBookings" INTEGER NOT NULL DEFAULT 0,
    "noShows" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "averageSpend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3),
    "restaurantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "segmentCriteria" JSONB NOT NULL,
    "scheduledFor" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "recipientCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "clickCount" INTEGER NOT NULL DEFAULT 0,
    "bookingCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservationSettings" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "confirmationMode" "ConfirmationMode" NOT NULL DEFAULT 'AUTO',
    "requireCreditCard" BOOLEAN NOT NULL DEFAULT false,
    "requirePrepayment" BOOLEAN NOT NULL DEFAULT false,
    "cancellationPolicy" JSONB,
    "noShowCharge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "send24hReminder" BOOLEAN NOT NULL DEFAULT true,
    "send2hReminder" BOOLEAN NOT NULL DEFAULT true,
    "sendReviewRequest" BOOLEAN NOT NULL DEFAULT true,
    "reviewRequestDelay" INTEGER NOT NULL DEFAULT 24,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReservationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Guest_restaurantId_idx" ON "Guest"("restaurantId");

-- CreateIndex
CREATE INDEX "Guest_email_idx" ON "Guest"("email");

-- CreateIndex
CREATE INDEX "Guest_phone_idx" ON "Guest"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_restaurantId_key" ON "Guest"("email", "restaurantId");

-- CreateIndex
CREATE INDEX "Campaign_restaurantId_idx" ON "Campaign"("restaurantId");

-- CreateIndex
CREATE INDEX "Campaign_sentAt_idx" ON "Campaign"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReservationSettings_restaurantId_key" ON "ReservationSettings"("restaurantId");

-- CreateIndex
CREATE INDEX "ReservationSettings_restaurantId_idx" ON "ReservationSettings"("restaurantId");

-- CreateIndex
CREATE INDEX "Booking_tableId_idx" ON "Booking"("tableId");

-- CreateIndex
CREATE INDEX "Booking_guestId_idx" ON "Booking"("guestId");

-- CreateIndex
CREATE UNIQUE INDEX "Table_qrCode_key" ON "Table"("qrCode");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "Table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
