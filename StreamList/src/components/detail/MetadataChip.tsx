import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface Props {
  label: string;
  variant?: 'filled' | 'outlined';
  showStar?: boolean;
}

export function MetadataChip({ label, variant = 'filled', showStar = false }: Props) {
  return (
    <View style={[styles.chip, variant === 'outlined' && styles.chipOutlined]}>
      {showStar && <Text style={styles.star}>★</Text>}
      <Text style={[styles.text, variant === 'outlined' && styles.textOutlined]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.surface_container_low,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: spacing.xl,
  },
  chipOutlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.outline_variant,
  },
  star: {
    fontSize: 12,
    color: colors.primary,
  },
  text: {
    ...typography.label,
    color: colors.on_surface_variant,
  },
  textOutlined: {
    color: colors.on_surface,
  },
});
