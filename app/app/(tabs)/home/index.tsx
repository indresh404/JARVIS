import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { RiskScoreCard } from '@/components/home/RiskScoreCard';
import { HeatmapWebView } from '@/components/heatmap/HeatmapWebView';
import { Button } from '@/components/ui/Button';
import { FamilyMemberCard } from '@/components/home/FamilyMemberCard';
import { AlertBanner } from '@/components/home/AlertBanner';
import { EmptyState } from '@/components/shared/EmptyState';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export default function HomeScreen() {
  const alerts = ['Blood pressure trend rising for the last 3 days'];
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: SPACING.xxl }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning, Rahul</Text>
          </View>
          <Ionicons name="notifications-outline" size={22} color={COLORS.blue[900]} />
        </View>
        <RiskScoreCard score={72} level="Elevated" reason="Elevated cardiovascular stress and reduced sleep quality this week." />
        <Text style={styles.sectionTitle}>Body Map</Text>
        <HeatmapWebView zoneScores={{ chest: 78, abdomen: 65, leg: 42 }} />
        <Button title="View Full Body Map" style={{ marginTop: SPACING.md }} />
        <Text style={styles.sectionTitle}>Family Health</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <FamilyMemberCard name="Meera" age={34} riskLevel="Low" riskScore={28} />
          <FamilyMemberCard name="Aarav" age={12} riskLevel="Moderate" riskScore={54} />
        </ScrollView>
        <Text style={styles.sectionTitle}>Alerts</Text>
        <View style={{ gap: 8 }}>
          {alerts.length ? alerts.map((message) => <AlertBanner key={message} message={message} />) : <EmptyState heading="No Alerts" subtitle="You're all good today." />}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  greeting: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl },
  sectionTitle: { marginTop: SPACING.lg, marginBottom: SPACING.sm, color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.lg },
});
