export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `${min}min`;
  const h = Math.floor(min / 60);
  const rem = min % 60;
  if (rem === 0) return `${h}h`;
  return `${h}h ${rem}min`;
}

export function minutesToLabel(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}
