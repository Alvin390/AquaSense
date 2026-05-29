// Tab 3: AI Recommendations Screen
// Owner: Ralph (UI/layout) + Alex (data wiring)
// Shows: overall risk label banner, AI summary paragraph, action bullet list,
//        data transparency line, share button
// Data source: GET /sources/{id}/latest → ai_recommendation fields
import { View, Text, StyleSheet } from 'react-native';

export default function RecommendationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>AI Recommendations — TODO: Ralph + Alex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4FEFF' },
  placeholder: { color: '#8F9BB3', fontSize: 15 },
});
