import { pool } from '../database'
import { Event } from '../dto/event.dto'

export async function getEvents() {
  const { rows } = await pool.query<Event>('SELECT * FROM events')
  return rows
}

export async function createEvent(
  creatorId: string,
  title: string,
  description?: string,
  totalSeats?: number,
  plannedAt?: string,
) {
  const { rows } = await pool.query<Event>(
    'INSERT INTO events (creator_id, title, description, total_seats, planned_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [creatorId, title, description, totalSeats, plannedAt],
  )
  return rows[0]
}

export async function getEventById(eventId: string) {
  const { rows } = await pool.query<Event>('SELECT * FROM events WHERE event_id = $1', [eventId])
  return rows[0]
}

export async function getEventByTitle(title: string) {
  const { rows } = await pool.query<Event>('SELECT * FROM events WHERE title = $1', [title])
  return rows[0]
}

export async function updateEventById(
  eventId: string,
  title: string,
  description?: string,
  total_seats?: number,
  planned_at?: string,
) {
  const { rows } = await pool.query<Event>(
    'UPDATE events SET title = $1, description = $2, total_seats = $3, planned_at = $4, updated_at = CURRENT_TIMESTAMP WHERE event_id = $5 RETURNING *',
    [title, description, total_seats, planned_at, eventId],
  )
  return rows[0]
}

export async function deleteEventById(eventId: string) {
  const { rows } = await pool.query<Event>('DELETE FROM events WHERE event_id = $1', [eventId])
  return rows[0]
}
