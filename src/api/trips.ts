import axios from 'axios'
import type { Trip } from '@/types'
import client from './client'

const publicClient = axios.create({
  baseURL: '/api/v1',
  headers: { Accept: 'application/json' },
})

export async function getTrips(): Promise<Trip[]> {
  const { data } = await publicClient.get<{ data: Trip[] }>('/trips')
  return data.data
}

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await publicClient.get<{ data: Trip }>(`/trips/${id}`)
  return data.data
}

export interface CreateTripPayload {
  departure:    string
  destination:  string
  date:         string
  capacity:     number
  price_per_kg: number
  type_trip:    string
  // Pickup location — optionnel
  pickup_address?:               string
  pickup_city?:                  string
  pickup_latitude?:              number
  pickup_longitude?:             number
  pickup_approx_latitude?:       number
  pickup_approx_longitude?:      number
  pickup_instructions?:          string
}

export async function createTrip(payload: CreateTripPayload): Promise<Trip> {
  const { data } = await client.post<{ data: Trip }>('/trips', payload)
  return data.data
}

export async function updateTrip(
  id: number,
  payload: Partial<CreateTripPayload>,
): Promise<Trip> {
  const { data } = await client.put<{ data: Trip }>(`/trips/${id}`, payload)
  return data.data
}