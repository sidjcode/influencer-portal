import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const agencies = await prisma.agency.findMany()
            res.status(200).json(agencies)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching agencies', error })
        }
    } else if (req.method === 'POST') {
        try {
            const { name, feeStructure } = req.body
            const newAgency = await prisma.agency.create({
                data: {
                    name,
                    feeStructure: JSON.parse(feeStructure),
                },
            })
            res.status(201).json(newAgency)
        } catch (error) {
            res.status(500).json({ message: 'Error creating agency', error })
        }
    } else if (req.method === 'PUT') {
        try {
            const { id } = req.query
            const { name, feeStructure } = req.body
            const updatedAgency = await prisma.agency.update({
                where: { id: parseInt(id as string) },
                data: {
                    name,
                    feeStructure: JSON.parse(feeStructure),
                },
            })
            res.status(200).json(updatedAgency)
        } catch (error) {
            res.status(500).json({ message: 'Error updating agency', error })
        }
    } else if (req.method === 'DELETE') {
        try {
            const { id } = req.query
            await prisma.agency.delete({
                where: { id: parseInt(id as string) },
            })
            res.status(204).end()
        } catch (error) {
            res.status(500).json({ message: 'Error deleting agency', error })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}