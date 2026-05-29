import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

const STALE_36H = 1000 * 60 * 60 * 36;

export function useWaterSources(city?: string) {
  return useQuery({
    queryKey: ['sources', city],
    queryFn: () => api.getSources({ city }),
    staleTime: STALE_36H,
  });
}

export function useLatestReading(sourceId: number | null) {
  return useQuery({
    queryKey: ['latest', sourceId],
    queryFn: () => api.getLatestReading(sourceId!),
    enabled: sourceId !== null,
    staleTime: STALE_36H,
  });
}

export function useSourceHistory(sourceId: number | null, days = 7) {
  return useQuery({
    queryKey: ['history', sourceId, days],
    queryFn: () => api.getHistory(sourceId!, days),
    enabled: sourceId !== null,
    staleTime: STALE_36H,
  });
}
