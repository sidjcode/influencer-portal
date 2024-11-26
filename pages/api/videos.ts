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
            console.error('Error fetching videos:', error)
            res.status(500).json({message: 'Error fetching videos', error: error instanceof Error ? error.message : String(error)})
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
                commentCount,
                clicks,
                cost
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
                    commentCount: commentCount ? parseInt(commentCount) : null,
                    clicks: clicks ? parseInt(clicks) : 0,
                    cost: cost ? parseFloat(cost) : 0
                },
            })
            res.status(201).json(video)
        } catch (error) {
            console.error('Error creating video:', error)
            res.status(500).json({message: 'Error creating video', error: error instanceof Error ? error.message : String(error)})
        }
    } else if (req.method === 'PUT') {
        try {
            console.log('Received PUT request with body:', JSON.stringify(req.body, null, 2));
            const { id, ...data } = req.body
            console.log('Parsed id:', id, 'and data:', JSON.stringify(data, null, 2));

            // Log the types of each field
            console.log('Field types:', Object.entries(data).reduce<Record<string, string>>((acc, [key, value]) => {
                acc[key] = typeof value;
                return acc;
            }, {}));

            if (!id) {
                throw new Error('Video ID is required for updating');
            }

            const updatedVideo = await prisma.video.update({
                where: { id: parseInt(id) },
                data: {
                    youtubeId: data.youtubeId,
                    title: data.title,
                    trackingUrl: data.trackingUrl,
                    videoLink: data.videoLink,
                    influencerId: data.influencerId ? parseInt(data.influencerId) : undefined,
                    dealId: data.dealId ? parseInt(data.dealId) : null,
                    postDate: data.postDate ? new Date(data.postDate) : undefined,
                    couponCode: data.couponCode,
                    channelTitle: data.channelTitle,
                    thumbnail: data.thumbnail,
                    viewCount: data.viewCount ? parseInt(data.viewCount) : undefined,
                    likeCount: data.likeCount ? parseInt(data.likeCount) : undefined,
                    commentCount: data.commentCount ? parseInt(data.commentCount) : undefined,
                    clicks: data.clicks ? parseInt(data.clicks) : undefined,
                    cost: data.cost ? parseFloat(data.cost) : undefined
                },
            })
            console.log('Video updated successfully:', updatedVideo);
            res.status(200).json(updatedVideo)
        } catch (error) {
            console.error('Error updating video:', error);
            res.status(500).json({
                message: 'Error updating video',
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                details: error
            })
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'PUT'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}