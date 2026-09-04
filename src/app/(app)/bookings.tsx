import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchBookings, type BookingStatusFilter } from '@/api/bookings';
import { BookingCard } from '@/components/bookings/BookingCard';
import { FilterChip } from '@/components/facilities/FilterChip';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { colors, spacing } from '@/theme/colors';

const TABS: { key: BookingStatusFilter; label: string; empty: string }[] = [
  { key: 'UPCOMING', label: 'Upcoming', empty: 'No upcoming games' },
  { key: 'PAST', label: 'Past', empty: 'No past bookings yet' },
  { key: 'CANCELLED', label: 'Cancelled', empty: 'Nothing cancelled' },
];

export default function BookingsScreen() {
  const [tab, setTab] = useState<BookingStatusFilter>('UPCOMING');

  const query = useQuery({
    queryKey: ['bookings', tab],
    queryFn: () => fetchBookings(tab),
  });

  const activeTab = TABS.find((t) => t.key === tab)!;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
        <View style={styles.tabsRow}>
          {TABS.map((t) => (
            <FilterChip
              key={t.key}
              label={t.label}
              active={tab === t.key}
              onPress={() => setTab(t.key)}
            />
          ))}
        </View>
      </View>

      {query.isPending ? (
        <View style={styles.listContent}>
          <Skeleton height={104} />
          <Skeleton height={104} />
          <Skeleton height={104} />
        </View>
      ) : query.isError ? (
        <StateView
          emoji="📡"
          title="Couldn't load bookings"
          actionLabel="Retry"
          onAction={() => void query.refetch()}
        />
      ) : (
        <FlatList
          data={query.data.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BookingCard booking={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <StateView
              emoji="🎾"
              title={activeTab.empty}
              message={
                tab === 'UPCOMING'
                  ? 'Find a venue on the Explore tab and book your first court.'
                  : undefined
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, flex: 1 },
  header: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tabsRow: { flexDirection: 'row', gap: spacing.sm },
  listContent: {
    flexGrow: 1,
    gap: spacing.md,
    padding: spacing.md,
  },
});
