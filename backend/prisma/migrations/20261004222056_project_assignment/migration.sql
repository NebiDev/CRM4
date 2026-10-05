-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "assignedToId" TEXT;

-- CreateIndex
CREATE INDEX "Project_organizationId_assignedToId_idx" ON "Project"("organizationId", "assignedToId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
