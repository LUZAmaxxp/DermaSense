"use client";
import { Moon } from "lucide-react";

export function ModeVigilance() {
  const hour = new Date().getHours();
  const isNight = hour >= 22 || hour < 6;
  if (!isNight) return null;

  return (
    <div
      className="rounded-2xl p-4 flex items-center gap-3"
      style={{ background: "#003f7b" }}
    >
      <Moon size={20} className="text-white flex-shrink-0" />
      <div>
        <p className="text-white text-[13px] font-semibold" style={{ fontFamily: "Manrope, sans-serif" }}>
          Mode Vigilance
        </p>
        <p className="text-white/70 text-[11px]">Protocoles de nuit actifs</p>
      </div>
    </div>
  );
}
