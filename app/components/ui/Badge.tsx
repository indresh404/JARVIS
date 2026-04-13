// components/ui/Badge.tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type BadgeColor = 'blue' | 'green' | 'red' | 'orange' | 'yellow' | 'gray';

interface BadgeProps {
  text: string;
  color?: BadgeColor;
}

export const Badge: React.FC<BadgeProps> = ({ text, color = 'blue' }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'blue':
        return { bg: COLORS.blue[100], text: COLORS.blue[700] };
      case 'green':
        return { bg: COLORS.green[300], text: COLORS.green[500] };
      case 'red':
        return { bg: '#FEE2E2', text: COLORS.risk.red };
      case 'orange':
        return { bg: '#FFEDD5', text: COLORS.risk.orange };
      case 'yellow':
        return { bg: '#FEF3C7', text: COLORS.risk.yellow };
      case 'gray':
        return { bg: COLORS.gray[100], text: COLORS.gray[500] };
    }
  };

  const colors = getColorStyles();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: TYPOGRAPHY.sizes.xs,
  },
});