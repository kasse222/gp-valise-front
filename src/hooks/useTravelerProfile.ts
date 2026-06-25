import { useQuery } from '@tanstack/react-query'
import { getTravelerProfile } from '@/api/travelers'
import type { TravelerProfile } from '@/types'

export function useTravelerProfile(id: number) {
  return useQuery<TravelerProfile>({
    queryKey: ['traveler', id],
    queryFn:  () => getTravelerProfile(id),
    staleTime: 30_000,
    retry: 1,
  })
}