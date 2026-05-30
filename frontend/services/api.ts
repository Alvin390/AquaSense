import axios from 'axios';
import type {
  WaterSource,
  WaterReading,
  AIRecommendation,
} from '../stores/waterStore';
 
// ─── Base URL ─────────────────────────────────────────────────────────────────
//
// Local dev: http://localhost:8000
// Demo day:  Alvin shares the ngrok URL — update this ONE line only.
//            Do not hardcode any API keys here. The frontend has none.
 
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
 
// ─── Axios Instance ───────────────────────────────────────────────────────────
//
// Single instance. All API calls in this file use this client.
// Ralph, Ted, and Liz import functions from this file — they never
// create their own Axios instances.
 
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10s hard limit per performance spec
  headers: {
    'Content-Type': 'application/json',
  },
});
 
// ─── Response / Error Interceptors ───────────────────────────────────────────
//
// Unwrap the { success: true, data: {...} } envelope Moses sends on every response.
// On error, extract Moses's { error, code, message } shape for clean throws.
 
client.interceptors.response.use(
  (response) => {
    // Unwrap envelope: return response.data.data if it exists, else raw data
    if (response.data && response.data.success && response.data.data !== undefined) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An unexpected error occurred';
    const code = error?.response?.data?.code || 'UNKNOWN_ERROR';
    return Promise.reject(new Error(`[${code}] ${message}`));
  }
);
 
// ─── Types ────────────────────────────────────────────────────────────────────
 
export interface SourceDetail {
  source: WaterSource;
  reading: WaterReading;
  ai_recommendation: AIRecommendation;
}
 
export interface Alert {
  id: number;
  source_id: number;
  source_name: string;
  alert_type: 'ph_critical' | 'flood_high' | 'water_scarce';
  triggered_at: string;
  last_notified_at: string;
}
 
// ─── API Functions ────────────────────────────────────────────────────────────
//
// All functions are async and throw on error — callers (TanStack Query)
// handle errors via isError state. No unhandled promise rejections.
 
/**
 * GET /sources
 * Returns all water sources, optionally filtered by city.
 * Used by: Tab 1 map to load markers.
 */
export async function getSources(city?: string): Promise<WaterSource[]> {
  const params: Record<string, string> = {};
  if (city) params.city = city;
  const response = await client.get<WaterSource[]>('/sources', { params });
  return response.data;
}
 
/**
 * GET /sources/{id}/latest
 * Returns the latest reading + AI recommendation for one source.
 * Alvin's AI output arrives pre-cached inside this response under
 * ai_recommendation — we never call Groq directly.
 * Used by: Tab 2 and Tab 3.
 */
export async function getSourceLatest(id: number): Promise<SourceDetail> {
  const response = await client.get<SourceDetail>(`/sources/${id}/latest`);
  return response.data;
}
 
/**
 * GET /sources/{id}/history?days=7
 * Returns an array of readings over the past N days.
 * Used by: Tab 2 historical trend chart.
 */
export async function getSourceHistory(
  id: number,
  days: number = 7
): Promise<WaterReading[]> {
  const response = await client.get<WaterReading[]>(
    `/sources/${id}/history`,
    { params: { days } }
  );
  return response.data;
}
 
/**
 * GET /alerts/active?lat=&lng=&radius_km=
 * Returns active alerts near given coordinates.
 * Used by: app startup check + in-app alert banner on Tab 1.
 */
export async function getActiveAlerts(
  lat: number,
  lng: number,
  radius: number = 10
): Promise<Alert[]> {
  const response = await client.get<Alert[]>('/alerts/active', {
    params: { lat, lng, radius_km: radius },
  });
  return response.data;
}
 
/**
 * POST /notifications/register
 * Registers an Expo push token against a list of source IDs to watch.
 * Called after Expo Notifications permission is granted.
 * Used by: useLocation.ts after permission flow completes.
 */
export async function registerPushToken(
  token: string,
  sourceIds: number[]
): Promise<void> {
  await client.post('/notifications/register', {
    expo_push_token: token,
    source_ids_to_watch: sourceIds,
  });
}
 
/**
 * GET /health
 * Lightweight connectivity check — used to verify Axios base URL is correct.
 * Returns { status: 'ok', db: 'connected', timestamp: string }
 */
export async function checkHealth(): Promise<{ status: string; db: string; timestamp: string }> {
  const response = await client.get('/health');
  return response.data;
}