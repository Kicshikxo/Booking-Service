import dotenv from 'dotenv'
import fs from 'node:fs/promises'
import { Pool } from 'pg'

dotenv.config()

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('connect', (client) => {
  client.query(`SET search_path TO ${process.env.DATABASE_SCHEMA}, public`)
})

export async function initDatabase() {
  const sql = await fs.readFile('server/database/init.sql', 'utf-8')
  await pool.query(sql)
  console.log('Database initialized')
}
