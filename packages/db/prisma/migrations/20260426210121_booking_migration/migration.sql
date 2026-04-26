-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "bookingSystem" TEXT NOT NULL DEFAULT 'internal',
ADD COLUMN     "bookingSystemConfig" JSONB;

-- AlterTable
ALTER TABLE "Therapist" ADD COLUMN     "googleCalendarId" TEXT;
