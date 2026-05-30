import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
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

const MARKER_COLOR: Record<string, string> = {
  SAFE: Colors.safeGreen,
  USE_WITH_CAUTION: Colors.cautionAmber,
  DO_NOT_USE: Colors.dangerRed,
};

export function AquaSenseMap({
  sources,
  userCoords,
  onMarkerPress,
  showFloodOverlay = false,
  showRainfallOverlay = false,
}: Props) {
  const mapRef = useRef<MapView>(null);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');

  const initialRegion = {
    latitude: userCoords?.lat ?? -1.2921,
    longitude: userCoords?.lng ?? 36.8219,
    latitudeDelta: 0.15,
    longitudeDelta: 0.15,
  };

  function toggleMapType() {
    setMapType((t) => (t === 'standard' ? 'satellite' : 'standard'));
  }

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        mapType={mapType}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {/* Live GPS pulsing dot */}
        {userCoords && (
          <>
            <Circle
              center={{ latitude: userCoords.lat, longitude: userCoords.lng }}
              radius={300}
              strokeColor={Colors.primaryTeal}
              fillColor="rgba(10,126,164,0.15)"
              strokeWidth={1.5}
            />
            <Marker
              coordinate={{ latitude: userCoords.lat, longitude: userCoords.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
              flat
            >
              <View style={styles.gpsDot}>
                <View style={styles.gpsDotInner} />
              </View>
            </Marker>
          </>
        )}

        {/* Water source markers */}
        {sources.map((source) => {
          const color = source.risk_label
            ? MARKER_COLOR[source.risk_label] ?? Colors.secondaryText
            : Colors.secondaryText;
          return (
            <Marker
              key={source.id}
              coordinate={{ latitude: source.latitude, longitude: source.longitude }}
              onPress={() => onMarkerPress(source)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={[styles.markerPin, { backgroundColor: color }]}>
                <View style={styles.markerInner} />
              </View>
            </Marker>
          );
        })}

        {/* Flood risk overlay circles */}
        {showFloodOverlay &&
          sources.map((source) => (
            <Circle
              key={`flood-${source.id}`}
              center={{ latitude: source.latitude, longitude: source.longitude }}
              radius={600}
              strokeColor={Colors.dangerRed}
              fillColor="rgba(231,76,60,0.12)"
              strokeWidth={1}
            />
          ))}

        {/* Rainfall overlay circles */}
        {showRainfallOverlay &&
          sources.map((source) => (
            <Circle
              key={`rain-${source.id}`}
              center={{ latitude: source.latitude, longitude: source.longitude }}
              radius={900}
              strokeColor={Colors.primaryTeal}
              fillColor="rgba(10,126,164,0.09)"
              strokeWidth={1}
            />
          ))}
      </MapView>

      {/* Map type toggle */}
      <TouchableOpacity style={styles.mapTypeBtn} onPress={toggleMapType} activeOpacity={0.8}>
        <Ionicons
          name={mapType === 'standard' ? 'earth-outline' : 'map-outline'}
          size={18}
          color={Colors.darkText}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  map: { flex: 1 },
  gpsDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(10,126,164,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryTeal,
  },
  gpsDotInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primaryTeal,
  },
  markerPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  markerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  mapTypeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
