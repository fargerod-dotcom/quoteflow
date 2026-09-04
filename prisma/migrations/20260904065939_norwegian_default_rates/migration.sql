-- AlterTable
ALTER TABLE "Business" ALTER COLUMN "hourlyRate" SET DEFAULT 1150,
ALTER COLUMN "calloutFee" SET DEFAULT 750;

-- One-off: businesses still on the pre-NOK demo rates get typical Norwegian plumber rates (ex-MVA).
UPDATE "Business" SET "hourlyRate" = 1150, "calloutFee" = 750 WHERE "hourlyRate" < 300;
