"use client";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertStore } from "@/store/useAlertStore";
import { AlertCard } from "@/components/alerts/AlertCard";
import { DailyTrendChart } from "@/components/alerts/DailyTrendChart";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AlertsPage() {
  const [tab, setTab] = useState<"all" | "active" | "history">("active");
  const { alerts, isLoading, mutate } = useAlerts(tab);
  const dismissInStore = useAlertStore((s) => s.dismissAlert);
  const allAlerts = useAlertStore((s) => s.alerts);

  const { data: trendData } = useSWR("/api/alerts/trends", fetcher, { refreshInterval: 60000 });
  const trend = trendData?.trend ?? [];

  const activeCount  = allAlerts.filter((a) => a.status === "active").length;
  const warningCount = allAlerts.filter((a) => a.status === "active" && a.severity === "warning").length;
  const criticalCount = allAlerts.filter((a) => a.status === "active" && a.severity === "critical").length;
  const resolvedCount = allAlerts.filter((a) => a.status === "resolved" || a.status === "dismissed").length;

  const handleDismiss = async (id: string) => {
    dismissInStore(id);
    await fetch("/api/alerts/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dismissed" }),
    });
    mutate();
  };

  return (
    <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 320px", alignItems: "start" }}>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "Manrope, sans-serif" }}>
            Alertes
          </h1>
          {activeCount > 0 && (
            <span className="bg-[#ba1a1a] text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {activeCount} active{activeCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="bg-gray-100 rounded-xl p-1 mb-4">
            <TabsTrigger value="all" className="rounded-lg text-xs">Toutes</TabsTrigger>
            <TabsTrigger value="active" className="rounded-lg text-xs">
              Actives {activeCount > 0 && "(" + activeCount + ")"}
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg text-xs">Historique</TabsTrigger>
          </TabsList>

          {["all", "active", "history"].map((t) => (
            <TabsContent key={t} value={t} className="space-y-3">
              {isLoading ? (
                <><SkeletonCard /><SkeletonCard /></>
              ) : alerts.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm">Aucune alerte{t === "active" ? " active" : ""}</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <AlertCard key={alert._id} alert={alert} onDismiss={handleDismiss} />
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="space-y-4">
        <DailyTrendChart data={trend} />

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Resume
          </p>
          <div className="space-y-3">
            {[
              { label: "Critiques actives",   count: criticalCount, bg: "#fee2e2", color: "#ba1a1a" },
              { label: "Avertissements",       count: warningCount,  bg: "#fef3c7", color: "#92400e" },
              { label: "Resolues aujourd'hui", count: resolvedCount, bg: "#dcfce7", color: "#006e11" },
            ].map(({ label, count, bg, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-xs text-gray-600">{label}</span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: bg, color }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
