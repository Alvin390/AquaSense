// AquaSenseMap: full-bleed react-native-maps MapView, source markers,
// GPS pin, satellite/standard toggle, search bar, overlay controls
// TODO: Ralph (layout) + Alex (data)
import { View, Text, StyleSheet } from 'react-native';

export function AquaSenseMap() {
  return (
    <View style={styles.root}>
      <Text style={styles.label}>Map placeholder</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E0EFEF' },
  label: { color: '#8F9BB3' },
});
