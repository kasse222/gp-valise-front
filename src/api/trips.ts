import client from "./client";
import type { Trip } from "@/types";

export async function getTrips(): Promise<Trip[]> {
  const { data } = await client.get<{ data: Trip[] }>("/trips");
  return data.data;
}

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await client.get<{ data: Trip }>(`/trips/${id}`);
  return data.data;
}
