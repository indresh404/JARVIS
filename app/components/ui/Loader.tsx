// components/ui/Loader.tsx
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import LottieView from 'lottie-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LoaderProps {
  text?: string;
  animationSize?: number;
  backgroundColor?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  text = 'Please wait...',
  animationSize = 180,
  backgroundColor = COLORS.gray[50],
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <LottieView
        source={require('../../assets/lottie_animations/loader.json')}
        autoPlay
        loop
        style={{ width: animationSize, height: animationSize }}
      />
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
    paddingHorizontal: SPACING.lg,
  },
  text: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.muted,
    textAlign: 'center',
  },
});
