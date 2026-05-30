import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GaugeChart } from '@/components/GaugeChart';
import { QualityCard } from '@/components/QualityCard';
import { TrendChart } from '@/components/TrendChart';
import { LiveSavedBadge } from '@/components/LiveSavedBadge';

import { Colors, Spacing, Radius } from '@/constants/theme';
import { useWaterStore } from '@/stores/waterStore';
import { useLocationStore } from '@/stores/locationStore';
import { useLatestReading, useSourceHistory } from '@/hooks/useWaterData';
import { formatTimestamp, formatPH, formatFloodRisk, formatWaterLevel } from '@/utils/formatters';

// Demo fallback data
const DEMO_BY_ID: Record<number, {
  name: string;
  lat: number;
  lng: number;
  ph: number;
  flood_risk_pct: number;
  water_level: string;
  quality_score: number;
  quantity_score: number;
  risk_label: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE';
  fetched_at: string;
}> = {
  1: { name: 'Nairobi River — Westlands Crossing', lat: -1.2676, lng: 36.8039, ph: 7.4, flood_risk_pct: 38, water_level: 'Normal', quality_score: 62, quantity_score: 70, risk_label: 'USE_WITH_CAUTION', fetched_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
  2: { name: 'Athi River — Mavoko Intake', lat: -1.4378, lng: 36.9563, ph: 7.1, flood_risk_pct: 18, water_level: 'Normal', quality_score: 82, quantity_score: 88, risk_label: 'SAFE', fetched_at: new Date(Date.now() - 1.5 * 3600_000).toISOString() },
  3: { name: 'Mathare River — Mathare North', lat: -1.2598, lng: 36.8598, ph: 5.8, flood_risk_pct: 71, water_level: 'Flooded', quality_score: 21, quantity_score: 35, risk_label: 'DO_NOT_USE', fetched_at: new Date(Date.now() - 3 * 3600_000).toISOString() },
  4: { name: 'Ngong River — Lower Kabete', lat: -1.2981, lng: 36.7423, ph: 7.6, flood_risk_pct: 44, water_level: 'Low', quality_score: 55, quantity_score: 48, risk_label: 'USE_WITH_CAUTION', fetched_at: new Date(Date.now() - 4 * 3600_000).toISOString() },
  5: { name: 'Ruiru Reservoir', lat: -1.1471, lng: 36.9607, ph: 7.2, flood_risk_pct: 12, water_level: 'Normal', quality_score: 88, quantity_score: 92, risk_label: 'SAFE', fetched_at: new Date(Date.now() - 1 * 3600_000).toISOString() },
  6: { name: 'Nairobi River — CBD Section', lat: -1.2865, lng: 36.8241, ph: 6.1, flood_risk_pct: 66, water_level: 'Normal', quality_score: 28, quantity_score: 60, risk_label: 'DO_NOT_USE', fetched_at: new Date(Date.now() - 2.5 * 3600_000).toISOString() },
};

const DEFAULT_SOURCE = DEMO_BY_ID[1];

function phStatus(ph: number): 'SAFE' | 'CAUTION' | 'UNSAFE' {
  if (ph < 6.5 || ph > 8.5) return 'UNSAFE';
  if (ph < 7.0 || ph > 8.0) return 'CAUTION';
  return 'SAFE';
}

function floodStatus(pct: number): 'SAFE' | 'CAUTION' | 'UNSAFE' {
  if (pct >= 60) return 'UNSAFE';
  if (pct >= 30) return 'CAUTION';
  return 'SAFE';
}

function levelStatus(level: string): 'SAFE' | 'CAUTION' | 'UNSAFE' {
  if (level === 'Flooded' || level === 'Dry') return 'UNSAFE';
  if (level === 'Low' || level === 'Very Low') return 'CAUTION';
  return 'SAFE';
}

function scoreLabel(score: number): string {
  if (score >= 80) return 'SAFE';
  if (score >= 60) return 'GOOD';
  if (score >= 40) return 'MODERATE';
  if (score >= 20) return 'CAUTION';
  return 'UNSAFE';
}

export default function QualityScreen() {
  const router = useRouter();
  const { selectedSourceId } = useWaterStore();
  const { isGPSMode } = useLocationStore();

  const demo = selectedSourceId ? DEMO_BY_ID[selectedSourceId] : DEFAULT_SOURCE;
  const source = demo ?? DEFAULT_SOURCE;

  const { data: apiLatest, isLoading, refetch, isFetching } = useLatestReading(selectedSourceId);
  const { data: apiHistory } = useSourceHistory(selectedSourceId);

  const latest = (apiLatest as any) ?? null;

  const ph = latest?.reading?.ph ?? source.ph;
  const floodRisk = latest?.reading?.flood_risk_pct ?? source.flood_risk_pct;
  const waterLevel = latest?.reading?.water_level ?? source.water_level;
  const qualityScore = latest?.ai_recommendation?.quality_score ?? source.quality_score;
  const quantityScore = latest?.ai_recommendation?.quantity_score ?? source.quantity_score;
  const fetchedAt = latest?.reading?.fetched_at ?? source.fetched_at;
  const sourceName = source.name;

  const history7 = (apiHistory as any[]) ?? [];
  const phHistory = history7.length ? history7.map((r: any) => r.ph ?? 7.0) : undefined;
  const floodHistory = history7.length ? history7.map((r: any) => r.flood_risk_pct ?? 30) : undefined;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={Colors.darkText} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>{sourceName}</Text>
          <Text style={styles.headerCoords}>
            {source.lat.toFixed(4)}, {source.lng.toFixed(4)}
          </Text>
        </View>
        <LiveSavedBadge isLive={isGPSMode || false} lastUpdated={fetchedAt} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.primaryTeal}
            colors={[Colors.primaryTeal]}
          />
        }
      >
        {/* Timestamp */}
        <Text style={styles.timestamp}>
          Last updated: {formatTimestamp(fetchedAt)}
        </Text>

        {/* Composite score gauges */}
        <View style={styles.gaugeRow}>
          <View style={styles.gaugeCard}>
            <GaugeChart score={qualityScore} label="Water Quality" />
            <View style={[styles.scoreBadge, { backgroundColor: badgeColor(qualityScore) + '20' }]}>
              <Text style={[styles.scoreBadgeText, { color: badgeColor(qualityScore) }]}>
                {scoreLabel(qualityScore)}
              </Text>
            </View>
          </View>
          <View style={styles.gaugeCard}>
            <GaugeChart score={quantityScore} label="Water Quantity" />
            <View style={[styles.scoreBadge, { backgroundColor: badgeColor(quantityScore) + '20' }]}>
              <Text style={[styles.scoreBadgeText, { color: badgeColor(quantityScore) }]}>
                {scoreLabel(quantityScore)}
              </Text>
            </View>
          </View>
        </View>

        {/* Parameter cards */}
        <Text style={styles.sectionTitle}>Water Parameters</Text>

        <QualityCard
          label="pH Level"
          value={formatPH(ph)}
          status={phStatus(ph)}
          safeRange="6.5 – 8.5"
          fillPercent={((ph - 0) / 14) * 100}
        />

        <QualityCard
          label="Rainfall & Flood Risk"
          value={formatFloodRisk(floodRisk)}
          status={floodStatus(floodRisk)}
          safeRange="Below 30% = Low Risk"
          fillPercent={floodRisk}
        />

        <QualityCard
          label="Water Availability"
          value={formatWaterLevel(waterLevel)}
          status={levelStatus(waterLevel)}
          fillPercent={levelFill(waterLevel)}
        />

        {/* 7-day trend chart */}
        <Text style={styles.sectionTitle}>7-Day Trend</Text>
        <TrendChart phData={phHistory} floodData={floodHistory} />

        <View style={styles.aiCTA}>
          <Ionicons name="sparkles" size={16} color={Colors.primaryTeal} />
          <Text style={styles.aiCTAText}>See AI safety recommendations</Text>
          <TouchableOpacity
            style={styles.aiCTABtn}
            onPress={() => router.push('/(tabs)/recommendations')}
            activeOpacity={0.85}
          >
            <Text style={styles.aiCTABtnText}>View AI Analysis</Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function badgeColor(score: number): string {
  if (score >= 75) return Colors.safeGreen;
  if (score >= 45) return Colors.cautionAmber;
  return Colors.dangerRed;
}

function levelFill(level: string): number {
  const map: Record<string, number> = {
    Flooded: 100,
    Normal: 65,
    Low: 35,
    'Very Low': 15,
    Dry: 0,
  };
  return map[level] ?? 50;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundWhite,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4F8',
    gap: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.darkText,
    letterSpacing: -0.2,
  },
  headerCoords: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginTop: 1,
  },
  timestamp: {
    fontSize: 14,
    color: Colors.secondaryText,
    marginBottom: Spacing.md,
    marginTop: -4,
  },
  scroll: { flex: 1 },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  gaugeCard: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  scoreBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  aiCTA: {
    backgroundColor: Colors.backgroundWhite,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryTeal + '30',
  },
  aiCTAText: {
    flex: 1,
    fontSize: 14,
    color: Colors.darkText,
    fontWeight: '500',
  },
  aiCTABtn: {
    backgroundColor: Colors.primaryTeal,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    gap: 6,
  },
  aiCTABtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
