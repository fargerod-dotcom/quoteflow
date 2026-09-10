-- AlterTable
ALTER TABLE "Business" ADD COLUMN     "country" VARCHAR(2) NOT NULL DEFAULT 'NO';

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN     "currency" VARCHAR(3) NOT NULL DEFAULT 'NOK';
