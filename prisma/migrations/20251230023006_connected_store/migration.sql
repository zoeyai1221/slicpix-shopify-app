-- CreateTable
CREATE TABLE "ConnectedStores" (
    "blockId" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "ConnectedStores_createdAt_idx" ON "ConnectedStores"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectedStores_shop_blockId_key" ON "ConnectedStores"("shop", "blockId");
