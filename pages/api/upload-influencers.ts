import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import csv from 'csv-parser'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    const form = new formidable.IncomingForm()

    return new Promise<void>((resolve, reject) => {
        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.error('Error parsing form:', err)
                res.status(500).json({ message: 'Error parsing form data' })
                return resolve()
            }

            const file = Array.isArray(files.file) ? files.file[0] : files.file
            if (!file) {
                res.status(400).json({ message: 'No file uploaded' })
                return resolve()
            }

            const results: any[] = []

            fs.createReadStream(file.filepath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    try {
                        for (const influencer of results) {
                            await prisma.influencer.create({
                                data: {
                                    channelName: influencer.channelName,
                                    channelYoutubeId: influencer.channelYoutubeId,
                                    category: influencer.category,
                                    avgViews: parseInt(influencer.avgViews),
                                    callRequired: influencer.callRequired === 'true',
                                    engagementRate: parseFloat(influencer.engagementRate),
                                    topCountriesProportion: parseFloat(influencer.topCountriesProportion),
                                    richCountriesFollowers: parseInt(influencer.richCountriesFollowers),
                                    maleFollowers: parseFloat(influencer.maleFollowers),
                                    followerGrowthRate: parseFloat(influencer.followerGrowthRate),
                                    englishSpeakingFollowers: parseInt(influencer.englishSpeakingFollowers),
                                    trackingUrl: influencer.trackingUrl,
                                },
                            })
                        }
                        res.status(200).json({ message: 'Influencers uploaded successfully' })
                    } catch (error) {
                        console.error('Error uploading influencers:', error)
                        res.status(500).json({ message: 'Error uploading influencers' })
                    }
                    resolve()
                })
        })
    })
}