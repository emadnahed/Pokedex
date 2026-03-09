import React, { memo, useCallback, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export const SearchBar = memo(({ value, onChangeText }: Props) => {
  const colors = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    focusAnim.value = withTiming(1, { duration: 200 });
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    focusAnim.value = withTiming(0, { duration: 200 });
  }, [focusAnim]);

  const animatedFocusStyle = useAnimatedStyle(() => ({
    borderColor: colors.primary,
    borderWidth: focusAnim.value * 1.5,
    opacity: focusAnim.value * 0.4,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.inputRow, { backgroundColor: colors.surface }]}>
        <Ionicons
          name="search"
          size={18}
          color={isFocused ? colors.primary : colors.textMuted}
          style={styles.icon}
        />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search name or #number..."
          placeholderTextColor={colors.textMuted}
          clearButtonMode="while-editing"
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <AnimatedView
          style={[StyleSheet.absoluteFill, styles.focusRing, animatedFocusStyle]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 26,
    paddingHorizontal: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  focusRing: {
    borderRadius: 26,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    letterSpacing: -0.2,
    fontWeight: '500',
  },
});
