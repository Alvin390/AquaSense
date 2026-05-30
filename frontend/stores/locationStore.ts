import { create } from 'zustand';
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export type SupportedCity = 'Nairobi' | 'Mombasa' | 'Kisumu';
 
export interface LatLng {
  lat: number;
  lng: number;
}
 
// ─── Store Interface ──────────────────────────────────────────────────────────
//
// isLive reflects NetInfo connectivity — whether the app can reach the backend.
// It is NOT the same as hasPermission (GPS permission) or GPS mode.
//
// Flow:
//   Permission granted  → hasPermission=true, userLocation set, city=null
//   Permission denied   → hasPermission=false, userLocation=null, city set by user
//   Network online      → isLive=true  (Live badge shown in teal)
//   Network offline     → isLive=false (Saved badge shown in amber)
 
interface LocationStore {
  // GPS state
  userLocation: LatLng | null;
  hasPermission: boolean;
 
  // City fallback — shown when GPS permission is denied (onboarding Step 3b)
  city: SupportedCity | null;
 
  // Network connectivity — drives Live / Saved badge (NetInfo)
  isLive: boolean;
 
  // Actions
  setLocation: (coords: LatLng) => void;
  setPermission: (granted: boolean) => void;
  setCity: (city: SupportedCity) => void;
  setIsLive: (live: boolean) => void;
 
  // Convenience: called when GPS is denied — clears GPS coords, sets city mode
  switchToCityMode: (city: SupportedCity) => void;
 
  // Convenience: called when GPS permission is granted mid-session
  switchToGPSMode: (coords: LatLng) => void;
}
 
// ─── Store ────────────────────────────────────────────────────────────────────
 
export const useLocationStore = create<LocationStore>((set) => ({
  // Initial state — no location, no permission, no city selected yet,
  // assume online until NetInfo says otherwise
  userLocation: null,
  hasPermission: false,
  city: null,
  isLive: true,
 
  // Set live GPS coordinates (Expo Location poll result)
  setLocation: (coords) =>
    set({ userLocation: coords }),
 
  // Called after Expo Location permission result resolves
  setPermission: (granted) =>
    set({ hasPermission: granted }),
 
  // Called when user picks a city from the fallback selector (onboarding Step 3b)
  setCity: (city) =>
    set({ city }),
 
  // Called by NetInfo event listener — drives Live / Saved badge
  setIsLive: (live) =>
    set({ isLive: live }),
 
  // GPS permission denied path:
  //   clear any stale coordinates, mark no permission, set city fallback
  switchToCityMode: (city) =>
    set({
      hasPermission: false,
      userLocation: null,
      city,
    }),
 
  // GPS permission granted path (can happen mid-session if user enables it):
  //   set coords, mark permission, clear city fallback
  switchToGPSMode: (coords) =>
    set({
      hasPermission: true,
      userLocation: coords,
      city: null,
    }),
}));
 