// QualityCard: single water quality parameter card
// Shows: parameter name, value + unit, status chip, fill bar, safe range note
// TODO: Ralph (design) + Alex (data)
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value: string;
  status: 'SAFE' | 'CAUTION' | 'UNSAFE';
  unit?: string;
}

const STATUS_COLOR = { SAFE: '#27AE60', CAUTION: '#F39C12', UNSAFE: '#E74C3C' };

export function QualityCard({ label, value, status, unit }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}{unit ? ` ${unit}` : ''}</Text>
      <View style={[styles.chip, { backgroundColor: STATUS_COLOR[status] }]}>
        <Text style={styles.chipText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: 8 },
  label: { fontSize: 13, color: '#8F9BB3', marginBottom: 4 },
  value: { fontSize: 20, fontWeight: 'bold', color: '#1A2E35', marginBottom: 8 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999 },
  chipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
