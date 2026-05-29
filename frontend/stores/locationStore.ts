import { create } from 'zustand';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationStore {
  permissionGranted: boolean;
  userCoords: Coords | null;
  selectedCity: 'Nairobi' | 'Mombasa' | 'Kisumu';
  isGPSMode: boolean;
  setPermission: (granted: boolean) => void;
  setCoords: (coords: Coords) => void;
  setCity: (city: 'Nairobi' | 'Mombasa' | 'Kisumu') => void;
  switchToGPSMode: () => void;
  switchToCityMode: (city: 'Nairobi' | 'Mombasa' | 'Kisumu') => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  permissionGranted: false,
  userCoords: null,
  selectedCity: 'Nairobi',
  isGPSMode: false,
  setPermission: (granted) => set({ permissionGranted: granted }),
  setCoords: (coords) => set({ userCoords: coords }),
  setCity: (city) => set({ selectedCity: city }),
  switchToGPSMode: () => set({ isGPSMode: true }),
  switchToCityMode: (city) => set({ isGPSMode: false, selectedCity: city }),
}));
