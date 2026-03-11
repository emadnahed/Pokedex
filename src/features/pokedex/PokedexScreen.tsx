import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ListRenderItem,
  Image,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
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
import { formatPokemonId, formatPokemonName, getSpriteUrl } from '@/utils/pokemonHelpers';
import { getTypeData } from '@/utils/typeColors';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeInDown } from 'react-native-reanimated';

type Props = NativeStackScreenProps<PokedexStackParamList, 'Pokedex'>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PokedexScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);

  const { filteredPokemon, loading, error, searchQuery, selectedType, favorites } = useAppSelector(
    (state) => state.pokemon,
  );

  // Use details cache to decorate the spotlight
  const details = useAppSelector(state => state.pokemon.pokemonDetails);

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

  const displayData = showFavorites
    ? filteredPokemon.filter(p => favorites.includes(p.id))
    : filteredPokemon;

  const renderHeader = () => {
    const spotlightItem = displayData[0];
    const detail = spotlightItem ? details[spotlightItem.id] : null;
    const primaryType = detail?.types[0]?.type.name ?? 'normal';
    const typeData = getTypeData(primaryType);

    return (
      <Animated.View style={styles.spotlightWrap} entering={FadeInDown.duration(600).springify()}>
        {spotlightItem && (
          <AnimatedPressable
            style={[styles.spotlight, { backgroundColor: typeData.bg }]}
            onPress={() => handlePress(spotlightItem.id)}
          >
            <View style={styles.spotlightFade} />
            <Image
              source={{ uri: getSpriteUrl(spotlightItem.id) }}
              style={styles.spotlightSprite}
              resizeMode="contain"
            />
            <View style={styles.spotlightInfo}>
              <View style={styles.spTop}>
                <Text style={styles.spEyebrow}>NO. {formatPokemonId(spotlightItem.id).replace('#', '')}</Text>
                <Text style={styles.spName} numberOfLines={1} adjustsFontSizeToFit>
                  {formatPokemonName(spotlightItem.name)}
                </Text>
                {detail && (
                  <View style={styles.spTypeRow}>
                    {detail.types.map((t) => {
                      const td = getTypeData(t.type.name);
                      return (
                        <View key={t.type.name} style={[styles.spType, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                          <Text style={[styles.spTypeText, { color: '#FFFFFF' }]}>{t.type.name}</Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
              <View style={styles.spBottom}>
                <View style={styles.spCta}>
                  <Ionicons name="flash" size={12} color="#1C1410" />
                  <Text style={styles.spCtaText}>Details</Text>
                </View>
              </View>
            </View>
          </AnimatedPressable>
        )}
        <View style={styles.secHead}>
          <Text style={styles.secTitle}>Explore</Text>
          <View style={styles.secRight}>
            <Text style={styles.secCount}>{displayData.length} Pokémon</Text>
            <TouchableOpacity
              style={[styles.favToggleBtn, showFavorites && styles.favToggleBtnActive]}
              onPress={() => setShowFavorites(!showFavorites)}
            >
              <Ionicons
                name={showFavorites ? "heart" : "heart-outline"}
                size={16}
                color={showFavorites ? "#fff" : "rgba(255,255,255,0.4)"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    );
  };

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
    <View style={[styles.container, { backgroundColor: '#1C1410' }]}>
      <View style={styles.homeHeader}>
        <Text style={styles.wordmark} numberOfLines={1} adjustsFontSizeToFit>
          POKÉ<Text style={styles.wordmarkOutline}>DEX</Text>
        </Text>
        <View style={styles.hdrRight}>
          <TouchableOpacity style={styles.iconPill}>
            <Ionicons name="notifications-outline" size={18} color="#F0EBE3" />
          </TouchableOpacity>
        </View>
      </View>

      <SearchBar value={searchQuery} onChangeText={handleSearch} />
      <TypeFilter selectedType={selectedType} onTypeSelect={handleTypeSelect} />

      {loading && displayData.length === 0 ? (
        <SkeletonLoader />
      ) : displayData.length === 0 ? (
        <View style={{ flex: 1 }}>
          {renderHeader()}
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color="rgba(255,255,255,0.1)" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>No Pokémon found matching your filters.</Text>
            {showFavorites && (
              <TouchableOpacity style={styles.emptyBackBtn} onPress={() => setShowFavorites(false)}>
                <Ionicons name="arrow-back" size={16} color="#1C1410" />
                <Text style={styles.emptyBackText}>Back to All</Text>
              </TouchableOpacity>
            )}
            {searchQuery && (
              <TouchableOpacity style={styles.emptyBackBtn} onPress={() => dispatch(setSearchQuery(''))}>
                <Ionicons name="close" size={16} color="#1C1410" />
                <Text style={styles.emptyBackText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <FlatList
          data={displayData.slice(1)} // Skip the first item as it's the spotlight
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          numColumns={2}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews
          showsVerticalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={renderHeader}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 14, textAlign: 'center' },

  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 58, // Adjust for notch/status bar
    paddingBottom: 14,
    paddingHorizontal: 22,
  },
  wordmark: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 22,
    color: '#F0EBE3',
    letterSpacing: -0.5,
    paddingVertical: 4, // Prevents clipping on iOS
  },
  wordmarkOutline: {
    color: 'transparent',
    textShadowColor: 'rgba(240,235,227,0.4)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  hdrRight: { flexDirection: 'row', gap: 8 },
  iconPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A1F18',
    borderColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  spotlightWrap: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  spotlight: {
    borderRadius: 22,
    overflow: 'hidden',
    height: 250,
    marginBottom: 20,
    position: 'relative',
    // Strong shadow for that premium floating look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 16,
  },
  spotlightFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)', // Fallback for CSS gradient fade
  },
  spotlightSprite: {
    position: 'absolute',
    right: -8,
    bottom: -8,
    height: 210,
    width: 210,
    zIndex: 1,
  },
  spotlightInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    padding: 22,
    justifyContent: 'space-between',
    zIndex: 2,
    width: '60%',
  },
  spTop: {},
  spEyebrow: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    letterSpacing: 2.5,
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 6,
  },
  spName: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 38,
    color: '#FFFFFF',
    textTransform: 'capitalize',
    letterSpacing: -1,
    marginBottom: 12,
  },
  spTypeRow: { flexDirection: 'row', gap: 6 },
  spType: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 6,
  },
  spTypeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    textTransform: 'capitalize',
    letterSpacing: 0.4,
  },
  spBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  spCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  spCtaText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    color: '#1C1410',
    letterSpacing: 0.3,
  },

  secHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingBottom: 12,
  },
  secTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    color: '#F0EBE3',
    letterSpacing: -0.4,
  },
  secRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secCount: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: 'rgba(240,235,227,0.28)',
  },
  favToggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favToggleBtnActive: {
    backgroundColor: 'rgba(229,56,59,0.55)',
    borderColor: 'rgba(229,56,59,0.8)',
  },

  list: { paddingBottom: 60, paddingHorizontal: 4 },
  emptyState: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  emptyText: { fontFamily: 'Nunito_600SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 24 },
  emptyBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0EBE3',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  emptyBackText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: '#1C1410',
  },
});
