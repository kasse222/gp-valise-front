import client from './client'

export interface DisputeMessage {
  id:         number
  dispute_id: number
  body:       string
  attachments: string[] | null
  author: {
    id:   number
    name: string
    role: string
  } | null
  created_at: string
}

export interface Dispute {
  id:          number
  booking_id:  number
  status: {
    code:  string
    label: string
    color: string
  }
  reason:      string
  resolution:  string | null
  decision:    string | null
  opened_by:   number
  assigned_to: number | null
  resolved_at: string | null
  created_at:  string
  messages:    DisputeMessage[]
}

export async function getDispute(id: number): Promise<Dispute> {
  const { data } = await client.get<{ data: Dispute }>(`/disputes/${id}`)
  return data.data
}

export async function getDisputeMessages(id: number): Promise<DisputeMessage[]> {
  const { data } = await client.get<{ data: DisputeMessage[] }>(`/disputes/${id}/messages`)
  return data.data
}

export async function sendDisputeMessage(id: number, body: string): Promise<DisputeMessage> {
  const { data } = await client.post<{ data: DisputeMessage }>(`/disputes/${id}/messages`, { body })
  return data.data
}
export async function getDisputeByBooking(bookingId: number): Promise<Dispute> {
  // Le booking contient le dispute dans status_history ou via un champ dispute_id
  // On cherche via GET /bookings/:id et on extrait le dispute
  const { data } = await client.get<{ data: { dispute?: Dispute } }>(`/bookings/${bookingId}`)
  if (!data.data.dispute) throw new Error('Aucun litige trouvé')
  return data.data.dispute
}