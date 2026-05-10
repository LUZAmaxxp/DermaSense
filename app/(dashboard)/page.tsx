"use client";
import { useEffect } from "react";
import { useSensorStore } from "@/store/useSensorStore";
import { useSensorStream } from "@/hooks/useSensorStream";
import { useAlerts } from "@/hooks/useAlerts";
import { useAlertStore } from "@/store/useAlertStore";
import { computeSafetyScore } from "@/lib/utils/pressure";
import { GlobalSafetyScore } from "@/components/home/GlobalSafetyScore";
import { AlerteProtocole } from "@/components/home/AlerteProtocole";
import { PressureMapPreview } from "@/components/home/PressureMapPreview";
import { PositionActuelle } from "@/components/home/PositionActuelle";
import { MobilityHistory } from "@/components/home/MobilityHistory";
import { ZoneStatsRail } from "@/components/home/ZoneStatsRail";
import { ActiveAlertsList } from "@/components/home/ActiveAlertsList";
import { ModeVigilance } from "@/components/home/ModeVigilance";

export default function HomePage() {
  useSensorStream();

  const latest = useSensorStore((s) => s.latest);
  const { alerts } = useAlerts("active");
  const setAlerts = useAlertStore((s) => s.setAlerts);

  useEffect(() => {
    if (alerts.length) setAlerts(alerts);
  }, [alerts, setAlerts]);

  const matrix = latest?.matrix ?? null;
  const score = matrix ? computeSafetyScore(matrix) : null;
  const position = latest?.position ?? null;
  const humidity = latest?.humidity ?? null;
  const now = Date.now();

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "280px 1fr 300px", alignItems: "start" }}
    >
      {/* Col 1 — left */}
      <div className="space-y-4">
        <GlobalSafetyScore score={score} />
        <PositionActuelle
          position={position}
          humidity={humidity}
          lastChangedAt={latest ? new Date(now - 45 * 60000).toISOString() : null}
        />
        <MobilityHistory data={[]} />
      </div>

      {/* Col 2 — center */}
      <div className="space-y-4">
        <PressureMapPreview matrix={matrix} />
        {latest && (
          <AlerteProtocole
            lastMovementMs={latest.timestamp ? new Date(latest.timestamp).getTime() : now}
            lastRepositionMs={latest.timestamp ? new Date(latest.timestamp).getTime() : now}
            intervalMin={120}
          />
        )}
      </div>

      {/* Col 3 — right */}
      <div className="space-y-4">
        <ZoneStatsRail />
        <ActiveAlertsList />
        <ModeVigilance />
      </div>
    </div>
  );
}
