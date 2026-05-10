import { create } from "zustand";
import type { Alert } from "@/types/alert.types";

interface AlertState {
  alerts: Alert[];
  activeCount: number;
  setAlerts: (alerts: Alert[]) => void;
  dismissAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  activeCount: 0,
  setAlerts: (alerts) =>
    set({ alerts, activeCount: alerts.filter((a) => a.status === "active").length }),
  dismissAlert: (id) =>
    set((state) => {
      const updated = state.alerts.map((a) =>
        a._id === id ? { ...a, status: "dismissed" as const } : a
      );
      return { alerts: updated, activeCount: updated.filter((a) => a.status === "active").length };
    }),
}));
