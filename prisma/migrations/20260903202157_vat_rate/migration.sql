-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 25;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "vatRate" DECIMAL(5,2) NOT NULL DEFAULT 25;

-- Existing quotes were stored ex-MVA; convert them to MVA-inclusive totals at 25%.
UPDATE "Quote" SET "total" = ROUND("total" * 1.25, 2);
