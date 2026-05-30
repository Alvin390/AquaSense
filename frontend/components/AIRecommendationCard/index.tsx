// TED file/location: frontend/components/AIRecommendationCard/index.tsx
// Contract: Tab 3 imports this card for one AI recommendation bullet.
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

export type RecommendationIconType = 'BOIL' | 'FILTER' | 'AVOID' | 'SAFE' | 'CHECK';

interface AIRecommendationCardProps {
  text: string;
  iconType: RecommendationIconType;
}

const ICON_LABEL: Record<RecommendationIconType, string> = {
  BOIL: 'B',
  FILTER: 'F',
  AVOID: '!',
  SAFE: 'OK',
  CHECK: '?',
};

const ICON_COLOR: Record<RecommendationIconType, string> = {
  BOIL: Colors.cautionAmber,
  FILTER: Colors.primaryTeal,
  AVOID: Colors.dangerRed,
  SAFE: Colors.safeGreen,
  CHECK: Colors.secondaryText,
};

export function AIRecommendationCard({ text, iconType }: AIRecommendationCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: ICON_COLOR[iconType] }]}>
        <Text style={styles.iconText}>{ICON_LABEL[iconType]}</Text>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'flex-start',
    backgroundColor: Colors.backgroundWhite,
    borderColor: Colors.skeletonBase,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  icon: {
    alignItems: 'center',
    borderRadius: 16,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  iconText: {
    color: Colors.cardBackground,
    fontSize: 14,
    fontWeight: '900',
  },
  text: {
    color: Colors.darkText,
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
});
