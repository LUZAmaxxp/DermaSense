export function ZoneLegend() {
  const items = [
    { color: "#006e11", label: "Faible (≤20 mmHg)" },
    { color: "#f59e0b", label: "Modéré (21–32 mmHg)" },
    { color: "#f97316", label: "Élevé (33–40 mmHg)" },
    { color: "#ba1a1a", label: "Critique (>40 mmHg)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map(({ color, label }) => (
        <div key={label} className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-xs text-gray-600">{label}</span>
        </div>
      ))}
    </div>
  );
}
