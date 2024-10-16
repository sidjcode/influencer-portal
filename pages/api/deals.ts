import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const deals = await prisma.deal.findMany({
                include: { influencer: true, videos: true },
            })
            res.status(200).json(deals)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching deals', error })
        }
    } else if (req.method === 'POST') {
        try {
            const { influencerId, ...dealData } = req.body
            const deal = await prisma.deal.create({
                data: {
                    ...dealData,
                    influencer: { connect: { id: influencerId } },
                },
            })
            res.status(201).json(deal)
        } catch (error) {
            res.status(500).json({ message: 'Error creating deal', error })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}