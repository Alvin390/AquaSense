// useLocation — custom hook
// Requests expo-location permission on mount
// On grant: streams GPS coords to locationStore
// On deny: sets selectedCity to 'Nairobi' fallback
// Exposes: { permissionGranted, userCoords, requesting }
