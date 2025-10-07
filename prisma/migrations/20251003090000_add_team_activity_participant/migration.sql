-- Ensure TeamActivityAction enum exists (older databases may miss it)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeamActivityAction') THEN
    CREATE TYPE "TeamActivityAction" AS ENUM (
      'ADDED_TO_TEAM',
      'REMOVED_FROM_TEAM',
      'ASSIGNED_TO_PROJECT',
      'REMOVED_FROM_PROJECT',
      'ASSIGNED_TO_TASK',
      'REMOVED_FROM_TASK'
    );
  END IF;
END
$$;

-- Create TeamActivity table when migrating older databases that never had it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name = 'TeamActivity'
  ) THEN
    CREATE TABLE "TeamActivity" (
      "id" SERIAL NOT NULL,
      "ownerId" INTEGER NOT NULL,
      "teamId" INTEGER,
      "colleagueId" INTEGER NOT NULL,
      "projectId" INTEGER,
      "taskId" INTEGER,
      "participantUserId" INTEGER,
      "action" "TeamActivityAction" NOT NULL,
      "metadata" JSONB,
      "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TeamActivity_pkey" PRIMARY KEY ("id")
    );

    CREATE INDEX "TeamActivity_ownerId_idx" ON "TeamActivity"("ownerId");
    CREATE INDEX "TeamActivity_teamId_idx" ON "TeamActivity"("teamId");
    CREATE INDEX "TeamActivity_colleagueId_idx" ON "TeamActivity"("colleagueId");
    CREATE INDEX "TeamActivity_participantUserId_idx" ON "TeamActivity"("participantUserId");
    CREATE INDEX "TeamActivity_projectId_idx" ON "TeamActivity"("projectId");
    CREATE INDEX "TeamActivity_taskId_idx" ON "TeamActivity"("taskId");

    ALTER TABLE "TeamActivity"
      ADD CONSTRAINT "TeamActivity_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      ADD CONSTRAINT "TeamActivity_teamId_fkey"
        FOREIGN KEY ("teamId") REFERENCES "ColleagueList"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      ADD CONSTRAINT "TeamActivity_colleagueId_fkey"
        FOREIGN KEY ("colleagueId") REFERENCES "Colleague"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
      ADD CONSTRAINT "TeamActivity_projectId_fkey"
        FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      ADD CONSTRAINT "TeamActivity_taskId_fkey"
        FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE,
      ADD CONSTRAINT "TeamActivity_participantUserId_fkey"
        FOREIGN KEY ("participantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  ELSE
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = current_schema()
        AND table_name = 'TeamActivity'
        AND column_name = 'participantUserId'
    ) THEN
      ALTER TABLE "TeamActivity" ADD COLUMN "participantUserId" INTEGER;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = current_schema()
        AND indexname = 'TeamActivity_participantUserId_idx'
    ) THEN
      CREATE INDEX "TeamActivity_participantUserId_idx" ON "TeamActivity"("participantUserId");
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.table_constraints
      WHERE constraint_schema = current_schema()
        AND table_name = 'TeamActivity'
        AND constraint_name = 'TeamActivity_participantUserId_fkey'
    ) THEN
      ALTER TABLE "TeamActivity"
        ADD CONSTRAINT "TeamActivity_participantUserId_fkey"
        FOREIGN KEY ("participantUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END
$$;
