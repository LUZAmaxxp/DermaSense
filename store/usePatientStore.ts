import { create } from "zustand";
import type { Patient } from "@/types/patient.types";

interface PatientState {
  patient: Patient | null;
  setPatient: (p: Patient) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  patient: null,
  setPatient: (p) => set({ patient: p }),
}));
