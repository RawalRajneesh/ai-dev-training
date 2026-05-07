import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export function ProfileScreen(): React.ReactElement {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.body}>This section is a placeholder for a future account experience.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.sm,
  },
  body: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
  },
});
