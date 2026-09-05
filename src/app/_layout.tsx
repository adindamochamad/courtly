import { useEffect } from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useAuthStore } from '@/stores/auth-store';
import { colors } from '@/theme/colors';
import { debugLog } from '@/lib/debug-log';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

/**
 * Redirects based on auth state:
 * - signed out  → anything outside (auth) goes to /login
 * - signed in   → (auth) screens bounce back to the app
 */
function AuthGate() {
  const segments = useSegments();
  const router = useRouter();
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    if (status === 'bootstrapping') return;

    const inAuthGroup = segments[0] === '(auth)';
    if (status === 'unauthenticated' && !inAuthGroup) {
      // #region agent log
      debugLog('_layout.tsx:AuthGate', 'Redirect to login', { status, segment: segments[0] }, 'A');
      // #endregion
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      // #region agent log
      debugLog('_layout.tsx:AuthGate', 'Redirect to app', { status, segment: segments[0] }, 'A');
      // #endregion
      router.replace('/(app)/(tabs)');
    }
  }, [status, segments, router]);

  return null;
}

export default function RootLayout() {
  const bootstrap = useAuthStore((state) => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <StatusBar style="light" />
        <AuthGate />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </View>
    </QueryClientProvider>
  );
}
