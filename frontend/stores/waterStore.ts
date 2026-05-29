import { create } from 'zustand';

interface WaterSource {
  id: number;
  name: string;
  source_type: string;
  latitude: number;
  longitude: number;
  city: string;
}

interface WaterReading {
  id: number;
  source_id: number;
  ph: number;
  turbidity: number;
  flood_risk_pct: number;
  water_level: string;
  ndwi: number;
  data_source: string;
  fetched_at: string;
}

interface AIRecommendation {
  risk_label: 'SAFE' | 'USE_WITH_CAUTION' | 'DO_NOT_USE';
  summary: string;
  recommendations: string[];
  data_drivers: string[];
  quality_score: number;
  quantity_score: number;
  generated_at: string;
}

interface WaterStore {
  selectedSourceId: number | null;
  waterSources: WaterSource[];
  latestReadings: Record<number, WaterReading>;
  aiRecommendations: Record<number, AIRecommendation>;
  setSelectedSource: (id: number | null) => void;
  setSources: (sources: WaterSource[]) => void;
  updateReading: (reading: WaterReading) => void;
  updateRecommendation: (sourceId: number, ai: AIRecommendation) => void;
  clearAll: () => void;
}

export const useWaterStore = create<WaterStore>((set) => ({
  selectedSourceId: null,
  waterSources: [],
  latestReadings: {},
  aiRecommendations: {},
  setSelectedSource: (id) => set({ selectedSourceId: id }),
  setSources: (sources) => set({ waterSources: sources }),
  updateReading: (reading) =>
    set((state) => ({ latestReadings: { ...state.latestReadings, [reading.source_id]: reading } })),
  updateRecommendation: (sourceId, ai) =>
    set((state) => ({ aiRecommendations: { ...state.aiRecommendations, [sourceId]: ai } })),
  clearAll: () => set({ selectedSourceId: null, waterSources: [], latestReadings: {}, aiRecommendations: {} }),
}));
