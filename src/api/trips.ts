import axios from 'axios'
import type { Trip } from '@/types'
import client from './client'

const publicClient = axios.create({
  baseURL: '/api/v1',
  headers: { Accept: 'application/json' },
})

export interface TripFilters {
  departure?:     string
  destination?:   string
  date?:          string
  price_max?:     number
  capacity_min?:  number
}

export async function getTrips(filters?: TripFilters): Promise<Trip[]> {
  const params = new URLSearchParams()
  if (filters?.departure)    params.set('departure',    filters.departure)
  if (filters?.destination)  params.set('destination',  filters.destination)
  if (filters?.date)         params.set('date',         filters.date)
  if (filters?.price_max)    params.set('price_max',    String(filters.price_max))
  if (filters?.capacity_min) params.set('capacity_min', String(filters.capacity_min))

  const { data } = await publicClient.get<{ data: Trip[] }>('/trips', { params })
  return data.data
}

export interface CreateTripPayload {
  departure:    string
  destination:  string
  date:         string
  capacity:     number
  price_per_kg: number
  currency:     string
  category_fees?: { category: string; fee: number }[]
  type_trip:    string
  // Pickup location — optionnel
  pickup_address?:               string
  pickup_city?:                  string
  pickup_latitude?:              number
  pickup_longitude?:             number
  pickup_approx_latitude?:       number
  pickup_approx_longitude?:      number
  pickup_instructions?:          string
  // Delivery location
  delivery_address?:             string
  delivery_city?:                string
  delivery_latitude?:            number
  delivery_longitude?:           number
  delivery_approx_latitude?:     number
  delivery_approx_longitude?:    number
  delivery_instructions?:        string
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

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await publicClient.get<{ data: Trip }>(`/trips/${id}`)
  return data.data
}