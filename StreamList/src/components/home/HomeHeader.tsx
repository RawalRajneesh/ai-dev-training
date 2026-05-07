import React from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export const HOME_HEADER_CONTENT_HEIGHT = spacing.xxxl;

interface Props {
  scrollY: Animated.Value;
  topInset: number;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

function AppIcon(): React.ReactElement {
  return (
    <View style={iconStyles.appIconContainer}>
      <View style={iconStyles.playTriangle} />
    </View>
  );
}

function BellIcon(): React.ReactElement {
  return (
    <View style={iconStyles.bellContainer}>
      <View style={iconStyles.bellBody} />
      <View style={iconStyles.bellClapper} />
    </View>
  );
}

export function HomeHeader({ scrollY, topInset }: Props): React.ReactElement {
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 56],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const totalHeight = topInset + HOME_HEADER_CONTENT_HEIGHT;

  return (
    <View style={[styles.wrapper, { height: totalHeight, paddingTop: topInset }]} pointerEvents="box-none">
      {Platform.OS === 'ios' ? (
        <AnimatedBlurView
          blurType="dark"
          blurAmount={22}
          reducedTransparencyFallbackColor={colors.scrim}
          style={[StyleSheet.absoluteFill, { height: totalHeight, opacity: blurOpacity }]}
        />
      ) : (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            styles.androidBlurFallback,
            { height: totalHeight, opacity: blurOpacity },
          ]}
        />
      )}
      <View style={styles.row}>
        <View style={styles.left}>
          <AppIcon />
          <Text style={styles.wordmark}>StreamList</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notifications"
          onPress={() => {}}
          hitSlop={spacing.sm}>
          <BellIcon />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  androidBlurFallback: {
    top: 0,
    backgroundColor: colors.scrim,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: HOME_HEADER_CONTENT_HEIGHT,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  wordmark: {
    ...typography.headlineMd,
    color: colors.on_surface,
  },
});

const iconStyles = StyleSheet.create({
  appIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: colors.on_primary,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  bellContainer: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBody: {
    width: 16,
    height: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    backgroundColor: colors.on_surface,
  },
  bellClapper: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.on_surface,
    marginTop: 1,
  },
});
