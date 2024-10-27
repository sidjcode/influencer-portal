const { Client } = require('pg')
require('dotenv').config()

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

async function listTables() {
    try {
        await client.connect()
        const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)
        console.log('Tables in the database:', result.rows.map(row => row.table_name))
    } catch (err) {
        console.error('Error listing tables:', err)
    } finally {
        await client.end()
    }
}

listTables()