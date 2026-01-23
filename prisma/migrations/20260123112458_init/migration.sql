-- CreateTable
CREATE TABLE "ScrapeJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "platform" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "itemsScraped" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "productId" TEXT,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "price" REAL,
    "currency" TEXT,
    "description" TEXT,
    "mainCategory" TEXT,
    "subCategory" TEXT,
    "shippingCost" REAL,
    "shippingTime" TEXT,
    "sellerName" TEXT,
    "sellerRating" REAL,
    "productRating" REAL,
    "reviewCount" INTEGER,
    "images" TEXT,
    "variants" TEXT,
    "stockStatus" TEXT,
    "minOrderQty" INTEGER,
    "weight" TEXT,
    "dimensions" TEXT,
    "sku" TEXT,
    "platformSource" TEXT,
    "dateScraped" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapeJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScrapeLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ScrapeLog_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "ScrapeJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScrapingConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "urlPatterns" TEXT NOT NULL,
    "rateLimit" INTEGER NOT NULL DEFAULT 2,
    "proxyRotation" BOOLEAN NOT NULL DEFAULT true,
    "javascriptRender" BOOLEAN NOT NULL DEFAULT true,
    "maxRetries" INTEGER NOT NULL DEFAULT 5,
    "timeoutSeconds" INTEGER NOT NULL DEFAULT 30,
    "captchaHandling" TEXT NOT NULL DEFAULT 'pause',
    "maxProducts" INTEGER NOT NULL DEFAULT 100,
    "robotsCompliance" BOOLEAN NOT NULL DEFAULT true,
    "selectors" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Product_jobId_idx" ON "Product"("jobId");

-- CreateIndex
CREATE INDEX "ScrapeLog_jobId_idx" ON "ScrapeLog"("jobId");
