import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Loader } from '@/components/ui/Loader';
import { COLORS } from '@/theme';

export const HeatmapWebView = ({ zoneScores }: { zoneScores: Record<string, number> }) => {
  const html = useMemo(
    () => `
      <html><body style="margin:0;background:${COLORS.surface};display:flex;align-items:center;justify-content:center;">
        <div style="font-family:sans-serif;color:${COLORS.blue[900]};text-align:center;">
          <h3>3D Body Map Preview</h3>
          <p>${JSON.stringify(zoneScores)}</p>
        </div>
      </body></html>`,
    [zoneScores],
  );

  return (
    <View style={styles.container}>
      <WebView source={{ html }} startInLoadingState renderLoading={() => <Loader />} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 200, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white },
});
