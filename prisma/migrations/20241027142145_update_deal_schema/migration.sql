-- CreateTable
CREATE TABLE "Influencer" (
    "id" SERIAL NOT NULL,
    "channelName" TEXT NOT NULL,
    "channelYoutubeId" TEXT NOT NULL,
    "category" TEXT,
    "avgViews" INTEGER NOT NULL,
    "engagementRate" DOUBLE PRECISION NOT NULL,
    "topCountriesProportion" DOUBLE PRECISION NOT NULL,
    "richCountriesFollowers" INTEGER NOT NULL,
    "maleFollowers" DOUBLE PRECISION NOT NULL,
    "followerGrowthRate" DOUBLE PRECISION NOT NULL,
    "englishSpeakingFollowers" INTEGER NOT NULL,
    "country" TEXT NOT NULL,
    "language" TEXT NOT NULL,

    CONSTRAINT "Influencer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "feeStructure" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "influencerId" INTEGER NOT NULL,
    "agencyId" INTEGER,
    "contractedBy" TEXT NOT NULL,
    "pricingType" TEXT NOT NULL,
    "fixedCost" DOUBLE PRECISION,
    "cpm" DOUBLE PRECISION,
    "priceCeiling" DOUBLE PRECISION,
    "viewGuarantee" INTEGER,
    "viewGuaranteeDays" INTEGER,
    "totalCost" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "numberOfVideos" INTEGER NOT NULL,
    "uploadMonths" TEXT[],

    CONSTRAINT "Deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "trackingUrl" TEXT NOT NULL,
    "videoLink" TEXT NOT NULL,
    "influencerId" INTEGER NOT NULL,
    "dealId" INTEGER,
    "postDate" TIMESTAMP(3) NOT NULL,
    "couponCode" TEXT,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyVideoMetric" (
    "id" SERIAL NOT NULL,
    "videoId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL,
    "clicks" INTEGER NOT NULL,
    "conversions" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyVideoMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Influencer_channelName_key" ON "Influencer"("channelName");

-- CreateIndex
CREATE UNIQUE INDEX "Agency_name_key" ON "Agency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Video_youtubeId_key" ON "Video"("youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyVideoMetric_videoId_date_key" ON "DailyVideoMetric"("videoId", "date");

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "Influencer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyVideoMetric" ADD CONSTRAINT "DailyVideoMetric_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
