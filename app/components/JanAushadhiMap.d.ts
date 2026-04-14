import React from 'react';

interface JanAushadhiMapProps {
  userLocation: { lat: number; lon: number };
  nearbyStores: any[];
  openDirections: (store: any) => void;
}

declare const JanAushadhiMap: React.FC<JanAushadhiMapProps>;
export default JanAushadhiMap;
