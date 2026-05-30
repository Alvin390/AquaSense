
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
  if (!iso) return 'Saved data unavailable';
  try {
    const parsedDate = new Date(iso).getTime();
    if (isNaN(parsedDate)) return 'Saved data unavailable';

    const diff = Date.now() - parsedDate;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Saved data from just now';
    if (minutes < 60) return `Saved data from ${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Saved data from ${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;

    const days = Math.floor(hours / 24);
    return `Saved data from ${days} ${days === 1 ? 'day' : 'days'} ago`;
  } catch {
    return 'Saved data from just now';
  }
}

/**
 * Formats pH value to 1 decimal place with the "pH" suffix (e.g., "7.2 pH")
 */
export function formatPH(value: number): string {
  if (value === undefined || value === null || isNaN(value)) return '— pH';
  return `${value.toFixed(1)} pH`;
}

/**
 * Formats flood risk percentage with its corresponding hazard category string.
 * Boundaries matching Specification (§8):
 * 0% - 30%    -> Low Risk
 * 31% - 60%   -> Moderate Risk
 * >60% - 100% -> High Risk
 */
export function formatFloodRisk(pct: number): string {
  if (pct === undefined || pct === null || isNaN(pct)) return 'No Risk Data';

  let category = 'Low Risk';
  if (pct > 30 && pct <= 60) {
    category = 'Moderate Risk';
  } else if (pct > 60) {
    category = 'High Risk';
  }

  return `${category} — ${Math.round(pct)}%`;
}

/**
 * Formats water level string into human-friendly display text
 */
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

/**
 * Formats composite score numbers out of 100 (e.g., "78 / 100")
 */
export function formatScore(n: number): string {
  if (n === undefined || n === null || isNaN(n)) return '— / 100';
  return `${Math.round(n)} / 100`;
}
