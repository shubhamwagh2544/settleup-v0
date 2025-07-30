/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Room` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserRoom" ADD COLUMN     "is_admin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
