// Shared UI primitives: SkeletonBox, StatusChip, SectionHeader, Divider, EmptyState
// TODO: Ralph
import { View, Text, StyleSheet } from 'react-native';

export function SkeletonBox({ width = '100%', height = 20 }: { width?: number | string; height?: number }) {
  return <View style={[styles.skeleton, { width: width as number, height }]} />;
}

export function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color }]}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.header}>{title}</Text>;
}

export function Divider() {
  return <View style={styles.divider} />;
}

export function EmptyState({ message }: { message: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: { backgroundColor: '#E0EFEF', borderRadius: 8, marginVertical: 4 },
  chip: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 9999 },
  chipText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  header: { fontSize: 13, fontWeight: '700', color: '#8F9BB3', textTransform: 'uppercase', marginBottom: 8 },
  divider: { height: 1, backgroundColor: '#E0EFEF', marginVertical: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyText: { color: '#8F9BB3', fontSize: 14, textAlign: 'center' },
});
