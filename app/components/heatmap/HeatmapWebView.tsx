import { HEATMAP_HTML } from '@/components/heatmap/heatmapHtml';
import { MODEL_GLB_BASE64 } from '@/components/heatmap/modelGlbBase64';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

interface HeatmapWebViewProps {
  webViewRef: React.RefObject<WebView>;
  onModelLoaded: () => void;
  onModelError: (message?: string | null) => void;
}

export const HeatmapWebView: React.FC<HeatmapWebViewProps> = ({
  webViewRef,
  onModelLoaded,
  onModelError,
}) => {
  const injectedJavaScriptBeforeContentLoaded = useMemo(
    () => `
      window.__MODEL_BASE64__ = ${JSON.stringify(MODEL_GLB_BASE64)};
      true;
    `,
    []
  );

  const handleMessage = useCallback(
    (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'MODEL_LOADED':
            onModelLoaded();
            break;
          case 'MODEL_ERROR':
            onModelError(data.message);
            break;
          default:
            break;
        }
      } catch {
        // Ignore malformed messages
      }
    },
    [onModelLoaded, onModelError]
  );

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: HEATMAP_HTML }}
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
        nestedScrollEnabled={false}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={handleMessage}
        onError={() => onModelError('The 3D viewer failed to open.')}
        onHttpError={() => onModelError('The 3D viewer could not load its content.')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: '#020617',
  },
  webview: {
    flex: 1,
    backgroundColor: '#020617',
  },
});
