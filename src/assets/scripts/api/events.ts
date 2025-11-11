import axios from 'axios'

export async function getEvents() {
  const response = await axios.get('/api/events/list')

  return response.data
}

export async function createEvent(event: {
  title: string
  description?: string
  totalSeats?: number | null
  plannedAt?: Date | null
}) {
  const reponse = await axios.post('/api/events', event)

  return reponse
}

export async function updateEvent(
  eventId: string,
  event: {
    title?: string
    description?: string
    totalSeats?: number | null
    plannedAt?: Date | null
  },
) {
  const reponse = await axios.patch(`/api/events/${eventId}`, event)

  return reponse.data
}

export async function deleteEvent(eventId: string) {
  const reponse = await axios.delete(`/api/events/${eventId}`)

  return reponse.data
}
