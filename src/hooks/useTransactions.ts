import { useQuery } from "@tanstack/react-query";
import { getTransactions } from "@/api/transactions";
import type { Transaction } from "@/types";

export function useTransactions() {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    staleTime: 30_000,
    retry: false,
  });
}
