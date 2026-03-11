import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPokemonDetail, toggleFavorite } from './pokemonSlice';
import { StatBar } from '@/components/StatBar';
import { TypeBadge } from '@/components/TypeBadge';
import { GlossarySheet } from '@/components/GlossarySheet';
import { AbilityAccordion } from '@/components/AbilityAccordion';
import { useTheme } from '@/hooks/useTheme';
import {
  formatPokemonId,
  formatPokemonName,
  formatHeight,
  formatWeight,
  getSpriteUrl,
} from '@/utils/pokemonHelpers';
import { getTypeData } from '@/utils/typeColors';
import type { PokedexStackParamList } from '@/navigation/PokedexNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = NativeStackScreenProps<PokedexStackParamList, 'PokemonDetail'>;

export function PokemonDetailScreen({ route, navigation }: Props) {
  const { pokemonId } = route.params;
  const dispatch = useAppDispatch();
  const colors = useTheme();
  const insets = useSafeAreaInsets();
  const [isGlossaryVisible, setIsGlossaryVisible] = React.useState(false);

  // Animation value for sprite floatiing
  const floatAnim = useSharedValue(0);

  const pokemon = useAppSelector((state) => state.pokemon.pokemonDetails[pokemonId]);
  const detailLoading = useAppSelector((state) => state.pokemon.detailLoading);
  const isFavorite = useAppSelector((state) => state.pokemon.favorites.includes(pokemonId));

  useEffect(() => {
    if (!pokemon) {
      dispatch(fetchPokemonDetail(pokemonId));
    }
  }, [pokemonId, pokemon, dispatch]);

  useEffect(() => {
    floatAnim.value = withRepeat(
      withSequence(
        withTiming(-13, { duration: 1900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [floatAnim]);

  const handleFavorite = useCallback(() => {
    dispatch(toggleFavorite(pokemonId));
  }, [dispatch, pokemonId]);

  const handleEvolution = useCallback(() => {
    navigation.navigate('Evolution', { pokemonId });
  }, [navigation, pokemonId]);

  const animatedSpriteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }],
  }));

  if (!pokemon || detailLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const primaryType = pokemon.types[0]?.type.name ?? 'normal';
  const typeData = getTypeData(primaryType);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* STICKY HEADER ACTIONS */}
      <View style={[styles.dTopbar, { top: Math.max(insets.top, 16) + (Platform.OS === 'android' ? 22 : 0) }]}>
        <TouchableOpacity style={styles.dBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="rgba(255,255,255,0.85)" />
        </TouchableOpacity>
        <View style={styles.topRBtns}>
          <TouchableOpacity style={styles.dBtn} onPress={() => setIsGlossaryVisible(true)}>
            <Ionicons name="help" size={20} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.dBtn, isFavorite && styles.dBtnLit]} onPress={handleFavorite}>
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#fff" : "rgba(255,255,255,0.85)"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.dScroll} showsVerticalScrollIndicator={false}>
        {/* HERO BANNER */}
        <View style={[styles.dHero, { backgroundColor: typeData.bg }]}>
          <View style={styles.dHeroFade} />

          <Animated.Image
            source={{ uri: getSpriteUrl(pokemon.id) }}
            style={[styles.dSprite, animatedSpriteStyle]}
            resizeMode="contain"
          />

          <View style={styles.dHeroText}>
            <Text style={styles.dNTag}>NO. {formatPokemonId(pokemon.id).replace('#', '')}</Text>
            <Text style={styles.dPname}>{formatPokemonName(pokemon.name)}</Text>
            <View style={styles.dTypesRow}>
              {pokemon.types.map((t) => {
                const td = getTypeData(t.type.name);
                return (
                  <View key={t.type.name} style={[styles.dTypePill, { backgroundColor: td.bg }]}>
                    <Text style={[styles.dTypePillText, { color: td.c }]}>{t.type.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* DETAIL BODY */}
        <View style={styles.dBody}>

          {/* VITALS */}
          <View style={styles.vitals}>
            <View style={styles.vital}>
              <Text style={[styles.vitalVal, { color: colors.text }]}>{formatWeight(pokemon.weight).split(' ')[0]}</Text>
              <Text style={styles.vitalKey}>KG</Text>
            </View>
            <View style={styles.vitalLine} />
            <View style={styles.vital}>
              <Text style={[styles.vitalVal, { color: colors.text }]}>{formatHeight(pokemon.height).split(' ')[0]}</Text>
              <Text style={styles.vitalKey}>M</Text>
            </View>
          </View>

          {/* ABILITIES */}
          <View style={styles.abWrap}>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Abilities</Text>
            </View>
            {pokemon.abilities.map((a) => (
              <AbilityAccordion
                key={a.ability.name}
                abilityName={a.ability.name}
                isHidden={a.is_hidden}
              />
            ))}
          </View>

          {/* STATS */}
          <View style={styles.statsWrap}>
            <View style={styles.secHead}>
              <Text style={styles.secTitle}>Base Stats</Text>
            </View>
            <View style={styles.statsContainer}>
              {pokemon.stats.map((s) => (
                <StatBar
                  key={s.stat.name}
                  statName={s.stat.name}
                  value={s.base_stat}
                />
              ))}
            </View>
          </View>

          {/* EVO BANNER */}
          <TouchableOpacity
            style={[styles.evoBanner, { backgroundColor: typeData.bg }]}
            onPress={handleEvolution}
            activeOpacity={0.8}
          >
            <View style={styles.evoBannerBg} />
            <View style={styles.evoBannerBody}>
              <Text style={[styles.evoBannerLabel, { color: typeData.c }]}>EVOLUTION PATH</Text>
              <Text style={styles.evoBannerTitle}>View Evolution Chain</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <GlossarySheet visible={isGlossaryVisible} onClose={() => setIsGlossaryVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dScroll: { flex: 1 },

  dHero: {
    height: 380,
    position: 'relative',
    overflow: 'hidden',
  },
  dHeroFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // Fallback texture gradient
  },
  dTopbar: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    zIndex: 10,
  },
  topRBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  dBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dBtnLit: {
    backgroundColor: 'rgba(229,56,59,0.55)',
  },
  dSprite: {
    position: 'absolute',
    right: 10,
    bottom: 20,
    width: 220,
    height: 220,
    zIndex: 2,
  },
  dHeroText: {
    position: 'absolute',
    bottom: 22,
    left: 20,
    zIndex: 3,
  },
  dNTag: {
    fontFamily: 'Nunito_900Black',
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 4,
  },
  dPname: {
    fontFamily: 'BricolageGrotesque_800ExtraBold',
    fontSize: 46,
    lineHeight: 46,
    color: '#fff',
    textTransform: 'capitalize',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  dTypesRow: { flexDirection: 'row', gap: 6 },
  dTypePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 7,
  },
  dTypePillText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 11,
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },

  dBody: {
    paddingBottom: 110,
  },

  vitals: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  vital: {
    flex: 1,
    alignItems: 'center',
  },
  vitalLine: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 4,
  },
  vitalVal: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    lineHeight: 22,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  vitalKey: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    letterSpacing: 1.5,
    color: 'rgba(240,235,227,0.28)',
  },

  secHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  secTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 19,
    color: '#F0EBE3',
    letterSpacing: -0.4,
  },

  abWrap: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 8,
  },

  statsWrap: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  statsContainer: {
    marginTop: 4,
  },

  evoBanner: {
    marginHorizontal: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  evoBannerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)', // Shadow tint
  },
  evoBannerBody: { zIndex: 1 },
  evoBannerLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 4,
  },
  evoBannerTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    color: '#fff',
    letterSpacing: -0.3,
  },
});
