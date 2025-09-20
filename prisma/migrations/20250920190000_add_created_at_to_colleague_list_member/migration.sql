-- Add missing createdAt column to ColleagueListMember
ALTER TABLE "ColleagueListMember"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

