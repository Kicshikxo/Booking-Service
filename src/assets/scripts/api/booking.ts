import axios from 'axios'

export async function reserveBooking(eventId: string) {
  const response = await axios.post(`/api/bookings/reserve/${eventId}`)

  return response.data
}

export async function unreserveBooking(eventId: string) {
  const response = await axios.delete(`/api/bookings/reserve/${eventId}`)

  return response.data
}
