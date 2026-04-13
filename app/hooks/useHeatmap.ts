// hooks/useHeatmap.ts
import { BODY_ZONES, BodyZone } from '@/data/bodyZones';
import { useCallback, useRef, useState } from 'react';

export interface HeatmapState {
  selectedZoneId: string | null;
  selectedZone: BodyZone | null;
  isLoading: boolean;
  loadError: string | null;
  isExpanded: boolean;
}

export function useHeatmap() {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const webViewRef = useRef<any>(null);

  const selectedZone = selectedZoneId
    ? BODY_ZONES.find((z) => z.id === selectedZoneId) ?? null
    : null;

  const handleZoneSelect = useCallback((zoneId: string | null) => {
    setSelectedZoneId(zoneId);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setLoadError(null);
    setIsLoading(false);
  }, []);

  const handleModelError = useCallback((message?: string | null) => {
    setLoadError(message || 'Unable to load the 3D model.');
    setIsLoading(false);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedZoneId(null);
    // Tell the WebView to deselect too
    webViewRef.current?.injectJavaScript(`
      if (window.clearSelection) window.clearSelection();
      true;
    `);
  }, []);

  const expand = useCallback(() => setIsExpanded(true), []);
  const collapse = useCallback(() => {
    setIsExpanded(false);
    setSelectedZoneId(null);
  }, []);

  return {
    selectedZoneId,
    selectedZone,
    isLoading,
    loadError,
    isExpanded,
    webViewRef,
    handleZoneSelect,
    handleModelLoaded,
    handleModelError,
    clearSelection,
    expand,
    collapse,
  };
}
