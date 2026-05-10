"use client";
import { useSensorStore } from "@/store/useSensorStore";
import { safetyLabel, computeSafetyScore } from "@/lib/utils/pressure";
import { CheckCircle, RotateCcw, Droplets, Wind, AlertTriangle } from "lucide-react";

const POSITIONS = [
  { label: "Decubitus Dorsal",   icon: "bed",  desc: "Position standard - repartition uniforme", recommended: false },
  { label: "Lateral Gauche 30",  icon: "left", desc: "Soulage le sacrum et les talons",          recommended: true  },
  { label: "Lateral Droit 30",   icon: "right",desc: "Alternative recommandee toutes les 2h",    recommended: false },
];

const TIPS = [
  { icon: Droplets,     text: "Maintenir l'hydratation : au moins 1.5L/jour",              color: "#003f7b" },
  { icon: RotateCcw,    text: "Repositionner toutes les 2h minimum",                       color: "#006e11" },
  { icon: Wind,         text: "Surveiller l'humidite de la peau (seuil 60%)",              color: "#00474f" },
  { icon: AlertTriangle,text: "Inspecter quotidiennement les zones sacree et talons",       color: "#f59e0b" },
];

const RISK_BG: Record<string, string> = {
  "Sur":     "#dcfce7",
  "Attention": "#fef3c7",
  "Eleve":   "#ffedd5",
  "Critique": "#fee2e2",
};
const RISK_TEXT: Record<string, string> = {
  "Sur":     "#006e11",
  "Attention": "#92400e",
  "Eleve":   "#c2410c",
  "Critique": "#ba1a1a",
};

export default function RecommendationsPage() {
  const latest = useSensorStore((s) => s.latest);
  const score = latest?.matrix ? computeSafetyScore(latest.matrix) : null;
  const { label } = score !== null ? safetyLabel(score) : { label: null };
  const riskBg   = label ? (RISK_BG[label]   ?? "#fee2e2") : null;
  const riskText = label ? (RISK_TEXT[label] ?? "#ba1a1a") : null;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {riskBg && riskText && label ? (
        <div className="rounded-2xl p-6" style={{ background: riskBg }}>
          <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: riskText, opacity: 0.7 }}>
            Niveau de Risque Actuel
          </p>
          <p className="text-3xl font-bold" style={{ fontFamily: "Manrope, sans-serif", color: riskText }}>{label}</p>
          <p className="text-sm mt-1" style={{ color: riskText, opacity: 0.75 }}>
            Score: {score}% &mdash; {latest!.matrix.filter((v) => v > 32).length} zones critiques
          </p>
        </div>
      ) : (
        <div className="rounded-2xl p-6 bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 text-sm">
          En attente des donn\u00e9es capteurs\u2026
        </div>
      )}

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Positions Recommandees</p>
        <div className="grid grid-cols-3 gap-4">
          {POSITIONS.map(({ label: pos, desc, recommended }) => (
            <div
              key={pos}
              className="bg-white rounded-2xl p-5 border shadow-sm transition-all hover:border-[#003f7b]"
              style={{ borderColor: recommended ? "#003f7b" : "#f1f5f9", borderWidth: recommended ? 2 : 1 }}
            >
              <div className="text-3xl mb-3">{recommended ? "↺" : pos.includes("Droit") ? "↻" : "□"}</div>
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-sm font-semibold text-gray-800">{pos}</p>
                {recommended && <CheckCircle size={14} className="text-[#006e11] flex-shrink-0" />}
              </div>
              {recommended && (
                <span className="inline-block text-[10px] font-bold bg-[#dcfce7] text-[#006e11] px-2 py-0.5 rounded-full mb-2">
                  Recommande
                </span>
              )}
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Soins Preventifs</p>
        <div className="grid grid-cols-2 gap-4">
          {TIPS.map(({ icon: Icon, text, color }) => (
            <div key={text} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: color + "15" }}>
                <Icon size={16} style={{ color }} />
              </div>
              <p className="text-sm text-gray-700 leading-snug">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-l-4 border-[#003f7b] bg-blue-50 rounded-r-2xl p-5">
        <p className="text-xs font-bold text-[#003f7b] uppercase tracking-wide mb-1">Echelle de Braden</p>
        <p className="text-sm text-gray-700">
          Score actuel : <strong>12/23</strong> - Risque eleve (12 ou moins).
          Protocole renforce recommande avec repositionnement toutes les 2h et utilisation d&apos;un matelas therapeutique.
        </p>
      </div>
    </div>
  );
}
