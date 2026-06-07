import client from "./client";
import type { LuggageResource } from "@/types";

export interface CreateLuggagePayload {
  trip_id:              number;
  description:          string;
  category?:            string;
  weight_kg:            number;
  length_cm?:           number;
  width_cm?:            number;
  height_cm?:           number;
  pickup_city:          string;
  delivery_city:        string;
  pickup_date:          string;
  delivery_date:        string;
  is_fragile?:          boolean;
  insurance_requested?: boolean;
  photo_path?:          string;
}

export async function createLuggage(
  payload: CreateLuggagePayload
): Promise<LuggageResource> {
  const { data } = await client.post<LuggageResource>("/luggages", payload);
  return data;
}