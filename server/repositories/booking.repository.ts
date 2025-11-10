import { pool } from '../database'
import { Booking } from '../dto/booking.dto'

export async function createBooking(eventId: string, userId: string): Promise<Booking> {
  const { rows } = await pool.query<Booking>(
    'INSERT INTO bookings (event_id, user_id) VALUES ($1, $2) RETURNING *',
    [eventId, userId],
  )
  return rows[0]
}

export async function getBookingByUserIdAndEventId(userId: string, eventId: string) {
  const { rows } = await pool.query<Booking>(
    'SELECT * FROM bookings WHERE user_id = $1 AND event_id = $2',
    [userId, eventId],
  )
  return rows[0]
}

export async function deleteBookingById(bookingId: string) {
  const { rows } = await pool.query<Booking>('DELETE FROM bookings WHERE booking_id = $1', [
    bookingId,
  ])
  return rows[0]
}
