"use client";
import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { mmHgToColor } from "@/lib/utils/pressure";

const ZONE_NAMES = [
  "Epaule G","Epaule","Epaule","Epaule","Epaule D",
  "Thorax G","Thorax","Thorax","Thorax","Thorax D",
  "Thorax G","Thorax","Thorax","Thorax","Thorax D",
  "Sacrum G","Sacrum","Sacrum","Sacrum","Sacrum D",
  "Sacrum G","Sacrum","Sacrum","Sacrum","Sacrum D",
  "Jambe G","Jambe","Jambe","Jambe","Jambe D",
  "Jambe G","Jambe","Jambe","Jambe","Jambe D",
  "Talon G","Talon","Talon","Talon","Talon D",
];

interface PressureMapPreviewProps {
  matrix: number[] | null;
}

export function PressureMapPreview({ matrix }: PressureMapPreviewProps) {
  if (!matrix || matrix.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>Carte de Pression</p>
          <Link href="/monitoring" className="flex items-center gap-1 text-[11px] text-[#003f7b] font-medium hover:underline">
            <Maximize2 size={12} />Plein ecran
          </Link>
        </div>
        <div className="flex items-center justify-center h-40 text-gray-400 text-xs">En attente des capteurs…</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>
          Carte de Pression
        </p>
        <Link href="/monitoring" className="flex items-center gap-1 text-[11px] text-[#003f7b] font-medium hover:underline">
          <Maximize2 size={12} />
          Plein ecran
        </Link>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
        {matrix.slice(0, 40).map((val, i) => {
          const bg = mmHgToColor(val ?? 0);
          return (
            <div
              key={i}
              className="rounded-lg"
              style={{ height: 40, background: bg, opacity: 0.85, transition: "background 300ms ease" }}
              title={ZONE_NAMES[i] + ": " + (val ?? 0).toFixed(1) + " mmHg"}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-3">
        {[
          { color: "#006e11", label: "Sur" },
          { color: "#f59e0b", label: "Attention" },
          { color: "#f97316", label: "Eleve" },
          { color: "#ba1a1a", label: "Critique" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
            <span className="text-[9px] text-gray-500">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
