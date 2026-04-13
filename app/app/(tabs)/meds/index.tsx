import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

export default function MedsScreen() {
  const [open, setOpen] = useState(false);
  return (
    <ScreenWrapper>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Medicines</Text>
          <Button title="Add Medicine" size="sm" onPress={() => setOpen(true)} />
        </View>
        <Card style={{ marginTop: SPACING.md }}>
          <Text style={styles.medName}>Metformin 500mg</Text>
          <Text style={styles.meta}>8:00 AM</Text>
          <Pressable style={styles.mark}>
            <Ionicons name="checkmark-circle" size={18} color={COLORS.green[500]} />
            <Text style={styles.markText}>Mark Taken</Text>
          </Pressable>
        </Card>
        <Text style={styles.section}>Medicine History</Text>
        <Card>
          <Text style={styles.meta}>Adherence rate: 87%</Text>
          <View style={styles.barBg}>
            <View style={styles.barFill} />
          </View>
        </Card>
      </ScrollView>
      <Modal visible={open} animationType="slide" transparent>
        <View style={styles.modalWrap}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Medicine</Text>
            <Input placeholder="Medicine name" />
            <Button title="Check Conflicts" style={{ marginTop: SPACING.md }} />
            <Button title="Close" variant="ghost" onPress={() => setOpen(false)} style={{ marginTop: SPACING.sm }} />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface, padding: SPACING.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xxl },
  medName: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fonts.semibold, fontSize: TYPOGRAPHY.sizes.lg },
  meta: { color: COLORS.text.muted, marginTop: 6 },
  mark: { marginTop: SPACING.md, flexDirection: 'row', gap: 6, alignItems: 'center' },
  markText: { color: COLORS.green[500], fontFamily: TYPOGRAPHY.fonts.semibold },
  section: { marginTop: SPACING.lg, marginBottom: SPACING.sm, color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold },
  barBg: { marginTop: 10, height: 10, borderRadius: 8, backgroundColor: COLORS.gray[100] },
  barFill: { width: '87%', height: 10, borderRadius: 8, backgroundColor: COLORS.green[500] },
  modalWrap: { flex: 1, justifyContent: 'flex-end', backgroundColor: `${COLORS.blue[900]}66` },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg },
  sheetTitle: { color: COLORS.blue[900], fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl, marginBottom: SPACING.md },
});
