"use client";
import { useSensorStore } from "@/store/useSensorStore";
import { useSensorStream } from "@/hooks/useSensorStream";
import { computeSafetyScore, mmHgToColor } from "@/lib/utils/pressure";
import dynamic from "next/dynamic";
const Body3D = dynamic(
  () => import("@/components/monitoring/Body3D").then((m) => m.Body3D),
  { ssr: false }
);
import { ZoneLegend } from "@/components/monitoring/ZoneLegend";
import { SystemStatus } from "@/components/monitoring/SystemStatus";

const ZONE_LABELS: Record<string, string> = {
  sacrum: "Sacrum", shoulders: "Epaules", thorax: "Thorax", heels: "Talons", legs: "Jambes",
};

export default function MonitoringPage() {
  useSensorStream();
  const latest = useSensorStore((s) => s.latest);
  const matrix = latest?.matrix ?? null;
  const avgPressure = matrix ? Math.round(matrix.reduce((a, b) => a + b, 0) / matrix.length) : null;
  const score = matrix ? computeSafetyScore(matrix) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] gap-5 items-start">

      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-700 relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
              Monitoring Temps Reel
            </h2>
          </div>
          <SystemStatus />
        </div>
        <Body3D matrix={matrix} />
        <div className="mt-4">
          <ZoneLegend />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "Pression Moy.", value: avgPressure !== null ? avgPressure : null, unit: "mmHg", color: avgPressure !== null ? mmHgToColor(avgPressure) : "#d1d5db" },
            { label: "Score Global",   value: score !== null ? score + "%" : null, unit: "",     color: score !== null ? (score >= 80 ? "#006e11" : score >= 60 ? "#f59e0b" : "#ba1a1a") : "#d1d5db" },
            { label: "Capteurs Actifs",value: latest ? "40" : null, unit: "/40",  color: "#003f7b" },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-[9px] sm:text-[10px] text-gray-500 font-medium uppercase tracking-wide leading-tight">{label}</p>
              <p className="text-xl sm:text-3xl font-bold mt-1" style={{ fontFamily: "Manrope, sans-serif", color: value !== null ? color : "#d1d5db" }}>
                {value !== null ? value : "\u2014"}
                {value !== null && unit && <span className="text-[10px] sm:text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Repartition par Zone
          </p>
          <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm min-w-[280px]">
            <thead>
              <tr className="text-[10px] text-gray-400 uppercase">
                <th className="text-left py-1 font-medium">Zone</th>
                <th className="text-right py-1 font-medium">Moy.</th>
                <th className="text-right py-1 font-medium">Max</th>
                <th className="text-right py-1 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {latest
                ? Object.entries(latest.zones)
                    .sort((a, b) => b[1].avg - a[1].avg)
                    .map(([zone, stats]) => {
                      const isUrgent = stats.avg >= 40;
                      const isCrit   = stats.avg >= 32;
                      const isWarn   = stats.avg >= 30;
                      return (
                        <tr key={zone} style={{ background: isUrgent ? "#fee2e240" : isCrit ? "#fee2e220" : isWarn ? "#fef3c720" : "#dcfce720" }}>
                          <td className="py-2 font-medium text-gray-700">{ZONE_LABELS[zone] ?? zone}</td>
                          <td className="py-2 text-right font-semibold" style={{ color: mmHgToColor(stats.avg) }}>
                            {stats.avg.toFixed(1)}
                          </td>
                          <td className="py-2 text-right text-gray-500">{stats.max.toFixed(1)}</td>
                          <td className="py-2 text-right">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isUrgent ? "#ba1a1a" : isCrit ? "#fee2e2" : isWarn ? "#fef3c7" : "#dcfce7",
                                color: isUrgent ? "#fff" : isCrit ? "#ba1a1a" : isWarn ? "#92400e" : "#006e11",
                              }}>
                              {isUrgent ? "URGENCE" : isCrit ? "Critique" : isWarn ? "Prévention" : "OK"}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-400 text-xs">
                      En attente des donnees ESP32...
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Historique de Position
          </p>
          <div className="flex items-center justify-center h-16 text-gray-400 text-xs">
            Aucun historique disponible
          </div>
        </div>
      </div>
    </div>
  );
}
