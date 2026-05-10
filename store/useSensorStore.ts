import { create } from "zustand";
import type { SensorUpdate } from "@/types/sensor.types";

interface SensorState {
  latest: SensorUpdate | null;
  history: SensorUpdate[];
  connected: boolean;
  setLatest: (update: SensorUpdate) => void;
  setConnected: (val: boolean) => void;
  reset: () => void;
}

export const useSensorStore = create<SensorState>((set) => ({
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
}));
