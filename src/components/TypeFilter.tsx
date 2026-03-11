import React, { memo, useCallback } from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { getTypeColor, POKEMON_TYPES } from '@/utils/typeColors';

interface Props {
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

export const TypeFilter = memo(({ selectedType, onTypeSelect }: Props) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={60}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      <TypeChip
        label="All"
        selected={selectedType === null}
        color="#6B6B6B"
        onPress={() => onTypeSelect(null)}
      />
      {POKEMON_TYPES.map((type) => (
        <TypeChip
          key={type}
          label={type}
          selected={selectedType === type}
          color={getTypeColor(type)}
          onPress={() => onTypeSelect(type === selectedType ? null : type)}
        />
      ))}
    </ScrollView>
  );
});

interface ChipProps {
  label: string;
  selected: boolean;
  color: string;
  onPress: () => void;
}

function TypeChip({ label, selected, color, onPress }: ChipProps) {
  const colors = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.9, { damping: 12, stiffness: 400 });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  }, [scale]);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        style={[
          styles.chip,
          {
            backgroundColor: selected ? color : colors.surface,
            borderColor: selected ? 'transparent' : colors.border,
          },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#FFFFFF' : colors.textMuted },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { flexShrink: 0 },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 12,
    letterSpacing: 0.2,
    textTransform: 'capitalize',
  },
});
