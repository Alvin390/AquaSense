import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Map' }} />
      <Tabs.Screen name="quality" options={{ title: 'Quality' }} />
      <Tabs.Screen name="recommendations" options={{ title: 'AI' }} />
    </Tabs>
  );
}
