// TED file/location: frontend/components/GaugeChart/index.tsx
// Contract: Ralph imports this gauge for Tab 2 quality and quantity scores.
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { scoreColors } from '@/utils/scoreColors';

export type GaugeStatus = 'SAFE' | 'CAUTION' | 'UNSAFE' | 'NO_DATA';

interface GaugeChartProps {
  score: number;
  label: string;
  status: GaugeStatus;
}

const SIZE = 132;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function statusColor(status: GaugeStatus, score: number) {
  if (status === 'NO_DATA') return Colors.secondaryText;
  if (status === 'CAUTION') return scoreColors.fromLabel('USE_WITH_CAUTION');
  if (status === 'UNSAFE') return scoreColors.fromLabel('DO_NOT_USE');
  if (status === 'SAFE') return scoreColors.fromLabel('SAFE');
  return scoreColors.fromScore(score);
}

export function GaugeChart({ score, label, status }: GaugeChartProps) {
  const boundedScore = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0));
  const color = statusColor(status, boundedScore);
  const dashOffset = CIRCUMFERENCE - (boundedScore / 100) * CIRCUMFERENCE;

  return (
    <View accessibilityLabel={`${label} score ${boundedScore}`} style={styles.container}>
      <View style={styles.gauge}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={Colors.skeletonBase}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <Text style={[styles.score, { color }]}>{Math.round(boundedScore)}</Text>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  gauge: {
    alignItems: 'center',
    height: SIZE,
    justifyContent: 'center',
    width: SIZE,
  },
  score: {
    fontSize: 34,
    fontWeight: '800',
    position: 'absolute',
  },
  label: {
    color: Colors.secondaryText,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
});
