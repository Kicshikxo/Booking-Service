import { Response, Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  countEventBookings,
  createBooking,
  deleteBookingById,
  getBookingByUserIdAndEventId,
} from '../repositories/booking.repository'
import { getEventById } from '../repositories/event.repository'

const router = Router()

router.post('/reserve/:id', authMiddleware(), async (request: AuthRequest, response: Response) => {
  try {
    const eventId = request.params.id

    const event = await getEventById(eventId)
    if (!event) {
      return response.status(404).json({ error: 'EVENT NOT FOUND' })
    }

    const existingBooking = await getBookingByUserIdAndEventId(request.user!.userId, eventId)
    if (existingBooking) {
      return response.status(400).json({ error: 'ALREADY BOOKED' })
    }

    const eventBookings = await countEventBookings(eventId)
    if (event.total_seats && event.total_seats - eventBookings <= 0) {
      return response.status(400).json({ error: 'NO SEATS LEFT' })
    }

    const booking = await createBooking(eventId, request.user!.userId)

    response.status(200).json(booking)
  } catch (error: any) {
    console.log(error)
    response.status(500).json({ error: error.message })
  }
})

router.delete(
  '/reserve/:id',
  authMiddleware(),
  async (request: AuthRequest, response: Response) => {
    try {
      const eventId = request.params.id

      const event = await getEventById(eventId)
      if (!event) {
        return response.status(404).json({ error: 'EVENT NOT FOUND' })
      }

      const existingBooking = await getBookingByUserIdAndEventId(request.user!.userId, eventId)
      if (!existingBooking) {
        return response.status(400).json({ error: 'NOT BOOKED' })
      }

      await deleteBookingById(existingBooking.booking_id)

      response.status(200).json({ message: 'OK' })
    } catch (error: any) {
      console.log(error)
      response.status(500).json({ error: error.message })
    }
  },
)

export default router
