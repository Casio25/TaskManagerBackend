-- Add admin approval tracking on projects and tasks
ALTER TABLE "Project" ADD COLUMN "completedById" INTEGER;

ALTER TABLE "Task" ADD COLUMN "submittedAt" TIMESTAMP(3);
ALTER TABLE "Task" ADD COLUMN "submittedById" INTEGER;
ALTER TABLE "Task" ADD COLUMN "completedById" INTEGER;

-- Harden task ratings ownership
ALTER TABLE "Rating" ALTER COLUMN "taskId" SET NOT NULL;
ALTER TABLE "Rating" ALTER COLUMN "userId" SET NOT NULL;
ALTER TABLE "Rating" ALTER COLUMN "teamwork" DROP DEFAULT;

CREATE UNIQUE INDEX "Rating_taskId_userId_key" ON "Rating"("taskId", "userId");

ALTER TABLE "Project"
  ADD CONSTRAINT "Project_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Task"
  ADD CONSTRAINT "Task_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "Task_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Ensure updated Rating relations align with NOT NULL requirement
ALTER TABLE "Rating"
  DROP CONSTRAINT IF EXISTS "Rating_userId_fkey",
  DROP CONSTRAINT IF EXISTS "Rating_taskId_fkey";
ALTER TABLE "Rating"
  ADD CONSTRAINT "Rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Rating_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
