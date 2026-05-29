export function formatTimestamp(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function formatPH(value: number): string {
  return `${value.toFixed(1)} pH`;
}

export function formatFloodRisk(pct: number): string {
  if (pct < 25) return `Low Risk — ${pct.toFixed(0)}%`;
  if (pct < 50) return `Moderate Risk — ${pct.toFixed(0)}%`;
  if (pct < 75) return `High Risk — ${pct.toFixed(0)}%`;
  return `Severe Risk — ${pct.toFixed(0)}%`;
}

export function formatWaterLevel(level: string): string {
  const map: Record<string, string> = {
    Normal: 'Normal Flow',
    Low: 'Low Level',
    'Very Low': 'Very Low',
    Flooded: 'Flooded',
    Dry: 'Dry',
  };
  return map[level] ?? level;
}
