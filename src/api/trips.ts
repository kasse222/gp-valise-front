import axios from "axios";
import type { Trip } from "@/types";

const publicClient = axios.create({
  baseURL: "/api/v1",
  headers: { Accept: "application/json" },
});

export async function getTrips(): Promise<Trip[]> {
  const { data } = await publicClient.get<{ data: Trip[] }>("/trips");
  return data.data;
}

export async function getTrip(id: number): Promise<Trip> {
  const { data } = await publicClient.get<{ data: Trip }>(`/trips/${id}`);
  return data.data;
}
