import { Colors } from '@/constants/theme';

export const scoreColors = {
  fromScore(score: number): string {
    if (score >= 75) return Colors.safeGreen;
    if (score >= 45) return Colors.cautionAmber;
    return Colors.dangerRed;
  },

  fromLabel(label: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | string): string {
    if (label === 'SAFE') return Colors.safeGreen;
    if (label === 'USE_WITH_CAUTION') return Colors.cautionAmber;
    return Colors.dangerRed;
  },
};
