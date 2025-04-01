/*
  Warnings:

  - You are about to alter the column `amount` on the `Expense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `amount_owed` on the `UserExpense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[account_number]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `account_number` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Made the column `amount_owed` on table `UserExpense` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'EXPENSE_SETTLEMENT';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "account_number" VARCHAR(16) NOT NULL;

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "UserExpense" ALTER COLUMN "amount_owed" SET NOT NULL,
ALTER COLUMN "amount_owed" SET DATA TYPE DECIMAL(10,2);

-- CreateIndex
CREATE UNIQUE INDEX "Account_account_number_key" ON "Account"("account_number");
