import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchPokemonDetail,
  toggleFavorite,
} from './pokemonSlice';
import { StatBar } from '@/components/StatBar';
import { TypeBadge } from '@/components/TypeBadge';
import { useTheme } from '@/hooks/useTheme';
import {
  formatPokemonId,
  formatPokemonName,
  formatHeight,
  formatWeight,
  getSpriteUrl,
} from '@/utils/pokemonHelpers';
import { getTypeColor } from '@/utils/typeColors';
import type { PokedexStackParamList } from '@/navigation/PokedexNavigator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = 340;

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

export function PokemonDetailScreen({ route, navigation }: Props) {
  const { pokemonId } = route.params;
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const scrollY = useSharedValue(0);

  const pokemon = useAppSelector((state) => state.pokemon.pokemonDetails[pokemonId]);
  const detailLoading = useAppSelector((state) => state.pokemon.detailLoading);
  const isFavorite = useAppSelector((state) => state.pokemon.favorites.includes(pokemonId));

  useEffect(() => {
    if (!pokemon) {
      dispatch(fetchPokemonDetail(pokemonId));
    }
  }, [pokemonId, pokemon, dispatch]);

  const handleFavorite = useCallback(
    () => dispatch(toggleFavorite(pokemonId)),
    [dispatch, pokemonId],
  );

  const handleEvolution = useCallback(
    () => navigation.navigate('Evolution', { pokemonId }),
    [navigation, pokemonId],
  );

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
          [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.6],
          Extrapolation.CLAMP,
        ),
      },
      {
        scale: interpolate(
          scrollY.value,
          [-HEADER_HEIGHT, 0],
          [1.8, 1],
          Extrapolation.EXTEND,
        ),
      },
    ],
  }));

  if (!pokemon || detailLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeColor = getTypeColor(primaryType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Colored header background */}
      <Animated.View style={[styles.headerBg, { backgroundColor: typeColor }, headerAnimatedStyle]}>
        <Image
          source={{ uri: getSpriteUrl(pokemon.id) }}
          style={styles.sprite}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT - 48 }}
      >
        <Animated.View entering={FadeInDown.delay(80).springify().damping(16)}>
          <View style={[styles.contentPanel, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />

            {/* Title row */}
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <Text style={[styles.number, { color: colors.textSecondary }]}>
                  {formatPokemonId(pokemon.id)}
                </Text>
                <Text style={[styles.name, { color: colors.text }]}>
                  {formatPokemonName(pokemon.name)}
                </Text>
                <View style={styles.typesRow}>
                  {pokemon.types.map((t) => (
                    <TypeBadge key={t.type.name} type={t.type.name} />
                  ))}
                </View>
              </View>
              <TouchableOpacity
                onPress={handleFavorite}
                style={[
                  styles.favBtn,
                  { backgroundColor: isFavorite ? colors.favorite : colors.inputBg },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isFavorite ? 'star' : 'star-outline'}
                  size={22}
                  color={isFavorite ? '#1A1A1A' : colors.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Quick stats */}
            <View style={[styles.quickStats, { backgroundColor: colors.background }]}>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatHeight(pokemon.height)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Height</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {formatWeight(pokemon.weight)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Weight</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {pokemon.base_experience ?? '—'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Base EXP</Text>
              </View>
            </View>

            {/* Abilities */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Abilities</Text>
            <View style={styles.abilitiesRow}>
              {pokemon.abilities.map((a) => (
                <View
                  key={a.ability.name}
                  style={[styles.abilityChip, { backgroundColor: colors.inputBg }]}
                >
                  <Text style={[styles.abilityText, { color: colors.text }]}>
                    {formatPokemonName(a.ability.name)}
                  </Text>
                  {a.is_hidden && (
                    <Text style={[styles.hiddenTag, { color: colors.textMuted }]}> (Hidden)</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Base stats */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Base Stats</Text>
            <View style={styles.statsContainer}>
              {pokemon.stats.map((s) => (
                <StatBar
                  key={s.stat.name}
                  statName={s.stat.name}
                  value={s.base_stat}
                  primaryType={primaryType}
                />
              ))}
            </View>

            {/* Evolution chain button */}
            <TouchableOpacity
              style={[styles.evoBtn, { backgroundColor: typeColor }]}
              onPress={handleEvolution}
              activeOpacity={0.85}
            >
              <Text style={styles.evoBtnText}>View Evolution Chain</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </View>
        </Animated.View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sprite: {
    width: 200,
    height: 200,
    marginBottom: 8,
  },
  contentPanel: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    minHeight: SCREEN_HEIGHT - HEADER_HEIGHT + 48,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 16,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleLeft: { flex: 1, paddingRight: 12 },
  number: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5, marginBottom: 2 },
  name: { fontSize: 32, fontWeight: '800', letterSpacing: -1, lineHeight: 38, marginBottom: 10 },
  typesRow: { flexDirection: 'row', gap: 8 },
  favBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStats: {
    flexDirection: 'row',
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 28,
    alignItems: 'center',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 4 },
  divider: { width: 1, height: 36 },
  statValue: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 14,
  },
  abilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  abilityChip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  abilityText: { fontSize: 14, fontWeight: '600' },
  hiddenTag: { fontSize: 12, fontWeight: '400' },
  statsContainer: { marginBottom: 28 },
  evoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  evoBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bottomSpacer: { height: 60 },
});
