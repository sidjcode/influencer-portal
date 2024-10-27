import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/prisma'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        const { startDate, endDate, timeFrame } = req.query

        try {
            const groupBy = timeFrame === 'weekly' ?
                { week: { date: '$postDate' } } :
                { month: { date: '$postDate' } }

            const views = await prisma.video.groupBy({
                by: [groupBy],
                _sum: {
                    views: true,
                },
                where: {
                    postDate: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string),
                    },
                },
                orderBy: {
                    [timeFrame === 'weekly' ? 'week' : 'month']: 'asc',
                },
            })

            // Similar queries for clicks, conversions, and posts...

            res.status(200).json({ views, clicks, conversions, posts })
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch graph data' })
        }
    } else {
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}