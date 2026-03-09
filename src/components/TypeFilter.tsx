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
          { backgroundColor: selected ? color : colors.surface },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text
          style={[
            styles.chipText,
            { color: selected ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scroll: { height: 66, flexShrink: 0 },
  container: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
});
