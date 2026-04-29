/*
  Warnings:

  - A unique constraint covering the columns `[assignmentId,type]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Transaction_assignmentId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_assignmentId_type_key" ON "Transaction"("assignmentId", "type");
