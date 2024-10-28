import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateDealName(deal: any, influencer: any, agency: any) {
    const influencerInitial = influencer.channelName.charAt(0).toUpperCase()
    const agencyName = agency ? agency.name : 'Direct'
    const pricingType = deal.pricingType === 'FIXED' ? 'F' : 'C'
    const cost = deal.pricingType === 'FIXED'
        ? deal.fixedCost
        : `${deal.cpm}y${deal.priceCeiling || ''}`
    const numberOfVideos = deal.numberOfVideos
    const viewGuarantee = deal.viewGuarantee ? `${(deal.viewGuarantee / 1000).toFixed(0)}VG${deal.viewGuaranteeDays}` : ''
    const firstMonth = new Date(deal.uploadMonths[0]).toLocaleString('default', { month: 'short' })

    return `${influencerInitial}, ${agencyName}, ${pricingType} ${cost} x ${numberOfVideos} ${viewGuarantee ? 'x ' + viewGuarantee : ''} x ${firstMonth}`
}

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
            res.status(500).json({message: 'Error fetching deals', error})
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
                status,
                numberOfVideos,
                uploadMonths,
                usage,
                deliverable,
            } = req.body

            let totalCost = 0

            if (pricingType === 'FIXED') {
                totalCost = parseFloat(fixedCost) * parseInt(numberOfVideos)
            } else if (pricingType === 'CPM') {
                if (viewGuarantee) {
                    totalCost = (parseFloat(cpm) * parseInt(viewGuarantee) / 1000) * parseInt(numberOfVideos)
                    if (priceCeiling && totalCost > parseFloat(priceCeiling)) {
                        totalCost = parseFloat(priceCeiling)
                    }
                }
            }

            const influencer = await prisma.influencer.findUnique({
                where: {id: parseInt(influencerId)},
            })

            const agency = agencyId ? await prisma.agency.findUnique({
                where: {id: parseInt(agencyId)},
            }) : null

            const name = generateDealName({
                pricingType,
                fixedCost,
                cpm,
                priceCeiling,
                viewGuarantee,
                viewGuaranteeDays,
                numberOfVideos,
                uploadMonths,
            }, influencer, agency)

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
                    totalCost,
                    status,
                    numberOfVideos: parseInt(numberOfVideos),
                    uploadMonths,
                    usage,
                    deliverable,
                },
            })

            res.status(201).json(newDeal)
        } catch (error) {
            res.status(500).json({message: 'Error creating deal', error})
        }
    } else if (req.method === 'PUT') {
        try {
            const {id} = req.query
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
                status,
                numberOfVideos,
                uploadMonths,
                usage,
                deliverable,
            } = req.body

            let totalCost = 0

            if (pricingType === 'FIXED') {
                totalCost = parseFloat(fixedCost) * parseInt(numberOfVideos)
            } else if (pricingType === 'CPM') {
                if (viewGuarantee) {
                    totalCost = (parseFloat(cpm) * parseInt(viewGuarantee) / 1000) * parseInt(numberOfVideos)
                    if (priceCeiling && totalCost > parseFloat(priceCeiling)) {
                        totalCost = parseFloat(priceCeiling)
                    }
                }
            }

            const influencer = await prisma.influencer.findUnique({
                where: {id: parseInt(influencerId)},
            })

            const agency = agencyId ? await prisma.agency.findUnique({
                where: {id: parseInt(agencyId)},
            }) : null

            const name = generateDealName({
                pricingType,
                fixedCost,
                cpm,
                priceCeiling,
                viewGuarantee,
                viewGuaranteeDays,
                numberOfVideos,
                uploadMonths,
            }, influencer, agency)

            const updatedDeal = await prisma.deal.update({
                where: {id: parseInt(id as string)},
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
                    totalCost,
                    status,
                    numberOfVideos: parseInt(numberOfVideos),
                    uploadMonths,
                    usage,
                    deliverable,
                },
            })

            res.status(200).json(updatedDeal)
        } catch (error) {
            res.status(500).json({message: 'Error updating deal', error})
        }
    } else if (req.method === 'DELETE') {
        try {
            const {id} = req.query
            await prisma.deal.delete({
                where: {id: parseInt(id as string)},
            })
            res.status(204).end()
        } catch (error) {
            res.status(500).json({message: 'Error deleting deal', error})
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}