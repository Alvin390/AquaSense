import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

const client = axios.create({ baseURL: BASE_URL, timeout: 10_000 });

export const api = {
  getSources: (params?: { city?: string; lat?: number; lng?: number; radius_km?: number }) =>
    client.get('/sources/', { params }).then((r) => r.data),

  getLatestReading: (sourceId: number) =>
    client.get(`/sources/${sourceId}/latest`).then((r) => r.data),

  getHistory: (sourceId: number, days = 7) =>
    client.get(`/sources/${sourceId}/history`, { params: { days } }).then((r) => r.data),

  getActiveAlerts: (params: { lat: number; lng: number; radius_km?: number }) =>
    client.get('/alerts/active', { params }).then((r) => r.data),

  registerPushToken: (payload: { expo_push_token: string; source_ids: number[] }) =>
    client.post('/notifications/register', payload).then((r) => r.data),

  refreshSource: (sourceId: number, adminKey: string) =>
    client
      .post(`/sources/${sourceId}/refresh`, {}, { headers: { 'X-API-Key': adminKey } })
      .then((r) => r.data),
};
