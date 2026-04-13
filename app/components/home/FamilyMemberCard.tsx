import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { TYPOGRAPHY, COLORS } from '@/theme';

interface Props {
  name: string;
  age: number;
  riskLevel: 'Low' | 'Moderate' | 'Elevated' | 'High';
  riskScore: number;
}

export const FamilyMemberCard = ({ name, age, riskLevel, riskScore }: Props) => (
  <Card style={styles.card}>
    <Text style={styles.name}>{name}</Text>
    <Text style={styles.age}>Age {age}</Text>
    <View style={styles.row}>
      <Badge
        label={riskLevel}
        color={riskLevel === 'High' ? 'red' : riskLevel === 'Elevated' ? 'orange' : riskLevel === 'Moderate' ? 'yellow' : 'green'}
      />
      <Text style={styles.score}>{riskScore}</Text>
    </View>
  </Card>
);

const styles = StyleSheet.create({
  card: { width: 160, marginRight: 12 },
  name: { fontFamily: TYPOGRAPHY.fonts.bold, color: COLORS.text.primary, fontSize: TYPOGRAPHY.sizes.md },
  age: { marginTop: 4, color: COLORS.text.muted, fontFamily: TYPOGRAPHY.fonts.regular },
  row: { marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  score: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.lg },
});
