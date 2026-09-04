import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { toApiDate } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

const DAYS_AHEAD = 14;

type DateStripProps = {
  selected: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
};

/** Horizontal picker for the next two weeks, today first. */
export function DateStrip({ selected, onSelect }: DateStripProps) {
  const days: { apiDate: string; weekday: string; dayNum: number }[] = [];
  const today = new Date();
  for (let i = 0; i < DAYS_AHEAD; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      apiDate: toApiDate(date),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
    });
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {days.map((day, index) => {
        const active = day.apiDate === selected;
        return (
          <Pressable
            key={day.apiDate}
            onPress={() => {
              void Haptics.selectionAsync();
              onSelect(day.apiDate);
            }}
            style={[styles.day, active && styles.dayActive]}
          >
            <Text style={[styles.weekday, active && styles.textActive]}>
              {index === 0 ? 'Today' : day.weekday}
            </Text>
            <Text style={[styles.dayNum, active && styles.textActive]}>
              {day.dayNum}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.md },
  day: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 2,
    minWidth: 56,
    paddingVertical: spacing.sm,
  },
  dayActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  weekday: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dayNum: { color: colors.text, fontSize: 17, fontWeight: '800' },
  textActive: { color: colors.onAccent },
});
