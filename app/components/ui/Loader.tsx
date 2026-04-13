// components/ui/Loader.tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Please wait...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={COLORS.green[500]} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  text: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.muted,
  },
});