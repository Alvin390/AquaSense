// AlertBanner: red slide-down banner when active alert exists for nearby source
// Tapping navigates to Tab 3 (Recommendations)
// TODO: Ralph — add Reanimated spring entry animation
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  alertType: 'ph_critical' | 'flood_high' | 'water_scarce';
  sourceName: string;
  onPress?: () => void;
}

const MESSAGES: Record<string, string> = {
  ph_critical: 'Critical pH detected',
  flood_high: 'High flood risk nearby',
  water_scarce: 'Water scarcity alert',
};

export function AlertBanner({ alertType, sourceName, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.banner} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.text}>{MESSAGES[alertType]} — {sourceName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#E74C3C', paddingHorizontal: 16, paddingVertical: 12 },
  text: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
