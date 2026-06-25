import client from './client'
import type { TravelerProfile } from '@/types'

export async function getTravelerProfile(id: number): Promise<TravelerProfile> {
  const { data } = await client.get<{ data: TravelerProfile }>(`/travelers/${id}`)
  return data.data
}