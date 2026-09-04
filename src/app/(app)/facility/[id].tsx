import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchFacilityDetail } from '@/api/facilities';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { formatIDR } from '@/lib/format';
import { colors, radius, spacing } from '@/theme/colors';

export default function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const query = useQuery({
    queryKey: ['facility', id],
    queryFn: () => fetchFacilityDetail(id!),
    enabled: !!id,
  });

  if (query.isPending) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton height={280} borderRadius={0} />
        <View style={styles.loadingBody}>
          <Skeleton width="70%" height={24} />
          <Skeleton width="50%" height={16} />
          <Skeleton height={80} />
        </View>
      </View>
    );
  }

  if (query.isError || !query.data) {
    return (
      <SafeAreaView style={styles.safe}>
        <StateView
          emoji="😵"
          title="Facility not found"
          message="It may have been removed, or your connection dropped."
          actionLabel="Try again"
          onAction={() => void query.refetch()}
        />
      </SafeAreaView>
    );
  }

  const facility = query.data;
  const lowestPrice = Math.min(...facility.courts.map((c) => c.basePrice));

  return (
    <View style={styles.safe}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View>
          <Image
            source={{ uri: facility.imageUrl }}
            style={styles.hero}
            contentFit="cover"
            transition={200}
          />
          <LinearGradient
            colors={['transparent', colors.bg]}
            style={styles.heroGradient}
          />
          <SafeAreaView style={styles.backRow} edges={['top']}>
            <Text style={styles.backButton} onPress={() => router.back()}>
              ← Back
            </Text>
          </SafeAreaView>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{facility.name}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>
                ★ {facility.rating.toFixed(1)}{' '}
                <Text style={styles.reviewCount}>({facility.reviewCount})</Text>
              </Text>
            </View>
          </View>
          <Text style={styles.address}>{facility.address}</Text>

          <View style={styles.chipRow}>
            {facility.sports.map((sport) => (
              <View key={sport} style={styles.chip}>
                <Text style={styles.chipText}>{sport}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{facility.description}</Text>

          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.chipRow}>
            {facility.amenities.map((amenity) => (
              <View key={amenity} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{amenity}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>
            Courts ({facility.courts.length})
          </Text>
          <View style={styles.courtList}>
            {facility.courts.map((court) => (
              <View key={court.id} style={styles.courtRow}>
                <View style={styles.courtInfo}>
                  <Text style={styles.courtName}>{court.name}</Text>
                  <Text style={styles.courtMeta}>
                    {court.indoor ? 'Indoor' : 'Outdoor'} · {court.type} ·{' '}
                    {court.sport}
                  </Text>
                </View>
                <Text style={styles.courtPrice}>
                  {formatIDR(court.basePrice)}
                  <Text style={styles.courtPriceSuffix}>/hr</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Starting from</Text>
          <Text style={styles.footerPrice}>{formatIDR(lowestPrice)}/hr</Text>
        </View>
        <View style={styles.footerButton}>
          <Button
            label="Check availability"
            onPress={() => router.push(`/(app)/book/${facility.id}`)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  loadingContainer: { backgroundColor: colors.bg, flex: 1 },
  loadingBody: { gap: spacing.md, padding: spacing.md },
  scrollContent: { paddingBottom: 120 },
  hero: { height: 280, width: '100%' },
  heroGradient: {
    bottom: 0,
    height: 120,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  backRow: {
    left: spacing.md,
    position: 'absolute',
    top: 0,
  },
  backButton: {
    backgroundColor: 'rgba(11,15,12,0.7)',
    borderRadius: radius.full,
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  body: {
    gap: spacing.sm,
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
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ratingBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  ratingText: { color: colors.warning, fontSize: 14, fontWeight: '700' },
  reviewCount: { color: colors.textMuted, fontWeight: '500' },
  address: { color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipText: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  amenityChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  amenityText: { color: colors.textMuted, fontSize: 13 },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
  },
  courtList: { gap: spacing.sm },
  courtRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  courtInfo: { flex: 1, gap: 2 },
  courtName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  courtMeta: {
    color: colors.textMuted,
    fontSize: 13,
    textTransform: 'capitalize',
  },
  courtPrice: { color: colors.accent, fontSize: 15, fontWeight: '800' },
  courtPriceSuffix: { color: colors.textMuted, fontSize: 12, fontWeight: '500' },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 0,
    padding: spacing.md,
    position: 'absolute',
    right: 0,
  },
  footerLabel: { color: colors.textMuted, fontSize: 12 },
  footerPrice: { color: colors.text, fontSize: 18, fontWeight: '800' },
  footerButton: { minWidth: 180 },
});
