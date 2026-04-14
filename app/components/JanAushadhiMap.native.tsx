import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

const JanAushadhiMap = ({ userLocation, nearbyStores, openDirections }: any) => {
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude: userLocation.lat,
        longitude: userLocation.lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Marker
        coordinate={{ latitude: userLocation.lat, longitude: userLocation.lon }}
        pinColor="blue"
        title="You"
      />
      {nearbyStores.map((store: any) => (
        <Marker
          key={store.id}
          coordinate={{ latitude: Number(store.latitude), longitude: Number(store.longitude) }}
          title={store.store_name}
          description={`${store.area} — ${store.distance_km}km away`}
          onCalloutPress={() => {
             if (openDirections) openDirections(store);
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="medkit" size={28} color="#0EA5E9" />
          </View>
        </Marker>
      ))}
    </MapView>
  );
};

export default JanAushadhiMap;
