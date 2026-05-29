// WaterSourceMarker: color-coded map pin (green=SAFE, amber=CAUTION, red=DO_NOT_USE)
// Tap → bottom-sheet with quick stats + "View Full Details" CTA
// TODO: Ralph (design) + Alex (data)
import { View, StyleSheet } from 'react-native';

interface Props {
  riskLabel: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE';
}

const COLOR: Record<string, string> = {
  SAFE: '#27AE60',
  USE_WITH_CAUTION: '#F39C12',
  DO_NOT_USE: '#E74C3C',
};

export function WaterSourceMarker({ riskLabel }: Props) {
  return <View style={[styles.pin, { backgroundColor: COLOR[riskLabel] ?? '#8F9BB3' }]} />;
}

const styles = StyleSheet.create({
  pin: { width: 16, height: 16, borderRadius: 8, borderWidth: 2, borderColor: '#fff' },
});
