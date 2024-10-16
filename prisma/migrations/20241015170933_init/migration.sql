-- CreateTable
CREATE TABLE "Influencer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "channelName" TEXT NOT NULL,
    "category" TEXT,
    "trackingUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "influencerId" INTEGER NOT NULL,
    "contractedBy" TEXT NOT NULL,
    "agencyName" TEXT,
    "pricingType" TEXT NOT NULL,
    "fixedCost" REAL,
    "cpm" REAL,
    "priceCeiling" REAL,
    "viewGuarantee" INTEGER,
    "viewGuaranteeDays" INTEGER,
    "postDate" DATETIME NOT NULL,
    CONSTRAINT "Deal_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Video" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "views" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "influencerId" INTEGER NOT NULL,
    "dealId" INTEGER,
    "postDate" DATETIME NOT NULL,
    CONSTRAINT "Video_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Video_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Click" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "influencerId" INTEGER NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    CONSTRAINT "Click_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_channelName_key" ON "Influencer"("channelName");

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_trackingUrl_key" ON "Influencer"("trackingUrl");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");
