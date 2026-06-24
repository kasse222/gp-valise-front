import { useQuery } from '@tanstack/react-query'
import { getEarnings } from '@/api/earnings'
import type { EarningsBucket } from '@/types'

export function useEarnings() {
  return useQuery<EarningsBucket[]>({
    queryKey: ['earnings'],
    queryFn:  getEarnings,
    staleTime: 30_000,
    retry: false,
  })
}