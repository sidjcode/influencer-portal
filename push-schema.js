const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    try {
        const result = await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS "Test" ("id" SERIAL PRIMARY KEY, "name" TEXT NOT NULL);`
        console.log('Table created successfully', result)
    } catch (error) {
        console.error('Error creating table:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()