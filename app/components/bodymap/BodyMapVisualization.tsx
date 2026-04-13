// components/bodymap/BodyMapVisualization.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Modal,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BODY_ZONES, getRiskLevelColor, getRiskLevelLabel } from '@/data/bodyZones';
import type { BodyZone } from '@/data/bodyZones';

interface BodyMapVisualizationProps {
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

// SVG-based Body Map Component
const BodyMapSVG = ({ selectedZone, onZoneSelect }: { selectedZone: string | null; onZoneSelect: (id: string) => void }) => {
  return (
    <View style={styles.svgContainer}>
      {/* Body outline (simplified human figure) */}
      <View style={styles.bodyOutline}>
        {/* Head circle */}
        <TouchableOpacity
          style={[styles.zone, { top: '8%', left: '50%', marginLeft: -20, width: 40, height: 40 }]}
          onPress={() => onZoneSelect('head')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'head' && styles.zoneCircleActive,
              { backgroundColor: '#ff8800' },
            ]}
          />
          <Text style={styles.zoneLabel}>Head</Text>
        </TouchableOpacity>

        {/* Heart zone */}
        <TouchableOpacity
          style={[styles.zone, { top: '30%', left: '35%', marginLeft: -18 }]}
          onPress={() => onZoneSelect('heart')}
          activeOpacity={0.7}
        >
          <Ionicons name="heart" size={32} color="#ff0000" style={{ marginRight: 8 }} />
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'heart' && styles.zoneCircleActive,
              { backgroundColor: '#ff0000' },
            ]}
          />
          <Text style={styles.zoneLabel}>Heart</Text>
        </TouchableOpacity>

        {/* Lungs zone - Left */}
        <TouchableOpacity
          style={[styles.zone, { top: '35%', left: '25%' }]}
          onPress={() => onZoneSelect('lungs')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'lungs' && styles.zoneCircleActive,
              { backgroundColor: '#10b981' },
            ]}
          />
          <Text style={styles.zoneLabel}>Lungs</Text>
        </TouchableOpacity>

        {/* Stomach zone */}
        <TouchableOpacity
          style={[styles.zone, { top: '50%', left: '50%', marginLeft: -18 }]}
          onPress={() => onZoneSelect('stomach')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'stomach' && styles.zoneCircleActive,
              { backgroundColor: '#ffdd00' },
            ]}
          />
          <Text style={styles.zoneLabel}>Stomach</Text>
        </TouchableOpacity>

        {/* Lower Abdomen zone */}
        <TouchableOpacity
          style={[styles.zone, { top: '60%', left: '50%', marginLeft: -18 }]}
          onPress={() => onZoneSelect('abdomens')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'abdomens' && styles.zoneCircleActive,
              { backgroundColor: '#ffdd00' },
            ]}
          />
          <Text style={styles.zoneLabel}>Lower Abdomen</Text>
        </TouchableOpacity>

        {/* Lower Back zone */}
        <TouchableOpacity
          style={[styles.zone, { top: '55%', right: '8%' }]}
          onPress={() => onZoneSelect('lowerBack')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'lowerBack' && styles.zoneCircleActive,
              { backgroundColor: '#f97316' },
            ]}
          />
          <Text style={styles.zoneLabel}>Lower Back</Text>
        </TouchableOpacity>

        {/* Knee zone - Left */}
        <TouchableOpacity
          style={[styles.zone, { top: '80%', left: '35%' }]}
          onPress={() => onZoneSelect('knee')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'knee' && styles.zoneCircleActive,
              { backgroundColor: '#10b981' },
            ]}
          />
          <Text style={styles.zoneLabel}>Knee</Text>
        </TouchableOpacity>

        {/* Limbs zone - Right */}
        <TouchableOpacity
          style={[styles.zone, { top: '45%', right: '5%' }]}
          onPress={() => onZoneSelect('limbs')}
          activeOpacity={0.7}
        >
          <View
            style={[
              styles.zoneCircle,
              selectedZone === 'limbs' && styles.zoneCircleActive,
              { backgroundColor: '#10b981' },
            ]}
          />
          <Text style={styles.zoneLabel}>Limbs</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Zone Info Panel Component
const ZoneInfoPanel = ({ zone, onClose }: { zone: BodyZone; onClose: () => void }) => {
  const riskColor = getRiskLevelColor(zone.riskLevel);
  const riskLabel = getRiskLevelLabel(zone.riskLevel);

  return (
    <View style={[styles.infoPanelContainer, { backgroundColor: '#1a1a1a' }]}>
      <LinearGradient colors={['#1a1a1a', '#0d0d0d']} style={styles.infoPanelGradient}>
        {/* Header with zone name and close button */}
        <View style={styles.infoPanelHeader}>
          <View style={styles.headerTitleContainer}>
            <View style={[styles.riskIndicator, { backgroundColor: riskColor }]} />
            <View>
              <Text style={styles.infoPanelTitle}>{zone.label}</Text>
              <Text style={[styles.riskLevelText, { color: riskColor }]}>{riskLabel}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Symptoms Section */}
        <View style={styles.infoPanelSection}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" size={16} color="#fbbf24" />
            <Text style={styles.sectionTitle}>Symptoms</Text>
          </View>
          <View style={styles.symptomsList}>
            {zone.symptoms.map((symptom, idx) => (
              <View key={idx} style={styles.symptomItem}>
                <View style={styles.symptomDot} />
                <Text style={styles.symptomText}>{symptom}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Last Logged */}
        <View style={styles.infoPanelSection}>
          <Text style={styles.sectionTitle}>Last Logged</Text>
          <Text style={styles.lastLoggedText}>{zone.lastLogged}</Text>
        </View>

        {/* AI Recommendation */}
        <View style={[styles.infoPanelSection, styles.recommendationBox]}>
          <View style={styles.aiRecHeader}>
            <Ionicons name="sparkles" size={14} color="#60a5fa" />
            <Text style={styles.aiRecTitle}>AI Recommendation</Text>
          </View>
          <Text style={styles.aiRecText}>{zone.aiRecommendation}</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

export const BodyMapVisualization: React.FC<BodyMapVisualizationProps> = ({ visible, onClose }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  const selectedZoneData = BODY_ZONES.find((z) => z.id === selectedZone);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <MaterialIcons name="favorite" size={18} color="#10b981" />
            <Text style={styles.headerText}>Diagnostic Body Map</Text>
            <View style={styles.betaBadge}>
              <Text style={styles.betaText}>BETA</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.headerCloseButton}>
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Body Map SVG */}
          <BodyMapSVG selectedZone={selectedZone} onZoneSelect={setSelectedZone} />

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>👆 Tap any body zone to view details</Text>
          </View>

          {/* Zone Info Panel */}
          {selectedZoneData && <ZoneInfoPanel zone={selectedZoneData} onClose={() => setSelectedZone(null)} />}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  betaBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  betaText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 0.5,
  },
  headerCloseButton: {
    padding: 8,
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  svgContainer: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  bodyOutline: {
    width: width - 40,
    height: height * 0.35,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    position: 'relative',
    overflow: 'hidden',
  },
  zone: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  zoneCircleActive: {
    opacity: 1,
    borderColor: '#10b981',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  zoneLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
  instructionsContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  instructionsText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10b981',
    textAlign: 'center',
  },
  infoPanelContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  infoPanelGradient: {
    flex: 1,
    padding: 20,
  },
  infoPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  riskIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  infoPanelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  riskLevelText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  infoPanelSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9ca3af',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  symptomsList: {
    gap: 8,
  },
  symptomItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  symptomDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginTop: 6,
  },
  symptomText: {
    fontSize: 12,
    color: '#e5e7eb',
    flex: 1,
  },
  lastLoggedText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  recommendationBox: {
    backgroundColor: '#0c2f4e',
    borderWidth: 1,
    borderColor: '#0369a1',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  aiRecHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aiRecTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#60a5fa',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  aiRecText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#bfdbfe',
    lineHeight: 18,
  },
});
