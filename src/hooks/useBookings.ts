import { useQuery } from "@tanstack/react-query";
import { getBookings } from "@/api/bookings";
import type { Booking } from "@/types";

export function useBookings() {
  return useQuery<Booking[]>({
    queryKey: ["bookings"],
    queryFn: getBookings,
    staleTime: 30_000,
  });
}
