import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPokemonList,
  fetchPokemonByType,
  setSearchQuery,
  setTypeFilter,
  type PokemonListItem,
} from './pokemonSlice';
import { PokemonCard } from '@/components/PokemonCard';
import { SearchBar } from '@/components/SearchBar';
import { TypeFilter } from '@/components/TypeFilter';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { pokemonService } from '@/api/pokemonService';
import type { PokedexStackParamList } from '@/navigation/PokedexNavigator';

type Props = NativeStackScreenProps<PokedexStackParamList, 'Pokedex'>;

export function PokedexScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const { filteredPokemon, loading, error, searchQuery, selectedType } = useAppSelector(
    (state) => state.pokemon,
  );

  useEffect(() => {
    dispatch(fetchPokemonList());
  }, [dispatch]);

  const handleSearch = useCallback(
    (q: string) => dispatch(setSearchQuery(q)),
    [dispatch],
  );

  const typeFilter = useAppSelector((state) => state.pokemon.typeFilter);

  const handleTypeSelect = useCallback(
    (type: string | null) => {
      dispatch(setTypeFilter(type));
      if (type && !typeFilter[type]) {
        dispatch(fetchPokemonByType(type));
      }
    },
    [dispatch, typeFilter],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      pokemonService.clearListCache();
      await dispatch(fetchPokemonList());
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handlePress = useCallback(
    (id: number) => navigation.navigate('PokemonDetail', { pokemonId: id }),
    [navigation],
  );

  const keyExtractor = useCallback((item: PokemonListItem) => String(item.id), []);

  const renderItem: ListRenderItem<PokemonListItem> = useCallback(
    ({ item }) => <PokemonCard pokemon={item} onPress={() => handlePress(item.id)} />,
    [handlePress],
  );

  if (error && filteredPokemon.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Failed to load: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <TypeFilter selectedType={selectedType} onTypeSelect={handleTypeSelect} />
      {loading && filteredPokemon.length === 0 ? (
        <SkeletonLoader />
      ) : (
        <FlatList
          data={filteredPokemon}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  list: { paddingHorizontal: 8, paddingVertical: 8, paddingBottom: 60 },
  errorText: { fontSize: 14, textAlign: 'center' },
});
