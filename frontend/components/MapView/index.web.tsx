/**
 * Web-safe MapView stub — react-native-maps is native-only and cannot
 * be bundled for web. Metro resolves this file (.web.tsx) on the web
 * platform instead of index.tsx, preventing the codegenNativeCommands error.
 *
 * The AquaSense demo runs on Expo Go (physical device). This stub keeps
 * the web bundler happy so `npx expo start` works without errors.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/theme';

interface WaterSource {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  source_type: string;
  city?: string;
  risk_label?: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | null;
}

interface UserCoords {
  lat: number;
  lng: number;
}

interface Props {
  sources: WaterSource[];
  userCoords?: UserCoords | null;
  onMarkerPress: (source: WaterSource) => void;
  showFloodOverlay?: boolean;
  showRainfallOverlay?: boolean;
}

export function AquaSenseMap({ sources }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Map view available on mobile (Expo Go)</Text>
      <Text style={styles.sub}>{sources.length} water source{sources.length !== 1 ? 's' : ''} loaded</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: Colors.darkText,
    fontWeight: '600',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    color: Colors.secondaryText,
    textAlign: 'center',
  },
});
