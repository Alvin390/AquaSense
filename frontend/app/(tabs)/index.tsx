import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { getActiveAlerts } from '@/services/api';

interface ActiveAlert {
  type: 'ph_critical' | 'flood_high' | 'water_scarce';
  sourceName: string;
}

interface SourceItem {
  id: number;
  name: string;
  source_type: string;
  latitude: number;
  longitude: number;
  city?: string;
  risk_label?: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE' | null;
}
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AquaSenseMap } from '@/components/MapView';
import { AlertBanner } from '@/components/AlertBanner';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useWaterStore } from '@/stores/waterStore';
import { useLocationStore } from '@/stores/locationStore';
import { useWaterSources } from '@/hooks/useWaterData';

// Demo Nairobi water sources (fallback when API not yet connected)
const DEMO_SOURCES: SourceItem[] = [
  { id: 1, name: 'Nairobi River — Westlands Crossing', source_type: 'river', latitude: -1.2676, longitude: 36.8039, city: 'Nairobi', risk_label: 'USE_WITH_CAUTION' },
  { id: 2, name: 'Athi River — Mavoko Intake', source_type: 'river', latitude: -1.4378, longitude: 36.9563, city: 'Nairobi', risk_label: 'SAFE' },
  { id: 3, name: 'Mathare River — Mathare North', source_type: 'river', latitude: -1.2598, longitude: 36.8598, city: 'Nairobi', risk_label: 'DO_NOT_USE' },
  { id: 4, name: 'Ngong River — Lower Kabete', source_type: 'river', latitude: -1.2981, longitude: 36.7423, city: 'Nairobi', risk_label: 'USE_WITH_CAUTION' },
  { id: 5, name: 'Ruiru Reservoir', source_type: 'reservoir', latitude: -1.1471, longitude: 36.9607, city: 'Nairobi', risk_label: 'SAFE' },
  { id: 6, name: 'Nairobi River — CBD Section', source_type: 'river', latitude: -1.2865, longitude: 36.8241, city: 'Nairobi', risk_label: 'DO_NOT_USE' },
];

const RISK_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  SAFE: { label: 'SAFE', color: Colors.safeGreen, bg: Colors.safeGreen + '20' },
  USE_WITH_CAUTION: { label: 'CAUTION', color: Colors.cautionAmber, bg: Colors.cautionAmber + '20' },
  DO_NOT_USE: { label: 'UNSAFE', color: Colors.dangerRed, bg: Colors.dangerRed + '20' },
};

const DEMO_STATS: Record<number, { ph: string; flood: string; level: string }> = {
  1: { ph: '7.4 pH', flood: '38% — Moderate', level: 'Normal Flow' },
  2: { ph: '7.1 pH', flood: '18% — Low', level: 'Normal Flow' },
  3: { ph: '5.8 pH', flood: '71% — Severe', level: 'Flooded' },
  4: { ph: '7.6 pH', flood: '44% — Moderate', level: 'Low Level' },
  5: { ph: '7.2 pH', flood: '12% — Low', level: 'Normal Flow' },
  6: { ph: '6.1 pH', flood: '66% — High', level: 'Normal Flow' },
};

export default function MapScreen() {
  const router = useRouter();
  const { setSelectedSource } = useWaterStore();
  const { hasPermission, userLocation, city: selectedCity, setCity } = useLocationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFloodOverlay, setShowFloodOverlay] = useState(false);
  const [showRainfallOverlay, setShowRainfallOverlay] = useState(false);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [selectedSource, setSelectedSourceLocal] = useState<SourceItem | null>(null);
  const [activeAlert, setActiveAlert] = useState<ActiveAlert | null>(null);
  const [showSafeWater, setShowSafeWater] = useState(false);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAlerts = useCallback(async () => {
    const lat = userLocation?.lat ?? -1.2921;
    const lng = userLocation?.lng ?? 36.8219;
    try {
      const alerts = await getActiveAlerts(lat, lng, 25);
      if (alerts.length > 0) {
        const first = alerts[0] as any;
        setActiveAlert({ type: first.alert_type, sourceName: first.source_name });
      } else {
        setActiveAlert(null);
      }
    } catch {
      // silently fail — banner stays hidden on network error
    }
  }, [userLocation]);

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000); // re-check every 5 min
    return () => clearInterval(interval);
  }, [fetchAlerts]);

  const { data: apiSources } = useWaterSources(selectedCity ?? undefined);
  const sources = (apiSources as any[]) ?? DEMO_SOURCES;

  // Feature 2 — Find Safe Water: sort SAFE sources by distance from user
  const safeSources = useMemo(() => {
    const refLat = userLocation?.lat ?? -1.2921;
    const refLng = userLocation?.lng ?? 36.8219;
    return [...sources]
      .filter((s) => s.risk_label === 'SAFE')
      .map((s) => {
        const dLat = (s.latitude - refLat) * Math.PI / 180;
        const dLng = (s.longitude - refLng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2
          + Math.cos(refLat * Math.PI / 180) * Math.cos(s.latitude * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
        const distKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return { ...s, distKm };
      })
      .sort((a, b) => a.distKm - b.distKm);
  }, [sources, userLocation]);

  const filteredSources = useMemo(() => {
    if (!searchQuery.trim()) return sources;
    const q = searchQuery.toLowerCase();
    return sources.filter((s: typeof DEMO_SOURCES[0]) => s.name.toLowerCase().includes(q));
  }, [sources, searchQuery]);

  function handleSearch(text: string) {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      // debounced search fires at 400ms
    }, 400);
  }

  function handleMarkerPress(source: typeof DEMO_SOURCES[0]) {
    setSelectedSourceLocal(source);
  }

  function handleViewDetails() {
    if (!selectedSource) return;
    setSelectedSource(selectedSource.id);
    setSelectedSourceLocal(null);
    router.push('/(tabs)/quality');
  }


  const CITIES = ['Nairobi', 'Mombasa', 'Kisumu'] as const;

  return (
    <View style={styles.root}>
      {/* Full-bleed map */}
      <AquaSenseMap
        sources={filteredSources}
        userCoords={hasPermission ? userLocation : null}
        onMarkerPress={handleMarkerPress}
        showFloodOverlay={showFloodOverlay}
        showRainfallOverlay={showRainfallOverlay}
      />

      {/* Alert banner — conditional */}
      <AlertBanner alert={activeAlert} onPress={() => router.push('/(tabs)/recommendations')} />

      {/* Search bar */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none">
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={Colors.secondaryText} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search water sources…"
              placeholderTextColor={Colors.secondaryText}
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
          </View>

          {/* Layer toggle button */}
          <TouchableOpacity
            style={[styles.layerBtn, showLayerPanel && styles.layerBtnActive]}
            onPress={() => setShowLayerPanel((v) => !v)}
            activeOpacity={0.8}
          >
            <Ionicons name="layers" size={18} color={showLayerPanel ? Colors.primaryTeal : Colors.darkText} />
          </TouchableOpacity>
        </View>

        {/* City fallback selector (shown when GPS denied) */}
        {!hasPermission && (
          <View style={styles.cityRow}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
                onPress={() => setCity(city)}
                activeOpacity={0.75}
              >
                <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextActive]}>
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Layer overlay panel */}
        {showLayerPanel && (
          <View style={styles.layerPanel}>
            <Text style={styles.layerTitle}>Map Layers</Text>
            <LayerToggle
              label="Flood Risk Heatmap"
              icon="warning"
              active={showFloodOverlay}
              color={Colors.dangerRed}
              onToggle={() => setShowFloodOverlay((v) => !v)}
            />
            <LayerToggle
              label="Rainfall Intensity"
              icon="rainy"
              active={showRainfallOverlay}
              color={Colors.primaryTeal}
              onToggle={() => setShowRainfallOverlay((v) => !v)}
            />
          </View>
        )}
      </SafeAreaView>

      {/* Bottom sheet popup */}
      <Modal
        visible={selectedSource !== null}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setSelectedSourceLocal(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setSelectedSourceLocal(null)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            {selectedSource && (
              <>
                <View style={styles.sheetHandle} />

                <Text style={styles.sheetSourceName} numberOfLines={2}>
                  {selectedSource.name}
                </Text>

                {selectedSource.risk_label && (
                  <View
                    style={[
                      styles.riskBadge,
                      { backgroundColor: RISK_BADGE[selectedSource.risk_label]?.bg },
                    ]}
                  >
                    <View
                      style={[
                        styles.riskDot,
                        { backgroundColor: RISK_BADGE[selectedSource.risk_label]?.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.riskLabel,
                        { color: RISK_BADGE[selectedSource.risk_label]?.color },
                      ]}
                    >
                      {RISK_BADGE[selectedSource.risk_label]?.label}
                    </Text>
                  </View>
                )}

                <View style={styles.statsRow}>
                  <StatPill icon="flask" label="pH" value={DEMO_STATS[selectedSource.id]?.ph ?? '—'} />
                  <StatPill icon="rainy" label="Flood" value={DEMO_STATS[selectedSource.id]?.flood ?? '—'} />
                  <StatPill icon="water" label="Level" value={DEMO_STATS[selectedSource.id]?.level ?? '—'} />
                </View>

                <TouchableOpacity style={styles.detailsBtn} onPress={handleViewDetails} activeOpacity={0.85}>
                  <Text style={styles.detailsBtnText}>View Full Details</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Feature 2 — Find Safe Water floating button */}
      <TouchableOpacity
        style={styles.safeWaterBtn}
        onPress={() => setShowSafeWater(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="search-circle" size={22} color="#FFFFFF" />
        <Text style={styles.safeWaterBtnText}>Find Safe Water Near Me</Text>
      </TouchableOpacity>

      {/* Safe Water results modal */}
      <Modal
        visible={showSafeWater}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSafeWater(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSafeWater(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.safeWaterTitle}>Safe Water Sources Near You</Text>
            {safeSources.length === 0 ? (
              <Text style={styles.safeWaterEmpty}>No SAFE sources found in current data. Check back after the next satellite refresh.</Text>
            ) : (
              safeSources.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.safeSourceRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedSource(s.id);
                    setShowSafeWater(false);
                    router.push('/(tabs)/quality');
                  }}
                >
                  <View style={styles.safeSourceDot} />
                  <View style={styles.safeSourceInfo}>
                    <Text style={styles.safeSourceName} numberOfLines={1}>{s.name}</Text>
                    <Text style={styles.safeSourceDist}>
                      {s.distKm < 1 ? `${Math.round(s.distKm * 1000)} m away` : `${s.distKm.toFixed(1)} km away`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.primaryTeal} />
                </TouchableOpacity>
              ))
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function LayerToggle({
  label,
  icon,
  active,
  color,
  onToggle,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  color: string;
  onToggle: () => void;
}) {
  return (
    <TouchableOpacity style={styles.layerRow} onPress={onToggle} activeOpacity={0.75}>
      <Ionicons name={icon} size={16} color={active ? color : Colors.secondaryText} />
      <Text style={[styles.layerLabel, active && { color }]}>{label}</Text>
      <View style={[styles.toggle, active && { backgroundColor: color }]}>
        <View style={[styles.toggleThumb, active && styles.toggleThumbOn]} />
      </View>
    </TouchableOpacity>
  );
}

function StatPill({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.statPill}>
      <Ionicons name={icon} size={13} color={Colors.secondaryText} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'android' ? 36 : 0,
    paddingHorizontal: Spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.darkText,
  },
  layerBtn: {
    width: 46,
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  layerBtnActive: { borderWidth: 1.5, borderColor: Colors.primaryTeal },
  cityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cityChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0EFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cityChipActive: { backgroundColor: Colors.primaryTeal, borderColor: Colors.primaryTeal },
  cityChipText: { fontSize: 14, fontWeight: '600', color: Colors.darkText },
  cityChipTextActive: { color: '#FFFFFF' },
  layerPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  layerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  layerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  layerLabel: { flex: 1, fontSize: 14, color: Colors.darkText, fontWeight: '500' },
  toggle: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#E0EFEF',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(26,46,53,0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#D0E8ED',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetSourceName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.darkText,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    marginBottom: Spacing.md,
    gap: 6,
  },
  riskDot: { width: 7, height: 7, borderRadius: 3.5 },
  riskLabel: { fontSize: 14, fontWeight: '800', letterSpacing: 0.8 },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statPill: {
    flex: 1,
    backgroundColor: Colors.backgroundWhite,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    gap: 3,
  },
  statLabel: { fontSize: 14, color: Colors.secondaryText, fontWeight: '600' },
  statValue: { fontSize: 14, color: Colors.darkText, fontWeight: '700', textAlign: 'center' },
  detailsBtn: {
    backgroundColor: Colors.primaryTeal,
    borderRadius: Radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  detailsBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  // Feature 2 — Find Safe Water
  safeWaterBtn: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.safeGreen,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  safeWaterBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  safeWaterTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.darkText,
    marginBottom: Spacing.md,
  },
  safeWaterEmpty: {
    fontSize: 14,
    color: Colors.secondaryText,
    lineHeight: 20,
    paddingVertical: Spacing.md,
  },
  safeSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F4F8',
    gap: 12,
  },
  safeSourceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.safeGreen,
  },
  safeSourceInfo: { flex: 1 },
  safeSourceName: { fontSize: 15, fontWeight: '600', color: Colors.darkText },
  safeSourceDist: { fontSize: 14, color: Colors.secondaryText },
});
