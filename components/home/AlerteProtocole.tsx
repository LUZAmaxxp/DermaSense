"use client";
import { CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { minutesToLabel } from "@/lib/utils/format";

interface AlerteProtocoleProps {
  lastMovementMs: number;    // timestamp of last movement
  lastRepositionMs: number;  // timestamp of last full reposition
  intervalMin: number;       // configured repositioning interval
}

export function AlerteProtocole({ lastMovementMs, lastRepositionMs, intervalMin }: AlerteProtocoleProps) {
  const now = Date.now();
  const movementAgoMin = Math.floor((now - lastMovementMs) / 60000);
  const repositionAgoMin = Math.floor((now - lastRepositionMs) / 60000);
  const remainingMin = Math.max(0, intervalMin - repositionAgoMin);

  const window30Ok = movementAgoMin < 30;
  const window60Ok = repositionAgoMin < intervalMin;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Protocoles de Repositionnement
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* 30 min window */}
        <div
          className={`rounded-xl p-3 border-l-4 ${
            window30Ok ? "bg-green-50 border-[#006e11]" : "bg-red-50 border-[#ba1a1a]"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            {window30Ok ? (
              <CheckCircle size={14} className="text-[#006e11]" />
            ) : (
              <AlertTriangle size={14} className="text-[#ba1a1a]" />
            )}
            <span className="text-[10px] font-semibold text-gray-600 uppercase">Fenêtre 30 min</span>
          </div>
          <p
            className={`text-sm font-bold ${window30Ok ? "text-[#006e11]" : "text-[#ba1a1a]"}`}
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {window30Ok ? "Conforme" : "Dépassé"}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            {minutesToLabel(movementAgoMin)} sans mouvement
          </p>
        </div>

        {/* Full interval window */}
        <div
          className={`rounded-xl p-3 border-l-4 ${
            window60Ok ? "bg-blue-50 border-[#003f7b]" : "bg-red-50 border-[#ba1a1a]"
          }`}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Clock size={14} className={window60Ok ? "text-[#003f7b]" : "text-[#ba1a1a]"} />
            <span className="text-[10px] font-semibold text-gray-600 uppercase">
              Repositionnement
            </span>
          </div>
          <p
            className={`text-sm font-bold ${window60Ok ? "text-[#003f7b]" : "text-[#ba1a1a]"}`}
            style={{ fontFamily: "Manrope, sans-serif" }}
          >
            {window60Ok ? `${minutesToLabel(remainingMin)} restant` : "Requis"}
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Intervalle: {minutesToLabel(intervalMin)}
          </p>
        </div>
      </div>
    </div>
  );
}
