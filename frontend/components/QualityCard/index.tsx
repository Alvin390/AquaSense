import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface Props {
  label: string;
  value: string;
  status: 'SAFE' | 'CAUTION' | 'UNSAFE';
  safeRange?: string;
  fillPercent?: number;
}

const STATUS_COLOR: Record<string, string> = {
  SAFE: Colors.safeGreen,
  CAUTION: Colors.cautionAmber,
  UNSAFE: Colors.dangerRed,
};

const STATUS_LABEL: Record<string, string> = {
  SAFE: 'Safe',
  CAUTION: 'Caution',
  UNSAFE: 'Unsafe',
};

export function QualityCard({ label, value, status, safeRange, fillPercent = 50 }: Props) {
  const color = STATUS_COLOR[status] ?? Colors.secondaryText;
  const clampedFill = Math.max(0, Math.min(100, fillPercent));

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={[styles.chip, { backgroundColor: color + '20', borderColor: color }]}>
          <View style={[styles.chipDot, { backgroundColor: color }]} />
          <Text style={[styles.chipText, { color }]}>{STATUS_LABEL[status]}</Text>
        </View>
      </View>

      <Text style={[styles.value, { color: Colors.darkText }]}>{value}</Text>

      {/* Fill bar */}
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${clampedFill}%`, backgroundColor: color }]} />
      </View>

      {safeRange ? (
        <Text style={styles.safeRange}>Safe range: {safeRange}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 13,
    color: Colors.secondaryText,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    gap: 5,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#E8F4F8',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  safeRange: {
    fontSize: 11,
    color: Colors.secondaryText,
    marginTop: 2,
  },
});
