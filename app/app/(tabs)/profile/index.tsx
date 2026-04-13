// app/(tabs)/profile/index.tsx
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonProfileScreen } from '@/components/ui/SkeletonLoader';
import { signOut, getFamilyByPatientId } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import QRCode from 'react-native-qrcode-svg';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from 'react-native';
import { supabase } from '@/services/supabaseClient';

// Color System with Primary #0474FC
const COLORS = {
  primary: '#0474FC',
  primaryLight: '#E8F1FE',
  primaryDark: '#0360D0',
  background: '#F9FAFB',
  card: '#FFFFFF',
  secondaryCard: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  risk: {
    low: '#10B981',
    moderate: '#F59E0B',
    elevated: '#F97316',
    high: '#EF4444',
  },
};

// Top Navigation Bar Component
const TopNavBar = ({ 
  onScanPress, 
  onNotificationPress, 
  onProfilePress, 
  notificationCount = 3, 
  userName = 'User',
  activeScreen = 'profile'
}: any) => {
  const getTitle = () => {
    switch(activeScreen) {
      case 'home': return 'DASHBOARD';
      case 'checkin': return 'CHECK-IN';
      case 'meds': return 'MEDICATIONS';
      case 'profile': return 'PROFILE';
      default: return 'PROFILE';
    }
  };

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavBar}>
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
            <LinearGradient
              colors={['#0474FC', '#0360D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const patientId = useAuthStore((state) => state.patientId);
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [familyData, setFamilyData] = useState<any>(null);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [healthId, setHealthId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id || patientId) {
      loadProfile();
      loadFamily();
      return;
    }
    setProfile({
      name: 'Demo User',
      age: 30,
      gender: 'Other',
      phone: '9999999999',
      risk_level: 'Low',
      profile_summary: 'Demo profile loaded because backend/auth is unavailable.',
      chronic_diseases: [],
      medications: [],
      allergies: [],
      state: 'Demo State',
      adherence_rate: 100,
    });
    setLoading(false);
  }, [user, patientId]);

  const loadProfile = async () => {
    try {
      const resolvedId = user?.id || patientId;
      if (!resolvedId) return;
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', resolvedId)
        .single();

      if (error) throw error;
      setProfile(data);
      
      // Set health ID from user data or generate from patient ID
      const userId = data.health_id || data.id || resolvedId;
      setHealthId(userId);
      
    } catch (error) {
      console.error("Profile load error:", error);
      setProfile((prev: any) => prev || {
        name: 'Demo User',
        age: 30,
        gender: 'Other',
        phone: '9999999999',
        risk_level: 'Low',
        profile_summary: 'Backend unavailable, showing demo profile.',
        chronic_diseases: [],
        medications: [],
        allergies: [],
        state: 'Demo State',
        adherence_rate: 100,
      });
      // Fallback health ID
      setHealthId(patientId || 'DEMO_USER_ID');
    } finally {
      setLoading(false);
    }
  };

  const loadFamily = async () => {
    try {
      const resolvedId = user?.id || patientId;
      if (!resolvedId) return;

      setLoadingFamily(true);
      const family = await getFamilyByPatientId(resolvedId);
      if (family) {
        console.log('Family loaded:', family.family_name);
        setFamilyData(family);
      }
    } catch (error) {
      console.error("Family load error:", error);
    } finally {
      setLoadingFamily(false);
    }
  };

  const handleIntroComplete = () => {
    setIsDataLoaded(true);
  };

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: `Check out my Health ID: ${healthId || patientId}`,
        title: 'Share Health ID',
      });
    } catch {
      Alert.alert('Error', 'Could not share QR code');
    }
  };

  const handleDownloadQR = () => {
    Alert.alert('Download QR', 'QR code saved to your gallery');
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      logout();
      router.replace('/(auth)/welcome');
    }
  };

  const handleCopyFamilyCode = async () => {
    if (!familyData?.join_code) return;
    try {
      // Try using expo-clipboard if available
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(familyData.join_code);
      Alert.alert('Copied!', 'Family code copied to clipboard');
    } catch {
      Alert.alert('Family Code', `Your family code is: ${familyData.join_code}`);
    }
  };

  const handleShareFamilyCode = async () => {
    if (!familyData?.join_code) return;
    try {
      await Share.share({
        message: `Join my family "${familyData.family_name}" on Swasthya! Use code: ${familyData.join_code}`,
        title: 'Share Family Code',
      });
    } catch {
      Alert.alert('Error', 'Could not share family code');
    }
  };

  const handleSetupFamily = () => {
    router.push('/(onboarding)/family-setup');
  };

  const recentRecords = [
    { id: 1, title: 'Blood Report', date: 'Mar 15, 2026' },
    { id: 2, title: 'ECG Analysis', date: 'Mar 10, 2026' },
    { id: 3, title: 'Prescription', date: 'Mar 5, 2026' },
  ];

  const familyMembers = [
    { name: 'Meera Sharma', risk: 'Low', age: 34, relationship: 'Spouse' },
    { name: 'Aarav Sharma', risk: 'Moderate', age: 12, relationship: 'Son' },
    { name: 'Vikram Sharma', risk: 'Low', age: 65, relationship: 'Father' },
  ];

  const getRiskColor = (risk: string) => {
    switch(risk?.toLowerCase()) {
      case 'low': case 'green': return COLORS.risk.low;
      case 'moderate': case 'yellow': return COLORS.risk.moderate;
      case 'elevated': case 'orange': return COLORS.risk.elevated;
      case 'high': case 'red': return COLORS.risk.high;
      default: return COLORS.risk.low;
    }
  };

  // Generate QR code value with actual user ID
  const getQRValue = () => {
    if (healthId) {
      return `SWASTHYA_HEALTH_ID:${healthId}`;
    }
    if (patientId) {
      return `SWASTHYA_PATIENT:${patientId}`;
    }
    return `SWASTHYA_USER:${user?.id || 'GUEST'}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName={profile?.name || "User"}
        activeScreen={currentRoute}
      />
      
      <ScreenIntroGate
        loaderText="Loading your profile..."
        loaderDuration={2000}
        backgroundColor={COLORS.background}
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded || loading ? (
          <SkeletonProfileScreen />
        ) : (
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
        {/* A. Identity + QR Card */}
        <View style={styles.identityCard}>
          <View style={styles.profileHeader}>
            <View style={styles.profileInfo}>
              <View style={styles.profilePhoto}>
                <Text style={styles.profilePhotoText}>{profile?.name ? profile.name[0] : 'U'}</Text>
              </View>
              <View>
                <Text style={styles.profileName}>{profile?.name || "Patient Name"}</Text>
                <Text style={styles.profileAge}>{profile?.age || "--"} years • {profile?.gender || "Other"}</Text>
              </View>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor(profile?.risk_level) }]}>
              <Text style={styles.riskBadgeText}>{profile?.risk_level || "Low"}</Text>
            </View>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Health ID</Text>
            <View style={styles.qrBox}>
              {profile?.health_id_qr ? (
                <Image 
                    source={{ uri: profile.health_id_qr }} 
                    style={{ width: 120, height: 120 }} 
                />
              ) : (
                <QRCode 
                  value={getQRValue()}
                  size={120}
                  color="#000000"
                  backgroundColor="#FFFFFF"
                />
              )}
            </View>
            <Text style={styles.qrSubtitle}>
              Health ID: {healthId || patientId || user?.id || 'Not assigned'}
            </Text>
            <Text style={styles.qrSubtitle}>Scan to access your health summary</Text>
            <View style={styles.qrButtons}>
              <TouchableOpacity style={styles.qrButton} onPress={handleShareQR}>
                <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                <Text style={styles.qrButtonText}>Share QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton} onPress={handleDownloadQR}>
                <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                <Text style={styles.qrButtonText}>Save QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* B. Quick Health Snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Health Snapshot</Text>
          <View style={styles.gridContainer}>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="alert-circle" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Risk Level</Text>
              <Text style={styles.gridValue}>{profile?.risk_level || "Low"}</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="fitness" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Conditions</Text>
              <Text style={styles.gridValue}>{profile?.chronic_diseases?.length || 0} Listed</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="medkit" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Medications</Text>
              <Text style={styles.gridValue}>{profile?.medications?.length || 0} Active</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Adherence</Text>
              <Text style={styles.gridValue}>{profile?.adherence_rate || 100}%</Text>
            </View>
          </View>
        </View>

        {/* C. AI Insight Card */}
        <View style={styles.aiCard}>
          <View style={styles.aiHeader}>
            <Ionicons name="bulb-outline" size={24} color={COLORS.primary} />
            <Text style={styles.aiTitle}>AI Insight</Text>
          </View>
          <Text style={styles.aiText}>
            {profile?.profile_summary || "Welcome to Swasthya AI. Complete your first check-in to get personalized health insights."}
          </Text>
        </View>

        {/* D. Medical Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.medicalCard}>
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Phone</Text>
              <Text style={styles.medicalValue}>{profile?.phone || "Not set"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Allergies</Text>
              <Text style={styles.medicalValue}>{profile?.allergies?.join(', ') || "None"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>State</Text>
              <Text style={styles.medicalValue}>{profile?.state || "Not set"}</Text>
            </View>
          </View>
        </View>

        {/* F. Family Information & QR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Family</Text>
          {familyData ? (
            <>
              <TouchableOpacity 
                style={styles.familyQRCard}
                activeOpacity={0.95}
              >
                <View style={styles.familyQRLeft}>
                  <View style={styles.familyQRCode}>
                    <Ionicons name="people" size={28} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.familyQRTitle}>{familyData.family_name || 'Your Family'}</Text>
                    <Text style={styles.familyQRSubtitle}>Code: {familyData.join_code}</Text>
                  </View>
                </View>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={24} color={COLORS.text.secondary} />
                </TouchableOpacity>
              </TouchableOpacity>

              <View style={styles.familyQRButtons}>
                <TouchableOpacity 
                  style={styles.familyActionButton}
                  onPress={handleCopyFamilyCode}
                >
                  <Ionicons name="copy-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.familyActionText}>Copy Code</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.familyActionButton}
                  onPress={handleShareFamilyCode}
                >
                  <Ionicons name="share-social-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.familyActionText}>Share</Text>
                </TouchableOpacity>
              </View>

              {/* Family QR Code Display */}
              <View style={styles.familyQRDisplayContainer}>
                <Text style={styles.familyQRLabel}>Share this code to invite members</Text>
                <View style={styles.familyQRBox}>
                  <QRCode 
                    value={`SWASTHYA_FAMILY:${familyData.join_code}`}
                    size={130}
                    color="#000000"
                    backgroundColor="#FFFFFF"
                  />
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noFamilyCard}>
              <Ionicons name="people-outline" size={48} color={COLORS.primary} />
              <Text style={styles.noFamilyTitle}>No Family Yet</Text>
              <Text style={styles.noFamilyText}>
                Create a family or join an existing one to share health data with family members
              </Text>
              <TouchableOpacity 
                style={styles.joinFamilyButton}
                activeOpacity={0.8}
                onPress={handleSetupFamily}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.joinFamilyButtonGradient}
                >
                  <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.joinFamilyButtonText}>Set Up Family</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* G. Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="speedometer-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/profile/schemes')}
            >
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="medal-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Check Schemes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconBg, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.actionText}>Add Record</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* H. Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="person-outline" size={22} color={COLORS.text.secondary} />
              <Text style={styles.settingText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="settings-outline" size={22} color={COLORS.text.secondary} />
              <Text style={styles.settingText}>App Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <View style={styles.settingLeft}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.risk.high} />
              <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
          </TouchableOpacity>
        </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
        )}
      </ScreenIntroGate>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
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
  // Original Profile Styles
  identityCard: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profilePhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  profileAge: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  riskBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  qrSection: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  qrBox: {
    width: 140,
    height: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  qrSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  qrButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  gridLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  gridValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 2,
  },
  aiCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  aiText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  medicalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  medicalLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  medicalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  recordCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recordIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  recordDate: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  familyQRCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  familyQRLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  familyQRCode: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  familyQRTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  familyQRSubtitle: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  familyQRButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  familyActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  familyActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  familyQRDisplayContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  familyQRLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  familyQRBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noFamilyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  noFamilyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  noFamilyText: {
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  joinFamilyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  joinFamilyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  joinFamilyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  memberAge: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  memberRisk: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  memberRiskText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  actionIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 14,
    color: COLORS.text.primary,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: COLORS.risk.high,
  },
  bottomPadding: {
    height: 100,
  },
});