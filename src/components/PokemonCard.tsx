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
import { getTypeColor } from '@/utils/typeColors';
import { useAppSelector } from '@/store/hooks';
import { useTheme } from '@/hooks/useTheme';

interface Props {
  pokemon: PokemonListItem;
  onPress: () => void;
}

function PokemonCardComponent({ pokemon, onPress }: Props) {
  const colors = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Use cached detail if available to show type color
  const detail = useAppSelector((state) => state.pokemon.pokemonDetails[pokemon.id]);
  const primaryType = detail?.types[0]?.type.name ?? null;
  const cardBg = primaryType ? getTypeColor(primaryType) : colors.surface;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(0.85, { duration: 120 });
  }, [scale, opacity]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 14, stiffness: 300 });
    opacity.value = withTiming(1, { duration: 200 });
  }, [scale, opacity]);

  return (
    <Animated.View style={[styles.card, { backgroundColor: cardBg }, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <Text style={styles.number}>{formatPokemonId(pokemon.id)}</Text>
        <Image
          source={{ uri: getSpriteUrl(pokemon.id) }}
          style={styles.sprite}
          resizeMode="contain"
        />
        <Text style={styles.name} numberOfLines={1}>
          {formatPokemonName(pokemon.name)}
        </Text>
        {detail && (
          <View style={styles.typesRow}>
            {detail.types.map((t) => (
              <View
                key={t.type.name}
                style={[styles.typePill, { backgroundColor: 'rgba(0,0,0,0.18)' }]}
              >
                <Text style={styles.typePillText}>{t.type.name.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export const PokemonCard = memo(PokemonCardComponent);

const styles = StyleSheet.create({
  card: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  pressable: {
    padding: 14,
    alignItems: 'center',
  },
  number: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.35)',
    letterSpacing: 0.5,
  },
  sprite: {
    width: '85%',
    aspectRatio: 1,
    marginVertical: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 4,
    textAlign: 'center',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  typePillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
