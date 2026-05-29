// GaugeChart: circular arc gauge for Water Quality Score / Water Quantity Score (0–100)
// Colors: green (≥75) → amber (≥45) → red (<45)
// TODO: Ralph — implement arc with react-native-svg
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  score: number;
  label: string;
}

function scoreColor(s: number) {
  if (s >= 75) return '#27AE60';
  if (s >= 45) return '#F39C12';
  return '#E74C3C';
}

export function GaugeChart({ score, label }: Props) {
  return (
    <View style={styles.container}>
      <Text style={[styles.score, { color: scoreColor(score) }]}>{score}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 16 },
  score: { fontSize: 40, fontWeight: 'bold' },
  label: { fontSize: 13, color: '#8F9BB3', marginTop: 4 },
});
