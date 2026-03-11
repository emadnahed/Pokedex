import React, { memo, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import type { PokemonListItem } from '@/features/pokedex/pokemonSlice';
import { formatPokemonId, formatPokemonName, getSpriteUrl } from '@/utils/pokemonHelpers';
import { getTypeData } from '@/utils/typeColors';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/hooks/useTheme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  pokemon: PokemonListItem;
  onPress: () => void;
}

function PokemonCardComponent({ pokemon, onPress }: Props) {
  const colors = useTheme();
  const scale = useSharedValue(1);

  // Use cached detail if available to show type color
  const detail = useAppSelector((state) => state.pokemon.pokemonDetails[pokemon.id]);
  const primaryType = detail?.types[0]?.type.name ?? 'normal';
  const typeData = getTypeData(primaryType);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 14, stiffness: 300 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
  }, [scale]);

  return (
    <AnimatedPressable
      testID={`pokemon-card-${pokemon.id}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.gcard, { backgroundColor: colors.surface, borderColor: colors.border }, animatedStyle]}
    >
      <View style={styles.gcardImg}>
        <View style={[styles.gcardImgBg, { backgroundColor: typeData.bg }]} />
        <View style={styles.gcardCircle} />
        <Image
          source={{ uri: getSpriteUrl(pokemon.id) }}
          style={styles.gcardSprite}
          resizeMode="contain"
        />
      </View>
      <View style={styles.gcardBody}>
        <Text style={[styles.gcardNum, { color: colors.textMuted }]}>
          {formatPokemonId(pokemon.id)}
        </Text>
        <Text style={[styles.gcardName, { color: colors.text }]} numberOfLines={1}>
          {formatPokemonName(pokemon.name)}
        </Text>
        {detail && (
          <View style={styles.gcardTypes}>
            {detail.types.map((t) => {
              const td = getTypeData(t.type.name);
              return (
                <View key={t.type.name} style={[styles.miniType, { backgroundColor: td.bg }]}>
                  <Text style={[styles.miniTypeText, { color: td.c }]}>
                    {t.type.name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </AnimatedPressable>
  );
}

export const PokemonCard = memo(PokemonCardComponent);

const styles = StyleSheet.create({
  gcard: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    // Add beautiful polished shadow to grid cards
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  gcardImg: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gcardImgBg: {
    ...StyleSheet.absoluteFillObject,
  },
  gcardCircle: {
    position: 'absolute',
    right: -18,
    bottom: -18,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  gcardSprite: {
    width: 80,
    height: 80,
    position: 'relative',
    zIndex: 1,
  },
  gcardBody: {
    paddingTop: 10,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  gcardNum: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  gcardName: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 15,
    textTransform: 'capitalize',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  gcardTypes: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  miniType: {
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  miniTypeText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 9.5,
    textTransform: 'capitalize',
    letterSpacing: 0.3,
  },
});
