"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useMqttStatus() {
  const { data, error } = useSWR<{ status: string; broker: string }>(
    "/api/mqtt/status",
    fetcher,
    { refreshInterval: 10000 }
  );

  return {
    connected: data?.status === "connected",
    broker: data?.broker ?? "",
    isLoading: !error && !data,
  };
}
