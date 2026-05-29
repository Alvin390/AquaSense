// Tab 2: Water Quality Details Screen
// Owner: Ralph (UI/layout) + Alex (data wiring)
// Shows: composite quality + quantity score gauges, parameter cards (pH, flood risk,
//        water availability), 7-day trend chart, last-updated timestamp, live/saved badge
import { View, Text, StyleSheet } from 'react-native';

export default function QualityScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Quality Details — TODO: Ralph + Alex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4FEFF' },
  placeholder: { color: '#8F9BB3', fontSize: 15 },
});
