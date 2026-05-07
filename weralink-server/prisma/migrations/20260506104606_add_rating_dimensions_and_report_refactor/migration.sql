/*
  Warnings:

  - You are about to drop the column `employerId` on the `Report` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[assignmentId,raterId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Report` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_employerId_fkey";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "dimensions" JSONB;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "employerId",
ADD COLUMN     "userId" UUID NOT NULL,
ALTER COLUMN "fileUrl" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_assignmentId_raterId_key" ON "Rating"("assignmentId", "raterId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
