import { Bed, Droplets } from "lucide-react";
import { timeAgo } from "@/lib/utils/format";
import type { PatientPosition } from "@/types/sensor.types";
import { Progress } from "@/components/ui/progress";

const POSITION_LABELS: Record<PatientPosition, string> = {
  dorsal:           "Décubitus Dorsal",
  lateral_droit:    "Décubitus Latéral Droit",
  lateral_gauche:   "Décubitus Latéral Gauche",
  prone:            "Décubitus Ventral",
};

interface PositionActuelleProps {
  position: PatientPosition | null;
  humidity: number | null;
  lastChangedAt: string | null;
}

export function PositionActuelle({ position, humidity, lastChangedAt }: PositionActuelleProps) {
  if (!position || humidity === null || !lastChangedAt) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Position Actuelle</p>
        <div className="flex items-center justify-center h-16 text-gray-400 text-xs">En attente des capteurs…</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Position Actuelle
      </p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#003f7b]/10 rounded-xl flex items-center justify-center">
          <Bed size={20} className="text-[#003f7b]" />
        </div>
        <div>
          <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>
            {POSITION_LABELS[position]}
          </p>
          <p className="text-xs text-gray-500">{timeAgo(lastChangedAt)}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Droplets size={13} className="text-blue-400" />
            <span className="text-xs text-gray-500">Humidité</span>
          </div>
          <span className="text-xs font-bold text-gray-800">{humidity}%</span>
        </div>
        <Progress value={humidity} className="h-1.5" />
      </div>
    </div>
  );
}
