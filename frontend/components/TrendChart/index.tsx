import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors, Spacing, Radius } from '@/constants/theme';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  phData?: number[];
  floodData?: number[];
  levelData?: number[];
  labels?: string[];
}

type Param = 'ph' | 'flood' | 'level';

const TABS: { key: Param; label: string }[] = [
  { key: 'ph', label: 'pH' },
  { key: 'flood', label: 'Flood Risk' },
  { key: 'level', label: 'Water Level' },
];

const DEFAULT_PH = [7.1, 7.3, 6.9, 7.2, 7.4, 7.1, 7.0];
const DEFAULT_FLOOD = [22, 35, 48, 41, 30, 25, 20];
const DEFAULT_LEVEL = [65, 60, 55, 58, 62, 68, 70];
const DEFAULT_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function paramColor(param: Param, value: number): string {
  if (param === 'ph') {
    if (value < 6.5 || value > 8.5) return Colors.dangerRed;
    if (value < 7.0 || value > 8.0) return Colors.cautionAmber;
    return Colors.safeGreen;
  }
  if (param === 'flood') {
    if (value >= 60) return Colors.dangerRed;
    if (value >= 30) return Colors.cautionAmber;
    return Colors.safeGreen;
  }
  return Colors.primaryTeal;
}

export function TrendChart({ phData, floodData, levelData, labels }: Props) {
  const [active, setActive] = useState<Param>('ph');

  const dataMap: Record<Param, number[]> = {
    ph: phData ?? DEFAULT_PH,
    flood: floodData ?? DEFAULT_FLOOD,
    level: levelData ?? DEFAULT_LEVEL,
  };

  const data = dataMap[active];
  const chartLabels = labels ?? DEFAULT_LABELS;
  const lastVal = data[data.length - 1] ?? 0;
  const lineColor = paramColor(active, lastVal);

  return (
    <View style={styles.card}>
      {/* Tab selector */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, active === tab.key && { borderBottomColor: lineColor, borderBottomWidth: 2 }]}
            onPress={() => setActive(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabLabel, active === tab.key && { color: lineColor, fontWeight: '700' }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <LineChart
        data={{
          labels: chartLabels,
          datasets: [{ data, color: () => lineColor, strokeWidth: 2.5 }],
        }}
        width={SCREEN_W - 64}
        height={160}
        withDots
        withInnerLines={false}
        withOuterLines={false}
        withVerticalLines={false}
        withHorizontalLines={true}
        chartConfig={{
          backgroundGradientFrom: '#FFFFFF',
          backgroundGradientTo: '#FFFFFF',
          color: () => lineColor,
          labelColor: () => Colors.secondaryText,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: lineColor,
            fill: '#FFFFFF',
          },
          propsForHorizontalLabels: { fontSize: 14 },
          propsForLabels: { fontSize: 14 },
          decimalPlaces: active === 'ph' ? 1 : 0,
          fillShadowGradient: lineColor,
          fillShadowGradientOpacity: 0.08,
        }}
        bezier
        style={styles.chart}
        fromZero={active !== 'ph'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4F8',
  },
  tab: {
    flex: 1,
    paddingBottom: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 14,
    color: Colors.secondaryText,
    fontWeight: '500',
  },
  chart: {
    marginLeft: -16,
  },
});
