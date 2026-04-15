// app/(tabs)/home/index.tsx
import { BodyMapVisualization3D } from '@/components/bodymap/BodyMapVisualization3D';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BodyMapCard } from '@/components/home/BodyMapCard';
import { GovernmentSchemeCard } from '@/components/home/GovernmentSchemeCard';
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonHomeScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { backendService } from '@/services/backend.service';
import { supabase } from '@/services/supabaseClient';
import { useAuthStore } from '@/store/auth.store';

// Top Navigation Bar Component (inline)
const TopNavBar = ({
  onScanPress,
  onNotificationPress,
  onProfilePress,
  notificationCount = 3,
  userName = 'User',
  activeScreen = 'DASHBOARD'
}: any) => {
  // Get the title based on active screen
  const getTitle = () => {
    switch (activeScreen) {
      case 'home': return 'DASHBOARD';
      case 'checkin': return 'CHECK-IN';
      case 'meds': return 'MEDICATIONS';
      case 'profile': return 'PROFILE';
      default: return 'DASHBOARD';
    }
  };

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavBar}>
        {/* Left Section - Scan Button */}
        <TouchableOpacity activeOpacity={0.8} onPress={onScanPress} style={styles.leftButton}>
          <LinearGradient
            colors={['#0474FC', '#0360D0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientButton}
          >
            <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Center Section - Dynamic Pill */}
        <View style={styles.centerPill}>
          <View style={styles.pillContent}>
            <View style={styles.blueDot} />
            <Text style={styles.pillText}>{getTitle()}</Text>
          </View>
        </View>

        {/* Right Section - Notification & Profile */}
        <View style={styles.rightSection}>
          {/* Notification Icon */}
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

          {/* Profile Avatar */}
          <TouchableOpacity activeOpacity={0.8} onPress={onProfilePress} style={styles.avatarButton}>
            <LinearGradient
              colors={['#0474FC', '#0360D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userName ? userName.charAt(0).toUpperCase() : 'U'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// AI Chat Button Component
const AIChatButton = () => {
  const handlePress = () => {
    try {
      // Navigate to AI Chat screen
      router.push('/(onboarding)/chat');
    } catch (error) {
      Alert.alert('Error', 'Unable to open chat. Please try again.');
      console.error('Navigation error:', error);
    }
  };

  return (
    <View style={styles.aiChatButton}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
      >
        <LinearGradient
          colors={['#0474FC', '#0360D0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiChatGradient}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

// Extraction Results Modal Component
const ExtractionResultsModal = ({ visible, data, onClose, loading }: any) => {
  if (!data && !loading) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Extraction Results</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {loading ? (
              <ActivityIndicator size="large" color="#0474FC" style={{ marginVertical: 40 }} />
            ) : (
              <>
                <Text style={styles.resultSectionTitle}>Summary</Text>
                <Text style={styles.resultText}>{data?.summary || 'No summary available.'}</Text>

                {data?.medications?.length > 0 && (
                  <>
                    <Text style={styles.resultSectionTitle}>Medications</Text>
                    {data.medications.map((med: any, i: number) => (
                      <View key={i} style={styles.resultItem}>
                        <Text style={styles.resultItemTitle}>{med.name}</Text>
                        <Text style={styles.resultItemDesc}>{med.dosage} - {med.frequency}</Text>
                      </View>
                    ))}
                  </>
                )}

                {data?.conditions?.length > 0 && (
                  <>
                    <Text style={styles.resultSectionTitle}>Detected Conditions</Text>
                    {data.conditions.map((cond: any, i: number) => (
                      <View key={i} style={styles.resultItem}>
                        <Text style={styles.resultItemTitle}>{cond.condition}</Text>
                        <Text style={styles.resultItemDesc}>Status: {cond.status}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Prediction Card
const PredictionCard = () => {
  const [idx, setIdx] = useState(0);
  const predictions = [
    { day: 'Day 3', score: 32, label: 'Low', color: '#10B981', note: 'Mild upward trend detected — maintain medication schedule.' },
    { day: 'Day 5', score: 45, label: 'Moderate', color: '#F59E0B', note: 'Fatigue pattern may resurface — monitor sleep quality.' },
    { day: 'Day 7', score: 37, label: 'Low', color: '#10B981', note: 'Trajectory stabilising. Risk score projected to plateau.' },
  ];
  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % predictions.length), 3000);
    return () => clearInterval(timer);
  }, []);
  const p = predictions[idx];
  return (
    <View style={styles.predCard}>
      <View style={styles.predHeader}>
        <Ionicons name="trending-up-outline" size={20} color="#8B5CF6" />
        <Text style={styles.predTitle}>AI Risk Prediction</Text>
        <View style={[styles.predBadge, { backgroundColor: p.color + '20' }]}>
          <Text style={[styles.predBadgeText, { color: p.color }]}>{p.label}</Text>
        </View>
      </View>
      <View style={styles.predBody}>
        <View style={styles.predScoreBox}>
          <Text style={[styles.predScore, { color: p.color }]}>{p.score}</Text>
          <Text style={styles.predScoreLabel}>/{p.day}</Text>
        </View>
        <Text style={styles.predNote}>{p.note}</Text>
      </View>
      <View style={styles.predDots}>
        {predictions.map((_, i) => (
          <View key={i} style={[styles.predDot, i === idx && styles.predDotActive]} />
        ))}
      </View>
    </View>
  );
};

// Watch Simulator Card Component — owns its own isAbnormal state to avoid setState-during-render
const WatchSimulatorCard = ({ onAbnormalChange }: { onAbnormalChange?: (val: boolean) => void }) => {
  const [isAbnormal, setIsAbnormalLocal] = useState(false);
  const [vitals, setVitals] = useState({ hr: 72, spo2: 98, sys: 120, dia: 80 });

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAbnormalLocal(prev => {
        const next = !prev;
        // Notify parent via callback (safe, outside render)
        if (onAbnormalChange) onAbnormalChange(next);
        if (next) {
          setVitals({
            hr: Math.floor(Math.random() * (140 - 120) + 120),
            spo2: Math.floor(Math.random() * (92 - 85) + 85),
            sys: Math.floor(Math.random() * (160 - 140) + 140),
            dia: Math.floor(Math.random() * (100 - 90) + 90),
          });
        } else {
          setVitals({
            hr: Math.floor(Math.random() * (85 - 65) + 65),
            spo2: Math.floor(Math.random() * (100 - 96) + 96),
            sys: Math.floor(Math.random() * (125 - 110) + 110),
            dia: Math.floor(Math.random() * (80 - 70) + 70),
          });
        }
        return next;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.newCard}>
      <View style={styles.cardHeaderRow}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBg, { backgroundColor: isAbnormal ? '#FEE2E2' : '#E0E7FF' }]}>
            <Ionicons name="watch-outline" size={20} color={isAbnormal ? '#EF4444' : '#4F46E5'} />
          </View>
          <Text style={styles.cardTitle}>Live Smartwatch Vitals</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: isAbnormal ? '#FEE2E2' : '#DCFCE7' }]}>
          <Text style={[styles.riskBadgeText, { color: isAbnormal ? '#EF4444' : '#16A34A' }]}>
            {isAbnormal ? 'Abnormal' : 'Normal'}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 16 }}>
        <View style={styles.vitalBox}>
          <Ionicons name="heart" size={18} color={isAbnormal ? '#EF4444' : '#EF4444'} />
          <Text style={styles.vitalValue}>{vitals.hr} <Text style={styles.vitalUnit}>bpm</Text></Text>
          <Text style={styles.vitalLabel}>Heart Rate</Text>
        </View>
        <View style={styles.vitalBox}>
          <Ionicons name="water" size={18} color="#0EA5E9" />
          <Text style={styles.vitalValue}>{vitals.spo2} <Text style={styles.vitalUnit}>%</Text></Text>
          <Text style={styles.vitalLabel}>SpO2</Text>
        </View>
        <View style={styles.vitalBox}>
          <Ionicons name="fitness" size={18} color="#8B5CF6" />
          <Text style={styles.vitalValue}>{vitals.sys}/{vitals.dia}</Text>
          <Text style={styles.vitalLabel}>BP</Text>
        </View>
      </View>
    </View>
  );
};

// Family AI Summary Card
const FamilySummaryCard = () => {
  const members = [
    { label: 'Adult Member 1', risk: 'Low', tag: 'Stable', color: '#10B981' },
    { label: 'Adult Member 2', risk: 'Moderate', tag: 'Respiratory↑', color: '#F59E0B' },
    { label: 'Child Member', risk: 'Low', tag: 'Healthy', color: '#10B981' },
  ];
  return (
    <View style={styles.familyCard}>
      <View style={styles.familyHeader}>
        <Ionicons name="people-outline" size={20} color="#0474FC" />
        <Text style={styles.familyTitle}>Family AI Summary</Text>
        <View style={styles.envFlag}>
          <Ionicons name="warning-outline" size={12} color="#F59E0B" />
          <Text style={styles.envFlagText}>Env. Risk</Text>
        </View>
      </View>
      <Text style={styles.familyInsight}>🤖 2 family members reported respiratory symptoms this week — possible environmental trigger detected.</Text>
      {members.map((m, i) => (
        <View key={i} style={styles.familyMemberRow}>
          <View style={[styles.familyDot, { backgroundColor: m.color }]} />
          <Text style={styles.familyMemberLabel}>{m.label}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.familyTag, { color: m.color }]}>{m.tag}</Text>
        </View>
      ))}
    </View>
  );
};

// Risk Score Card Component
const RiskScoreCard = ({ profile, isAbnormal }: { profile: any; isAbnormal: boolean }) => {
  const getRiskDetails = () => {
    if (isAbnormal) {
      return { score: 92, color: '#EF4444', label: 'Critical' };
    }
    const level = profile?.risk_level?.toLowerCase() || 'moderate';
    if (level === 'high' || level === 'red') return { score: 85, color: '#EF4444', label: 'High' };
    if (level === 'elevated' || level === 'orange') return { score: 65, color: '#F97316', label: 'Elevated' };
    if (level === 'low' || level === 'green') return { score: 15, color: '#10B981', label: 'Low' };
    return { score: 45, color: '#F59E0B', label: 'Moderate' };
  };

  const { score, color, label } = getRiskDetails();

  // Simulated trend data
  const trendData = [
    Math.min(100, score * 1.2),
    Math.min(100, score * 0.9),
    Math.min(100, score * 1.1),
    Math.min(100, score * 0.8),
    Math.min(100, score * 1.05),
    Math.min(100, score * 0.95),
    score
  ];

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.newCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.iconBg, { backgroundColor: color + '15' }]}>
            <Ionicons name="pulse" size={20} color={color} />
          </View>
          <Text style={styles.cardTitle}>Health Risk Analysis</Text>
        </View>
        <View style={[styles.riskBadge, { backgroundColor: color + '15' }]}>
          <Text style={[styles.riskBadgeText, { color }]}>{label} Level</Text>
        </View>
      </View>

      <View style={styles.riskScoreRow}>
        <View style={styles.scoreCircleWrapper}>
          <Text style={[styles.scoreLarge, { color }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>Current Risk</Text>
        </View>
        <View style={styles.scoreTextWrapper}>
          <Text style={styles.scoreDescTitle}>Analysis Complete</Text>
          <Text style={styles.scoreDescText}>
            Based on your medical history, recent vitals, and demographic factors.
          </Text>
        </View>
      </View>

      <View style={styles.graphContainer}>
        <View style={styles.graphHeader}>
          <Text style={styles.graphTitle}>7-Day Risk Trend</Text>
        </View>
        <LineChart
          data={{
            labels: ["M", "T", "W", "T", "F", "S", "S"],
            datasets: [
              {
                data: trendData,
                color: (opacity = 1) => color,
                strokeWidth: 3
              }
            ]
          }}
          width={screenWidth - 80}
          height={160}
          withDots={true}
          withInnerLines={true}
          withOuterLines={false}
          withVerticalLines={false}
          withHorizontalLines={true}
          chartConfig={{
            backgroundColor: "#FFFFFF",
            backgroundGradientFrom: "#FFFFFF",
            backgroundGradientTo: "#FFFFFF",
            decimalPlaces: 0,
            color: (opacity = 1) => color,
            labelColor: (opacity = 1) => "#9CA3AF",
            style: { borderRadius: 16 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: color }
          }}
          bezier
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>
    </View>
  );
};

// Doctor Ranking List Component
const MOCK_DOCTORS = [
  { id: '1', name: 'Dr. Sarah Smith', spec: 'Cardiologist', rating: 4.9, exp: '15 Yrs Exp' },
  { id: '2', name: 'Dr. Anil Kumar', spec: 'General Physician', rating: 4.8, exp: '12 Yrs Exp' },
  { id: '3', name: 'Dr. Emily Chen', spec: 'Endocrinologist', rating: 4.7, exp: '9 Yrs Exp' },
];

const DoctorRankingCard = ({ isAbnormal }: { isAbnormal: boolean }) => {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  const toggleFollow = (id: string) => {
    setFollowed(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const doctors = [...MOCK_DOCTORS];
  if (isAbnormal) {
    doctors.sort((a, b) => (a.spec === 'Cardiologist' ? -1 : 1));
  } else {
    doctors.sort((a, b) => a.id.localeCompare(b.id));
  }

  return (
    <View style={styles.newCard}>
      <View style={styles.cardHeaderRow}>
        <Text style={styles.cardTitle}>{isAbnormal ? 'Recommended Specialists' : 'Top Ranked Specialists'}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.docList}>
        {doctors.map((doc, index) => {
          const isFollowed = !!followed[doc.id];
          return (
            <View key={doc.id} style={[styles.docItem, index === doctors.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.docRank}>#{index + 1}</Text>
              <View style={styles.docAvatar}>
                <Text style={styles.docAvatarText}>{doc.name.replace('Dr. ', '').charAt(0)}</Text>
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docSpec}>{doc.spec} • {doc.exp}</Text>
                <View style={styles.docRating}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.docRatingValue}>{doc.rating}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.followBtn, isFollowed && styles.followingBtn]} 
                onPress={() => toggleFollow(doc.id)}
              >
                <Text style={[styles.followBtnText, isFollowed && styles.followingBtnText]}>
                  {isFollowed ? 'Following' : 'Follow'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const { user, patientId } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [bodyMapVisible, setBodyMapVisible] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isAbnormal, setIsAbnormal] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [extractionModalVisible, setExtractionModalVisible] = useState(false);

  // Skeleton loading timeout: 2 seconds fixed duration
  const SKELETON_DURATION = 2000; // 2 seconds
  const MAX_SKELETON_TIME = 90000; // 4 minutes max timeout
  const skeletonStartTime = React.useRef<number>(Date.now());

  useEffect(() => {
    if (user?.id || patientId) {
      fetchProfile();
    } else {
      setIsLoadingProfile(false);
    }
  }, [user, patientId]);

  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const resolvedId = user?.id || patientId;
      if (!resolvedId) return;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', resolvedId)
        .single();

      if (error) throw error;
      setProfile(data);
      console.log('✅ Profile name loaded:', data?.name);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Set default profile using email if available
      setProfile({
        name: user?.email?.split('@')[0] || 'User',
      });
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleIntroComplete = () => {
    // Start skeleton loading after intro animation
    skeletonStartTime.current = Date.now();

    // Hide skeleton after fixed 2 seconds duration
    const skeletonTimeout = setTimeout(() => {
      setIsDataLoaded(true);
    }, SKELETON_DURATION);

    // Safety: force show content after 4 minutes max
    const maxTimeoutTimer = setTimeout(() => {
      setIsDataLoaded(true);
    }, MAX_SKELETON_TIME);

    return () => {
      clearTimeout(skeletonTimeout);
      clearTimeout(maxTimeoutTimer);
    };
  };

  // Get user name from profile
  const getUserName = () => {
    if (profile?.name) return profile.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  const handleScanReport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      setExtracting(true);
      
      const response = await backendService.extractReport(
        file.uri,
        file.name,
        file.mimeType || 'application/pdf'
      );

      setExtracting(false);
      
      if (response && response.success) {
        setExtractedData(response.data);
        setExtractionModalVisible(true);
      } else {
        Alert.alert('Extraction Failed', 'Could not extract data from the report. Please try again with a clearer document.');
      }
    } catch (error) {
      setExtracting(false);
      console.error('Scan Error:', error);
      Alert.alert('Error', 'An unexpected error occurred while scanning.');
    }
  };

  // Get first name for greeting
  const getFirstName = () => {
    const fullName = getUserName();
    return fullName.split(' ')[0];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Top Navigation Bar with dynamic title */}
      <TopNavBar
        onScanPress={handleScanReport}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => router.push('/(tabs)/profile')}
        notificationCount={3}
        userName={getUserName()}
        activeScreen={currentRoute}
      />

      <ScreenIntroGate
        loaderText="Loading your health dashboard..."
        loaderDuration={2500}
        introSource={require('../../../assets/lottie_animations/heart_animation.json')}
        introText="Tracking your heartbeat and getting everything ready"
        backgroundColor="#F9FAFB"
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded || isLoadingProfile ? (
          <SkeletonHomeScreen />
        ) : (
          <>
            <ScrollView
              style={styles.container}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.content}>
                {/* Welcome Section */}
                <View style={styles.welcomeSection}>
                  <View style={styles.welcomeHeader}>
                    <View style={styles.shieldIcon}>
                      <Ionicons name="shield-checkmark" size={16} color="#0474FC" />
                    </View>
                    <Text style={styles.welcomeSubtitle}>CLINICAL HEALTH ID: #SW-9431</Text>
                  </View>
                  {/* FIXED: Changed from "Rahul" to dynamic profile name */}
                  <Text style={styles.welcomeTitle}>Welcome back, {getFirstName()}</Text>
                  <Text style={styles.welcomeDescription}>Your individualized health intelligence hub is ready</Text>
                </View>

                {/* Government Scheme Card */}
                <GovernmentSchemeCard />

                {/* 3D Body Map Card */}
                <BodyMapCard onPress={() => setBodyMapVisible(true)} />

                {/* Prediction Card */}
                <PredictionCard />

                {/* Family AI Summary Card */}
                <FamilySummaryCard />

                {/* Smartwatch Simulator Area */}
                <WatchSimulatorCard onAbnormalChange={setIsAbnormal} />

                {/* Health Risk Score Area */}
                <RiskScoreCard profile={profile} isAbnormal={isAbnormal} />

                {/* Doctor Ranking Area */}
                <DoctorRankingCard isAbnormal={isAbnormal} />
              </View>
            </ScrollView>

            {/* Body Map Modal */}
            <BodyMapVisualization3D
              visible={bodyMapVisible}
              onClose={() => setBodyMapVisible(false)}
            />

            {/* Extraction Results Modal */}
            <ExtractionResultsModal
              visible={extractionModalVisible}
              data={extractedData}
              onClose={() => setExtractionModalVisible(false)}
              loading={extracting}
            />

            {/* Loading Indicator for Extraction */}
            {extracting && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#0474FC" />
                <Text style={styles.loadingText}>Analyzing Report...</Text>
              </View>
            )}

            {/* AI Chat Button - Floating */}
            <AIChatButton />
          </>
        )}
      </ScreenIntroGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  shieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(4, 116, 252, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0474FC',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  contentSection: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  // Prediction Card
  predCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, borderLeftWidth: 3, borderLeftColor: '#8B5CF6' },
  predHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  predTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  predBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  predBadgeText: { fontSize: 12, fontWeight: '600' },
  predBody: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  predScoreBox: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  predScore: { fontSize: 36, fontWeight: '800' },
  predScoreLabel: { fontSize: 13, color: '#6B7280' },
  predNote: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 18 },
  predDots: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  predDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E5E7EB' },
  predDotActive: { backgroundColor: '#8B5CF6', width: 18 },
  // Family Card
  familyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginTop: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  familyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  familyTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827' },
  envFlag: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  envFlagText: { fontSize: 11, color: '#D97706', fontWeight: '600' },
  familyInsight: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 12, backgroundColor: '#F0F9FF', padding: 10, borderRadius: 10 },
  familyMemberRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  familyDot: { width: 10, height: 10, borderRadius: 5 },
  familyMemberLabel: { fontSize: 13, color: '#374151', fontWeight: '500' },
  familyTag: { fontSize: 12, fontWeight: '700' },
  welcomeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 15,
  },
  // AI Chat Button Styles
  aiChatButton: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    marginVertical: 20,
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  aiChatGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Top Navigation Bar Styles
  topNavContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  // Left Section
  leftButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Center Section
  centerPill: {
    flex: 1,
    marginHorizontal: 12,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0474FC',
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#1F2937',
  },
  // Right Section
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // New Card Styles
  newCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  riskScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 20,
  },
  scoreCircleWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreLarge: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  scoreTextWrapper: {
    flex: 1,
  },
  scoreDescTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  scoreDescText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0474FC',
  },
  docList: {
    gap: 16,
  },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    gap: 12,
  },
  docRank: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
    width: 24,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F1FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0474FC',
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  docSpec: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  docRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  docRatingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  vitalBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  vitalUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
  },
  vitalLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  graphContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  graphHeader: {
    marginBottom: 8,
  },
  graphTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartArea: {
    height: 120,
    position: 'relative',
  },
  gridLineContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#F3F4F6',
    width: '100%',
  },
  barsContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 20,
    paddingBottom: 0,
  },
  barWrapper: {
    width: 24,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 8,
  },
  chartLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#0474FC',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 78,
    marginLeft: 8,
  },
  followingBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  followBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  followingBtnText: {
    color: '#6B7280',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#0474FC',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  modalBody: {
    marginBottom: 20,
  },
  resultSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  resultText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
  },
  resultItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  resultItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  resultItemDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#0474FC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});