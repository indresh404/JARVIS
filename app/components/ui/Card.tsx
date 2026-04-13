// components/ui/Card.tsx
import { COLORS, GRADIENTS, SPACING } from '@/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  gradient?: boolean;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  gradient = false,
  style,
  onPress,
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  
  const cardContent = (
    <CardComponent
      style={[styles.card, !gradient && styles.whiteCard, style]}
      onPress={onPress}
      activeOpacity={0.95}
    >
      {children}
    </CardComponent>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={GRADIENTS.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, styles.gradientCard, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: SPACING.md,
    overflow: 'hidden',
  },
  whiteCard: {
    backgroundColor: COLORS.white,
    shadowColor: COLORS.blue[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gradientCard: {
    shadowColor: COLORS.blue[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
});