-- CreateTable
CREATE TABLE "Colleague" (
    "id" SERIAL NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "contactId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colleague_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Colleague_ownerId_email_key" ON "Colleague"("ownerId", "email");

-- AddForeignKey
ALTER TABLE "Colleague" ADD CONSTRAINT "Colleague_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colleague" ADD CONSTRAINT "Colleague_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

