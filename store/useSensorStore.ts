import { create } from "zustand";
import type { SensorIndex, SensorUpdate } from "@/types/sensor.types";

interface SensorState {
  latest: SensorUpdate | null;
  history: SensorUpdate[];
  connected: boolean;
  setLatest: (update: SensorUpdate) => void;
  setConnected: (val: boolean) => void;
  reset: () => void;
  /** Returns the mmHg value for a specific FSR sensor index from the latest reading */
  getSensorValue: (index: SensorIndex) => number;
}

export const useSensorStore = create<SensorState>((set, get) => ({
  latest: null,
  history: [],
  connected: false,
  setLatest: (update) =>
    set((state) => ({
      latest: update,
      history: [update, ...state.history].slice(0, 288), // keep ~24h at 5s intervals
    })),
  setConnected: (val) => set({ connected: val }),
  reset: () => set({ latest: null, history: [], connected: false }),
  getSensorValue: (index) => get().latest?.matrix[index] ?? 0,
}));
