import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Platform,
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
import { getTypeData } from '@/utils/typeColors';
import type { PokedexStackParamList } from '@/navigation/PokedexNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();

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
      <View style={[styles.centered, { backgroundColor: '#1C1410' }]}>
        <ActivityIndicator size="large" color="#F0EBE3" />
      </View>
    );
  }

  const stages = parseChainToStages(chain.chain);
  const primaryType = pokemon?.types[0]?.type.name ?? 'normal';
  const typeData = getTypeData(primaryType);

  return (
    <View style={[styles.container, { backgroundColor: '#1C1410' }]}>
      <View style={[styles.topbar, { paddingTop: Math.max(insets.top, 16) + (Platform.OS === 'android' ? 12 : 0) }]}>
        <TouchableOpacity testID="evo-back-button" style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#1C1410" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evolution Chain</Text>
        <View style={{ width: 38 }} />
      </View>
      <ScrollView
        style={styles.scroll}
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
                <View style={[styles.arrowLine, { backgroundColor: 'rgba(255,255,255,0.07)' }]} />
                <View style={[styles.arrowHead, { borderTopColor: 'rgba(255,255,255,0.07)' }]} />
                <Text style={[styles.arrowLabel, { color: 'rgba(255,255,255,0.28)' }]}>
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
                const nodeColor = isCurrent ? typeData.bg : '#2A1F18';

                return (
                  <Animated.View
                    key={node.id}
                    entering={FadeInDown.delay(stageIdx * 120 + nodeIdx * 60).springify()}
                    style={styles.nodeWrapper}
                  >
                    <TouchableOpacity
                      testID={`evo-node-${node.id}`}
                      style={[
                        styles.nodeCard,
                        {
                          backgroundColor: nodeColor,
                          borderColor: isCurrent ? 'transparent' : 'rgba(255,255,255,0.03)',
                          borderWidth: 1,
                        },
                      ]}
                      onPress={() => handlePokemonPress(node.id)}
                      activeOpacity={0.8}
                      disabled={isCurrent}
                    >
                      {isCurrent && <View style={styles.nodeCardFade} />}
                      <Image
                        source={{ uri: getSpriteUrl(node.id) }}
                        style={styles.nodeSprite}
                        resizeMode="contain"
                      />
                      <View style={styles.nodeInfo}>
                        <Text
                          style={[
                            styles.nodeNumber,
                            { color: isCurrent ? 'rgba(255,255,255,0.5)' : 'rgba(240,235,227,0.28)' },
                          ]}
                        >
                          {formatPokemonId(node.id)}
                        </Text>
                        <Text
                          style={[
                            styles.nodeName,
                            { color: isCurrent ? '#FFFFFF' : '#F0EBE3' },
                          ]}
                          numberOfLines={1}
                        >
                          {formatPokemonName(node.name)}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
    backgroundColor: '#1C1410',
    zIndex: 10,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0EBE3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 18,
    color: '#F0EBE3',
    letterSpacing: -0.5,
  },
  content: { paddingHorizontal: 24, paddingTop: 32 },
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
    width: 140,
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  nodeCardFade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  nodeSprite: {
    width: 95,
    height: 95,
    zIndex: 2,
  },
  nodeInfo: {
    marginTop: 12,
    alignItems: 'center',
    zIndex: 2,
  },
  nodeNumber: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  nodeName: {
    fontFamily: 'BricolageGrotesque_600SemiBold',
    fontSize: 16,
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  arrowRow: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 2,
  },
  arrowLine: {
    width: 2,
    height: 24,
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
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 6,
    letterSpacing: 1,
  },
  bottomSpacer: { height: 100 },
});
