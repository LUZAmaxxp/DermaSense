"use client";
import { useSensorStore } from "@/store/useSensorStore";
import { useSensorStream } from "@/hooks/useSensorStream";
import { computeSafetyScore, mmHgToColor } from "@/lib/utils/pressure";
import { BodyHeatmap } from "@/components/monitoring/BodyHeatmap";
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
    <div className="grid gap-5" style={{ gridTemplateColumns: "420px 1fr", alignItems: "start" }}>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
              Monitoring Temps Reel
            </h2>
          </div>
          <SystemStatus />
        </div>
        <BodyHeatmap matrix={matrix} />
        <div className="mt-4">
          <ZoneLegend />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Pression Moy.", value: avgPressure !== null ? avgPressure : null, unit: "mmHg", color: avgPressure !== null ? mmHgToColor(avgPressure) : "#d1d5db" },
            { label: "Score Global",   value: score !== null ? score + "%" : null, unit: "",     color: score !== null ? (score >= 80 ? "#006e11" : score >= 60 ? "#f59e0b" : "#ba1a1a") : "#d1d5db" },
            { label: "Capteurs Actifs",value: latest ? "40" : null, unit: "/40",  color: "#003f7b" },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              <p className="text-3xl font-bold mt-1" style={{ fontFamily: "Manrope, sans-serif", color: value !== null ? color : "#d1d5db" }}>
                {value !== null ? value : "\u2014"}
                {value !== null && unit && <span className="text-sm font-normal text-gray-400 ml-0.5">{unit}</span>}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Repartition par Zone
          </p>
          <table className="w-full text-sm">
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
                      const isCrit = stats.avg > 32;
                      const isWarn = stats.avg > 20;
                      return (
                        <tr key={zone} style={{ background: isCrit ? "#fee2e220" : isWarn ? "#fef3c720" : "#dcfce720" }}>
                          <td className="py-2 font-medium text-gray-700">{ZONE_LABELS[zone] ?? zone}</td>
                          <td className="py-2 text-right font-semibold" style={{ color: mmHgToColor(stats.avg) }}>
                            {stats.avg.toFixed(1)}
                          </td>
                          <td className="py-2 text-right text-gray-500">{stats.max.toFixed(1)}</td>
                          <td className="py-2 text-right">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isCrit ? "#fee2e2" : isWarn ? "#fef3c7" : "#dcfce7",
                                color: isCrit ? "#ba1a1a" : isWarn ? "#92400e" : "#006e11",
                              }}>
                              {isCrit ? "Critique" : isWarn ? "Attention" : "OK"}
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

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
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
