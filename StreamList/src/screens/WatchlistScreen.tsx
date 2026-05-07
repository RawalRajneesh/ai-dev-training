import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentCard } from '../components/common/ContentCard';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import type { RootStackParamList } from '../navigation/types';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Filter = 'all' | 'movie' | 'tv';

export function WatchlistScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const hydrated = useWatchlistStore(s => s.hydrated);
  const items = useWatchlistStore(s => s.items);
  const removeItem = useWatchlistStore(s => s.removeItem);
  const [filter, setFilter] = useState<Filter>('all');
  const cellWidth = useMemo(() => {
    const w = Dimensions.get('window').width;
    return Math.floor((w - spacing.md * 2 - spacing.sm) / 2);
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') {
      return items;
    }
    return items.filter(i => i.mediaType === filter);
  }, [filter, items]);

  const emptyMessage = useMemo(() => {
    if (filter === 'movie') {
      return 'No movies in your watchlist yet.';
    }
    if (filter === 'tv') {
      return 'No series in your watchlist yet.';
    }
    return 'Save titles you want to watch. They will appear here.';
  }, [filter]);

  return (
    <ScreenErrorBoundary onRetry={() => undefined}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <Text style={styles.heading}>Watchlist</Text>
        <View style={styles.filters}>
          {(['all', 'movie', 'tv'] as const).map(f => {
            const active = filter === f;
            const label = f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'Series';
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active ? styles.filterOn : styles.filterOff]}>
                <Text style={[styles.filterText, active ? styles.filterTextOn : styles.filterTextOff]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {!hydrated ? (
          <View style={styles.center}>
            <Text style={styles.muted}>Loading your list…</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>Nothing here yet</Text>
            <Text style={styles.emptyBody}>{emptyMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.key}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            renderItem={({ item }) => (
              <View style={{ width: cellWidth }}>
                <ContentCard
                  title={item.title}
                  posterPath={item.posterPath}
                  width={cellWidth}
                  onPress={() =>
                    navigation.navigate('Detail', {
                      mediaType: item.mediaType,
                      id: item.tmdbId,
                    })
                  }
                  onLongPress={() => removeItem(item.key)}
                />
              </View>
            )}
          />
        )}
      </View>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  heading: {
    ...typography.displayLg,
    color: colors.on_surface,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
  },
  filterOn: {
    backgroundColor: colors.secondary_container,
  },
  filterOff: {
    backgroundColor: colors.surface_container_low,
  },
  filterText: {
    ...typography.bodySm,
  },
  filterTextOn: {
    color: colors.on_surface,
  },
  filterTextOff: {
    color: colors.on_surface_variant,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  muted: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
});
