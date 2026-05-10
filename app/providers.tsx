"use client";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          shouldRetryOnError: false,
        }}
      >
        {children}
        <Toaster position="top-center" richColors />
      </SWRConfig>
    </SessionProvider>
  );
}
