import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import type { FacilitySummary } from '@/api/schemas';
import { formatIDR } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

type FacilityCardProps = {
  facility: FacilitySummary;
};

export function FacilityCard({ facility }: FacilityCardProps) {
  return (
    <Link href={`/(app)/facility/${facility.id}`} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <Image
          source={{ uri: facility.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          recyclingKey={facility.id}
        />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name} numberOfLines={1}>
              {facility.name}
            </Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>
                ★ {facility.rating.toFixed(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.location} numberOfLines={1}>
            {facility.location} · {facility.distanceKm.toFixed(1)} km
          </Text>
          <View style={styles.metaRow}>
            <View style={styles.sportsRow}>
              {facility.sports.map((sport) => (
                <View key={sport} style={styles.sportChip}>
                  <Text style={styles.sportChipText}>{sport}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.price}>
              {formatIDR(facility.startingPrice)}
              <Text style={styles.priceSuffix}>/hr</Text>
            </Text>
          </View>
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
    overflow: 'hidden',
  },
  image: {
    height: 160,
    width: '100%',
  },
  body: {
    gap: spacing.xs,
    padding: spacing.md,
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  name: {
    color: colors.text,
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  ratingBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  ratingText: {
    color: colors.warning,
    fontSize: 13,
    fontWeight: '700',
  },
  location: {
    color: colors.textMuted,
    fontSize: 14,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sportsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sportChip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  sportChipText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  price: {
    color: colors.accent,
    fontSize: 15,
    fontWeight: '800',
  },
  priceSuffix: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
  },
});
