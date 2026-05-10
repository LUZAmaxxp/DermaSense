"use client";
import { safetyLabel } from "@/lib/utils/pressure";

interface GlobalSafetyScoreProps {
  score: number | null;
}

export function GlobalSafetyScore({ score }: GlobalSafetyScoreProps) {
  if (score === null) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Score de Sécurité Global
        </p>
        <div className="flex items-center justify-center h-28 text-gray-400 text-xs">
          En attente des capteurs…
        </div>
      </div>
    );
  }
  const { label, color } = safetyLabel(score);
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
        Score de Sécurité Global
      </p>
      <div className="flex items-center gap-5">
        <svg width="112" height="112" viewBox="0 0 112 112">
          {/* Background ring */}
          <circle cx="56" cy="56" r={radius} fill="none" stroke="#f0f0f0" strokeWidth="8" />
          {/* Progress ring */}
          <circle
            cx="56"
            cy="56"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 56 56)"
            style={{ transition: "stroke-dashoffset 800ms ease, stroke 800ms ease" }}
          />
          <text
            x="56"
            y="52"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-2xl font-bold"
            style={{ fontFamily: "Manrope, sans-serif", fill: color, fontSize: "22px", fontWeight: 700 }}
          >
            {score}%
          </text>
          <text
            x="56"
            y="70"
            textAnchor="middle"
            style={{ fill: color, fontSize: "11px", fontWeight: 600, fontFamily: "Inter, sans-serif" }}
          >
            {label}
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Capteurs actifs</span>
            <span className="text-xs font-bold text-gray-800">362</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Zones OK</span>
            <span className="text-xs font-bold text-[#006e11]">4/5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Dernière MAJ</span>
            <span className="text-xs font-bold text-gray-800">À l&apos;instant</span>
          </div>
        </div>
      </div>
    </div>
  );
}
