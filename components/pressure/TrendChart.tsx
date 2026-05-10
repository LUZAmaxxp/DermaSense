"use client";
import dynamic from "next/dynamic";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

const LineChart = dynamic(() => import("recharts").then((m) => ({ default: m.LineChart })), { ssr: false, loading: () => <SkeletonCard /> });
const Line = dynamic(() => import("recharts").then((m) => ({ default: m.Line })), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => ({ default: m.XAxis })), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => ({ default: m.YAxis })), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => ({ default: m.CartesianGrid })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => ({ default: m.Tooltip })), { ssr: false });
const ReferenceLine = dynamic(() => import("recharts").then((m) => ({ default: m.ReferenceLine })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer })), { ssr: false });

interface TrendPoint {
  time: string;
  avg: number;
}

interface TrendChartProps {
  data: TrendPoint[] | null;
  threshold?: number;
}

export function TrendChart({ data, threshold = 32 }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">\u00c9volution (12h)</p>
        <div className="flex items-center justify-center h-[140px] text-gray-400 text-xs">Aucune donn\u00e9e historique disponible</div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Évolution (12h)
        </p>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-0.5 bg-[#ba1a1a] rounded-full border-dashed" />
          <span className="text-[10px] text-gray-400">Seuil {threshold} mmHg</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 60]} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 10, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            formatter={(v) => [`${v ?? 0} mmHg`, "Pression Moy."]}
          />
          <ReferenceLine
            y={threshold}
            stroke="#ba1a1a"
            strokeDasharray="4 4"
            label={{ value: `${threshold} mmHg`, position: "right", fontSize: 9, fill: "#ba1a1a" }}
          />
          <Line
            type="monotone"
            dataKey="avg"
            stroke="#003f7b"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#003f7b" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
