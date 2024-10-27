import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const videos = await prisma.video.findMany({
                include: {
                    influencer: true,
                    deal: true,
                    dailyMetrics: {
                        orderBy: {
                            date: 'desc'
                        },
                        take: 1
                    }
                }
            })
            res.status(200).json(videos)
        } catch (error) {
            res.status(500).json({ message: 'Error fetching videos', error })
        }
    } else if (req.method === 'POST') {
        try {
            const {
                youtubeId,
                title,
                trackingUrl,
                videoLink,
                influencerId,
                dealId,
                postDate,
                couponCode,
                channelTitle,
                thumbnail,
                viewCount,
                likeCount,
                commentCount
            } = req.body

            const video = await prisma.video.create({
                data: {
                    youtubeId,
                    title,
                    trackingUrl,
                    videoLink,
                    influencerId: parseInt(influencerId),
                    dealId: dealId ? parseInt(dealId) : null,
                    postDate: new Date(postDate),
                    couponCode,
                    channelTitle,
                    thumbnail,
                    viewCount: viewCount ? parseInt(viewCount) : null,
                    likeCount: likeCount ? parseInt(likeCount) : null,
                    commentCount: commentCount ? parseInt(commentCount) : null
                },
            })
            res.status(201).json(video)
        } catch (error) {
            res.status(500).json({ message: 'Error creating video', error })
        }
    } else if (req.method === 'PUT') {
        try {
            const { id, ...data } = req.body
            const updatedVideo = await prisma.video.update({
                where: { id: parseInt(id) },
                data: {
                    ...data,
                    influencerId: parseInt(data.influencerId),
                    dealId: data.dealId ? parseInt(data.dealId) : null,
                    postDate: new Date(data.postDate),
                    viewCount: data.viewCount ? parseInt(data.viewCount) : null,
                    likeCount: data.likeCount ? parseInt(data.likeCount) : null,
                    commentCount: data.commentCount ? parseInt(data.commentCount) : null
                },
            })
            res.status(200).json(updatedVideo)
        } catch (error) {
            res.status(500).json({ message: 'Error updating video', error })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}