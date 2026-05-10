import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types/alert.types";

type ExtendedSeverity = AlertSeverity | "high" | "safe";

const config: Record<ExtendedSeverity, { label: string; bg: string; color: string }> = {
  critical: { label: "Critique",       bg: "#fee2e2", color: "#ba1a1a" },
  warning:  { label: "Avertissement",  bg: "#fef3c7", color: "#92400e" },
  high:     { label: "Élevé",          bg: "#ffedd5", color: "#c2410c" },
  info:     { label: "Info",           bg: "#eff6ff", color: "#003f7b" },
  safe:     { label: "Sûr",            bg: "#dcfce7", color: "#006e11" },
};

interface SeverityBadgeProps {
  severity: ExtendedSeverity | null;
  className?: string;
}

export function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  if (!severity) return null;
  const { label, bg, color } = config[severity] ?? config.info;
  return (
    <span
      className={cn("inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-medium", className)}
      style={{ background: bg, color }}
    >
      {label}
    </span>
  );
}

