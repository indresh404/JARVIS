import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { Button } from '@/components/ui/Button';
import { COLORS, GRADIENTS, SPACING, TYPOGRAPHY } from '@/theme';

const data = [
  ['Name', 'Rahul Sharma'],
  ['Age', '36'],
  ['Conditions', 'Hypertension'],
  ['Medicines', 'Telmisartan'],
  ['Allergies', 'None'],
  ['Family History', 'Diabetes'],
];

export default function ConfirmScreen() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
        <Text style={styles.title}>Your Health Profile</Text>
        <LinearGradient colors={GRADIENTS.surface} style={styles.card}>
          {data.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{value}</Text>
            </View>
          ))}
        </LinearGradient>
        <Button title="Edit" variant="outline" />
        <Button title="Confirm & Continue" style={{ marginTop: 12 }} onPress={() => setOpen(true)} />
      </ScrollView>
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.sheetWrap}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Set up your family group</Text>
            <Pressable style={styles.option}>
              <Text style={styles.optTitle}>Create Family Group</Text>
              <Text style={styles.optSub}>Start a new family group and invite members</Text>
            </Pressable>
            <Pressable style={styles.option}>
              <Text style={styles.optTitle}>Join Existing Family</Text>
              <Text style={styles.optSub}>Enter a family code to join your family</Text>
            </Pressable>
            <Pressable onPress={() => router.replace('/(tabs)/home')}>
              <Text style={styles.skip}>Skip for now</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.lg },
  title: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xxl, marginBottom: SPACING.md },
  card: { borderRadius: 16, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.blue[300], marginBottom: SPACING.lg },
  row: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.gray[100] },
  label: { color: COLORS.text.muted },
  value: { color: COLORS.text.primary, marginTop: 2, fontFamily: TYPOGRAPHY.fonts.semibold },
  sheetWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: `${COLORS.blue[900]}66` },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg },
  sheetTitle: { fontSize: TYPOGRAPHY.sizes.xl, color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, marginBottom: SPACING.md },
  option: { borderWidth: 1, borderColor: COLORS.blue[300], borderRadius: 14, padding: SPACING.md, marginBottom: SPACING.sm },
  optTitle: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.semibold },
  optSub: { color: COLORS.text.muted, marginTop: 4 },
  skip: { marginTop: SPACING.sm, textAlign: 'center', color: COLORS.blue[500], fontFamily: TYPOGRAPHY.fonts.medium },
});
