// LiveSavedBadge: LIVE (teal) or Saved (grey) data freshness pill
// "Saved" = offline/stale — never say "Cached" in user-facing text
// TODO: Ralph
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  isLive: boolean;
  hoursAgo?: number;
}

export function LiveSavedBadge({ isLive, hoursAgo }: Props) {
  const label = isLive ? 'Live' : hoursAgo ? `Saved · ${hoursAgo}h ago` : 'Saved';
  const color = isLive ? '#0A7EA4' : '#8F9BB3';
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999 },
  text: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
