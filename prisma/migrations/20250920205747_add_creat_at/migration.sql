-- DropForeignKey
ALTER TABLE "ColleagueList" DROP CONSTRAINT "ColleagueList_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ColleagueListMember" DROP CONSTRAINT "ColleagueListMember_colleagueId_fkey";

-- DropForeignKey
ALTER TABLE "ColleagueListMember" DROP CONSTRAINT "ColleagueListMember_listId_fkey";

-- AlterTable
ALTER TABLE "ColleagueList" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "ColleagueList" ADD CONSTRAINT "ColleagueList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColleagueListMember" ADD CONSTRAINT "ColleagueListMember_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ColleagueList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColleagueListMember" ADD CONSTRAINT "ColleagueListMember_colleagueId_fkey" FOREIGN KEY ("colleagueId") REFERENCES "Colleague"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
