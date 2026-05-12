import { useQuery } from "@tanstack/react-query";
import { getBooking } from "@/api/bookings";
import type { Booking } from "@/types";

export function useBooking(id: number) {
  return useQuery<Booking>({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id),
    staleTime: 30_000,
    enabled: id > 0,
  });
}
