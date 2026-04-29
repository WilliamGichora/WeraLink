/*
  Warnings:

  - A unique constraint covering the columns `[checkoutRequestId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiptNumber]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AssignmentStatus" ADD VALUE 'REVISION_REQUESTED';
ALTER TYPE "AssignmentStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "autoApproveAt" TIMESTAMP(3),
ADD COLUMN     "deadlineAt" TIMESTAMP(3),
ADD COLUMN     "extensionReason" TEXT,
ADD COLUMN     "extensionRequestedAt" TIMESTAMP(3),
ADD COLUMN     "isExtensionGranted" BOOLEAN;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "checkoutRequestId" TEXT,
ADD COLUMN     "merchantRequestId" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "receiptNumber" TEXT;

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "raisedById" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_assignmentId_key" ON "Dispute"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_checkoutRequestId_key" ON "Transaction"("checkoutRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiptNumber_key" ON "Transaction"("receiptNumber");

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
