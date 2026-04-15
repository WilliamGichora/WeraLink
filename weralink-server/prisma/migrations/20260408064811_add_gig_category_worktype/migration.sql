/*
  Warnings:

  - Added the required column `category` to the `Gig` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GigCategory" AS ENUM ('TRANSLATION', 'MARKETING', 'DATA_ENTRY', 'BUG_HUNTING', 'AI_LABELING', 'RESEARCH');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('REMOTE', 'ON_SITE', 'HYBRID');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "category" "GigCategory" NOT NULL,
ADD COLUMN     "workType" "WorkType" NOT NULL DEFAULT 'REMOTE';
