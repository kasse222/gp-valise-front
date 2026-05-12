import client from "./client";
import type { Booking, PaginatedResponse } from "@/types";

export async function getBookings(): Promise<Booking[]> {
  const { data } = await client.get<PaginatedResponse<Booking>>("/bookings");
  return data.data;
}

export async function getBooking(id: number): Promise<Booking> {
  const { data } = await client.get<{ data: Booking }>(`/bookings/${id}`);
  return data.data;
}
