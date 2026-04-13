import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

interface Props {
  visible: boolean;
  zone: string;
  score: number;
  symptoms: string[];
  onClose: () => void;
}

export const ZoneDetailCard = ({ visible, zone, score, symptoms, onClose }: Props) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{zone}</Text>
        <Text style={styles.score}>Health Index: {score}</Text>
        {symptoms.map((symptom) => (
          <Text key={symptom} style={styles.item}>
            - {symptom}
          </Text>
        ))}
        <Button title="Close" onPress={onClose} />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: `${COLORS.blue[900]}66` },
  sheet: { backgroundColor: COLORS.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: SPACING.lg },
  title: { color: COLORS.text.primary, fontFamily: TYPOGRAPHY.fonts.bold, fontSize: TYPOGRAPHY.sizes.xl },
  score: { marginTop: 6, color: COLORS.text.secondary, marginBottom: SPACING.md },
  item: { color: COLORS.text.muted, marginBottom: 4 },
});
