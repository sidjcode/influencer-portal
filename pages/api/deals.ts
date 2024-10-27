import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const deals = await prisma.deal.findMany({
                include: {
                    influencer: {
                        select: {
                            channelName: true,
                            channelYoutubeId: true
                        }
                    },
                    videos: true,
                    agency: true
                }
            });

            res.status(200).json(deals);
        } catch (error) {
            console.error('Error fetching deals:', error);
            res.status(500).json({ message: 'Error fetching deals', error: (error as Error).message });
        }
    } else if (req.method === 'POST') {
        try {
            const {
                influencerId,
                agencyId,
                contractedBy,
                pricingType,
                fixedCost,
                cpm,
                priceCeiling,
                viewGuarantee,
                viewGuaranteeDays,
                postDate,
                totalSpend,
                agencyFee,
                status
            } = req.body;

            const newDeal = await prisma.deal.create({
                data: {
                    influencerId: parseInt(influencerId),
                    agencyId: agencyId ? parseInt(agencyId) : undefined,
                    contractedBy,
                    pricingType,
                    fixedCost: fixedCost ? parseFloat(fixedCost) : null,
                    cpm: cpm ? parseFloat(cpm) : null,
                    priceCeiling: priceCeiling ? parseFloat(priceCeiling) : null,
                    viewGuarantee: viewGuarantee ? parseInt(viewGuarantee) : null,
                    viewGuaranteeDays: viewGuaranteeDays ? parseInt(viewGuaranteeDays) : null,
                    postDate: new Date(postDate),
                    totalSpend: parseFloat(totalSpend),
                    agencyFee: agencyFee ? parseFloat(agencyFee) : null,
                    status: status || 'active'
                },
                include: {
                    influencer: true,
                    agency: true
                }
            });

            res.status(201).json(newDeal);
        } catch (error) {
            console.error('Error creating deal:', error);
            res.status(500).json({ message: 'Error creating deal', error: (error as Error).message });
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}