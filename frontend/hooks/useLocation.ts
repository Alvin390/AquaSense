import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '@/stores/locationStore';

export function useLocation() {
  const [requesting, setRequesting] = useState(true);
  const { permissionGranted, userCoords, setPermission, setCoords, switchToCityMode } = useLocationStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setPermission(true);
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      } else {
        setPermission(false);
        switchToCityMode('Nairobi');
      }
      setRequesting(false);
    })();
  }, []);

  return { permissionGranted, userCoords, requesting };
}
