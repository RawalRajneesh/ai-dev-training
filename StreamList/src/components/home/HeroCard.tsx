import React, { useMemo } from 'react';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { MovieSummary } from '../../api/types';
import { buildImageUrl } from '../../utils/image';
import { colors, heroPrimaryGradient } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props {
  movie: MovieSummary;
  onWatchNow: () => void;
  onDetails: () => void;
}

export function HeroCard({ movie, onWatchNow, onDetails }: Props): React.ReactElement {
  const uri = buildImageUrl(movie.backdrop_path ?? movie.poster_path, 'w780');
  const cardWidth = useMemo(() => Math.round(Dimensions.get('window').width * 0.9), []);
  const cardHeight = useMemo(() => Math.round(Dimensions.get('window').height * 0.4), []);

  return (
    <View style={[styles.wrap, { width: cardWidth }]}>
      {uri ? (
        <ImageBackground source={{ uri }} style={[styles.image, { minHeight: cardHeight }]} imageStyle={styles.imageInner}>
          <LinearGradient
            colors={['transparent', colors.surface]}
            locations={[0, 1]}
            style={styles.fadeBottom}
          />
          <View style={styles.textBlock}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NEW RELEASE</Text>
            </View>
            <Text style={styles.title}>{movie.title}</Text>
            {movie.overview ? (
              <Text numberOfLines={2} style={styles.overview}>
                {movie.overview}
              </Text>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Watch now"
                onPress={onWatchNow}
                style={styles.primaryOuter}>
                <View style={styles.primaryBtnWrapper}>
                  <LinearGradient
                    colors={[...heroPrimaryGradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.primaryGradient}
                  />
                  <View style={styles.primaryBtnContent}>
                    <Text style={styles.playGlyph}>▶</Text>
                    <Text style={styles.primaryLabel}>Watch Now</Text>
                  </View>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Details"
                onPress={onDetails}
                style={styles.secondaryOuter}>
                <View style={styles.secondaryBtn}>
                  <Text style={styles.secondaryLabel}>Details</Text>
                </View>
              </Pressable>
            </View>
          </View>
        </ImageBackground>
      ) : (
        <View style={[styles.image, styles.fallback, { minHeight: cardHeight }]}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>NEW RELEASE</Text>
          </View>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onWatchNow} style={styles.primaryOuter}>
              <View style={styles.primaryBtnWrapper}>
                <LinearGradient
                  colors={[...heroPrimaryGradient]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryGradient}
                />
                <View style={styles.primaryBtnContent}>
                  <Text style={styles.playGlyph}>▶</Text>
                  <Text style={styles.primaryLabel}>Watch Now</Text>
                </View>
              </View>
            </Pressable>
            <Pressable onPress={onDetails} style={styles.secondaryOuter}>
              <View style={styles.secondaryBtn}>
                <Text style={styles.secondaryLabel}>Details</Text>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
    borderRadius: spacing.md,
    overflow: 'hidden',
    backgroundColor: colors.surface_container_low,
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  imageInner: {
    borderRadius: spacing.md,
  },
  fadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  textBlock: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary_container,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xl,
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.labelSm,
    color: colors.on_primary_fill,
    textTransform: 'uppercase',
  },
  title: {
    ...typography.displayMd,
    color: colors.on_surface,
    marginBottom: spacing.xs,
  },
  overview: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  primaryOuter: {
    flex: 1,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  primaryBtnWrapper: {
    position: 'relative',
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  primaryGradient: {
    ...StyleSheet.absoluteFill,
  },
  primaryBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  playGlyph: {
    fontSize: spacing.sm,
    color: colors.on_primary_fill,
  },
  primaryLabel: {
    ...typography.titleSm,
    color: colors.on_primary_fill,
  },
  secondaryOuter: {
    flex: 1,
    borderRadius: spacing.sm,
    overflow: 'hidden',
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
  },
  secondaryLabel: {
    ...typography.titleSm,
    color: colors.on_surface,
  },
  fallback: {
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
});
