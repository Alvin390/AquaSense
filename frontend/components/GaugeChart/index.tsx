import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';

interface Props {
  score: number;
  label: string;
  status?: 'SAFE' | 'CAUTION' | 'UNSAFE' | 'NO_DATA';
}

const RADIUS = 44;
const STROKE = 8;
const SIZE = (RADIUS + STROKE) * 2 + 4;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function arcColor(score: number): string {
  if (score >= 75) return Colors.safeGreen;
  if (score >= 45) return Colors.cautionAmber;
  return Colors.dangerRed;
}

export function GaugeChart({ score, label, status }: Props) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const color = arcColor(clampedScore);
  const filled = (clampedScore / 100) * CIRCUMFERENCE;
  const dashOffset = CIRCUMFERENCE - filled;

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={SIZE} height={SIZE}>
          {/* Track */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#E8F4F8"
            strokeWidth={STROKE}
            fill="none"
          />
          {/* Arc fill */}
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${CENTER}, ${CENTER}`}
          />
        </Svg>
        <View style={styles.center}>
          <Text style={[styles.score, { color }]}>{clampedScore}</Text>
          <Text style={styles.outOf}>/100</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  svgWrapper: {
    position: 'relative',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 30,
  },
  outOf: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  label: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
});
