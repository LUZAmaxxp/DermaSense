"use client";
import { useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";
import { usePatientStore } from "@/store/usePatientStore";
import type { Patient } from "@/types/patient.types";

function PatientHydrator() {
  const setPatient = usePatientStore((s) => s.setPatient);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dermasense_patient");
      if (raw) {
        const p = JSON.parse(raw) as Patient;
        if (p?._id) setPatient(p);
      }
    } catch { /* ignore */ }
  }, [setPatient]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        <PatientHydrator />
        {children}
        <Toaster position="top-center" richColors />
      </SWRConfig>
    </SessionProvider>
  );
}
