import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import type { Booking } from '@/api/schemas';
import { formatDateLong, formatIDR } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

const STATUS_STYLE: Record<
  Booking['status'],
  { label: string; color: string }
> = {
  CONFIRMED: { label: 'Confirmed', color: colors.success },
  COMPLETED: { label: 'Completed', color: colors.textMuted },
  CANCELLED: { label: 'Cancelled', color: colors.danger },
};

export function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_STYLE[booking.status];

  return (
    <Link href={`/(app)/booking/${booking.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <Image
          source={{ uri: booking.facility.imageUrl }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={200}
          recyclingKey={booking.facility.id}
        />
        <View style={styles.body}>
          <View style={styles.topRow}>
            <Text style={styles.facilityName} numberOfLines={1}>
              {booking.facility.name}
            </Text>
            <View style={[styles.statusDot, { backgroundColor: status.color }]} />
          </View>
          <Text style={styles.meta} numberOfLines={1}>
            {booking.court.name} · {formatDateLong(booking.date)}
          </Text>
          <Text style={styles.meta}>
            {booking.startTime}–{booking.endTime} · {formatIDR(booking.totalPrice)}
          </Text>
          <Text style={styles.reference}>{booking.bookingReference}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  thumbnail: { height: '100%', minHeight: 104, width: 96 },
  body: {
    flex: 1,
    gap: 3,
    padding: spacing.md,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  facilityName: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    borderRadius: radius.full,
    height: 8,
    width: 8,
  },
  meta: { color: colors.textMuted, fontSize: 13 },
  reference: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
