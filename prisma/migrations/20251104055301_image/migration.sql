-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "svgHtml" TEXT NOT NULL,
    "previewHtml" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "Image_shop_idx" ON "Image"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Image_externalId_shop_key" ON "Image"("externalId", "shop");
