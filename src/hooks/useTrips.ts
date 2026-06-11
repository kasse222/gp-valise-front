import { useQuery } from "@tanstack/react-query";
import { getTrips } from "@/api/trips";
import client from "@/api/client";
import type { Trip } from "@/types";

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn:  () => getTrips(),
    staleTime: 0,
  });
}

export function useTrip(id: number) {
  return useQuery<Trip>({
    queryKey: ["trip", id],
    queryFn:  async () => {
      const { data } = await client.get<{ data: Trip }>(`/trips/${id}`)
      return data.data
    },
    staleTime: 0,
    enabled: id > 0,
  });
}