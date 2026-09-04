import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth-store';
import { colors, spacing } from '@/theme/colors';

/**
 * Temporary home screen — replaced by the facility list in the next phase.
 * For now it proves the auth flow works end to end.
 */
export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Text style={styles.logo}>
          Courtly<Text style={styles.logoAccent}>.</Text>
        </Text>
        <Text style={styles.greeting}>
          You&apos;re in, {user?.name ?? 'player'} 🎾
        </Text>
        <Text style={styles.muted}>
          Signed in as {user?.email}
        </Text>
        <Button label="Sign out" variant="ghost" onPress={() => void signOut()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  content: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    color: colors.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  logoAccent: { color: colors.accent },
  greeting: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '700',
  },
  muted: { color: colors.textMuted, fontSize: 14 },
});
