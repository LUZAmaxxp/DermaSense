"use client";
import { CheckCircle } from "lucide-react";
import { useAlertStore } from "@/store/useAlertStore";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { timeAgo } from "@/lib/utils/format";
import { mmHgToColor } from "@/lib/utils/pressure";
import type { IAlert } from "@/models/Alert";

export function ActiveAlertsList() {
  const alerts = useAlertStore((s) => s.alerts);
  const active = alerts.filter((a) => a.status === "active");

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
          Alertes Actives
        </p>
        {active.length > 0 && (
          <span className="bg-[#fee2e2] text-[#ba1a1a] text-[10px] font-bold px-2 py-0.5 rounded-full">
            {active.length}
          </span>
        )}
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <CheckCircle size={28} className="text-[#006e11]" />
          <p className="text-xs text-gray-500">Aucune alerte active</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {active.map((alert) => {
            const isCritical = alert.severity === "critical";
            return (
              <div
                key={String(alert._id)}
                className={`border-l-4 rounded-r-xl px-3 py-2.5 ${isCritical ? "alert-pulse" : ""}`}
                style={{ borderColor: mmHgToColor(alert.pressure_mmhg), background: "#fafafa" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={alert.severity} />
                    <span className="text-xs font-semibold text-gray-800">{alert.zone}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 flex-shrink-0">
                    {timeAgo(new Date(alert.created_at))}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {alert.pressure_mmhg.toFixed(1)} mmHg · {alert.duration_min}min
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
