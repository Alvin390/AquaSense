import { create } from 'zustand';
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export interface WaterSource {
  id: number;
  name: string;
  source_type: 'river' | 'borehole' | 'reservoir' | 'tap';
  latitude: number;
  longitude: number;
  city: 'Nairobi' | 'Mombasa' | 'Kisumu' | 'Nyeri';
  is_demo_seed: boolean;
  created_at: string;
}
 
export interface WaterReading {
  id: number;
  source_id: number;
  ph: number;
  turbidity: number;
  flood_risk_pct: number;           // 0.0 – 100.0
  water_level: 'Normal' | 'Low' | 'Very Low' | 'Flooded' | 'Dry';
  rainfall_mm: number;              // last 24h
  dissolved_oxygen: number;
  pollution_index: number | null;
  ndwi: number;                     // raw Sentinel-2 index
  data_source: 'sentinel_hub' | 'seeded' | 'cached';
  fetched_at: string;               // ISO timestamp
}
 
export interface AIRecommendation {
  risk_label: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE';
  summary: string;
  recommendations: string[];
  data_drivers: string[];
  quality_score: number;            // 0 – 100
  quantity_score: number;           // 0 – 100
  generated_at: string;             // ISO timestamp
}
 
// ─── Store Interface ──────────────────────────────────────────────────────────
 
interface WaterStore {
  // State — consumed by Ralph, Ted, Liz
  selectedSourceId: number | null;
  waterSources: WaterSource[];
  readings: Record<number, WaterReading>;           // keyed by source_id
  recommendations: Record<number, AIRecommendation>; // keyed by source_id
 
  // Actions
  setSelectedSource: (id: number | null) => void;
  setSources: (sources: WaterSource[]) => void;
  updateReadings: (reading: WaterReading) => void;
  updateRecommendation: (sourceId: number, ai: AIRecommendation) => void;
  clearStore: () => void;
}
 
// ─── Store ────────────────────────────────────────────────────────────────────
 
export const useWaterStore = create<WaterStore>((set) => ({
  // Initial state
  selectedSourceId: null,
  waterSources: [],
  readings: {},
  recommendations: {},
 
  // Select a source — used by map marker tap to pre-load Tab 2 / Tab 3
  setSelectedSource: (id) =>
    set({ selectedSourceId: id }),
 
  // Populate the full sources list from GET /sources
  setSources: (sources) =>
    set({ waterSources: sources }),
 
  // Cache a single latest reading from GET /sources/{id}/latest
  // Keyed by source_id so Tab 2 can look it up instantly
  updateReadings: (reading) =>
    set((state) => ({
      readings: {
        ...state.readings,
        [reading.source_id]: reading,
      },
    })),
 
  // Cache the AI recommendation alongside its reading
  // Alvin's ai_service.py output arrives pre-packaged inside the API response
  updateRecommendation: (sourceId, ai) =>
    set((state) => ({
      recommendations: {
        ...state.recommendations,
        [sourceId]: ai,
      },
    })),
 
  // Full reset — used on logout or city switch
  clearStore: () =>
    set({
      selectedSourceId: null,
      waterSources: [],
      readings: {},
      recommendations: {},
    }),
}));