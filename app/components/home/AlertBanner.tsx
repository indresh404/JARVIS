import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '@/theme';

export const AlertBanner = ({ message }: { message: string }) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Ionicons name="warning" size={18} color={COLORS.risk.red} />
      <Text style={styles.text}>{message}</Text>
      <Pressable onPress={() => setVisible(false)}>
        <Ionicons name="close" size={18} color={COLORS.risk.red} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: `${COLORS.risk.red}1A`,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.risk.red,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: { flex: 1, color: COLORS.risk.red, fontFamily: TYPOGRAPHY.fonts.medium },
});
