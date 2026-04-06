/*
  Warnings:

  - You are about to drop the column `portfolioUrls` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "portfolioUrls",
ADD COLUMN     "portfolio" JSONB;
