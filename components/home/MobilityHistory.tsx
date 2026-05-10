"use client";
import { Clock, ArrowRight } from "lucide-react";

interface DataPoint {
  label: string;
  value: number;
  alert: boolean;
}

interface MobilityHistoryProps {
  data: DataPoint[];
}

const POSITION_CYCLE = ["Dorsal", "Latéral G", "Dorsal", "Latéral D", "Dorsal", "Latéral G"];

export function MobilityHistory({ data }: MobilityHistoryProps) {
  const entries = data.slice(0, 6);
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Historique Mobilité (24h)
      </p>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {entries.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <Clock size={11} className="text-gray-400 flex-shrink-0" />
            <span className="text-[11px] text-gray-500 w-8 flex-shrink-0">{d.label}</span>
            <ArrowRight size={10} className="text-gray-300 flex-shrink-0" />
            <span className="text-[11px] font-medium text-gray-700 flex-1">
              {POSITION_CYCLE[i % POSITION_CYCLE.length]}
            </span>
            {d.alert && (
              <span className="text-[9px] bg-[#fee2e2] text-[#ba1a1a] px-1.5 py-0.5 rounded-full font-semibold">
                Alerte
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
