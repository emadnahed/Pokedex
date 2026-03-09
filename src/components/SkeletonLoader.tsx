import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const CARD_COUNT = 6;

export function SkeletonLoader() {
  const colors = useTheme();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.35, { duration: 750, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.grid, { backgroundColor: colors.background }]}>
      {Array.from({ length: CARD_COUNT }).map((_, i) => (
        <Animated.View
          key={i}
          style={[styles.card, { backgroundColor: colors.surface }, animatedStyle]}
        >
          <View style={[styles.sprite, { backgroundColor: colors.skeleton }]} />
          <View style={styles.info}>
            <View style={[styles.line, styles.numLine, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.line, styles.nameLine, { backgroundColor: colors.skeleton }]} />
            <View style={[styles.line, styles.typeLine, { backgroundColor: colors.skeleton }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  card: {
    width: '47%',
    margin: '1.5%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  sprite: { width: '100%', aspectRatio: 1 },
  info: { padding: 12, gap: 8 },
  line: { height: 10, borderRadius: 5 },
  numLine: { width: '35%' },
  nameLine: { width: '70%' },
  typeLine: { width: '50%' },
});
