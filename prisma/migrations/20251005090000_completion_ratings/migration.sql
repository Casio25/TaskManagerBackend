-- Create ProjectStatus enum
CREATE TYPE "ProjectStatus" AS ENUM ('ACTIVE', 'COMPLETED');

-- Add status tracking to projects
ALTER TABLE "Project"
  ADD COLUMN "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "completedAt" TIMESTAMP(3);

-- Add completion tracking to tasks
ALTER TABLE "Task"
  ADD COLUMN "completedAt" TIMESTAMP(3);

-- Rename timeliness rating column
ALTER TABLE "Rating"
  RENAME COLUMN "timeliness" TO "punctuality";

-- Add teamwork category
ALTER TABLE "Rating"
  ADD COLUMN "teamwork" INTEGER;

UPDATE "Rating" SET "teamwork" = 0 WHERE "teamwork" IS NULL;

ALTER TABLE "Rating"
  ALTER COLUMN "teamwork" SET NOT NULL,
  ALTER COLUMN "teamwork" SET DEFAULT 0;

-- Aggregated user performance by tag
CREATE TABLE "UserTagPerformance" (
  "id" SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  "tagId" INTEGER NOT NULL,
  "averagePunctuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "averageTeamwork" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "averageQuality" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ratingsCount" INTEGER NOT NULL DEFAULT 0,
  "lastPunctuality" INTEGER,
  "lastTeamwork" INTEGER,
  "lastQuality" INTEGER,
  "lastTaskId" INTEGER,
  "lastRatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX "UserTagPerformance_userId_tagId_key"
  ON "UserTagPerformance"("userId", "tagId");

ALTER TABLE "UserTagPerformance"
  ADD CONSTRAINT "UserTagPerformance_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserTagPerformance"
  ADD CONSTRAINT "UserTagPerformance_tagId_fkey"
    FOREIGN KEY ("tagId") REFERENCES "Tag"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
