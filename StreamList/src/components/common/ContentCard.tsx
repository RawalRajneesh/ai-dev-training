import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { buildImageUrl } from '../../utils/image';

interface Props {
  title: string;
  posterPath: string | null;
  width: number;
  onPress: () => void;
  onLongPress?: () => void;
}

export function ContentCard({ title, posterPath, width, onPress, onLongPress }: Props) {
  const height = Math.round((width * 3) / 2);
  const uri = buildImageUrl(posterPath, 'w342');

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.wrap, { width }]}>
      {uri ? (
        <ImageBackground
          source={{ uri }}
          style={[styles.image, { height }]}
          imageStyle={styles.imageInner}>
          <View style={styles.gradient} />
          <Text numberOfLines={2} style={styles.title}>
            {title}
          </Text>
        </ImageBackground>
      ) : (
        <View style={[styles.placeholder, { height }]}>
          <Text numberOfLines={2} style={styles.placeholderTitle}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    justifyContent: 'flex-end',
    borderRadius: spacing.sm,
    overflow: 'hidden',
    backgroundColor: colors.surface_container_low,
  },
  imageInner: {
    borderRadius: spacing.sm,
  },
  gradient: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(14, 14, 14, 0.55)',
  },
  title: {
    ...typography.bodySm,
    color: colors.on_surface,
    padding: spacing.sm,
  },
  placeholder: {
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_low,
    justifyContent: 'center',
    padding: spacing.sm,
  },
  placeholderTitle: {
    ...typography.bodySm,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
});
