/*
  Warnings:

  - You are about to drop the column `generateUntil` on the `RecurrenceRule` table. All the data in the column will be lost.
  - You are about to drop the column `pattern` on the `RecurrenceRule` table. All the data in the column will be lost.
  - Added the required column `frequency` to the `RecurrenceRule` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecurrenceFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "RecurrenceRule" DROP COLUMN "generateUntil",
DROP COLUMN "pattern",
ADD COLUMN     "byMonth" INTEGER[],
ADD COLUMN     "byMonthDay" INTEGER[],
ADD COLUMN     "byWeekDay" TEXT[],
ADD COLUMN     "count" INTEGER,
ADD COLUMN     "frequency" "RecurrenceFrequency" NOT NULL,
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "lastGenerated" TIMESTAMP(3),
ADD COLUMN     "until" TIMESTAMP(3);
