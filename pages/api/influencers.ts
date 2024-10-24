import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const influencers = await prisma.influencer.findMany();
            res.status(200).json(influencers);
        } else if (req.method === 'POST') {
            const newInfluencer = await prisma.influencer.create({
                data: req.body
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