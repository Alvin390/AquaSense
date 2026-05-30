import React, { useEffect } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface Alert {
  type: 'ph_critical' | 'flood_high' | 'water_scarce';
  sourceName: string;
}

interface Props {
  alert: Alert | null;
  onPress?: () => void;
}

const MESSAGES: Record<string, string> = {
  ph_critical: 'Critical pH levels',
  flood_high: 'High flood risk nearby',
  water_scarce: 'Water scarcity alert',
};

export function AlertBanner({ alert, onPress }: Props) {
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (alert) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 220 });
    } else {
      translateY.value = withTiming(-80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [alert]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!alert) return null;

  return (
    <Animated.View style={[styles.banner, animStyle]}>
      <TouchableOpacity style={styles.inner} onPress={onPress} activeOpacity={0.85}>
        <Ionicons name="warning" size={18} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.text} numberOfLines={1}>
          {MESSAGES[alert.type]} — {alert.sourceName}
        </Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.dangerRed,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  icon: { marginRight: 8 },
  text: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});
