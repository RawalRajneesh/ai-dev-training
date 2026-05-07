import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MovieSummary } from '../api/types';
import { HOME_GENRE_CHIPS } from '../constants/homeGenres';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { GenreStrip } from '../components/home/GenreStrip';
import { HeroCard } from '../components/home/HeroCard';
import { HOME_HEADER_CONTENT_HEIGHT, HomeHeader } from '../components/home/HomeHeader';
import { HorizontalContentRow } from '../components/home/HorizontalContentRow';
import { PosterRow } from '../components/home/PosterRow';
import { useGenres } from '../hooks/useGenres';
import { useMoviesByGenre } from '../hooks/useMoviesByGenre';
import { useTopRatedMovies } from '../hooks/useTopRatedMovies';
import { useTrendingMovies } from '../hooks/useTrendingMovies';
import type { HomeStackParamList, RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const TAB_BAR_SCROLL_PADDING = spacing.xxxl + spacing.xxl;

export function HomeScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList & RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);

  const trending = useTrendingMovies();
  const topRated = useTopRatedMovies();
  const byGenre = useMoviesByGenre(selectedGenreId);
  const { genres: apiGenres } = useGenres();

  const isGenreFilterActive = selectedGenreId !== null;

  const genreChips = useMemo(
    () =>
      HOME_GENRE_CHIPS.map(c => ({
        id: c.id,
        label: c.id === null ? c.label : apiGenres.find(g => g.id === c.id)?.name ?? c.label,
      })),
    [apiGenres],
  );

  const cardWidth = useMemo(() => {
    const w = Dimensions.get('window').width;
    return Math.min(140, Math.round((w - spacing.md * 2) / 2.1));
  }, []);

  const hero = isGenreFilterActive
    ? byGenre.items[0] ?? null
    : trending.items[0] ?? null;

  const selectedGenreLabel = useMemo(() => {
    if (selectedGenreId === null) {
      return 'All';
    }
    const chip = genreChips.find(c => c.id === selectedGenreId);
    return chip?.label ?? 'Movies';
  }, [genreChips, selectedGenreId]);

  const openMovie = useCallback(
    (item: MovieSummary) => {
      navigation.navigate('Detail', { mediaType: 'movie', id: item.id });
    },
    [navigation],
  );

  const onScroll = Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
    useNativeDriver: false,
  });

  const refetchTrending = trending.refetch;
  const refetchTopRated = topRated.refetch;
  const refetchGenre = byGenre.refetch;
  const onRefresh = useCallback((): Promise<void> => {
    if (isGenreFilterActive) {
      return refetchGenre().then(() => {});
    }
    return Promise.all([refetchTrending(), refetchTopRated()]).then(() => {});
  }, [refetchTrending, refetchTopRated, refetchGenre, isGenreFilterActive]);

  const showGlobalLoading = isGenreFilterActive
    ? byGenre.loading && byGenre.items.length === 0
    : trending.loading && trending.items.length === 0;
  const showGlobalError = isGenreFilterActive
    ? Boolean(byGenre.error) && byGenre.items.length === 0
    : Boolean(trending.error) && trending.items.length === 0;
  const globalErrorMessage = isGenreFilterActive ? byGenre.error : trending.error;

  const contentTopPadding = insets.top + HOME_HEADER_CONTENT_HEIGHT;

  const anyRowLoadingMore = isGenreFilterActive
    ? byGenre.loadingMore
    : trending.loadingMore || topRated.loadingMore;

  const listRefreshing = isGenreFilterActive
    ? byGenre.loading && !showGlobalLoading
    : (trending.loading || topRated.loading) && !showGlobalLoading;

  const genreFilteredItems = byGenre.items.slice(1);

  return (
    <ScreenErrorBoundary onRetry={() => onRefresh().catch(() => {})}>
      <View style={styles.root}>
        <HomeHeader scrollY={scrollY} topInset={insets.top} />
        {showGlobalLoading ? (
          <View style={[styles.center, { paddingTop: contentTopPadding }]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : showGlobalError ? (
          <View style={[styles.center, { paddingTop: contentTopPadding }]}>
            <Text style={styles.err}>{globalErrorMessage}</Text>
            <Pressable onPress={() => onRefresh().catch(() => {})} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : (
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            refreshControl={
              <RefreshControl refreshing={listRefreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
            contentContainerStyle={{
              paddingTop: contentTopPadding,
              paddingBottom: TAB_BAR_SCROLL_PADDING,
            }}>
            <GenreStrip chips={genreChips} selectedId={selectedGenreId} onSelect={setSelectedGenreId} />
            {hero ? (
              <HeroCard
                movie={hero}
                onWatchNow={() => openMovie(hero)}
                onDetails={() => openMovie(hero)}
              />
            ) : null}

            {isGenreFilterActive ? (
              <>
                <PosterRow
                  key={`genre-${selectedGenreId}`}
                  title={selectedGenreLabel}
                  items={genreFilteredItems}
                  loading={byGenre.loading}
                  cardWidth={cardWidth}
                  onSelect={openMovie}
                  onEndReached={byGenre.loadMore}
                  rowLoading={byGenre.loadingMore}
                />
              </>
            ) : (
              <>
                <HorizontalContentRow
                  title="Trending Now"
                  items={trending.items}
                  loading={trending.loading}
                  loadingMore={trending.loadingMore}
                  hasMore={trending.hasMore}
                  cardWidth={cardWidth}
                  onSelect={openMovie}
                  onLoadMore={trending.loadMore}
                  onSeeAll={() =>
                    navigation.navigate('MovieList', { kind: 'trending', title: 'Trending Now' })
                  }
                />

                <HorizontalContentRow
                  title="Top Rated"
                  items={topRated.items}
                  loading={topRated.loading}
                  loadingMore={topRated.loadingMore}
                  hasMore={topRated.hasMore}
                  cardWidth={cardWidth}
                  onSelect={openMovie}
                  onLoadMore={topRated.loadMore}
                  onSeeAll={() =>
                    navigation.navigate('MovieList', { kind: 'topRated', title: 'Top Rated' })
                  }
                />
              </>
            )}

            {anyRowLoadingMore ? (
              <View style={styles.footerBlock}>
                <Text style={styles.footerLabel}>LOADING MORE CONTENT</Text>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : null}
          </Animated.ScrollView>
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
  footerBlock: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  footerLabel: {
    ...typography.labelSm,
    color: colors.on_surface_variant,
    textTransform: 'uppercase',
  },
});
