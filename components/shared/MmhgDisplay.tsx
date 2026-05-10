import { alertLevelToColor, mmHgToColor } from "@/lib/utils/pressure";
import type { AlertLevel } from "@/types/sensor.types";

interface MmhgDisplayProps {
  value: number | null;
  alertLevel?: AlertLevel;
  showUnit?: boolean;
  className?: string;
}

export function MmhgDisplay({ value, alertLevel, showUnit = true, className = "" }: MmhgDisplayProps) {
  if (value === null || value === undefined) {
    return (
      <span className={`inline-flex items-end gap-1 ${className}`}>
        <span className="text-[40px] font-bold leading-none text-gray-300" style={{ fontFamily: "Manrope, sans-serif" }}>
          —
        </span>
        {showUnit && <span className="text-sm text-gray-300 mb-1 font-medium">mmHg</span>}
      </span>
    );
  }
  const color = alertLevel ? alertLevelToColor(alertLevel) : value >= 40 ? "#ba1a1a" : value >= 32 ? "#f97316" : value >= 30 ? "#f59e0b" : "#006e11";
  return (
    <span className={`inline-flex items-end gap-1 ${className}`}>
      <span
        className="text-[40px] font-bold leading-none"
        style={{ fontFamily: "Manrope, sans-serif", color }}
      >
        {Math.round(value)}
      </span>
      {showUnit && (
        <span className="text-sm text-gray-500 mb-1 font-medium">mmHg</span>
      )}
    </span>
  );
}
