import { Tabs } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 60 * 36 },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Tabs screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
