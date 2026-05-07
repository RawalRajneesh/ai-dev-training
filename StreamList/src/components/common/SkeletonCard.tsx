import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  width: number;
  height: number;
}

export function SkeletonCard({ width, height }: Props) {
  const pulse = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          width,
          height,
          opacity: pulse,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.sm,
    backgroundColor: colors.surface_container_highest,
    marginRight: spacing.md,
  },
});
