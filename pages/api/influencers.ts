import type { NextApiRequest, NextApiResponse } from 'next'
import { openDb, closeDb } from '../../db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            const influencers = await db.all('SELECT * FROM influencers');
            res.status(200).json(influencers);
        } catch (error) {
            console.error('Error fetching influencers:', error);
            res.status(500).json({ error: 'Error fetching influencers', details: (error as Error).message });
        } finally {
            await closeDb();
        }
    } else if (req.method === 'POST') {
        try {
            const {
                channelName,
                channelYoutubeId,
                category,
                avgViews,
                callRequired,
                engagementRate,
                topCountriesProportion,
                richCountriesFollowers,
                maleFollowers,
                followerGrowthRate,
                englishSpeakingFollowers
            } = req.body;

            const result = await db.run(`
                INSERT INTO influencers (
                    channelName,
                    channelYoutubeId,
                    category,
                    avgViews,
                    callRequired,
                    engagementRate,
                    topCountriesProportion,
                    richCountriesFollowers,
                    maleFollowers,
                    followerGrowthRate,
                    englishSpeakingFollowers
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                channelName,
                channelYoutubeId,
                category,
                avgViews,
                callRequired,
                engagementRate,
                topCountriesProportion,
                richCountriesFollowers,
                maleFollowers,
                followerGrowthRate,
                englishSpeakingFollowers
            ]);

            const newInfluencer = await db.get('SELECT * FROM influencers WHERE id = ?', result.lastID);
            res.status(201).json(newInfluencer);
        } catch (error) {
            console.error('Error creating influencer:', error);
            res.status(500).json({ error: 'Error creating influencer', details: (error as Error).message });
        } finally {
            await closeDb();
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}