/*
  Warnings:

  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_createdById_fkey";

-- DropForeignKey
ALTER TABLE "OrderProduct" DROP CONSTRAINT "OrderProduct_orderId_fkey";

-- DropTable
DROP TABLE "Order";

-- DropEnum
DROP TYPE "OrderStatus";
