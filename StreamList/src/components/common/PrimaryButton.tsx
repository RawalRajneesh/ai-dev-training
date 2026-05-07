import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface Props {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
}

export function PrimaryButton({ label, onPress, disabled, style, icon }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.wrapper,
        style,
        pressed && !disabled ? { opacity: 0.9 } : null,
      ]}>
      <LinearGradient
        colors={[colors.primary, colors.primary_container]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, disabled && styles.disabled]}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: 'stretch',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    height: 52,
    paddingHorizontal: spacing.lg,
    borderRadius: spacing.xs,
  },
  disabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 14,
    color: colors.on_primary_fill,
  },
});
