import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

let db: Database | null = null;

export async function openDb(): Promise<Database> {
    if (!db) {
        db = await open({
            filename: './influencer_portal.sqlite',
            driver: sqlite3.Database
        });
    }
    return db;
}

export async function initializeDb(): Promise<void> {
    try {
        const db = await openDb();

        await db.exec(`
            CREATE TABLE IF NOT EXISTS influencers (
                                                       id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                       channelName TEXT NOT NULL,
                                                       channelYoutubeId TEXT NOT NULL,
                                                       category TEXT,
                                                       avgViews INTEGER,
                                                       callRequired BOOLEAN,
                                                       engagementRate REAL,
                                                       topCountriesProportion REAL,
                                                       richCountriesFollowers INTEGER,
                                                       maleFollowers REAL,
                                                       followerGrowthRate REAL,
                                                       englishSpeakingFollowers INTEGER
            )
        `);

        await db.exec(`
            CREATE TABLE IF NOT EXISTS deals (
                                                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                 influencerId INTEGER,
                                                 status TEXT NOT NULL,
                                                 uploadMonth TEXT,
                                                 deliverables TEXT,
                                                 usage TEXT,
                                                 recut TEXT,
                                                 exclusivity TEXT,
                                                 viewGuaranteeAmount INTEGER,
                                                 viewGuaranteeDays INTEGER,
                                                 rate REAL,
                                                 postDate TEXT,
                                                 uploadLink TEXT,
                                                 trackingUrl TEXT,
                                                 contractedBy TEXT NOT NULL,
                                                 agencyName TEXT,
                                                 FOREIGN KEY(influencerId) REFERENCES influencers(id)
                )
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

export async function closeDb(): Promise<void> {
    if (db) {
        await db.close();
        db = null;
    }
}

export { openDb };