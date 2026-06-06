import { useQuery } from "@tanstack/react-query";
import { getTrips, getTrip } from "@/api/trips";
import type { Trip } from "@/types";

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: getTrips,
    staleTime: 0,
  });
}

export function useTrip(id: number) {
  return useQuery<Trip>({
    queryKey: ["trip", id],
    queryFn: () => getTrip(id),
    staleTime: 0,
    enabled: id > 0,
  });
}