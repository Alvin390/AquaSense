// TED file/location: frontend/components/LiveSavedBadge/index.tsx
// Contract: Ralph imports this freshness badge for Tab 2 headers.
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';
import { formatRelativeTime } from '@/utils/formatters';

interface LiveSavedBadgeProps {
  isLive: boolean;
  lastUpdated: string;
}

export function LiveSavedBadge({ isLive, lastUpdated }: LiveSavedBadgeProps) {
  const label = isLive ? 'Live' : `Saved · ${formatRelativeTime(lastUpdated)}`;
  const color = isLive ? Colors.primaryTeal : Colors.cautionAmber;

  return (
    <View accessibilityLabel={label} style={styles.badge}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.cardBackground,
    borderColor: Colors.skeletonBase,
    borderRadius: 9999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  text: {
    color: Colors.darkText,
    fontSize: 14,
    fontWeight: '700',
  },
});
