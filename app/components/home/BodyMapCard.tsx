import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface BodyMapCardProps {
  onPress?: () => void;
}

export const BodyMapCard: React.FC<BodyMapCardProps> = ({ onPress }) => {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity activeOpacity={0.88} onPress={onPress} style={styles.container}>
        <LinearGradient
          colors={['#000000', '#111827', '#000000']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.backgroundGlow} />

          <View style={styles.content}>
            <View style={styles.leftContent}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="human-handsup" size={38} color="#34d399" />
              </View>

              <View style={styles.textContainer}>
                <View style={styles.labelRow}>
                  <View style={styles.labelDot} />
                  <Text style={styles.label}>AI VISUALIZATION</Text>
                </View>
                <Text style={styles.title}>3D Diagnostic Body Map</Text>
                <Text style={styles.description}>
                  Open the immersive full-screen model viewer
                </Text>
              </View>
            </View>

            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>Open</Text>
              <MaterialCommunityIcons name="arrow-top-right" size={18} color="#34d399" />
            </View>
          </View>

          <View style={styles.border} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    position: 'relative',
    overflow: 'hidden',
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  backgroundGlow: {
    position: 'absolute',
    right: -40,
    top: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#10b981',
    opacity: 0.08,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    zIndex: 1,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
  },
  textContainer: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34d399',
  },
  label: {
    color: '#9ca3af',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  description: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  ctaContainer: {
    minWidth: 74,
    height: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.18)',
  },
  ctaText: {
    color: '#ecfdf5',
    fontSize: 12,
    fontWeight: '700',
  },
  border: {
    position: 'absolute',
    inset: 0,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.18)',
    pointerEvents: 'none',
  },
});
