import { pool } from '../database'
import { Booking } from '../dto/booking.dto'
import { Event } from '../dto/event.dto'
import { User } from '../dto/user.dto'

export async function getEvents() {
  const { rows } = await pool.query<Event>(/*sql*/ `SELECT * FROM events ORDER BY created_at DESC`)
  return rows
}

export async function getEventsWithBookingsAndUsers() {
  const { rows } = await pool.query(/*sql*/ `
    SELECT
      events.*,
      COALESCE(
        json_agg(
          json_build_object(
            'booking_id', bookings.booking_id,
            'event_id', bookings.event_id,
            'user_id', bookings.user_id,
            'created_at', bookings.created_at,
            'updated_at', bookings.updated_at,
            'user', json_build_object(
              'user_id', users.user_id,
              'email', users.email,
              'created_at', users.created_at,
              'updated_at', users.updated_at
            )
          )
        ) FILTER (WHERE bookings.booking_id IS NOT NULL),
        '[]'
      ) AS bookings
    FROM events
    LEFT JOIN bookings ON events.event_id = bookings.event_id
    LEFT JOIN users ON bookings.user_id = users.user_id
    GROUP BY events.event_id
    ORDER BY events.created_at DESC;
  `)

  return rows as (Event & { bookings: (Booking & { user: User })[] })[]
}

export async function createEvent(
  creatorId: string,
  title: string,
  description?: string,
  totalSeats?: number,
  plannedAt?: string,
) {
  const { rows } = await pool.query<Event>(
    /*sql*/ `INSERT INTO events (creator_id, title, description, total_seats, planned_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [creatorId, title, description, totalSeats, plannedAt],
  )
  return rows[0]
}

export async function getEventById(eventId: string) {
  const { rows } = await pool.query<Event>(/*sql*/ `SELECT * FROM events WHERE event_id = $1`, [
    eventId,
  ])
  return rows[0]
}

export async function getEventByTitle(title: string) {
  const { rows } = await pool.query<Event>(/*sql*/ `SELECT * FROM events WHERE title = $1`, [title])
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
    /*sql*/ `UPDATE events SET title = $1, description = $2, total_seats = $3, planned_at = $4, updated_at = CURRENT_TIMESTAMP WHERE event_id = $5 RETURNING *`,
    [title, description, total_seats, planned_at, eventId],
  )
  return rows[0]
}

export async function deleteEventById(eventId: string) {
  const { rows } = await pool.query<Event>(/*sql*/ `DELETE FROM events WHERE event_id = $1`, [
    eventId,
  ])
  return rows[0]
}
