"use client";
import { useSensorStore } from "@/store/useSensorStore";
import { mmHgToColor } from "@/lib/utils/pressure";

const ZONE_LABELS: Record<string, string> = {
  sacrum: "Sacrum",
  shoulders: "Épaules",
  thorax: "Thorax",
  heels: "Talons",
  legs: "Jambes",
};

export function ZoneStatsRail() {
  const latest = useSensorStore((s) => s.latest);

  if (!latest) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Zones Critiques</p>
        <div className="flex items-center justify-center h-24 text-gray-400 text-xs">En attente des capteurs\u2026</div>
      </div>
    );
  }

  const zones = latest.zones;
  const rows = Object.entries(zones)
    .map(([key, val]) => ({
      key,
      label: ZONE_LABELS[key] ?? key,
      avg: val.avg,
      color: mmHgToColor(val.avg),
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
        Zones Critiques
      </p>
      <div className="space-y-3">
        {rows.map(({ key, label, avg, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">{label}</span>
              <span className="text-xs font-semibold" style={{ color }}>
                {avg.toFixed(1)} mmHg
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min((avg / 80) * 100, 100)}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
