import client from "./client";
import type { Transaction } from "@/types";

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await client.get<{ data: Transaction[] }>("/transactions");
  return data.data;
}
