import type { NextApiRequest, NextApiResponse } from 'next'
import { openDb, closeDb } from '../../db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const db = await openDb();

    if (req.method === 'GET') {
        try {
            const deals = await db.all(`
                SELECT d.*, i.channelName, i.channelYoutubeId
                FROM deals d
                LEFT JOIN influencers i ON d.influencerId = i.id
            `);

            // Fetch videos for each deal
            for (let deal of deals) {
                const videos = await db.all('SELECT * FROM videos WHERE dealId = ?', deal.id);
                deal.videos = videos;
            }

            res.status(200).json(deals);
        } catch (error) {
            console.error('Error fetching deals:', error);
            res.status(500).json({ message: 'Error fetching deals', error: (error as Error).message });
        } finally {
            await closeDb();
        }
    } else if (req.method === 'POST') {
        try {
            const {
                influencerId,
                status,
                uploadMonth,
                deliverables,
                usage,
                recut,
                exclusivity,
                viewGuaranteeAmount,
                viewGuaranteeDays,
                rate,
                postDate,
                uploadLink,
                trackingUrl,
                contractedBy,
                agencyName
            } = req.body;

            const result = await db.run(`
                INSERT INTO deals (
                    influencerId, status, uploadMonth, deliverables, usage, recut, exclusivity,
                    viewGuaranteeAmount, viewGuaranteeDays, rate, postDate, uploadLink,
                    trackingUrl, contractedBy, agencyName
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                influencerId, status, uploadMonth, deliverables, usage, recut, exclusivity,
                viewGuaranteeAmount, viewGuaranteeDays, rate, postDate, uploadLink,
                trackingUrl, contractedBy, agencyName
            ]);

            const newDeal = await db.get('SELECT * FROM deals WHERE id = ?', result.lastID);
            res.status(201).json(newDeal);
        } catch (error) {
            console.error('Error creating deal:', error);
            res.status(500).json({ message: 'Error creating deal', error: (error as Error).message });
        } finally {
            await closeDb();
        }
    } else {
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}