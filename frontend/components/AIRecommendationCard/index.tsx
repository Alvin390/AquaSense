// AIRecommendationCard: renders Groq/Llama 3 output
// 1. Risk banner (SAFE / USE WITH CAUTION / DO NOT USE)
// 2. Summary paragraph
// 3. Bulleted action list
// TODO: Ralph (design) + Alex (data)
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  riskLabel?: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE';
  summary?: string;
  recommendations?: string[];
}

const BANNER_COLOR: Record<string, string> = {
  SAFE: '#27AE60',
  USE_WITH_CAUTION: '#F39C12',
  DO_NOT_USE: '#E74C3C',
};

export function AIRecommendationCard({ riskLabel, summary, recommendations }: Props) {
  const color = BANNER_COLOR[riskLabel ?? ''] ?? '#8F9BB3';
  return (
    <View style={styles.card}>
      {riskLabel && (
        <View style={[styles.banner, { backgroundColor: color }]}>
          <Text style={styles.bannerText}>{riskLabel.replace(/_/g, ' ')}</Text>
        </View>
      )}
      {summary && <Text style={styles.summary}>{summary}</Text>}
      {recommendations?.map((r, i) => (
        <Text key={i} style={styles.bullet}>• {r}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', margin: 8 },
  banner: { padding: 12 },
  bannerText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  summary: { color: '#1A2E35', fontSize: 14, padding: 16, paddingBottom: 0 },
  bullet: { color: '#1A2E35', fontSize: 14, paddingHorizontal: 16, paddingVertical: 4 },
});
