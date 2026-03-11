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
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: focusAnim.value ? 1.5 : 0,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.inputRow}>
        <Ionicons
          name="search"
          size={18}
          color={colors.textMuted}
          style={styles.icon}
        />
        <TextInput
          testID="search-input"
          style={[styles.input, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
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
    paddingHorizontal: 16,
    paddingBottom: 14,
    flexShrink: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  focusRing: {
    borderRadius: 12,
  },
  icon: {
    position: 'absolute',
    left: 14,
    zIndex: 2,
  },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 42,
    paddingRight: 16,
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
  },
});
