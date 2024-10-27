// File: /pages/api/deals.ts (or wherever your API routes are located)

import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const deals = await prisma.deal.findMany({
                include: {
                    influencer: true,
                    agency: true,
                },
            })
            res.status(200).json(deals)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching deals', error })
        }
    } else if (req.method === 'POST') {
        try {
            const {
                name,
                influencerId,
                agencyId,
                contractedBy,
                pricingType,
                fixedCost,
                cpm,
                priceCeiling,
                viewGuarantee,
                viewGuaranteeDays,
                totalCost,
                status,
                numberOfVideos,
                uploadMonths,
            } = req.body

            const newDeal = await prisma.deal.create({
                data: {
                    name,
                    influencerId: parseInt(influencerId),
                    agencyId: agencyId ? parseInt(agencyId) : null,
                    contractedBy,
                    pricingType,
                    fixedCost: fixedCost ? parseFloat(fixedCost) : null,
                    cpm: cpm ? parseFloat(cpm) : null,
                    priceCeiling: priceCeiling ? parseFloat(priceCeiling) : null,
                    viewGuarantee: viewGuarantee ? parseInt(viewGuarantee) : null,
                    viewGuaranteeDays: viewGuaranteeDays ? parseInt(viewGuaranteeDays) : null,
                    totalCost: parseFloat(totalCost),
                    status,
                    numberOfVideos: parseInt(numberOfVideos),
                    uploadMonths,
                },
            })

            res.status(201).json(newDeal)
        } catch (error) {
            res.status(500).json({ message: 'Error creating deal', error })
        }
    } else if (req.method === 'PUT') {
        try {
            const { id } = req.query
            const {
                name,
                influencerId,
                agencyId,
                contractedBy,
                pricingType,
                fixedCost,
                cpm,
                priceCeiling,
                viewGuarantee,
                viewGuaranteeDays,
                totalCost,
                status,
                numberOfVideos,
                uploadMonths,
            } = req.body

            const updatedDeal = await prisma.deal.update({
                where: { id: parseInt(id as string) },
                data: {
                    name,
                    influencerId: parseInt(influencerId),
                    agencyId: agencyId ? parseInt(agencyId) : null,
                    contractedBy,
                    pricingType,
                    fixedCost: fixedCost ? parseFloat(fixedCost) : null,
                    cpm: cpm ? parseFloat(cpm) : null,
                    priceCeiling: priceCeiling ? parseFloat(priceCeiling) : null,
                    viewGuarantee: viewGuarantee ? parseInt(viewGuarantee) : null,
                    viewGuaranteeDays: viewGuaranteeDays ? parseInt(viewGuaranteeDays) : null,
                    totalCost: parseFloat(totalCost),
                    status,
                    numberOfVideos: parseInt(numberOfVideos),
                    uploadMonths,
                },
            })

            res.status(200).json(updatedDeal)
        } catch (error) {
            res.status(500).json({ message: 'Error updating deal', error })
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query
            await prisma.deal.delete({
                where: { id: parseInt(id as string) },
            })
            res.status(204).end()
        } catch (error) {
            res.status(500).json({ message: 'Error deleting deal', error })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}