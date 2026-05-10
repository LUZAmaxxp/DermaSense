"use client";
import dynamic from "next/dynamic";
import { SkeletonCard } from "@/components/shared/SkeletonCard";

const BarChart = dynamic(() => import("recharts").then((m) => ({ default: m.BarChart })), { ssr: false, loading: () => <SkeletonCard /> });
const Bar = dynamic(() => import("recharts").then((m) => ({ default: m.Bar })), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => ({ default: m.XAxis })), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => ({ default: m.Tooltip })), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then((m) => ({ default: m.ResponsiveContainer })), { ssr: false });

interface DayData {
  date: string;
  count: number;
  critical: number;
}

interface DailyTrendChartProps {
  data: DayData[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Tendance Alertes (7j)
      </p>
      <ResponsiveContainer width="100%" height={80}>
        <BarChart data={data} barSize={10} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 10, borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
            formatter={(v) => [v ?? 0, "Alertes"]}
          />
          <Bar
            dataKey="count"
            radius={[3, 3, 0, 0]}
            fill="#003f7b"
          />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-gray-400 mt-1 text-right">
        Pic: {max} alertes / jour
      </p>
    </div>
  );
}
