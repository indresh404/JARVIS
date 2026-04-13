import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge } from '@/components/ui/Badge';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '@/theme';

interface RiskScoreCardProps {
  score: number;
  level: string;
  reason: string;
}

export const RiskScoreCard = ({ score, level, reason }: RiskScoreCardProps) => {
  const badgeColor = level.toLowerCase().includes('high')
    ? 'red'
    : level.toLowerCase().includes('elevated')
      ? 'orange'
      : level.toLowerCase().includes('moderate')
        ? 'yellow'
        : 'green';

  return (
    <LinearGradient colors={GRADIENTS.primary} style={styles.card}>
      <Text style={styles.label}>Your Health Score</Text>
      <Text style={styles.score}>{score}</Text>
      <Badge label={level} color={badgeColor as 'red'} />
      <Text style={styles.reason}>{reason}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 20, padding: SPACING.lg },
  label: { color: `${COLORS.white}B3`, fontFamily: TYPOGRAPHY.fonts.medium, marginBottom: 8 },
  score: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: 48 },
  reason: { color: `${COLORS.white}CC`, marginTop: SPACING.md, fontSize: TYPOGRAPHY.sizes.sm },
});
