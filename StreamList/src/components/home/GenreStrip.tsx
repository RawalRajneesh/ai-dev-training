import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export interface GenreChipItem {
  id: number | null;
  label: string;
}

interface Props {
  chips: GenreChipItem[];
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export function GenreStrip({ chips, selectedId, onSelect }: Props): React.ReactElement {
  return (
    <View style={styles.section}>
      <FlatList
        horizontal
        data={chips}
        keyExtractor={item => (item.id === null ? 'all' : String(item.id))}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const active = item.id === selectedId;
          return (
            <Pressable
              onPress={() => onSelect(item.id)}
              style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}>
              <Text style={[styles.label, active ? styles.labelActive : styles.labelIdle]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  list: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xl,
    marginRight: spacing.xs,
  },
  chipIdle: {
    backgroundColor: colors.surface_container_high,
  },
  chipActive: {
    backgroundColor: colors.secondary_container,
  },
  label: {
    ...typography.bodySm,
  },
  labelIdle: {
    color: colors.on_surface_variant,
  },
  labelActive: {
    color: colors.on_surface,
  },
});
