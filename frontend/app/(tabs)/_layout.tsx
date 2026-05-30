import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Map', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "map" : "map-outline"} size={24} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="quality" 
        options={{ 
          title: 'Quality',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "water" : "water-outline"} size={24} color={color} />
          ),
        }} 
      />
      <Tabs.Screen 
        name="recommendations" 
        options={{ 
          title: 'AI', 
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"} size={24} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}
