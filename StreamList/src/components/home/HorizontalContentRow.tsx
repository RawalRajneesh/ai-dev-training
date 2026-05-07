import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewToken,
} from 'react-native';
import type { MovieSummary } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ContentCard } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';

const NEAR_END_THRESHOLD = 3;

interface Props {
  title: string;
  items: MovieSummary[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  cardWidth: number;
  onSelect: (item: MovieSummary) => void;
  onLoadMore: () => void | Promise<void>;
  onSeeAll: () => void;
  emptyStateMessage?: string;
  showSeeAll?: boolean;
}

export function HorizontalContentRow({
  title,
  items,
  loading,
  loadingMore,
  hasMore,
  cardWidth,
  onSelect,
  onLoadMore,
  onSeeAll,
  emptyStateMessage,
  showSeeAll = true,
}: Props): React.ReactElement {
  const cardHeight = Math.round((cardWidth * 3) / 2);
  const loadMoreRef = useRef(false);

  const maybeLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || loading || loadMoreRef.current) {
      return;
    }
    loadMoreRef.current = true;
    const run = async () => {
      try {
        await onLoadMore();
      } finally {
        loadMoreRef.current = false;
      }
    };
    run().catch(() => {});
  }, [hasMore, loadingMore, loading, onLoadMore]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 0 || items.length === 0) {
        return;
      }
      const indices = viewableItems
        .map(v => v.index)
        .filter((i): i is number => typeof i === 'number');
      const maxVisible = Math.max(...indices);
      if (maxVisible >= items.length - NEAR_END_THRESHOLD) {
        maybeLoadMore();
      }
    },
    [items.length, maybeLoadMore],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 45,
    minimumViewTime: 80,
  }).current;

  const renderItem: ListRenderItem<MovieSummary> = ({ item }) => (
    <ContentCard
      title={item.title}
      posterPath={item.poster_path}
      width={cardWidth}
      onPress={() => onSelect(item)}
    />
  );

  const showEmpty = !loading && items.length === 0 && emptyStateMessage;

  return (
    <View style={styles.block}>
      <View style={styles.titleRow}>
        <Text style={styles.heading}>{title}</Text>
        {showSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={spacing.sm}>
            <Text style={styles.seeAll}>See All</Text>
          </Pressable>
        ) : (
          <View style={styles.seeAllPlaceholder} />
        )}
      </View>
      {showEmpty ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{emptyStateMessage}</Text>
        </View>
      ) : loading && items.length === 0 ? (
        <FlatList
          horizontal
          data={[0, 1, 2, 3]}
          keyExtractor={String}
          renderItem={() => <SkeletonCard width={cardWidth} height={cardHeight} />}
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <FlatList
          horizontal
          data={items}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          ListFooterComponent={
            loadingMore ? (
              <View style={[styles.footer, { height: cardHeight }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: spacing.xl,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  heading: {
    ...typography.headlineMd,
    color: colors.on_surface,
  },
  seeAll: {
    ...typography.titleSm,
    color: colors.primary,
  },
  seeAllPlaceholder: {
    minWidth: spacing.xxxl,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
  footer: {
    justifyContent: 'center',
    paddingLeft: spacing.sm,
    minWidth: spacing.xxxl,
  },
  emptyWrap: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface_container_low,
    borderRadius: spacing.sm,
  },
  emptyText: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
