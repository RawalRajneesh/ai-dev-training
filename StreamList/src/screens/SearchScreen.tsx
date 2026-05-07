import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MultiSearchResult } from '../api/types';
import { ContentCard } from '../components/common/ContentCard';
import { ScreenErrorBoundary } from '../components/common/ScreenErrorBoundary';
import { useSearch } from '../hooks/useSearch';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

const GAP = spacing.sm;

export function SearchScreen(): React.ReactElement {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const {
    data,
    loading,
    error,
    refetch,
    searchText,
    setSearchText,
    loadMore,
    clearRecent,
    pushRecent,
  } = useSearch();

  const cellWidth = useMemo(() => {
    const w = Dimensions.get('window').width;
    return Math.floor((w - spacing.md * 2 - GAP) / 2);
  }, []);

  const openResult = (item: MultiSearchResult) => {
    const term = data?.query?.trim() || searchText.trim();
    if (term) {
      void pushRecent(term);
    }
    navigation.navigate('Detail', { mediaType: item.media_type, id: item.id });
  };

  const q = data?.query ?? '';
  const showGrid = q.length > 0;
  const showEmpty = showGrid && !loading && (data?.results.length ?? 0) === 0;

  return (
    <ScreenErrorBoundary onRetry={refetch}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.searchBar}>
          <TextInput
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search movies and series"
            placeholderTextColor={colors.on_surface_variant}
            style={styles.input}
            returnKeyType="search"
            onSubmitEditing={() => void pushRecent(searchText.trim())}
          />
          {loading ? <ActivityIndicator color={colors.primary} /> : null}
        </View>
        {error ? <Text style={styles.err}>{error}</Text> : null}
        {!showGrid ? (
          <View style={styles.recentBlock}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle}>Recent searches</Text>
              {data?.recentSearches.length ? (
                <Pressable onPress={() => void clearRecent()}>
                  <Text style={styles.clear}>Clear</Text>
                </Pressable>
              ) : null}
            </View>
            {data?.recentSearches.map(term => (
              <Pressable
                key={term}
                onPress={() => {
                  setSearchText(term);
                }}
                style={styles.recentRow}>
                <Text style={styles.recentText}>{term}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {showEmpty ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No results</Text>
            <Text style={styles.emptyBody}>Try another title or keyword.</Text>
          </View>
        ) : null}
        {showGrid && !showEmpty ? (
          <FlatList
            data={data?.results ?? []}
            keyExtractor={item => `${item.media_type}-${item.id}`}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.grid}
            onEndReachedThreshold={0.5}
            onEndReached={() => void loadMore()}
            renderItem={({ item }) => {
              const title = item.title ?? item.name ?? 'Untitled';
              return (
                <View style={[styles.cell, { width: cellWidth }]}>
                  <ContentCard
                    title={title}
                    posterPath={item.poster_path}
                    width={cellWidth}
                    onPress={() => openResult(item)}
                  />
                </View>
              );
            }}
          />
        ) : null}
      </View>
    </ScreenErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface_container_low,
    borderRadius: spacing.md,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.on_surface,
    paddingVertical: spacing.xs,
  },
  err: {
    ...typography.bodySm,
    color: colors.error,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  recentBlock: {
    paddingHorizontal: spacing.md,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recentTitle: {
    ...typography.headlineMd,
    color: colors.on_surface,
  },
  clear: {
    ...typography.bodySm,
    color: colors.primary,
  },
  recentRow: {
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface_container_low,
    borderRadius: spacing.xs,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  recentText: {
    ...typography.bodyMd,
    color: colors.on_surface,
  },
  empty: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headlineMd,
    color: colors.on_surface,
    marginBottom: spacing.xs,
  },
  emptyBody: {
    ...typography.bodyMd,
    color: colors.on_surface_variant,
    textAlign: 'center',
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: GAP,
  },
  cell: {},
});
