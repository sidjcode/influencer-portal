import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET':
                const influencers = await prisma.influencer.findMany();
                res.status(200).json(influencers);
                break;

            case 'POST':
                const newInfluencer = await prisma.influencer.create({
                    data: {
                        channelName: req.body.channelName,
                        channelYoutubeId: req.body.channelYoutubeId,
                        category: req.body.category,
                        avgViews: parseInt(req.body.avgViews),
                        engagementRate: parseFloat(req.body.engagementRate),
                        topCountriesProportion: parseFloat(req.body.topCountriesProportion),
                        maleFollowers: parseFloat(req.body.maleFollowers),
                        followerGrowthRate: parseFloat(req.body.followerGrowthRate),
                        englishSpeakingFollowers: parseInt(req.body.englishSpeakingFollowers),
                        country: req.body.country,
                        language: req.body.language,
                    }
                });
                res.status(201).json(newInfluencer);
                break;

            case 'PUT':
                const { id, ...updateData } = req.body;
                const updatedInfluencer = await prisma.influencer.update({
                    where: { id: parseInt(id) },
                    data: {
                        channelName: updateData.channelName,
                        channelYoutubeId: updateData.channelYoutubeId,
                        category: updateData.category,
                        avgViews: parseInt(updateData.avgViews),
                        engagementRate: parseFloat(updateData.engagementRate),
                        topCountriesProportion: parseFloat(updateData.topCountriesProportion),
                        maleFollowers: parseFloat(updateData.maleFollowers),
                        followerGrowthRate: parseFloat(updateData.followerGrowthRate),
                        englishSpeakingFollowers: parseInt(updateData.englishSpeakingFollowers),
                        country: updateData.country,
                        language: updateData.language,
                    }
                });
                res.status(200).json(updatedInfluencer);
                break;

            case 'DELETE':
                const { id: deleteId } = req.body;
                await prisma.influencer.delete({
                    where: { id: parseInt(deleteId) }
                });
                res.status(204).end();
                break;

            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Error in influencers API:', error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
}