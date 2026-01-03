-- CreateTable
CREATE TABLE "ImageRegistry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "blockLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "ImageRegistry_createdAt_idx" ON "ImageRegistry"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ImageRegistry_shop_blockId_key" ON "ImageRegistry"("shop", "blockId");
