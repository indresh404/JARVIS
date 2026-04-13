// app/(tabs)/meds/index.tsx
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonMedsScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { getMedicines, logMedAdherence } from '@/services/supabase.service';
import { useAuthStore } from '@/store/auth.store';

const TopNavBar = ({ 
  onScanPress, 
  onNotificationPress, 
  onProfilePress, 
  notificationCount = 3, 
  userName = 'Rahul',
  activeScreen = 'meds'
}: any) => {
  const getTitle = () => {
    switch(activeScreen) {
      case 'home': return 'DASHBOARD';
      case 'checkin': return 'CHECK-IN';
      case 'meds': return 'MEDICATIONS';
      case 'profile': return 'PROFILE';
      default: return 'MEDICATIONS';
    }
  };

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={onScanPress} style={styles.leftButton}>
          <LinearGradient colors={['#0474FC', '#0360D0']} style={styles.gradientButton}>
            <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.centerPill}>
          <View style={styles.pillContent}>
            <View style={styles.blueDot} />
            <Text style={styles.pillText}>{getTitle()}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity activeOpacity={0.8} onPress={onNotificationPress} style={styles.iconButton}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={onProfilePress} style={styles.avatarButton}>
            <LinearGradient colors={['#0474FC', '#0360D0']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function MedsScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [takenToday, setTakenToday] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId || 'demo-patient';

  useEffect(() => {
    loadData();
  }, [patientId]);

  const loadData = async () => {
    try {
      const data = await getMedicines(patientId);
      const resolved = data?.length
        ? data
        : [
            { id: 'demo-m1', medicine_name: 'Metformin 500mg', next_dose: '08:00 AM' },
            { id: 'demo-m2', medicine_name: 'Amlodipine 5mg', next_dose: '09:00 PM' },
            { id: 'demo-m3', medicine_name: 'Vitamin D3', next_dose: '01:00 PM' },
          ];
      setMedications(resolved);
    } catch (error) {
      console.error("Failed to load meds:", error);
      setMedications([
        { id: 'demo-m1', medicine_name: 'Metformin 500mg', next_dose: '08:00 AM' },
        { id: 'demo-m2', medicine_name: 'Amlodipine 5mg', next_dose: '09:00 PM' },
        { id: 'demo-m3', medicine_name: 'Vitamin D3', next_dose: '01:00 PM' },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const handleLogAdherence = async (medName: string) => {
    try {
      await logMedAdherence(patientId, medName);
      setTakenToday((prev) => ({ ...prev, [medName]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      Alert.alert("Success", `Adherence logged for ${medName}`);
    } catch (error) {
      setTakenToday((prev) => ({ ...prev, [medName]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
      Alert.alert("Saved", `Marked ${medName} as taken (demo mode).`);
    }
  };

  const handleIntroComplete = () => {
    setIsDataLoaded(true);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      <ScreenIntroGate
        loaderText="Loading medication details..."
        loaderDuration={2000}
        backgroundColor="#F9FAFB"
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded || loading ? (
          <SkeletonMedsScreen />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Your Medications</Text>
              <Text style={styles.subtitle}>Track your daily adherence</Text>
            </View>

            {medications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="medkit-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyText}>No medications prescribed yet.</Text>
              </View>
            ) : (
              medications.map((med, index) => (
                <View key={med.id || index} style={styles.medCard}>
                  <View style={styles.medInfo}>
                    <View style={styles.medIconBg}>
                      <Ionicons name="medical" size={24} color="#0474FC" />
                    </View>
                    <View>
                      <Text style={styles.medName}>{med.medicine_name}</Text>
                      <Text style={styles.medDetail}>Next dose: {med.next_dose || 'Morning'}</Text>
                      {takenToday[med.medicine_name] ? (
                        <Text style={styles.takenText}>Taken at {takenToday[med.medicine_name]}</Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.logButton}
                    onPress={() => handleLogAdherence(med.medicine_name)}
                  >
                    <Ionicons name="checkmark-circle" size={28} color="#0474FC" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </ScreenIntroGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtitle: { fontSize: 16, color: '#6B7280', marginTop: 4 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#9CA3AF', marginTop: 12, fontSize: 16 },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  medIconBg: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E8F1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medName: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  medDetail: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  takenText: { fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: '600' },
  logButton: { padding: 4 },
  topNavContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 12, backgroundColor: '#F9FAFB' },
  topNavBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 5 },
  leftButton: { shadowColor: '#0474FC', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  gradientButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  centerPill: { flex: 1, marginHorizontal: 12 },
  pillContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0474FC', marginRight: 8 },
  pillText: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, color: '#1F2937' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FFFFFF' },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  avatarButton: { shadowColor: '#0474FC', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 3 },
  avatarGradient: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});
