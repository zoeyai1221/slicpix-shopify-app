/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ConnectedStores` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "ConnectedStores_shop_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedStores_email_key" ON "ConnectedStores"("email");
