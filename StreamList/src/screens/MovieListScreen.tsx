import type { NativeStackScreenProps, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MovieSummary } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { SkeletonCard } from '../components/common/SkeletonCard';
import { useMoviesByGenre } from '../hooks/useMoviesByGenre';
import { useTopRatedMovies } from '../hooks/useTopRatedMovies';
import { useTrendingMovies } from '../hooks/useTrendingMovies';
import type { HomeStackParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

type Props = NativeStackScreenProps<HomeStackParamList, 'MovieList'>;

export function MovieListScreen(props: Props): React.ReactElement {
  const { kind } = props.route.params;
  if (kind === 'trending') {
    return <MovieListTrendingBody />;
  }
  if (kind === 'topRated') {
    return <MovieListTopRatedBody />;
  }
  return <MovieListGenreBody route={props.route} />;
}

function MovieListTrendingBody(): React.ReactElement {
  const { items, loading, loadingMore, error, hasMore, loadMore, refetch } = useTrendingMovies();
  return (
    <MovieListBody
      items={items}
      loading={loading}
      loadingMore={loadingMore}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
      refetch={refetch}
    />
  );
}

function MovieListTopRatedBody(): React.ReactElement {
  const { items, loading, loadingMore, error, hasMore, loadMore, refetch } = useTopRatedMovies();
  return (
    <MovieListBody
      items={items}
      loading={loading}
      loadingMore={loadingMore}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
      refetch={refetch}
    />
  );
}

function MovieListGenreBody({
  route,
}: {
  route: Props['route'];
}): React.ReactElement {
  const rawId = route.params.genreId;
  const safeId = typeof rawId === 'number' ? rawId : null;
  const { items, loading, loadingMore, error, hasMore, loadMore, refetch } = useMoviesByGenre(safeId);
  if (safeId === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Missing genre for this list.</Text>
      </View>
    );
  }
  return (
    <MovieListBody
      items={items}
      loading={loading}
      loadingMore={loadingMore}
      error={error}
      hasMore={hasMore}
      loadMore={loadMore}
      refetch={refetch}
    />
  );
}

interface BodyProps {
  items: MovieSummary[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

function MovieListBody({
  items,
  loading,
  loadingMore,
  error,
  hasMore,
  loadMore,
  refetch,
}: BodyProps): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const cardWidth = useMemo(() => Math.round(Dimensions.get('window').width - spacing.md * 2), []);
  const cardHeight = useMemo(() => Math.round((cardWidth * 3) / 2), [cardWidth]);

  const openMovie = useCallback(
    (item: MovieSummary) => {
      navigation.navigate('Detail', { mediaType: 'movie', id: item.id });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<MovieSummary> = ({ item }) => (
    <View style={styles.rowTap}>
      <ContentCard
        title={item.title}
        posterPath={item.poster_path}
        width={cardWidth}
        onPress={() => openMovie(item)}
      />
    </View>
  );

  return (
    <ScreenErrorBoundary onRetry={() => refetch().catch(() => {})}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        {loading && items.length === 0 && !error ? (
          <View style={styles.pad}>
            {[0, 1, 2, 3, 4].map(i => (
              <View key={i} style={styles.rowTap}>
                <SkeletonCard width={cardWidth} height={cardHeight} />
              </View>
            ))}
          </View>
        ) : error && items.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.err}>{error}</Text>
            <Pressable onPress={() => refetch().catch(() => {})} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={[styles.pad, styles.listBottom]}
            refreshControl={
              <RefreshControl
                refreshing={loading && items.length > 0}
                onRefresh={() => refetch().catch(() => {})}
                tintColor={colors.primary}
              />
            }
            onEndReachedThreshold={0.25}
            onEndReached={() => {
              if (hasMore && !loadingMore && !loading) {
                loadMore().catch(() => {});
              }
            }}
            ListFooterComponent={
              loadingMore ? (
                <View style={styles.footer}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : null
            }
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
  pad: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  listBottom: {
    paddingBottom: spacing.xxxl + spacing.xxl,
  },
  rowTap: {
    marginBottom: spacing.md,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  err: {
    ...typography.bodyMd,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retry: {
    backgroundColor: colors.surface_container_highest,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.xs,
  },
  retryText: {
    ...typography.titleSm,
    color: colors.on_surface,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
