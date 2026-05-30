import { useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';
import { useLocationStore } from '../stores/locationStore';
import type { SupportedCity } from '../stores/locationStore';
 
// ─── Constants ────────────────────────────────────────────────────────────────
 
// Poll GPS every 30 seconds when in live mode
const GPS_POLL_INTERVAL_MS = 30_000;
 
// Default city shown on map before user picks one (onboarding Step 3b)
const DEFAULT_CITY: SupportedCity = 'Nairobi';
 
// ─── useLocation ──────────────────────────────────────────────────────────────
//
// Responsibilities:
//   1. Request Expo Location foreground permission on mount
//   2. If granted  → start GPS polling, call switchToGPSMode on each fix
//   3. If denied   → call switchToCityMode with DEFAULT_CITY
//   4. Subscribe to NetInfo → drive isLive (Live / Saved badge)
//   5. Clean up all subscriptions on unmount
//
// Called once from _layout.tsx so it runs for the entire app lifetime.
// Ralph, Ted, and Liz read state from locationStore — they never call
// this hook directly.
 
export function useLocation() {
  const {
    switchToGPSMode,
    switchToCityMode,
    setIsLive,
  } = useLocationStore();
 
  // Keep a ref to the GPS polling interval so we can clear it on unmount
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
 
  // ── GPS Permission + Polling ───────────────────────────────────────────────
 
  async function requestAndStartGPS() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
 
      if (status === 'granted') {
        // Permission granted — get an immediate fix then start polling
        await pollGPS();
        gpsIntervalRef.current = setInterval(pollGPS, GPS_POLL_INTERVAL_MS);
      } else {
        // Permission denied — fall back to city selector (onboarding Step 3b)
        switchToCityMode(DEFAULT_CITY);
      }
    } catch {
      // If anything goes wrong with location request, fall back gracefully
      switchToCityMode(DEFAULT_CITY);
    }
  }
 
  async function pollGPS() {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      switchToGPSMode({
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      });
    } catch {
      // GPS fix failed (device indoors, etc.) — don't crash, keep last known coords
    }
  }
 
  // ── NetInfo Subscription ───────────────────────────────────────────────────
  //
  // Drives the Live / Saved badge on Tab 2 header and anywhere
  // LiveSavedBadge (Liz's component) is used.
  // isConnected can be null on first emission — treat null as offline.
 
  function subscribeToNetInfo() {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsLive(state.isConnected === true);
    });
    return unsubscribe;
  }
 
  // ── Effect ─────────────────────────────────────────────────────────────────
 
  useEffect(() => {
    // Start GPS flow
    requestAndStartGPS();
 
    // Start NetInfo listener
    const unsubscribeNetInfo = subscribeToNetInfo();
 
    // Cleanup on unmount
    return () => {
      if (gpsIntervalRef.current) {
        clearInterval(gpsIntervalRef.current);
        gpsIntervalRef.current = null;
      }
      unsubscribeNetInfo();
    };
  }, []); // runs once on mount — app lifetime scope
}
 
// ─── useCitySelector ──────────────────────────────────────────────────────────
//
// Thin helper hook for the city selector UI (onboarding Step 3b + Tab 1 pill).
// Ralph / Ted call this when the user picks a city from the dropdown.
// Separated so city changes don't re-run the GPS/NetInfo effect.
 
export function useCitySelector() {
  const setCity = useLocationStore((s) => s.setCity);
  const city = useLocationStore((s) => s.city);
  const hasPermission = useLocationStore((s) => s.hasPermission);
 
  function selectCity(city: SupportedCity) {
    setCity(city);
  }
 
  return {
    city,
    hasPermission,
    selectCity,
    cities: ['Nairobi', 'Mombasa', 'Kisumu'] as SupportedCity[],
  };
}
 
