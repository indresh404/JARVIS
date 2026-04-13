import { Loader } from '@/components/ui/Loader';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import LottieView from 'lottie-react-native';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type IntroPhase = 'loading' | 'intro' | 'ready';

interface ScreenIntroGateProps extends PropsWithChildren {
  loaderDuration?: number;
  loaderText?: string;
  introDuration?: number;
  introSource?: any;
  introText?: string;
  backgroundColor?: string;
}

export function ScreenIntroGate({
  children,
  loaderDuration = 3000,
  loaderText = 'Preparing your health view...',
  introDuration = 6000,
  introSource,
  introText,
  backgroundColor = COLORS.gray[50],
}: ScreenIntroGateProps) {
  const [phase, setPhase] = useState<IntroPhase>('loading');

  useEffect(() => {
    if (phase !== 'loading') return;

    const timeout = setTimeout(() => {
      setPhase(introSource ? 'intro' : 'ready');
    }, loaderDuration);

    return () => clearTimeout(timeout);
  }, [introSource, loaderDuration, phase]);

  useEffect(() => {
    if (phase !== 'intro') return;

    const timeout = setTimeout(() => {
      setPhase('ready');
    }, introDuration);

    return () => clearTimeout(timeout);
  }, [introDuration, phase]);

  if (phase === 'loading') {
    return <Loader text={loaderText} backgroundColor={backgroundColor} />;
  }

  if (phase === 'intro' && introSource) {
    return (
      <View style={[styles.introContainer, { backgroundColor }]}>
        <View style={styles.introCard}>
          <LottieView
            source={introSource}
            autoPlay
            loop={false}
            style={styles.introAnimation}
            onAnimationFinish={(isCancelled) => {
              if (!isCancelled) {
                setPhase('ready');
              }
            }}
          />
          {introText ? <Text style={styles.introText}>{introText}</Text> : null}
        </View>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
  },
  introCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  introAnimation: {
    width: 260,
    height: 260,
  },
  introText: {
    marginTop: SPACING.sm,
    color: COLORS.text.secondary,
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    textAlign: 'center',
  },
});
