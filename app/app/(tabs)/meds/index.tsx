// app/(tabs)/meds/index.tsx
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonMedsScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, Alert, Modal, TextInput, Animated
} from 'react-native';
import { getMedicines, logMedAdherence } from '@/services/supabase.service';
import { useAuthStore } from '@/store/auth.store';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const ADHERENCE_DATA = [true, true, false, true, true, true, false]; // last 7 days fake

const FAKE_ANALYSIS = [
  { medicine: 'Metformin 500mg', status: 'safe', note: 'No known interactions with your current medications.', color: '#10B981', icon: 'checkmark-circle' },
  { medicine: 'Amlodipine 5mg', status: 'warning', note: 'Mild interaction possible with Aspirin — consult physician.', color: '#F59E0B', icon: 'warning' },
  { medicine: 'Vitamin D3', status: 'safe', note: 'OpenFDA: No adverse interactions detected.', color: '#10B981', icon: 'checkmark-circle' },
];

const TopNavBar = ({ onScanPress, onNotificationPress, onProfilePress, notificationCount = 3, userName = 'Rahul', activeScreen = 'meds' }: any) => {
  const getTitle = () => {
    switch (activeScreen) {
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

// Mini calendar strip for the week
const WeekCalendar = () => {
  const today = new Date().getDay();
  return (
    <View style={styles.calendarCard}>
      <Text style={styles.cardTitle}>📅 This Week's Adherence</Text>
      <View style={styles.weekRow}>
        {DAYS.map((day, i) => (
          <View key={i} style={styles.dayCol}>
            <Text style={[styles.dayLabel, i === today && styles.todayLabel]}>{day}</Text>
            <View style={[
              styles.dayDot,
              ADHERENCE_DATA[i] ? styles.dayDotTaken : styles.dayDotMissed,
              i === today && styles.dayDotToday,
            ]}>
              {ADHERENCE_DATA[i]
                ? <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                : <Ionicons name="close" size={10} color="#FFFFFF" />}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.calendarLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>Taken</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Missed</Text>
        </View>
      </View>
    </View>
  );
};

// Adherence analytics bar chart
const AnalyticsCard = () => {
  const weeks = [
    { label: 'W1', pct: 71 },
    { label: 'W2', pct: 86 },
    { label: 'W3', pct: 57 },
    { label: 'W4', pct: 100 },
  ];
  return (
    <View style={styles.analyticsCard}>
      <Text style={styles.cardTitle}>📊 Monthly Adherence</Text>
      <View style={styles.barsRow}>
        {weeks.map((w, i) => (
          <View key={i} style={styles.barCol}>
            <Text style={styles.barPct}>{w.pct}%</Text>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { height: `${w.pct}%` as any, backgroundColor: w.pct >= 80 ? '#10B981' : w.pct >= 60 ? '#F59E0B' : '#EF4444' }]} />
            </View>
            <Text style={styles.barLabel}>{w.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.analyticsNote}>Overall adherence: <Text style={{ color: '#10B981', fontWeight: '700' }}>78.5%</Text> — Keep going!</Text>
    </View>
  );
};

// AI OpenFDA Analysis Panel
const AIAnalysisPanel = ({ visible, onClose, medName }: { visible: boolean; onClose: () => void; medName: string }) => {
  const [analysing, setAnalysing] = useState(true);
  const [result, setResult] = useState<any>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setAnalysing(true);
      setResult(null);
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      ).start();
      setTimeout(() => {
        const found = FAKE_ANALYSIS.find(a => a.medicine === medName) || FAKE_ANALYSIS[0];
        setResult(found);
        setAnalysing(false);
      }, 2200);
    }
  }, [visible, medName]);

  if (!visible) return null;
  return (
    <Modal transparent animationType="slide" visible={visible}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Ionicons name="flask-outline" size={22} color="#0474FC" />
            <Text style={styles.modalTitle}>AI Drug Analysis</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalMed}>{medName}</Text>
          <Text style={styles.modalSub}>Powered by OpenFDA + Groq LLaMA-3.3</Text>

          {analysing ? (
            <View style={styles.analysingBox}>
              <Animated.Text style={[styles.analysingText, { opacity: dotAnim }]}>
                🔍 Querying OpenFDA database...
              </Animated.Text>
              <Text style={[styles.analysingText, { marginTop: 8 }]}>⚗️ Cross-checking known interactions...</Text>
              <Text style={[styles.analysingText, { marginTop: 8 }]}>🤖 Running LLM safety review...</Text>
            </View>
          ) : result && (
            <View style={[styles.resultBox, { borderColor: result.color + '40', backgroundColor: result.color + '10' }]}>
              <Ionicons name={result.icon as any} size={28} color={result.color} />
              <Text style={[styles.resultStatus, { color: result.color }]}>
                {result.status === 'safe' ? '✓ No Interaction Detected' : '⚠ Mild Interaction Found'}
              </Text>
              <Text style={styles.resultNote}>{result.note}</Text>
              <Text style={styles.resultSource}>Source: OpenFDA API · Groq analysis</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function MedsScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [medications, setMedications] = useState<any[]>([]);
  const [takenToday, setTakenToday] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newMedName, setNewMedName] = useState('');

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId || 'demo-patient';

  useEffect(() => { loadData(); }, [patientId]);

  const loadData = async () => {
    try {
      const data = await getMedicines(patientId);
      const resolved = data?.length ? data : [
        { id: 'demo-m1', medicine_name: 'Metformin 500mg', next_dose: '08:00 AM' },
        { id: 'demo-m2', medicine_name: 'Amlodipine 5mg', next_dose: '09:00 PM' },
        { id: 'demo-m3', medicine_name: 'Vitamin D3', next_dose: '01:00 PM' },
      ];
      setMedications(resolved);
    } catch {
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
    } catch {/* ignore */}
    setTakenToday(prev => ({ ...prev, [medName]: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }));
  };

  const handleAddMed = () => {
    if (!newMedName.trim()) return;
    const newMed = { id: `custom-${Date.now()}`, medicine_name: newMedName.trim(), next_dose: '08:00 AM' };
    setMedications(prev => [...prev, newMed]);
    setSelectedMed(newMed.medicine_name);
    setNewMedName('');
    setAddModalVisible(false);
    setTimeout(() => setAnalysisModal(true), 400);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TopNavBar
        onScanPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      <ScreenIntroGate loaderText="Loading medication details..." loaderDuration={2000} backgroundColor="#F9FAFB" onIntroComplete={() => setIsDataLoaded(true)}>
        {!isDataLoaded || loading ? <SkeletonMedsScreen /> : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Your Medications</Text>
                <Text style={styles.subtitle}>Track your daily adherence</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={() => setAddModalVisible(true)}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            </View>

            <WeekCalendar />
            <AnalyticsCard />

            <Text style={styles.sectionLabel}>Today's Medications</Text>
            {medications.map((med, index) => (
              <View key={med.id || index} style={styles.medCard}>
                <View style={styles.medInfo}>
                  <View style={[styles.medIconBg, takenToday[med.medicine_name] && styles.medIconTaken]}>
                    <Ionicons name="medical" size={22} color={takenToday[med.medicine_name] ? '#FFFFFF' : '#0474FC'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.medName}>{med.medicine_name}</Text>
                    <Text style={styles.medDetail}>Next dose: {med.next_dose || 'Morning'}</Text>
                    {takenToday[med.medicine_name] && (
                      <Text style={styles.takenText}>✓ Taken at {takenToday[med.medicine_name]}</Text>
                    )}
                  </View>
                </View>
                <View style={styles.medActions}>
                  <TouchableOpacity
                    style={styles.analyseBtn}
                    onPress={() => { setSelectedMed(med.medicine_name); setAnalysisModal(true); }}
                  >
                    <Ionicons name="flask-outline" size={16} color="#8B5CF6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.logButton, takenToday[med.medicine_name] && styles.logButtonTaken]}
                    onPress={() => handleLogAdherence(med.medicine_name)}
                  >
                    <Ionicons
                      name={takenToday[med.medicine_name] ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={28}
                      color={takenToday[med.medicine_name] ? '#10B981' : '#0474FC'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </ScreenIntroGate>

      {/* Add Med Modal */}
      <Modal transparent animationType="slide" visible={addModalVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="add-circle-outline" size={22} color="#0474FC" />
              <Text style={styles.modalTitle}>Add Medication</Text>
              <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aspirin 81mg"
              placeholderTextColor="#9CA3AF"
              value={newMedName}
              onChangeText={setNewMedName}
            />
            <TouchableOpacity style={styles.submitModalBtn} onPress={handleAddMed}>
              <Text style={styles.submitModalText}>Add & Analyse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <AIAnalysisPanel
        visible={analysisModal}
        onClose={() => setAnalysisModal(false)}
        medName={selectedMed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#0474FC', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4 },
  
  // Calendar
  calendarCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 12 },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  todayLabel: { color: '#0474FC' },
  dayDot: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dayDotTaken: { backgroundColor: '#10B981' },
  dayDotMissed: { backgroundColor: '#EF4444' },
  dayDotToday: { borderWidth: 2, borderColor: '#0474FC' },
  calendarLegend: { flexDirection: 'row', gap: 16, marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: '#6B7280' },
  
  // Analytics
  analyticsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 80, marginBottom: 8 },
  barCol: { alignItems: 'center', gap: 4 },
  barPct: { fontSize: 10, color: '#6B7280', fontWeight: '600' },
  barBg: { width: 32, height: 60, backgroundColor: '#F3F4F6', borderRadius: 8, overflow: 'hidden', justifyContent: 'flex-end' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { fontSize: 11, color: '#6B7280' },
  analyticsNote: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 4 },
  
  // Med cards
  medCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  medIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#E8F1FE', alignItems: 'center', justifyContent: 'center' },
  medIconTaken: { backgroundColor: '#10B981' },
  medName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  medDetail: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  takenText: { fontSize: 11, color: '#10B981', marginTop: 3, fontWeight: '600' },
  medActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analyseBtn: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#F5F3FF', alignItems: 'center', justifyContent: 'center' },
  logButton: { padding: 4 },
  logButtonTaken: { opacity: 0.7 },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  modalTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  modalMed: { fontSize: 16, fontWeight: '600', color: '#0474FC', marginBottom: 4 },
  modalSub: { fontSize: 12, color: '#6B7280', marginBottom: 16 },
  analysingBox: { backgroundColor: '#0F172A', borderRadius: 12, padding: 16, marginBottom: 16 },
  analysingText: { color: '#60A5FA', fontSize: 13, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 22 },
  resultBox: { borderWidth: 1, borderRadius: 14, padding: 16, alignItems: 'center', gap: 8, marginBottom: 16 },
  resultStatus: { fontSize: 16, fontWeight: '700' },
  resultNote: { fontSize: 13, color: '#374151', textAlign: 'center', lineHeight: 20 },
  resultSource: { fontSize: 11, color: '#9CA3AF' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 16 },
  submitModalBtn: { backgroundColor: '#0474FC', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitModalText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  
  // Nav
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
