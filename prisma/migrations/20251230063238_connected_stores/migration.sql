/*
  Warnings:

  - You are about to drop the column `blockId` on the `ConnectedStores` table. All the data in the column will be lost.
  - Added the required column `email` to the `ConnectedStores` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ConnectedStores" (
    "email" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ConnectedStores" ("createdAt", "shop") SELECT "createdAt", "shop" FROM "ConnectedStores";
DROP TABLE "ConnectedStores";
ALTER TABLE "new_ConnectedStores" RENAME TO "ConnectedStores";
CREATE INDEX "ConnectedStores_createdAt_idx" ON "ConnectedStores"("createdAt");
CREATE UNIQUE INDEX "ConnectedStores_shop_email_key" ON "ConnectedStores"("shop", "email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
