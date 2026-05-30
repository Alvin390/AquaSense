import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Colors } from '@/constants/theme';
import { checkHealth } from '@/services/api';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 60 * 36 },
  },
});

function SplashOverlay({ onDone }: { onDone: () => void }) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoOpacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(onDone, 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splash}>
      <Animated.View style={[styles.logoWrapper, { opacity: logoOpacity }]}>
        {/* Droplet shape built from primitives — no image dependency */}
        <View style={styles.droplet}>
          <View style={styles.dropletCircle} />
          <View style={styles.dropletTip} />
          {/* Signal arcs */}
          <View style={[styles.arc, styles.arc1]} />
          <View style={[styles.arc, styles.arc2]} />
        </View>
        <Text style={styles.appName}>AquaSense</Text>
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        Know your water. Right now.
      </Animated.Text>
    </View>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    checkHealth()
      .then(result => {
        console.log('[AquaSense] ✅ Backend connected —', JSON.stringify(result));
      })
      .catch(err => {
        console.error('[AquaSense] ❌ Backend unreachable —', err.message);
        console.error('[AquaSense] Check EXPO_PUBLIC_API_URL in frontend/.env');
      });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {!splashDone && <SplashOverlay onDone={() => setSplashDone(true)} />}
      {splashDone && <Stack screenOptions={{ headerShown: false }} />}
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.primaryTeal,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  logoWrapper: {
    alignItems: 'center',
    gap: 16,
  },
  droplet: {
    width: 80,
    height: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dropletCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  dropletTip: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  arc: {
    position: 'absolute',
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    borderRadius: 50,
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  arc1: {
    width: 28,
    height: 28,
    top: 22,
    right: 8,
    transform: [{ rotate: '-30deg' }],
  },
  arc2: {
    width: 20,
    height: 20,
    top: 27,
    right: 14,
    transform: [{ rotate: '-30deg' }],
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
