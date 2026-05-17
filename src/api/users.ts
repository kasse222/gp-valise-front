import client from "./client";
import type { AuthUser } from "@/store/authStore";

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  country?: string;
}

export async function updateUser(
  userId: number,
  payload: UpdateUserPayload
): Promise<AuthUser> {
  const { data } = await client.put<{ data: AuthUser }>(
    `/users/${userId}`,
    payload
  );
  return data.data;
}
