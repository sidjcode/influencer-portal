// pages/api/updateVideoMetrics.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' })
    }

    try {
        const { videos } = req.body

        const updatedVideos = await Promise.all(videos.map(async (video: any) => {
            const updatedVideo = await prisma.video.update({
                where: { youtubeId: video.youtubeId },
                data: {
                    title: video.title,
                    viewCount: parseInt(video.viewCount),
                    likeCount: parseInt(video.likeCount),
                    commentCount: parseInt(video.commentCount),
                    thumbnail: video.thumbnail,
                    updatedAt: new Date(),
                },
            })

            // Create a new daily metric entry
            await prisma.dailyVideoMetric.create({
                data: {
                    videoId: updatedVideo.id,
                    date: new Date(),
                    views: parseInt(video.viewCount),
                    clicks: updatedVideo.clicks, // Assuming clicks are not updated from YouTube API
                    conversions: 0, // You may want to update this if you have conversion data
                },
            })

            return updatedVideo
        }))

        res.status(200).json(updatedVideos)
    } catch (error) {
        console.error('Error updating video metrics:', error)
        res.status(500).json({ message: 'Error updating video metrics', error })
    }
}