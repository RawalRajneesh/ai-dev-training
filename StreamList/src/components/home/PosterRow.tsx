import React from 'react';
import { FlatList, ListRenderItem, StyleSheet, Text, View } from 'react-native';
import type { MovieSummary } from '../../api/types';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ContentCard } from '../common/ContentCard';
import { SkeletonCard } from '../common/SkeletonCard';
interface Props {
  title: string;
  items: MovieSummary[];
  loading: boolean;
  cardWidth: number;
  onSelect: (item: MovieSummary) => void;
  onEndReached: () => void;
  rowLoading: boolean;
}

export function PosterRow({
  title,
  items,
  loading,
  cardWidth,
  onSelect,
  onEndReached,
  rowLoading,
}: Props): React.ReactElement {
  const cardHeight = Math.round((cardWidth * 3) / 2);

  const renderItem: ListRenderItem<MovieSummary> = ({ item }) => (
    <ContentCard
      title={item.title}
      posterPath={item.poster_path}
      width={cardWidth}
      onPress={() => onSelect(item)}
    />
  );

  if (!loading && items.length === 0) {
    return <></>;
  }

  return (
    <View style={styles.block}>
      <Text style={styles.heading}>{title}</Text>
      {loading && items.length === 0 ? (
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
          onEndReachedThreshold={0.4}
          onEndReached={onEndReached}
          contentContainerStyle={styles.list}
          showsHorizontalScrollIndicator={false}
          ListFooterComponent={
            rowLoading ? <SkeletonCard width={cardWidth} height={cardHeight} /> : null
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
  heading: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
});
