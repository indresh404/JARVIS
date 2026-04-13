// components/chat/TypingIndicator.tsx
import { COLORS, SPACING } from '@/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export const TypingIndicator: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  const animateDot = (dot: Animated.Value, delay: number) => {
    return Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(dot, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    const animations = [
      animateDot(dot1, 0),
      animateDot(dot2, 200),
      animateDot(dot3, 400),
    ];

    animations.forEach((animation) => animation.start());

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [dot1, dot2, dot3]);

  const getDotStyle = (dot: Animated.Value) => ({
    transform: [
      {
        translateY: dot.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -8],
        }),
      },
    ],
  });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, getDotStyle(dot1)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot2)]} />
        <Animated.View style={[styles.dot, getDotStyle(dot3)]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  bubble: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray[400],
    marginHorizontal: 2,
  },
});
