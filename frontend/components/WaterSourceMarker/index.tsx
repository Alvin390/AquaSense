// TED file/location: frontend/components/WaterSourceMarker/index.tsx
// Contract: Ralph imports this marker for Tab 1 map pins.
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { scoreColors } from '@/utils/scoreColors';

export type MarkerStatus = 'SAFE' | 'CAUTION' | 'UNSAFE' | 'NO_DATA';

interface WaterSourceMarkerProps {
  status: MarkerStatus;
  name: string;
}

function markerColor(status: MarkerStatus) {
  if (status === 'NO_DATA') return Colors.secondaryText;
  if (status === 'CAUTION') return scoreColors.fromLabel('USE_WITH_CAUTION');
  if (status === 'UNSAFE') return scoreColors.fromLabel('DO_NOT_USE');
  return scoreColors.fromLabel('SAFE');
}

export function WaterSourceMarker({ status, name }: WaterSourceMarkerProps) {
  const color = markerColor(status);

  return (
    <View accessibilityLabel={`${name} water source status ${status}`} style={styles.wrapper}>
      <View style={[styles.pin, { borderBottomColor: color }]}>
        <View style={[styles.dot, { backgroundColor: color }]} />
      </View>
      <Text numberOfLines={1} style={styles.label}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    maxWidth: 96,
  },
  pin: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '180deg' }],
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderColor: Colors.cardBackground,
    borderWidth: 2,
    transform: [{ rotate: '180deg' }, { translateY: -7 }],
  },
  label: {
    marginTop: 2,
    color: Colors.darkText,
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 96,
  },
});
