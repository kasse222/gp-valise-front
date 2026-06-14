import client from "./client";
import type { Booking, PaginatedResponse } from "@/types";

export interface CreateBookingPayload {
  trip_id: number;
  items: Array<{
    luggage_id: number;
    kg_reserved: number;
  }>;
  comment?: string;
  // Instant Booking — destinataire obligatoire
  recipient_name:  string;
  recipient_phone: string;
  recipient_email: string;
}

export async function getBookings(): Promise<Booking[]> {
  const { data } = await client.get<PaginatedResponse<Booking>>("/bookings");
  return data.data;
}

export async function getBooking(id: number): Promise<Booking> {
  const { data } = await client.get<{ data: Booking }>(`/bookings/${id}`);
  return data.data;
}

export interface PayBookingResponse {
  transaction_id: number;
  booking_id:     number;
  amount:         number;
  status:         string;
  payment_url:    string | null;
}

export interface PayBookingPayload {
  method?:  string;
  phone?:   string;
  country?: string;
}

export async function createBooking(
  payload: CreateBookingPayload
): Promise<Booking> {
  const { data } = await client.post<{ data: Booking }>("/bookings", payload);
  return data.data;
}

export async function payBooking(
  bookingId: number,
  payload: PayBookingPayload = {}
): Promise<PayBookingResponse> {
  const { data } = await client.post<PayBookingResponse>(
    `/bookings/${bookingId}/pay`,
    payload
  );
  return data;
}

export async function cancelBooking(bookingId: number): Promise<void> {
  await client.post(`/bookings/${bookingId}/cancel`)
}

// @deprecated Instant Booking
export async function approveBooking(bookingId: number): Promise<void> {
  await client.post(`/bookings/${bookingId}/approve`)
}

// @deprecated Instant Booking
export async function declineBooking(bookingId: number): Promise<void> {
  await client.post(`/bookings/${bookingId}/decline`)
}