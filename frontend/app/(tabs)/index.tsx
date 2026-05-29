// Tab 1: Map Screen
// Owner: Ralph (UI/layout) + Alex (marker data, GPS, search logic)
// Shows: full-bleed map, color-coded water source markers, live GPS pin,
//        layer overlay controls, search bar, alert banner, marker tap → bottom sheet
import { View, Text, StyleSheet } from 'react-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Map — TODO: Ralph + Alex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4FEFF' },
  placeholder: { color: '#8F9BB3', fontSize: 15 },
});
