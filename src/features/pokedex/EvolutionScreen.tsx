import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchEvolutionForPokemon, type EvolutionLink } from './pokemonSlice';
import { useTheme } from '@/hooks/useTheme';
import {
  formatPokemonName,
  formatPokemonId,
  getSpriteUrl,
  extractIdFromUrl,
} from '@/utils/pokemonHelpers';
import { getTypeColor } from '@/utils/typeColors';
import type { PokedexStackParamList } from '@/navigation/PokedexNavigator';

type Props = NativeStackScreenProps<PokedexStackParamList, 'Evolution'>;

// ─── Evolution stage parsing ─────────────────────────────────────────────────

interface EvolutionNode {
  id: number;
  name: string;
  trigger?: string;
  minLevel?: number | null;
  item?: string | null;
}

interface EvolutionStage {
  nodes: EvolutionNode[];
}

function parseChainToStages(link: EvolutionLink): EvolutionStage[] {
  const stages: EvolutionStage[] = [];

  function traverse(node: EvolutionLink, depth: number) {
    if (!stages[depth]) stages[depth] = { nodes: [] };
    const id = extractIdFromUrl(node.species.url);
    const detail = node.evolution_details[0];
    stages[depth].nodes.push({
      id,
      name: node.species.name,
      trigger: detail?.trigger?.name,
      minLevel: detail?.min_level,
      item: detail?.item?.name ?? null,
    });
    for (const next of node.evolves_to) {
      traverse(next, depth + 1);
    }
  }

  traverse(link, 0);
  return stages;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export function EvolutionScreen({ route, navigation }: Props) {
  const { pokemonId } = route.params;
  const dispatch = useAppDispatch();
  const colors = useTheme();

  const evolutionLoading = useAppSelector((state) => state.pokemon.evolutionLoading);
  const chains = useAppSelector((state) => state.pokemon.evolutionChains);
  const pokemon = useAppSelector((state) => state.pokemon.pokemonDetails[pokemonId]);

  // Find the chain that contains this pokemonId
  const chain = Object.values(chains).find((c) => {
    function includes(link: EvolutionLink): boolean {
      if (extractIdFromUrl(link.species.url) === pokemonId) return true;
      return link.evolves_to.some(includes);
    }
    return includes(c.chain);
  });

  useEffect(() => {
    if (!chain) {
      dispatch(fetchEvolutionForPokemon(pokemonId));
    }
  }, [chain, pokemonId, dispatch]);

  const handlePokemonPress = useCallback(
    (id: number) => {
      if (id !== pokemonId) {
        navigation.replace('PokemonDetail', { pokemonId: id });
      }
    },
    [navigation, pokemonId],
  );

  if (evolutionLoading || !chain) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stages = parseChainToStages(chain.chain);
  const primaryType = pokemon?.types[0]?.type.name ?? 'normal';
  const accentColor = getTypeColor(primaryType);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {stages.map((stage, stageIdx) => (
        <View key={stageIdx}>
          {/* Arrow between stages */}
          {stageIdx > 0 && (
            <Animated.View
              entering={FadeIn.delay(stageIdx * 100)}
              style={styles.arrowRow}
            >
              <View style={[styles.arrowLine, { backgroundColor: colors.border }]} />
              <View style={[styles.arrowHead, { borderTopColor: colors.border }]} />
              <Text style={[styles.arrowLabel, { color: colors.textSecondary }]}>
                {stage.nodes[0]?.trigger === 'level-up' && stage.nodes[0]?.minLevel
                  ? `Lv. ${stage.nodes[0].minLevel}`
                  : stage.nodes[0]?.item
                  ? formatPokemonName(stage.nodes[0].item)
                  : 'Evolves'}
              </Text>
            </Animated.View>
          )}

          {/* Nodes in this stage (for branching evolutions) */}
          <View style={styles.stageRow}>
            {stage.nodes.map((node, nodeIdx) => {
              const isCurrent = node.id === pokemonId;
              const detail = pokemon?.types[0]?.type.name;
              const nodeColor = isCurrent ? accentColor : colors.surface;

              return (
                <Animated.View
                  key={node.id}
                  entering={FadeInDown.delay(stageIdx * 120 + nodeIdx * 60).springify()}
                  style={styles.nodeWrapper}
                >
                  <TouchableOpacity
                    style={[
                      styles.nodeCard,
                      {
                        backgroundColor: nodeColor,
                        borderColor: isCurrent ? accentColor : colors.border,
                        borderWidth: isCurrent ? 2 : 1,
                      },
                    ]}
                    onPress={() => handlePokemonPress(node.id)}
                    activeOpacity={0.8}
                    disabled={isCurrent}
                  >
                    <Image
                      source={{ uri: getSpriteUrl(node.id) }}
                      style={styles.nodeSprite}
                      resizeMode="contain"
                    />
                    <Text
                      style={[
                        styles.nodeNumber,
                        { color: isCurrent ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                      ]}
                    >
                      {formatPokemonId(node.id)}
                    </Text>
                    <Text
                      style={[
                        styles.nodeName,
                        { color: isCurrent ? '#FFFFFF' : colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {formatPokemonName(node.name)}
                    </Text>
                  </TouchableOpacity>
                  {!isCurrent && (
                    <Ionicons
                      name="arrow-forward-circle"
                      size={22}
                      color={colors.textMuted}
                      style={styles.tapHint}
                    />
                  )}
                </Animated.View>
              );
            })}
          </View>
        </View>
      ))}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  stageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  nodeWrapper: {
    alignItems: 'center',
  },
  nodeCard: {
    width: 130,
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  nodeSprite: {
    width: 90,
    height: 90,
  },
  nodeNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  nodeName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    textAlign: 'center',
    marginTop: 2,
  },
  tapHint: {
    marginTop: 8,
  },
  arrowRow: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 2,
  },
  arrowLine: {
    width: 2,
    height: 20,
  },
  arrowHead: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  bottomSpacer: { height: 60 },
});
