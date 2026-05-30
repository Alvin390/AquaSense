import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '@/constants/theme';

interface Props {
  isLive: boolean;
  hoursAgo?: number;
  lastUpdated?: string;
}

export function LiveSavedBadge({ isLive, hoursAgo, lastUpdated }: Props) {
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isLive) {
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.6, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        false
      );
      pulseOpacity.value = withRepeat(
        withSequence(withTiming(0, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        false
      );
    }
  }, [isLive]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  const displayHours = hoursAgo !== undefined && hoursAgo !== null
    ? hoursAgo
    : lastUpdated
      ? Math.round((Date.now() - new Date(lastUpdated).getTime()) / 3_600_000)
      : null;

  const timeStr = displayHours !== null ? `${displayHours}h ago` : 'recently';
  const label = isLive ? 'Live' : `Saved · ${timeStr}`;
  const dotColor = isLive ? Colors.primaryTeal : Colors.cautionAmber;
  const textColor = isLive ? Colors.primaryTeal : Colors.secondaryText;
  const bg = isLive ? Colors.primaryTeal + '15' : '#F0F0F0';

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={styles.dotWrapper}>
        {isLive && (
          <Animated.View style={[styles.pulse, { backgroundColor: dotColor }, pulseStyle]} />
        )}
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      </View>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    gap: 6,
  },
  dotWrapper: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
