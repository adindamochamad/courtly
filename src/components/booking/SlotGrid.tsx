import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import type { AvailabilitySlot } from '@/api/schemas';
import { formatIDR } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

type SlotGridProps = {
  slots: AvailabilitySlot[];
  /** startTimes of the currently selected slots on THIS court. */
  selectedStartTimes: ReadonlySet<string>;
  /** Whether another court currently holds the selection. */
  otherCourtSelected: boolean;
  isSlotPast: (startTime: string) => boolean;
  onToggleSlot: (slot: AvailabilitySlot) => void;
};

/** Hourly slot chips for one court. */
export function SlotGrid({
  slots,
  selectedStartTimes,
  otherCourtSelected,
  isSlotPast,
  onToggleSlot,
}: SlotGridProps) {
  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const selected = selectedStartTimes.has(slot.startTime);
        const disabled =
          !slot.available ||
          isSlotPast(slot.startTime) ||
          (otherCourtSelected && !selected);

        return (
          <Pressable
            key={slot.startTime}
            disabled={disabled}
            onPress={() => {
              void Haptics.selectionAsync();
              onToggleSlot(slot);
            }}
            style={[
              styles.slot,
              selected && styles.slotSelected,
              disabled && !selected && styles.slotDisabled,
            ]}
          >
            <Text
              style={[
                styles.slotTime,
                selected && styles.slotTimeSelected,
                disabled && !selected && styles.slotTextDisabled,
              ]}
            >
              {slot.startTime}
            </Text>
            <Text
              style={[
                styles.slotPrice,
                selected && styles.slotTimeSelected,
                disabled && !selected && styles.slotTextDisabled,
              ]}
            >
              {slot.available ? formatIDR(slot.price) : 'Booked'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  slot: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: 2,
    minWidth: '22%',
    paddingVertical: spacing.sm,
  },
  slotSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  slotDisabled: {
    backgroundColor: 'transparent',
    borderStyle: 'dashed',
    opacity: 0.5,
  },
  slotTime: { color: colors.text, fontSize: 14, fontWeight: '700' },
  slotPrice: { color: colors.textMuted, fontSize: 11 },
  slotTimeSelected: { color: colors.onAccent },
  slotTextDisabled: { color: colors.textFaint },
});
