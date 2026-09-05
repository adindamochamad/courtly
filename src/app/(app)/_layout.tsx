import { Stack } from 'expo-router';

import { colors } from '@/theme/colors';

/**
 * Stack navigator wrapping tabs + detail/booking screens.
 * Detail routes push on top of tabs without appearing in the tab bar.
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="facility/[id]" />
      <Stack.Screen name="book/[facilityId]" />
      <Stack.Screen name="booking/[id]" />
    </Stack>
  );
}
