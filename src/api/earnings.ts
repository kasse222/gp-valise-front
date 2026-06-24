import client from './client'
import type { EarningsBucket } from '@/types'

export async function getEarnings(): Promise<EarningsBucket[]> {
  const { data } = await client.get<{ data: EarningsBucket[] }>('/me/earnings')
  return data.data
}