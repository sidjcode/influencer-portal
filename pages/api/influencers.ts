import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const influencers = await prisma.influencer.findMany();
            res.status(200).json(influencers);
        } else if (req.method === 'POST') {
            const newInfluencer = await prisma.influencer.create({
                data: {
                    channelName: req.body.channelName,
                    channelYoutubeId: req.body.channelYoutubeId,
                    category: req.body.category,
                    avgViews: parseInt(req.body.avgViews),
                    callRequired: req.body.callRequired === 'true',
                    callCompleted: req.body.callCompleted === 'true',
                    engagementRate: parseFloat(req.body.engagementRate),
                    topCountriesProportion: parseFloat(req.body.topCountriesProportion),
                    richCountriesFollowers: parseInt(req.body.richCountriesFollowers),
                    maleFollowers: parseFloat(req.body.maleFollowers),
                    followerGrowthRate: parseFloat(req.body.followerGrowthRate),
                    englishSpeakingFollowers: parseInt(req.body.englishSpeakingFollowers),
                    trackingUrl: req.body.trackingUrl,
                }
            });
            res.status(201).json(newInfluencer);
        } else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in influencers API:', error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
}