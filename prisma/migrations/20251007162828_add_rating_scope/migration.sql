/*
  Warnings:

  - You are about to drop the `TeamActivity` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[taskId,userId,scope]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,userId,scope]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ratedById` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RatingScope" AS ENUM ('TASK', 'PROJECT');

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_colleagueId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_participantUserId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_taskId_fkey";

-- DropForeignKey
ALTER TABLE "TeamActivity" DROP CONSTRAINT "TeamActivity_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagPerformance" DROP CONSTRAINT "UserTagPerformance_tagId_fkey";

-- DropForeignKey
ALTER TABLE "UserTagPerformance" DROP CONSTRAINT "UserTagPerformance_userId_fkey";

-- DropIndex
DROP INDEX "Rating_taskId_userId_key";

-- AlterTable
ALTER TABLE "Rating" ADD COLUMN     "ratedById" INTEGER NOT NULL,
ADD COLUMN     "scope" "RatingScope" NOT NULL DEFAULT 'TASK',
ALTER COLUMN "taskId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserTagPerformance" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "TeamActivity";

-- DropEnum
DROP TYPE "TeamActivityAction";

-- CreateIndex
CREATE UNIQUE INDEX "Rating_taskId_userId_scope_key" ON "Rating"("taskId", "userId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_projectId_userId_scope_key" ON "Rating"("projectId", "userId", "scope");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_ratedById_fkey" FOREIGN KEY ("ratedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagPerformance" ADD CONSTRAINT "UserTagPerformance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTagPerformance" ADD CONSTRAINT "UserTagPerformance_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
