import { useQuery } from '@tanstack/react-query';
import {
  getSources,
  getSourceLatest,
  getSourceHistory,
} from '../services/api';
import { useWaterStore } from '../stores/waterStore';
import type { WaterSource, WaterReading } from '../stores/waterStore';
import type { SourceDetail } from '../services/api';
 
// ─── Cache Config ─────────────────────────────────────────────────────────────
//
// 36 hours — matches the backend's satellite fetch cycle exactly.
// Data is considered fresh for 36h. Background refetch on app focus.
// MMKV persistence (wired in _layout.tsx) means this survives app restarts.
 
const STALE_TIME = 1000 * 60 * 60 * 36; // 36 hours in ms
const GC_TIME = 1000 * 60 * 60 * 36;    // keep in cache for 36 hours too
 
// ─── Query Keys ───────────────────────────────────────────────────────────────
//
// Centralised here so Ralph, Ted, and Liz can import them for cache invalidation
// without hardcoding strings.
 
export const waterQueryKeys = {
  sources: (city?: string) => ['sources', city ?? 'all'] as const,
  sourceDetail: (id: number) => ['source', id, 'latest'] as const,
  sourceHistory: (id: number, days: number) => ['source', id, 'history', days] as const,
};
 
// ─── useWaterSources ──────────────────────────────────────────────────────────
//
// Fetches all water source markers for the map.
// Also writes results into waterStore so Tab 1 markers stay in sync.
// city is optional — if undefined, all sources are returned.
 
export function useWaterSources(city?: string) {
  const setSources = useWaterStore((s) => s.setSources);
 
  return useQuery<WaterSource[], Error>({
    queryKey: waterQueryKeys.sources(city),
    queryFn: async () => {
      const sources = await getSources(city);
      setSources(sources); // sync into Zustand for map markers
      return sources;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    // Empty array on error — no crash, just empty map
    placeholderData: [],
  });
}
 
// ─── useSourceDetail ──────────────────────────────────────────────────────────
//
// Fetches the latest reading + AI recommendation for a single source.
// Alvin's ai_recommendation comes pre-packaged inside the response —
// we unpack it and write both reading and recommendation into waterStore.
// Used by Tab 2 (reading) and Tab 3 (ai_recommendation).
 
export function useSourceDetail(sourceId: number) {
  const updateReadings = useWaterStore((s) => s.updateReadings);
  const updateRecommendation = useWaterStore((s) => s.updateRecommendation);
 
  return useQuery<SourceDetail, Error>({
    queryKey: waterQueryKeys.sourceDetail(sourceId),
    queryFn: async () => {
      const detail = await getSourceLatest(sourceId);
      // Cache reading and AI rec into Zustand for instant Tab 2/3 access
      updateReadings(detail.reading);
      updateRecommendation(sourceId, detail.ai_recommendation);
      return detail;
    },
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    // Only fetch when a source is actually selected
    enabled: sourceId > 0,
  });
}
 
// ─── useSourceHistory ─────────────────────────────────────────────────────────
//
// Fetches 7-day trend data for the Tab 2 historical chart.
// days defaults to 7 — matches the backend's history endpoint default.
 
export function useSourceHistory(sourceId: number, days: number = 7) {
  return useQuery<WaterReading[], Error>({
    queryKey: waterQueryKeys.sourceHistory(sourceId, days),
    queryFn: () => getSourceHistory(sourceId, days),
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: true,
    enabled: sourceId > 0,
    // Empty array on error — trend chart shows empty state, no crash
    placeholderData: [],
  });
}