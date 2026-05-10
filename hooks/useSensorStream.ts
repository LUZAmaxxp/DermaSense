"use client";
import { useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";
import type { SensorUpdate } from "@/types/sensor.types";

export function useSensorStream() {
  const { setLatest, setConnected } = useSensorStore();

  useEffect(() => {
    const es = new EventSource("/api/sensors/stream");

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as { type: string; payload?: SensorUpdate };
        if (msg.type === "sensor-update" && msg.payload) {
          setLatest(msg.payload);
        }
        if (msg.type === "connected") {
          setConnected(true);
        }
      } catch {
        // ignore parse errors
      }
    };

    return () => es.close();
  }, [setLatest, setConnected]);
}
