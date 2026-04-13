// components/heatmap/HeatmapWebView.tsx
import React, { useCallback } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface HeatmapWebViewProps {
  webViewRef: React.RefObject<WebView>;
  onZoneSelect: (zoneId: string | null) => void;
  onModelLoaded: () => void;
}

// Resolve the local HTML asset path
const HTML_SOURCE =
  Platform.OS === 'android'
    ? { uri: 'file:///android_asset/heatmap/heatmap.html' }
    : require('@/assets/heatmap/heatmap.html');

export const HeatmapWebView: React.FC<HeatmapWebViewProps> = ({
  webViewRef,
  onZoneSelect,
  onModelLoaded,
}) => {
  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case 'ZONE_SELECTED':
            onZoneSelect(data.zoneId ?? null);
            break;
          case 'MODEL_LOADED':
            onModelLoaded();
            break;
        }
      } catch (e) {
        // ignore malformed messages
      }
    },
    [onZoneSelect, onModelLoaded]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={HTML_SOURCE}
        style={styles.webview}
        originWhitelist={['*']}
        allowFileAccess={true}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        mixedContentMode="always"
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
        // Prevent WebView from intercepting gestures meant for the parent ScrollView
        nestedScrollEnabled={false}
        // For iOS, allow inline media
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: '#050505',
  },
});