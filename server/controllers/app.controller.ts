import { Router } from 'express'
import authRouter from './auth.controller'
import bookingsRouter from './bookings.controller'
import eventsRouter from './events.controller'

const router = Router()

router.use('/api/auth', authRouter)
router.use('/api/events', eventsRouter)
router.use('/api/bookings', bookingsRouter)

export default router
