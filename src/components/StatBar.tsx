import React, { memo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { getStatLabel, getStatMax } from '@/utils/pokemonHelpers';
import { getTypeColor } from '@/utils/typeColors';

interface Props {
  statName: string;
  value: number;
  primaryType: string;
}

function StatBarComponent({ statName, value, primaryType }: Props) {
  const colors = useTheme();
  const progress = useSharedValue(0);
  const max = getStatMax(statName);
  const ratio = Math.min(value / max, 1);
  const barColor = getTypeColor(primaryType);

  useEffect(() => {
    progress.value = withTiming(ratio, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [ratio, progress]);

  const animatedBarStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {getStatLabel(statName)}
      </Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {String(value).padStart(3, ' ')}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.statBar }]}>
        <Animated.View style={[styles.fill, { backgroundColor: barColor }, animatedBarStyle]} />
      </View>
    </View>
  );
}

export const StatBar = memo(StatBarComponent);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    width: 68,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  value: {
    width: 36,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    marginRight: 12,
    fontVariant: ['tabular-nums'],
  },
  track: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
