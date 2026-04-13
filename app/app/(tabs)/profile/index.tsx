import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '@/theme';

export default function ProfileScreen() {
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <LinearGradient colors={GRADIENTS.primary} style={styles.header}>
          <Avatar initials="RS" size={70} />
          <Text style={styles.name}>Rahul Sharma, 36</Text>
          <Badge label="Active" color="green" />
        </LinearGradient>
        <Card style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>Health Profile</Text>
          <Text style={styles.item}>Conditions: Hypertension</Text>
          <Text style={styles.item}>Allergies: None</Text>
          <Text style={styles.item}>Medicines: Telmisartan</Text>
        </Card>
        <Card style={{ marginTop: SPACING.md, alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>Family Group</Text>
          <QRCode value="SWASTHYA_FAM_8K2D" size={140} />
          <Text style={[styles.item, { marginTop: 10 }]}>Code: SWASTHYA-FAM-8K2D</Text>
        </Card>
        <Card style={{ marginTop: SPACING.md }}>
          <Text style={styles.sectionTitle}>Symptom History</Text>
          <Text style={styles.item}>Chest | Elevated | 05 Apr 2026</Text>
          <Text style={styles.item}>Head | Moderate | 03 Apr 2026</Text>
        </Card>
        <Button title="Sign Out" variant="danger" style={{ marginTop: SPACING.lg, marginBottom: SPACING.xl }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md },
  header: { borderRadius: 16, padding: SPACING.lg, alignItems: 'center', gap: 10 },
  name: { color: COLORS.white, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.lg },
  sectionTitle: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.lg, marginBottom: 8 },
  item: { color: COLORS.text.secondary, marginBottom: 4 },
});
