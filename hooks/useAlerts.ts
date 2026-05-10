"use client";
import useSWR from "swr";
import type { Alert } from "@/types/alert.types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAlerts(status?: "active" | "all" | "history") {
  const param = status === "history" ? "?status=resolved" : status === "active" ? "?status=active" : "";
  const { data, error, mutate } = useSWR<{ alerts: Alert[] }>(
    `/api/alerts${param}`,
    fetcher,
    { refreshInterval: 15000 }
  );

  return {
    alerts: data?.alerts ?? [],
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  };
}
