// TrendChart: 7-day line chart for pH / flood risk / water level
// Tab selector to switch between parameters
// TODO: Ralph — implement with react-native-chart-kit
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  data: number[];
  label: string;
}

export function TrendChart({ label }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label} — 7-day trend</Text>
      <Text style={styles.placeholder}>[Chart — TODO: Ralph]</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 8 },
  label: { fontSize: 13, color: '#8F9BB3', marginBottom: 8 },
  placeholder: { color: '#E0EFEF', fontSize: 13 },
});
