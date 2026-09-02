-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "isReadOnly" BOOLEAN NOT NULL DEFAULT false;
