"use client";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { useMqttStatus } from "@/hooks/useMqttStatus";

export function TopAppBar() {
  const activeCount = useAlertStore((s) => s.activeCount);
  const { connected } = useMqttStatus();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-5"
      style={{ background: "#003f7b" }}
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
          <span className="text-white text-xs font-bold">DS</span>
        </div>
        <span
          className="text-white font-semibold text-[15px] tracking-[0.08em]"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          DERMASENSE
        </span>
      </div>

      {/* Center: Patient chip */}
      <div className="flex-1 flex justify-center">
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">OS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white text-[13px] font-medium" style={{ fontFamily: "Manrope, sans-serif" }}>
              Ouiame Salimi
            </span>
            <span className="text-white/60 text-[11px]">Gériatrie</span>
            <span className="bg-white/20 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
              #7724
            </span>
          </div>
        </div>
      </div>

      {/* Right: MQTT + Bell + Avatar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-[#4ade80] animate-pulse" : "bg-[#f87171]"}`}
          />
          <span className="text-white/70 text-[11px]">MQTT</span>
        </div>

        <Link href="/alerts" className="relative p-1">
          <Bell size={19} className="text-white/90" />
          {activeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#ba1a1a] text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] flex items-center justify-center px-0.5">
              {activeCount > 9 ? "9+" : activeCount}
            </span>
          )}
        </Link>

        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white text-xs font-bold">NS</span>
        </div>
      </div>
    </header>
  );
}
