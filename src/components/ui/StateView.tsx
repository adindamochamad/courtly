import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme/colors';

import { Button } from './Button';

type StateViewProps = {
  emoji: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Friendly empty / error state used across all screens. */
export function StateView({
  emoji,
  title,
  message,
  actionLabel,
  onAction,
}: StateViewProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      {!!message && <Text style={styles.message}>{message}</Text>}
      {!!actionLabel && !!onAction && (
        <Button label={actionLabel} variant="ghost" onPress={onAction} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emoji: { fontSize: 44 },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
