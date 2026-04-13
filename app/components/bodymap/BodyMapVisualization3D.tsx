import { HeatmapWebView } from '@/components/heatmap/HeatmapWebView';
import { BODY_ZONES } from '@/data/bodyZones';
import { useHeatmap } from '@/hooks/useHeatmap';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface BodyMapVisualization3DProps {
  visible: boolean;
  onClose: () => void;
}

export const BodyMapVisualization3D: React.FC<BodyMapVisualization3DProps> = ({
  visible,
  onClose,
}) => {
  const { isLoading, loadError, webViewRef, handleModelLoaded, handleModelError } = useHeatmap();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
        <View style={styles.screen}>
          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveBadgeText}>LIVE MODEL VIEW</Text>
              </View>
              <Text style={styles.title}>3D Diagnostic Body Map</Text>
              <Text style={styles.subtitle}>
                Drag left or right for a full 360-degree view and pinch to zoom in or out.
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              activeOpacity={0.85}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <MaterialCommunityIcons name="close" size={22} color="#f9fafb" />
            </TouchableOpacity>
          </View>

          <View style={styles.viewerShell}>
            <View style={styles.viewerFrame}>
              <HeatmapWebView
                webViewRef={webViewRef}
                onModelLoaded={handleModelLoaded}
                onModelError={handleModelError}
              />

              {isLoading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator color="#34d399" size="large" />
                  <Text style={styles.loadingTitle}>Preparing body model</Text>
                  <Text style={styles.loadingText}>Rendering the full-screen 3D view...</Text>
                </View>
              )}

              {!isLoading && loadError && (
                <View style={styles.errorOverlay}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#f87171" />
                  <Text style={styles.errorTitle}>Viewer unavailable</Text>
                  <Text style={styles.errorText}>{loadError}</Text>
                </View>
              )}

              {!isLoading && !loadError && (
                <>
                  <View style={styles.topHint} pointerEvents="none">
                    <MaterialCommunityIcons name="rotate-right" size={15} color="#34d399" />
                    <Text style={styles.topHintText}>Rotate 360°</Text>
                  </View>

                  <View style={styles.bottomHintRow} pointerEvents="none">
                    <View style={styles.hintPill}>
                      <MaterialCommunityIcons name="gesture-swipe-horizontal" size={14} color="#e5e7eb" />
                      <Text style={styles.hintPillText}>Horizontal drag</Text>
                    </View>
                    <View style={styles.hintPill}>
                      <MaterialCommunityIcons name="magnify-plus-outline" size={14} color="#e5e7eb" />
                      <Text style={styles.hintPillText}>Pinch to zoom</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Text style={styles.footerLabel}>HOTSPOT SUMMARY</Text>
              <Text style={styles.footerValue}>
                {BODY_ZONES.filter(zone => zone.severity === 'high').length} high-priority areas detected
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  screen: {
    flex: 1,
    backgroundColor: '#020617',
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  headerTextWrap: {
    flex: 1,
  },
  liveBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.22)',
    marginBottom: 12,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#34d399',
  },
  liveBadgeText: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  title: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 19,
    paddingRight: 8,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewerShell: {
    flex: 1,
    paddingVertical: 4,
  },
  viewerFrame: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.16)',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 24,
  },
  loadingTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
  },
  errorTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
  topHint: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.18)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  topHintText: {
    color: '#d1fae5',
    fontSize: 12,
    fontWeight: '700',
  },
  bottomHintRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  hintPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  hintPillText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    paddingTop: 14,
  },
  footerCard: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.12)',
  },
  footerLabel: {
    color: '#6ee7b7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  footerValue: {
    color: '#e2e8f0',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600',
  },
});
