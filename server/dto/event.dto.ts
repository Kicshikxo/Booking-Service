export interface Event {
  event_id: string
  creator_id: string
  title: string
  description?: string
  total_seats?: number
  planned_at?: string
  created_at: string
  updated_at: string
}
