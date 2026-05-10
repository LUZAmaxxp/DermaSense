"use client";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface PressurePoint {
  timestamp: string;
  zones: {
    sacrum: { avg: number; max: number };
    shoulders: { avg: number; max: number };
    heels: { avg: number; max: number };
    thorax: { avg: number; max: number };
    legs: { avg: number; max: number };
  };
}

export function usePressureHistory(range: "12h" | "24h" = "12h") {
  const { data, error } = useSWR<{ readings: PressurePoint[] }>(
    `/api/sensors?range=${range}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  return {
    readings: data?.readings ?? [],
    isLoading: !error && !data,
    isError: !!error,
  };
}
