
export function formatTimestamp(iso: string): string {
  if (!iso) return '—';
  try {
    const parsedDate = new Date(iso).getTime();
    if (isNaN(parsedDate)) return '—';

    const diff = Date.now() - parsedDate;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return '—';
  }
}

export function formatRelativeTime(iso: string): string {
  return formatTimestamp(iso);
}

export function formatPH(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '— pH';
  return `${value.toFixed(1)} pH`;
}

export function formatFloodRisk(pct: number): string {
  if (pct === undefined || pct === null || isNaN(pct)) return 'No Risk Data';
  if (pct < 30) return `Low Risk — ${Math.round(pct)}%`;
  if (pct < 60) return `Moderate Risk — ${Math.round(pct)}%`;
  if (pct < 80) return `High Risk — ${Math.round(pct)}%`;
  return `Severe Risk — ${Math.round(pct)}%`;
}

export function formatWaterLevel(level: string): string {
  if (!level) return '—';
  const map: Record<string, string> = {
    Normal: 'Normal Flow',
    Low: 'Low Level',
    'Very Low': 'Very Low',
    Flooded: 'Flooded',
    Dry: 'Dry',
  };
  return map[level] ?? level.trim();
}

export function formatScore(n: number): string {
  if (n === undefined || n === null || isNaN(n)) return '— / 100';
  return `${Math.round(n)} / 100`;
}
