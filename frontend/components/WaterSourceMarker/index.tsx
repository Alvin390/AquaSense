import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface Props {
  status: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | 'NO_DATA';
  name?: string;
}

const COLOR: Record<string, string> = {
  SAFE: Colors.safeGreen,
  USE_WITH_CAUTION: Colors.cautionAmber,
  DO_NOT_USE: Colors.dangerRed,
  NO_DATA: Colors.secondaryText,
};

export function WaterSourceMarker({ status }: Props) {
  const color = COLOR[status] ?? Colors.secondaryText;
  return (
    <View style={[styles.pin, { borderColor: color }]}>
      <View style={[styles.fill, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: Colors.safeGreen,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  fill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
