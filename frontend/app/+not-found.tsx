import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Page not found.</Text>
      <Link href="/" style={styles.link}>Go to Map</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4FEFF' },
  title: { fontSize: 20, color: '#1A2E35', marginBottom: 16 },
  link: { color: '#0A7EA4', fontSize: 15 },
});
