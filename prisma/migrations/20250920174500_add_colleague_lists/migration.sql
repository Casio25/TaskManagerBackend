-- Create colleague lists table
CREATE TABLE "ColleagueList" (
    "id" SERIAL PRIMARY KEY,
    "ownerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure unique list names per owner
CREATE UNIQUE INDEX "ColleagueList_ownerId_name_key" ON "ColleagueList" ("ownerId", "name");

-- Create list membership table
CREATE TABLE "ColleagueListMember" (
    "id" SERIAL PRIMARY KEY,
    "listId" INTEGER NOT NULL,
    "colleagueId" INTEGER NOT NULL
);

-- Ensure colleague appears only once per list
CREATE UNIQUE INDEX "ColleagueListMember_listId_colleagueId_key" ON "ColleagueListMember" ("listId", "colleagueId");

-- Foreign keys
ALTER TABLE "ColleagueList"
  ADD CONSTRAINT "ColleagueList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ColleagueListMember"
  ADD CONSTRAINT "ColleagueListMember_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ColleagueList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ColleagueListMember"
  ADD CONSTRAINT "ColleagueListMember_colleagueId_fkey" FOREIGN KEY ("colleagueId") REFERENCES "Colleague"("id") ON DELETE CASCADE ON UPDATE CASCADE;


