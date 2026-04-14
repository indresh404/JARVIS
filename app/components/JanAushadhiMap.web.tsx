import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JanAushadhiMap = ({ nearbyStores }: any) => {
  return (
    <View style={styles.webFallback}>
      <Ionicons name="map-outline" size={48} color="#6B7280" />
      <Text style={styles.webFallbackText}>
        Interactive map available on mobile devices
      </Text>
      <TouchableOpacity 
        style={styles.viewListButton}
        onPress={() => {
          const stores = nearbyStores.map((s: any) => `${s.store_name} - ${s.area} (${s.distance_km}km)`).join('\n');
          Alert.alert('Nearby Jan Aushadhi Stores', stores || 'No stores found');
        }}
      >
        <Text style={styles.viewListButtonText}>View Store List</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  webFallbackText: {
    marginTop: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },
  viewListButton: {
    marginTop: 16,
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewListButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default JanAushadhiMap;
