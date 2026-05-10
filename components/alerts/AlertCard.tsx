"use client";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { SeverityBadge } from "@/components/shared/SeverityBadge";
import { PulseRing } from "@/components/shared/PulseRing";
import { timeAgo } from "@/lib/utils/format";
import type { Alert } from "@/types/alert.types";

const ZONE_LABELS: Record<string, string> = {
  sacrum: "Sacrum", shoulders: "Épaules", heels: "Talons", thorax: "Thorax", legs: "Jambes",
};

interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string) => void;
}

export function AlertCard({ alert, onDismiss }: AlertCardProps) {
  const isCritical = alert.severity === "critical";
  const borderColor =
    alert.severity === "critical" ? "#ba1a1a" : alert.severity === "warning" ? "#f59e0b" : "#003f7b";

  const card = (
    <div
      className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
      style={{ borderLeft: `4px solid ${borderColor}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <SeverityBadge severity={alert.severity} />
            <span className="text-xs text-gray-500">{ZONE_LABELS[alert.zone] ?? alert.zone}</span>
            <span className="text-xs text-gray-400">{timeAgo(alert.created_at)}</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm font-bold text-gray-800" style={{ fontFamily: "Manrope, sans-serif" }}>
              {alert.pressure_mmhg} mmHg
            </span>
            {alert.duration_min > 0 && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {alert.duration_min} min
              </span>
            )}
            <span className="text-xs text-gray-400">Seuil: {alert.threshold_mmhg} mmHg</span>
          </div>
        </div>
        {alert.status === "active" && (
          <button
            onClick={() => onDismiss(alert._id)}
            className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0"
            aria-label="Rejeter l'alerte"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {alert.status === "active" && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onDismiss(alert._id)}
            className="text-xs font-medium text-gray-600 hover:text-gray-800 bg-gray-100 px-3 py-1.5 rounded-lg"
          >
            Rejeter
          </button>
          <Link
            href="/recommendations"
            className="text-xs font-medium text-[#003f7b] hover:text-[#1a5c9e] flex items-center gap-1 bg-[#003f7b]/10 px-3 py-1.5 rounded-lg"
          >
            Guide Protocole <ArrowRight size={11} />
          </Link>
        </div>
      )}
    </div>
  );

  return isCritical && alert.status === "active" ? (
    <PulseRing>{card}</PulseRing>
  ) : card;
}
