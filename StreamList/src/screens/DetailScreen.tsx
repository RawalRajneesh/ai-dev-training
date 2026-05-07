import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MediaType } from '../api/types';
import { pickPrimaryRuntime } from '../api/movies';
import { MetadataChip } from '../components/detail/MetadataChip';
import { ContentCard } from '../components/common/ContentCard';
import { PrimaryButton } from '../components/common/PrimaryButton';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { useMovieDetail } from '../hooks/useMovieDetail';
import type { RootStackParamList } from '../navigation/types';
import { useWatchlistStore } from '../store/watchlistStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { buildImageUrl } from '../utils/image';

type DetailRoute = RouteProp<RootStackParamList, 'Detail'>;

const SYNOPSIS_LINE_LIMIT = 4;

export function DetailScreen(): React.ReactElement {
  const route = useRoute<DetailRoute>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { mediaType, id } = route.params;
  const insets = useSafeAreaInsets();
  const { data, loading, error, refetch } = useMovieDetail({ mediaType, id });
  const addItem = useWatchlistStore(s => s.addItem);
  const removeItem = useWatchlistStore(s => s.removeItem);
  const isSaved = useWatchlistStore(s => s.isSaved(mediaType, id));
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const title = useMemo(() => {
    if (!data?.detail) {
      return '';
    }
    if (data.detail.mediaType === 'movie') {
      return data.detail.detail.title;
    }
    return data.detail.detail.name;
  }, [data]);

  const posterPath = useMemo(() => {
    if (!data?.detail) {
      return null;
    }
    return data.detail.detail.poster_path;
  }, [data]);

  const backdropUri = useMemo(() => {
    if (!data?.detail) {
      return null;
    }
    const path =
      data.detail.mediaType === 'movie'
        ? data.detail.detail.backdrop_path ?? data.detail.detail.poster_path
        : data.detail.detail.backdrop_path ?? data.detail.detail.poster_path;
    return buildImageUrl(path, 'w780');
  }, [data]);

  const chips = useMemo(() => {
    if (!data?.detail) {
      return [] as { label: string; type: 'default' | 'rating' | 'genre' }[];
    }
    const out: { label: string; type: 'default' | 'rating' | 'genre' }[] = [];
    if (data.detail.mediaType === 'movie') {
      const m = data.detail.detail;
      if (m.release_date) {
        out.push({ label: m.release_date.slice(0, 4), type: 'default' });
      }
      if (m.vote_average > 0) {
        out.push({ label: `${m.vote_average.toFixed(1)} Rating`, type: 'rating' });
      }
      if (m.genres?.length > 0) {
        out.push({ label: m.genres[0].name, type: 'genre' });
      }
      const runtime = pickPrimaryRuntime('movie', m.runtime, undefined);
      if (runtime && runtime > 0) {
        const hrs = Math.floor(runtime / 60);
        const mins = runtime % 60;
        out.push({ label: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`, type: 'default' });
      }
    } else {
      const t = data.detail.detail;
      if (t.first_air_date) {
        out.push({ label: t.first_air_date.slice(0, 4), type: 'default' });
      }
      if (t.vote_average > 0) {
        out.push({ label: `${t.vote_average.toFixed(1)} Rating`, type: 'rating' });
      }
      if (t.genres?.length > 0) {
        out.push({ label: t.genres[0].name, type: 'genre' });
      }
      const runtime = pickPrimaryRuntime('tv', t.runtime, t.episode_run_time);
      if (runtime && runtime > 0) {
        const hrs = Math.floor(runtime / 60);
        const mins = runtime % 60;
        out.push({ label: hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`, type: 'default' });
      }
    }
    return out;
  }, [data]);

  const overview = useMemo(() => {
    if (!data?.detail) {
      return '';
    }
    return data.detail.mediaType === 'movie'
      ? data.detail.detail.overview
      : data.detail.detail.overview;
  }, [data]);

  const similar = useMemo(() => {
    if (!data) {
      return [];
    }
    if (mediaType === 'movie') {
      return data.similarMovies.map(m => ({
        key: `movie-${m.id}`,
        mediaType: 'movie' as const,
        id: m.id,
        label: m.title,
        poster: m.poster_path,
      }));
    }
    return data.similarTv.map(m => ({
      key: `tv-${m.id}`,
      mediaType: 'tv' as const,
      id: m.id,
      label: m.name,
      poster: m.poster_path,
    }));
  }, [data, mediaType]);

  const cast = data?.credits?.cast?.slice(0, 12) ?? [];

  const toggleWatchlist = () => {
    if (!title) {
      return;
    }
    const key = `${mediaType}:${id}`;
    if (isSaved) {
      removeItem(key);
    } else {
      addItem({
        mediaType,
        tmdbId: id,
        title,
        posterPath,
      });
    }
  };

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Check out ${title} on StreamList!`,
      });
    } catch {
      // User cancelled or error
    }
  }, [title]);

  const toggleSynopsis = () => setSynopsisExpanded(prev => !prev);

  return (
    <ScreenErrorBoundary onRetry={refetch}>
      <View style={styles.root}>
        {loading && !data ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error && !data?.detail ? (
          <View style={[styles.center, { paddingTop: insets.top }]}>
            <Text style={styles.err}>{error}</Text>
            <Pressable onPress={() => void refetch()} style={styles.retry}>
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : data?.detail ? (
          <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}>
            {/* Hero with overlaid header buttons and title */}
            <View style={styles.hero}>
              {backdropUri ? (
                <ImageBackground source={{ uri: backdropUri }} style={styles.heroImage}>
                  <LinearGradient
                    colors={['rgba(19, 19, 19, 0.4)', 'transparent', colors.surface]}
                    locations={[0, 0.3, 1]}
                    style={styles.heroFade}
                  />
                </ImageBackground>
              ) : (
                <View style={[styles.heroImage, styles.heroFallback]} />
              )}
              {/* Header overlay with back and share buttons */}
              <View style={[styles.headerOverlay, { paddingTop: insets.top + spacing.xs }]}>
                <Pressable
                  onPress={() => navigation.goBack()}
                  style={styles.headerButton}
                  hitSlop={spacing.sm}>
                  <Text style={styles.headerIcon}>‹</Text>
                </Pressable>
                <Pressable
                  onPress={handleShare}
                  style={styles.headerButton}
                  hitSlop={spacing.sm}>
                  <Text style={styles.shareIcon}>↗</Text>
                </Pressable>
              </View>
              {/* Title positioned at bottom-left of hero */}
              <Text style={styles.heroTitle}>{title}</Text>
            </View>

            <View style={styles.body}>
              {/* Metadata chips row */}
              {chips.length > 0 && (
                <View style={styles.chips}>
                  {chips.map((c, idx) => (
                    <MetadataChip
                      key={`${c.label}-${idx}`}
                      label={c.label}
                      variant={c.type === 'genre' ? 'outlined' : 'filled'}
                      showStar={c.type === 'rating'}
                    />
                  ))}
                </View>
              )}

              {/* CTA Button - full width */}
              <PrimaryButton
                label={isSaved ? 'In Watchlist' : 'Add to Watchlist'}
                onPress={toggleWatchlist}
                icon={<Text style={styles.ctaIcon}>{isSaved ? '✓' : '+'}</Text>}
                style={styles.cta}
              />

              {/* Synopsis section */}
              {overview ? (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Synopsis</Text>
                  <Text
                    style={styles.synopsis}
                    numberOfLines={synopsisExpanded ? undefined : SYNOPSIS_LINE_LIMIT}>
                    {overview}
                  </Text>
                  <Pressable onPress={toggleSynopsis} hitSlop={spacing.xs}>
                    <Text style={styles.readMore}>
                      {synopsisExpanded ? 'Show less' : 'Read more'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              {/* Cast section */}
              {cast.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Cast</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.castRow}>
                    {cast.map(c => (
                      <View key={String(c.id)} style={styles.castCard}>
                        {c.profile_path ? (
                          <Image
                            source={{ uri: buildImageUrl(c.profile_path, 'w185') ?? undefined }}
                            style={styles.castImage}
                          />
                        ) : (
                          <View style={[styles.castImage, styles.castImagePlaceholder]}>
                            <Text style={styles.castImagePlaceholderText}>
                              {c.name.charAt(0)}
                            </Text>
                          </View>
                        )}
                        <Text style={styles.castName} numberOfLines={1}>
                          {c.name}
                        </Text>
                        <Text style={styles.castChar} numberOfLines={1}>
                          {c.character}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* More Like This section */}
              {similar.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>More Like This</Text>
                    <Pressable hitSlop={spacing.xs}>
                      <Text style={styles.seeAll}>See All</Text>
                    </Pressable>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.similarRow}>
                    {similar.map(s => (
                      <ContentCard
                        key={s.key}
                        title={s.label}
                        posterPath={s.poster}
                        width={120}
                        onPress={() =>
                          navigation.push('Detail', {
                            mediaType: s.mediaType,
                            id: s.id,
                          })
                        }
                      />
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.center}>
            <Text style={styles.err}>Unavailable</Text>
          </View>
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
    justifyContent: 'center',
    alignItems: 'center',
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
  hero: {
    height: 280,
    position: 'relative',
  },
  heroImage: {
    height: 280,
    width: '100%',
  },
  heroFade: {
    ...StyleSheet.absoluteFill,
  },
  heroFallback: {
    backgroundColor: colors.surface_container_low,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  headerButton: {
    width: spacing.xxxl,
    height: spacing.xxxl,
    borderRadius: spacing.lg,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    fontSize: 28,
    color: colors.on_surface,
    marginTop: -2,
  },
  shareIcon: {
    fontSize: 20,
    color: colors.on_surface,
  },
  heroTitle: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    ...typography.displayLg,
    color: colors.on_surface,
  },
  body: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  cta: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  ctaIcon: {
    fontSize: 18,
    color: colors.surface_container_lowest,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.sm,
  },
  seeAll: {
    ...typography.titleSm,
    color: colors.primary,
  },
  synopsis: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
  },
  readMore: {
    ...typography.titleSm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  castRow: {
    gap: spacing.sm,
  },
  castCard: {
    width: 80,
    alignItems: 'center',
  },
  castImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: spacing.xs,
    backgroundColor: colors.surface_container_low,
  },
  castImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  castImagePlaceholderText: {
    ...typography.headlineMd,
    color: colors.on_surface_variant,
  },
  castName: {
    ...typography.titleSm,
    color: colors.on_surface,
    textAlign: 'center',
  },
  castChar: {
    ...typography.bodySm,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  similarRow: {
    gap: spacing.sm,
  },
});
