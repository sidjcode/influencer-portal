import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { videoId } = req.query

    if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' })
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
        return res.status(500).json({ error: 'Google API key not configured' })
    }

    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${apiKey}`

    try {
        const response = await fetch(apiUrl)
        if (!response.ok) {
            throw new Error(`YouTube API responded with status ${response.status}`)
        }
        const data = await response.json()

        if (!data.items || data.items.length === 0) {
            return res.status(404).json({ error: 'Video not found' })
        }

        const videoData = data.items[0]
        const { snippet, statistics } = videoData

        const formattedData = {
            youtubeId: videoId,
            title: snippet.title,
            channelTitle: snippet.channelTitle,
            channelId: snippet.channelId,
            postDate: snippet.publishedAt,
            thumbnail: snippet.thumbnails.high.url,
            viewCount: statistics.viewCount,
            likeCount: statistics.likeCount,
            commentCount: statistics.commentCount
        }

        res.status(200).json(formattedData)
    } catch (error) {
        console.error('Error fetching YouTube data:', error)
        res.status(500).json({ error: 'Error fetching YouTube data' })
    }
}