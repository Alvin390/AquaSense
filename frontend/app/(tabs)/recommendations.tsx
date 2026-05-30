// TED file/location: frontend/app/(tabs)/recommendations.tsx
// Contract: Tab 3 renders Alvin's AI recommendation output from Fidel's store data.
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { AIRecommendationCard, RecommendationIconType } from '@/components/AIRecommendationCard';
import { LiveSavedBadge } from '@/components/LiveSavedBadge';
import { Colors, Spacing } from '@/constants/theme';
import { useWaterStore } from '@/stores/waterStore';
import { scoreColors } from '@/utils/scoreColors';

type RiskLabel = 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | null;

const NO_DATA_MESSAGE =
  'AI recommendations are not available for this source yet. Check the latest water quality screen or try another source.';

function getIconType(text: string): RecommendationIconType {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('boil')) return 'BOIL';
  if (lowerText.includes('filter')) return 'FILTER';
  if (lowerText.includes('avoid')) return 'AVOID';
  if (lowerText.includes('safe')) return 'SAFE';
  return 'CHECK';
}

function riskColor(riskLabel: RiskLabel) {
  if (riskLabel === 'SAFE') return scoreColors.fromLabel('SAFE');
  if (riskLabel === 'USE_WITH_CAUTION') return scoreColors.fromLabel('USE_WITH_CAUTION');
  if (riskLabel === 'DO_NOT_USE') return scoreColors.fromLabel('DO_NOT_USE');
  return Colors.secondaryText;
}

function riskTitle(riskLabel: RiskLabel) {
  if (riskLabel === 'SAFE') return 'SAFE';
  if (riskLabel === 'USE_WITH_CAUTION') return 'USE WITH CAUTION';
  if (riskLabel === 'DO_NOT_USE') return 'DO NOT USE';
  return 'DATA UNAVAILABLE';
}

export default function RecommendationsScreen() {
  const selectedSourceId = useWaterStore((state) => state.selectedSourceId);
  const waterSources = useWaterStore((state) => state.waterSources);
  const latestReadings = useWaterStore((state) => state.latestReadings);
  const aiRecommendations = useWaterStore((state) => state.aiRecommendations);

  const source = waterSources.find((item) => item.id === selectedSourceId) ?? waterSources[0];
  const sourceId = selectedSourceId ?? source?.id ?? null;
  const recommendation = sourceId === null ? undefined : aiRecommendations[sourceId];
  const reading = sourceId === null ? undefined : latestReadings[sourceId];
  const bannerColor = riskColor(recommendation?.risk_label ?? null);
  const recommendationItems = recommendation?.recommendations ?? [];
  const dataDrivers = recommendation?.data_drivers ?? [];
  const lastUpdated = reading?.fetched_at ?? recommendation?.generated_at ?? new Date().toISOString();

  const shareRecommendation = () => {
    const summary = recommendation?.summary ?? NO_DATA_MESSAGE;
    const actions = recommendationItems.length > 0 ? recommendationItems.join('\n- ') : 'No actions available yet.';

    Share.share({
      message: `${source?.name ?? 'Selected water source'}\n${riskTitle(
        recommendation?.risk_label ?? null,
      )}\n\n${summary}\n\n- ${actions}`,
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.content} style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>AI Recommendations</Text>
        <Text style={styles.title}>{source?.name ?? 'Select a water source'}</Text>
        <LiveSavedBadge isLive={reading?.data_source === 'live'} lastUpdated={lastUpdated} />
      </View>

      <View style={[styles.banner, { backgroundColor: bannerColor }]}>
        <Text style={styles.bannerLabel}>Current guidance</Text>
        <Text style={styles.bannerTitle}>{riskTitle(recommendation?.risk_label ?? null)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summary}>{recommendation?.summary ?? NO_DATA_MESSAGE}</Text>
      </View>

      {recommendationItems.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended actions</Text>
          <View style={styles.cardStack}>
            {recommendationItems.map((item) => (
              <AIRecommendationCard key={item} iconType={getIconType(item)} text={item} />
            ))}
          </View>
        </View>
      )}

      <Text style={styles.transparency}>
        {dataDrivers.length > 0 ? `Based on: ${dataDrivers.join(', ')}` : 'Based on: latest available water data'}
      </Text>

      <Pressable accessibilityRole="button" onPress={shareRecommendation} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Share</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: Colors.backgroundWhite,
    flex: 1,
  },
  content: {
    gap: Spacing.md,
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
  },
  eyebrow: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: Colors.darkText,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  banner: {
    borderRadius: 8,
    gap: 6,
    padding: Spacing.md,
  },
  bannerLabel: {
    color: Colors.cardBackground,
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  bannerTitle: {
    color: Colors.cardBackground,
    fontSize: 24,
    fontWeight: '900',
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    color: Colors.secondaryText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  summary: {
    color: Colors.darkText,
    fontSize: 16,
    lineHeight: 24,
  },
  cardStack: {
    gap: Spacing.sm,
  },
  transparency: {
    color: Colors.secondaryText,
    fontSize: 13,
    lineHeight: 19,
  },
  shareButton: {
    alignItems: 'center',
    backgroundColor: Colors.primaryTeal,
    borderRadius: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: Spacing.md,
  },
  shareButtonText: {
    color: Colors.cardBackground,
    fontSize: 15,
    fontWeight: '900',
  },
});
