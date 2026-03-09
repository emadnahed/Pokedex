import React, { memo } from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { getTypeColor } from '@/utils/typeColors';

interface Props {
  type: string;
  size?: 'sm' | 'md';
}

function TypeBadgeComponent({ type, size = 'md' }: Props) {
  const color = getTypeColor(type);
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: color }, isSmall && styles.badgeSm]}>
      <Text style={[styles.label, isSmall && styles.labelSm]}>{type.toUpperCase()}</Text>
    </View>
  );
}

export const TypeBadge = memo(TypeBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  labelSm: {
    fontSize: 10,
  },
});
