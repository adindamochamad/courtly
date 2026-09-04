import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  FACILITIES_PAGE_SIZE,
  fetchCities,
  fetchFacilities,
  fetchSports,
  type FacilityFilters,
} from '@/api/facilities';
import { FacilityCard } from '@/components/facilities/FacilityCard';
import { FilterChip } from '@/components/facilities/FilterChip';
import { FacilityCardSkeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { useDebounce } from '@/lib/use-debounce';
import { useAuthStore } from '@/stores/auth-store';
import { colors, radius, spacing } from '@/theme/colors';

export default function ExploreScreen() {
  const user = useAuthStore((state) => state.user);
  const [searchInput, setSearchInput] = useState('');
  const [sport, setSport] = useState<string | undefined>();
  const [city, setCity] = useState<string | undefined>();

  const search = useDebounce(searchInput.trim());
  const filters: FacilityFilters = useMemo(
    () => ({ search: search || undefined, sport, city }),
    [search, sport, city],
  );

  const facilitiesQuery = useInfiniteQuery({
    queryKey: ['facilities', filters],
    queryFn: ({ pageParam }) => fetchFacilities(pageParam, filters),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const sportsQuery = useQuery({
    queryKey: ['sports'],
    queryFn: fetchSports,
    staleTime: Infinity,
  });
  const citiesQuery = useQuery({
    queryKey: ['cities'],
    queryFn: fetchCities,
    staleTime: Infinity,
  });

  const facilities =
    facilitiesQuery.data?.pages.flatMap((page) => page.data) ?? [];
  const total = facilitiesQuery.data?.pages[0]?.pagination.total ?? 0;

  const renderBody = () => {
    if (facilitiesQuery.isPending) {
      return (
        <View style={styles.listContent}>
          <FacilityCardSkeleton />
          <FacilityCardSkeleton />
          <FacilityCardSkeleton />
        </View>
      );
    }

    if (facilitiesQuery.isError) {
      return (
        <StateView
          emoji="📡"
          title="Couldn't load facilities"
          message="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => void facilitiesQuery.refetch()}
        />
      );
    }

    return (
      <FlatList
        data={facilities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FacilityCard facility={item} />}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (
            facilitiesQuery.hasNextPage &&
            !facilitiesQuery.isFetchingNextPage
          ) {
            void facilitiesQuery.fetchNextPage();
          }
        }}
        refreshControl={
          <RefreshControl
            refreshing={facilitiesQuery.isRefetching}
            onRefresh={() => void facilitiesQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={
          <StateView
            emoji="🔍"
            title="No facilities found"
            message="Try a different keyword or clear the filters."
          />
        }
        ListFooterComponent={
          facilitiesQuery.isFetchingNextPage ? (
            <ActivityIndicator
              color={colors.accent}
              style={styles.footerSpinner}
            />
          ) : null
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hey, {user?.name?.split(' ')[0] ?? 'player'} 👋
        </Text>
        <Text style={styles.headline}>Find your court</Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search facilities…"
            placeholderTextColor={colors.textFaint}
            value={searchInput}
            onChangeText={setSearchInput}
            autoCapitalize="none"
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <FilterChip
            label="All sports"
            active={!sport}
            onPress={() => setSport(undefined)}
          />
          {(sportsQuery.data?.data ?? []).map((option) => (
            <FilterChip
              key={option.id}
              label={option.name}
              active={sport === option.slug}
              onPress={() =>
                setSport((current) =>
                  current === option.slug ? undefined : option.slug,
                )
              }
            />
          ))}
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <FilterChip
            label="All cities"
            active={!city}
            onPress={() => setCity(undefined)}
          />
          {(citiesQuery.data?.data ?? []).map((option) => (
            <FilterChip
              key={option}
              label={option}
              active={city === option}
              onPress={() =>
                setCity((current) => (current === option ? undefined : option))
              }
            />
          ))}
        </ScrollView>

        <Text style={styles.resultCount}>
          {total} {total === 1 ? 'venue' : 'venues'}
          {facilitiesQuery.isFetching && !facilitiesQuery.isPending
            ? ' · updating…'
            : ''}
        </Text>
      </View>

      {renderBody()}
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
  greeting: { color: colors.textMuted, fontSize: 14 },
  headline: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  searchIcon: {
    color: colors.textFaint,
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
  },
  chipsRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  resultCount: {
    color: colors.textFaint,
    fontSize: 13,
  },
  listContent: {
    gap: spacing.md,
    padding: spacing.md,
  },
  separator: { height: 0 },
  footerSpinner: { marginVertical: spacing.md },
});
