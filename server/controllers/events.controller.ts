import { Response, Router } from 'express'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import {
  createEvent,
  deleteEventById,
  getEventById,
  getEventByTitle,
  getEvents,
  updateEventById,
} from '../repositories/event.repository'

const router = Router()

router.get('/list', authMiddleware(), async (request: AuthRequest, response: Response) => {
  try {
    const events = await getEvents()

    response.status(200).json(events)
  } catch (error: any) {
    console.log(error)
    response.status(500).json({ error: error.message })
  }
})

router.post('/', authMiddleware(), async (request: AuthRequest, response: Response) => {
  try {
    const { title, description, totalSeats, plannedAt } = request.body ?? {}

    const existingEvent = await getEventByTitle(title)
    if (existingEvent) {
      return response.status(400).json({ error: 'EVENT TITLE ALREADY EXISTS' })
    }

    const event = await createEvent(request.user!.userId, title, description, totalSeats, plannedAt)

    response.status(201).json(event)
  } catch (error: any) {
    console.log(error)
    response.status(500).json({ error: error.message })
  }
})

router.patch('/:id', authMiddleware(), async (request: AuthRequest, response: Response) => {
  try {
    const eventId = request.params.id
    const { title, description, totalSeats, plannedAt } = request.body ?? {}

    const event = await getEventById(eventId)
    if (!event) {
      return response.status(404).json({ error: 'EVENT NOT FOUND' })
    }
    if (event.creator_id !== request.user!.userId) {
      return response.status(403).json({ error: 'FORBIDDEN TO UPDATE' })
    }

    const existingEvent = await getEventByTitle(title)
    if (existingEvent) {
      return response.status(400).json({ error: 'EVENT TITLE ALREADY EXISTS' })
    }

    const updatedEvent = await updateEventById(
      eventId,
      title ?? event.title,
      description ?? event.description,
      totalSeats ?? event.total_seats,
      plannedAt ?? event.planned_at,
    )

    response.status(200).json(updatedEvent)
  } catch (error: any) {
    console.log(error)
    response.status(500).json({ error: error.message })
  }
})

router.delete('/:id', authMiddleware(), async (request: AuthRequest, response: Response) => {
  try {
    const eventId = request.params.id

    const event = await getEventById(eventId)
    if (!event) {
      return response.status(404).json({ error: 'EVENT NOT FOUND' })
    }
    if (event.creator_id !== request.user!.userId) {
      return response.status(403).json({ error: 'FORBIDDEN TO DELETE' })
    }

    await deleteEventById(eventId)

    response.status(200).json({ message: 'OK' })
  } catch (error: any) {
    console.log(error)
    response.status(500).json({ error: error.message })
  }
})

export default router
