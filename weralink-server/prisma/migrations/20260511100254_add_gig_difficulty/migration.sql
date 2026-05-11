-- CreateEnum
CREATE TYPE "GigDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERT');

-- AlterTable
ALTER TABLE "Gig" ADD COLUMN     "difficulty" "GigDifficulty" NOT NULL DEFAULT 'BEGINNER';
