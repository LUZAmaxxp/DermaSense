"use client";
import { useSensorStore } from "@/store/useSensorStore";
import { useSensorStream } from "@/hooks/useSensorStream";
import { usePressureHistory } from "@/hooks/usePressureHistory";
import { mmHgToColor, safetyLabel, P_NORMAL, P_CAUTION, P_EMERGENCY } from "@/lib/utils/pressure";
import { formatTime } from "@/lib/utils/format";
import { MmhgDisplay } from "@/components/shared/MmhgDisplay";
import { TrendChart } from "@/components/pressure/TrendChart";
import { ZoneRiskTable } from "@/components/pressure/ZoneRiskTable";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import type { ZoneName } from "@/types/sensor.types";
import { Clock } from "lucide-react";

export default function PressurePage() {
  useSensorStream();
  const latest = useSensorStore((s) => s.latest);
  const { readings } = usePressureHistory("12h");

  const matrix = latest?.matrix ?? null;
  const avgPressure = matrix ? Math.round(matrix.reduce((a, b) => a + b, 0) / matrix.length) : null;
  const { label: riskLabel } = avgPressure !== null ? safetyLabel(avgPressure >= P_CAUTION ? 30 : avgPressure >= P_NORMAL ? 60 : 90) : { label: null };

  const trendData =
    readings.length > 0
      ? readings.slice().reverse().map((r) => ({ time: formatTime(r.timestamp), avg: Math.round(r.zones.sacrum.avg) }))
      : null;

  const zoneRows = latest?.zones
    ? (Object.entries(latest.zones) as [ZoneName, { avg: number; max: number; count_over_32: number }][]).map(
        ([name, stats]) => ({ name, ...stats })
      )
    : null;

  const severity = avgPressure === null ? null : avgPressure >= P_EMERGENCY ? "critical" : avgPressure >= P_CAUTION ? "critical" : avgPressure >= P_NORMAL ? "warning" : "safe";

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px", alignItems: "start" }}>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Pression Moyenne Actuelle
          </p>
          <div className="flex items-end gap-4">
            <MmhgDisplay value={avgPressure} />
            <div className="mb-1">
              <SeverityBadge severity={severity} />
              <p className="text-[11px] text-gray-400 mt-1">Urgence: {P_EMERGENCY} mmHg / Repositionnement: {P_CAUTION} mmHg / Prévention: {P_NORMAL} mmHg</p>
            </div>
          </div>
        </div>

        <TrendChart data={trendData} />
      </div>

      <div className="space-y-4">
        <ZoneRiskTable zones={zoneRows} />

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Resume du Risque
          </p>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Score de Braden</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#003f7b]" style={{ fontFamily: "Manrope, sans-serif" }}>12</span>
                <span className="text-xs text-gray-400">/23</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Niveau de risque</span>
              {riskLabel ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: mmHgToColor(avgPressure!) + "20", color: mmHgToColor(avgPressure!) }}>
                  {riskLabel}
                </span>
              ) : (
                <span className="text-xs text-gray-400">—</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Clock size={12} />
                Prochain repositionnement
              </div>
              <span className="text-xs font-bold text-[#003f7b]">15 min</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
