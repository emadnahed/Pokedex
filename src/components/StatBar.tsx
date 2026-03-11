import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { getStatMax } from '@/utils/pokemonHelpers';

interface Props {
  statName: string;
  value: number;
  primaryType: string;
}

const STATS_UI: Record<string, { l: string, c: string }> = {
  hp: { l: "HP", c: "#E05555" },
  attack: { l: "ATK", c: "#E08830" },
  defense: { l: "DEF", c: "#4499DD" },
  "special-attack": { l: "Sp.A", c: "#9944CC" },
  "special-defense": { l: "Sp.D", c: "#33AA66" },
  speed: { l: "SPD", c: "#CC4477" },
};

function StatBarComponent({ statName, value }: Props) {
  const colors = useTheme();
  const progress = useSharedValue(0);
  const max = getStatMax(statName);
  const ratio = Math.min(value / max, 1);
  const statConfig = STATS_UI[statName] ?? { l: statName.toUpperCase(), c: "#FFFFFF" };

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 1100,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    });
  }, [ratio, progress]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.statRow}>
      <Text style={[styles.sLbl, { color: colors.textMuted }]}>
        {statConfig.l}
      </Text>
      <Text style={[styles.sNum, { color: colors.text }]}>
        {value}
      </Text>
      <View style={styles.sTrack}>
        <Animated.View style={[styles.sFill, { backgroundColor: statConfig.c }, animatedBarStyle]} />
      </View>
    </View>
  );
}

export const StatBar = memo(StatBarComponent);

const styles = StyleSheet.create({
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sLbl: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 10.5,
    textTransform: 'uppercase',
    letterSpacing: 1,
    width: 48,
    flexShrink: 0,
  },
  sNum: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 16,
    width: 34,
    textAlign: 'right',
    flexShrink: 0,
    letterSpacing: -0.5,
  },
  sTrack: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  sFill: {
    height: '100%',
    borderRadius: 99,
  },
});
