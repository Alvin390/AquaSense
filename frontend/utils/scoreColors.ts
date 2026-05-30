

import { Colors } from '../constants/theme';





export function getStatusColor(score: number, status?: string): string {
  // If an explicit status string is provided, prioritize it
  if (status) {
    const normalizedStatus = status.toUpperCase().trim();
    if (normalizedStatus === 'SAFE') return Colors.safeGreen;
    if (normalizedStatus === 'CAUTION' || normalizedStatus === 'USE_WITH_CAUTION') return Colors.cautionAmber;
    if (normalizedStatus === 'UNSAFE' || normalizedStatus === 'DO_NOT_USE') return Colors.dangerRed;
    if (normalizedStatus === 'NO_DATA') return Colors.grey;
  }

  // Fallback to numeric score evaluation if no explicit status is given
  if (score === undefined || score === null || isNaN(score)) return Colors.grey;
  if (score >= 70) return Colors.safeGreen;
  if (score >= 40) return Colors.cautionAmber;
  return Colors.dangerRed;
}

/**
 * Returns the exact hex color code for Map Pin Markers based on the source risk label.
 * Fulfills the explicit contract for Ted's WaterSourceMarker and Ralph's MapView.
 */
export function getMarkerColor(status: string): string {
  if (!status) return Colors.grey;

  const normalized = status.toUpperCase().trim();
  switch (normalized) {
    case 'SAFE':
      return Colors.safeGreen;
    case 'CAUTION':
    case 'USE_WITH_CAUTION':
      return Colors.cautionAmber;
    case 'UNSAFE':
    case 'DO_NOT_USE':
      return Colors.dangerRed;
    case 'NO_DATA':
    default:
      return Colors.grey;
  }
}