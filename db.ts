import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { PrismaClient } from '@prisma/client';

let db: Database | null = null;
const prisma = new PrismaClient();

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
        await prisma.$connect();
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
    await prisma.$disconnect();
}

export { prisma };