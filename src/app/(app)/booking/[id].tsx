import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelBooking, fetchBookingDetail } from '@/api/bookings';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { addBookingToCalendar } from '@/lib/calendar';
import { formatDateLong, formatIDR } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

const STATUS_LABEL = {
  CONFIRMED: { label: 'Confirmed', color: colors.success },
  COMPLETED: { label: 'Completed', color: colors.textMuted },
  CANCELLED: { label: 'Cancelled', color: colors.danger },
} as const;

export default function BookingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingDetail(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id!),
    onSuccess: async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      void queryClient.invalidateQueries({ queryKey: ['bookings'] });
      void queryClient.invalidateQueries({ queryKey: ['booking', id] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        Alert.alert('Already cancelled', 'This booking was already cancelled.');
        void queryClient.invalidateQueries({ queryKey: ['booking', id] });
      } else if (error instanceof Error) {
        Alert.alert('Cancel failed', error.message);
      }
    },
  });

  const confirmCancel = () => {
    Alert.alert(
      'Cancel this booking?',
      'This cannot be undone.',
      [
        { text: 'Keep booking', style: 'cancel' },
        {
          text: 'Cancel booking',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(),
        },
      ],
    );
  };

  if (query.isPending) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingBody}>
          <Skeleton height={180} />
          <Skeleton width="60%" height={22} />
          <Skeleton height={90} />
        </View>
      </SafeAreaView>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <StateView
          emoji="😵"
          title="Booking not found"
          actionLabel="Go back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const booking = query.data;
  const status = STATUS_LABEL[booking.status];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.backLink} onPress={() => router.back()}>
          ← Back
        </Text>

        <Image
          source={{ uri: booking.facility.imageUrl }}
          style={styles.hero}
          contentFit="cover"
          transition={200}
        />

        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { borderColor: status.color }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
          <Text style={styles.reference}>{booking.bookingReference}</Text>
        </View>

        <Text style={styles.facilityName}>{booking.facility.name}</Text>
        <Text style={styles.courtName}>{booking.court.name}</Text>

        <View style={styles.detailCard}>
          <DetailRow label="Date" value={formatDateLong(booking.date)} />
          <DetailRow
            label="Time"
            value={`${booking.startTime} – ${booking.endTime}`}
          />
          <DetailRow label="Court price" value={formatIDR(booking.price)} />
          <DetailRow label="Service fee" value={formatIDR(booking.serviceFee)} />
          <View style={styles.divider} />
          <DetailRow
            label="Total"
            value={formatIDR(booking.totalPrice)}
            emphasize
          />
        </View>

        {booking.status === 'CONFIRMED' && (
          <View style={styles.actions}>
            <Button
              label="Add to calendar"
              variant="ghost"
              onPress={() => void addBookingToCalendar(booking)}
            />
            <Button
              label="Cancel booking"
              variant="danger"
              loading={cancelMutation.isPending}
              onPress={confirmCancel}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={[detailStyles.label, emphasize && detailStyles.emphasize]}>
        {label}
      </Text>
      <Text style={[detailStyles.value, emphasize && detailStyles.emphasizeValue]}>
        {value}
      </Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: { color: colors.textMuted, fontSize: 14 },
  value: { color: colors.text, fontSize: 14, fontWeight: '600' },
  emphasize: { color: colors.text, fontWeight: '700' },
  emphasizeValue: { color: colors.accent, fontSize: 16, fontWeight: '800' },
});

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  loadingBody: { gap: spacing.md, padding: spacing.md },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  backLink: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    borderRadius: radius.lg,
    height: 180,
    width: '100%',
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusPill: {
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  statusText: { fontSize: 13, fontWeight: '700' },
  reference: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  facilityName: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  courtName: { color: colors.textMuted, fontSize: 15, marginTop: -spacing.sm },
  detailCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.xs,
  },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
