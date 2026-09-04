import { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBooking } from '@/api/bookings';
import { ApiError } from '@/api/client';
import { fetchAvailability } from '@/api/availability';
import { fetchFacilityDetail } from '@/api/facilities';
import type { AvailabilitySlot, Booking } from '@/api/schemas';
import { DateStrip } from '@/components/booking/DateStrip';
import { SlotGrid } from '@/components/booking/SlotGrid';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { formatDateLong, formatIDR, toApiDate } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

/** Estimated service fee rate (confirmed server-side at ~5%). */
const SERVICE_FEE_RATE = 0.05;

type Selection = {
  courtId: string;
  courtName: string;
  slots: AvailabilitySlot[];
};

export default function BookingScreen() {
  const { facilityId } = useLocalSearchParams<{ facilityId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(() => toApiDate(new Date()));
  const [selection, setSelection] = useState<Selection | null>(null);
  const [confirmed, setConfirmed] = useState<Booking[] | null>(null);

  const facilityQuery = useQuery({
    queryKey: ['facility', facilityId],
    queryFn: () => fetchFacilityDetail(facilityId!),
    enabled: !!facilityId,
  });

  const availabilityQuery = useQuery({
    queryKey: ['availability', facilityId, date],
    queryFn: () => fetchAvailability(facilityId!, date),
    enabled: !!facilityId,
    // Availability changes fast — keep it fresh.
    staleTime: 15_000,
  });

  const isToday = date === toApiDate(new Date());
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const isSlotPast = (startTime: string) => {
    if (!isToday) return false;
    const [h, m] = startTime.split(':').map(Number);
    return h * 60 + m <= nowMinutes;
  };

  const handleToggleSlot = (
    court: { id: string; name: string },
    slot: AvailabilitySlot,
  ) => {
    setSelection((current) => {
      // Tapping a selected slot clears the selection.
      if (
        current &&
        current.courtId === court.id &&
        current.slots.some((s) => s.startTime === slot.startTime)
      ) {
        return null;
      }
      // Extending: same court, consecutive to either end of the range.
      if (current && current.courtId === court.id) {
        const times = current.slots.map((s) => s.startTime).sort();
        const first = times[0];
        if (slot.endTime === first) {
          return {
            ...current,
            slots: [slot, ...current.slots],
          };
        }
        if (slot.startTime === current.slots[current.slots.length - 1].endTime) {
          return { ...current, slots: [...current.slots, slot] };
        }
        // Non-consecutive on same court → restart from this slot.
        return { courtId: court.id, courtName: court.name, slots: [slot] };
      }
      // New selection (possibly switching courts).
      return { courtId: court.id, courtName: court.name, slots: [slot] };
    });
  };

  const sortedSlots = useMemo(
    () =>
      selection
        ? [...selection.slots].sort((a, b) =>
            a.startTime.localeCompare(b.startTime),
          )
        : [],
    [selection],
  );
  const subtotal = sortedSlots.reduce((sum, slot) => sum + slot.price, 0);
  const estimatedTotal = Math.round(subtotal * (1 + SERVICE_FEE_RATE));

  const bookMutation = useMutation({
    mutationFn: async (current: Selection) => {
      // The API accepts one hourly slot per call — book consecutive
      // slots sequentially so a conflict stops the chain early.
      const created: Booking[] = [];
      const ordered = [...current.slots].sort((a, b) =>
        a.startTime.localeCompare(b.startTime),
      );
      for (const slot of ordered) {
        const booking = await createBooking({
          courtId: current.courtId,
          date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        });
        created.push(booking);
      }
      return created;
    },
    onSuccess: async (created) => {
      await Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      );
      setSelection(null);
      setConfirmed(created);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({
        queryKey: ['availability', facilityId, date],
      });
    },
    onError: async (error, current) => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Refresh availability so the grid reflects reality.
      void queryClient.invalidateQueries({
        queryKey: ['availability', facilityId, date],
      });
      if (error instanceof ApiError && error.status === 409) {
        Alert.alert(
          'Slot just got booked',
          'Someone else grabbed that slot. We refreshed the availability — please pick another time.',
        );
      } else if (error instanceof Error) {
        Alert.alert('Booking failed', error.message);
      }
      setSelection(null);
    },
  });

  if (confirmed) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.successContainer}>
          <Text style={styles.successEmoji}>🎾</Text>
          <Text style={styles.successTitle}>You&apos;re booked!</Text>
          <Text style={styles.successSubtitle}>
            {facilityQuery.data?.name} · {formatDateLong(date)}
          </Text>
          <View style={styles.successCard}>
            {confirmed.map((booking) => (
              <View key={booking.id} style={styles.successRow}>
                <View style={styles.successRowInfo}>
                  <Text style={styles.successCourt}>
                    {booking.court.name} · {booking.startTime}–{booking.endTime}
                  </Text>
                  <Text style={styles.successRef}>
                    Ref: {booking.bookingReference}
                  </Text>
                </View>
                <Text style={styles.successPrice}>
                  {formatIDR(booking.totalPrice)}
                </Text>
              </View>
            ))}
          </View>
          <Button
            label="View my bookings"
            onPress={() => router.replace('/(app)/bookings')}
          />
          <Button
            label="Book another slot"
            variant="ghost"
            onPress={() => setConfirmed(null)}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.backLink} onPress={() => router.back()}>
          ← Back
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {facilityQuery.data?.name ?? 'Check availability'}
        </Text>
        <Text style={styles.subtitle}>{formatDateLong(date)}</Text>
      </View>

      <DateStrip
        selected={date}
        onSelect={(next) => {
          setDate(next);
          setSelection(null);
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {availabilityQuery.isPending ? (
          <View style={styles.loadingBody}>
            <Skeleton height={90} />
            <Skeleton height={90} />
            <Skeleton height={90} />
          </View>
        ) : availabilityQuery.isError ? (
          <StateView
            emoji="📡"
            title="Couldn't load availability"
            actionLabel="Retry"
            onAction={() => void availabilityQuery.refetch()}
          />
        ) : (
          availabilityQuery.data.courts.map((court) => (
            <View key={court.id} style={styles.courtSection}>
              <View style={styles.courtHeader}>
                <Text style={styles.courtName}>{court.name}</Text>
                <Text style={styles.courtMeta}>
                  {court.indoor ? 'Indoor' : 'Outdoor'} · {court.type}
                </Text>
              </View>
              <SlotGrid
                slots={court.slots}
                selectedStartTimes={
                  new Set(
                    selection?.courtId === court.id
                      ? selection.slots.map((s) => s.startTime)
                      : [],
                  )
                }
                otherCourtSelected={
                  !!selection && selection.courtId !== court.id
                }
                isSlotPast={isSlotPast}
                onToggleSlot={(slot) => handleToggleSlot(court, slot)}
              />
            </View>
          ))
        )}
      </ScrollView>

      {selection && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>
              {selection.courtName} · {sortedSlots[0]?.startTime}–
              {sortedSlots[sortedSlots.length - 1]?.endTime}
            </Text>
            <Text style={styles.summarySubtitle}>
              {sortedSlots.length} {sortedSlots.length === 1 ? 'hour' : 'hours'}{' '}
              · est. {formatIDR(estimatedTotal)} (incl. service fee)
            </Text>
          </View>
          <View style={styles.summaryButton}>
            <Button
              label="Book now"
              loading={bookMutation.isPending}
              onPress={() => bookMutation.mutate(selection)}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  header: {
    gap: 2,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  backLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: colors.textMuted, fontSize: 14 },
  scrollContent: {
    gap: spacing.lg,
    padding: spacing.md,
    paddingBottom: 140,
  },
  loadingBody: { gap: spacing.md },
  courtSection: { gap: spacing.sm },
  courtHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  courtName: { color: colors.text, fontSize: 16, fontWeight: '700' },
  courtMeta: {
    color: colors.textMuted,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  summaryBar: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.md,
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
  },
  summaryInfo: { flex: 1, gap: 2 },
  summaryTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  summarySubtitle: { color: colors.textMuted, fontSize: 13 },
  summaryButton: { minWidth: 130 },
  successContainer: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  successEmoji: { fontSize: 56 },
  successTitle: { color: colors.text, fontSize: 26, fontWeight: '800' },
  successSubtitle: { color: colors.textMuted, fontSize: 15 },
  successCard: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginVertical: spacing.sm,
    padding: spacing.md,
  },
  successRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successRowInfo: { gap: 2 },
  successCourt: { color: colors.text, fontSize: 15, fontWeight: '700' },
  successRef: { color: colors.textMuted, fontSize: 13 },
  successPrice: { color: colors.accent, fontSize: 15, fontWeight: '800' },
});
