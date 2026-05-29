// API service layer — Axios instance + all backend endpoint calls
// Base URL: set via EXPO_PUBLIC_API_URL env var (ngrok URL on demo day)
// Endpoints:
//   getSources({ city?, lat?, lng?, radius_km? })
//   getLatestReading(sourceId)
//   getHistory(sourceId, days?)
//   getActiveAlerts({ lat, lng, radius_km })
//   registerPushToken({ expo_push_token, source_ids_to_watch })
//   refreshSource(sourceId)     ← admin only, requires X-API-Key header
