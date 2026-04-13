// app/(tabs)/profile/index.tsx
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonProfileScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState } from 'react';
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
} from 'react-native';

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
  userName = 'Rahul',
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
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Skeleton loading timeout: 4 seconds fixed duration
  const SKELETON_DURATION = 4000; // 4 seconds
  const MAX_SKELETON_TIME = 240000; // 4 minutes max timeout

  const handleIntroComplete = () => {
    // Hide skeleton after fixed 4 seconds duration
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

  const handleShareQR = async () => {
    try {
      await Share.share({
        message: 'Check out my Health ID QR Code',
        title: 'Share Health ID',
      });
    } catch {
      Alert.alert('Error', 'Could not share QR code');
    }
  };

  const handleDownloadQR = () => {
    Alert.alert('Download QR', 'QR code would be downloaded here');
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
    switch(risk) {
      case 'Low': return COLORS.risk.low;
      case 'Moderate': return COLORS.risk.moderate;
      case 'Elevated': return COLORS.risk.elevated;
      case 'High': return COLORS.risk.high;
      default: return COLORS.risk.low;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Top Navigation Bar */}
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      
      <ScreenIntroGate
        loaderText="Loading your profile..."
        loaderDuration={3000}
        backgroundColor={COLORS.background}
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded ? (
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
                <Text style={styles.profilePhotoText}>RS</Text>
              </View>
              <View>
                <Text style={styles.profileName}>Rahul Sharma</Text>
                <Text style={styles.profileAge}>32 years • Male</Text>
              </View>
            </View>
            <View style={[styles.riskBadge, { backgroundColor: getRiskColor('Elevated') }]}>
              <Text style={styles.riskBadgeText}>Elevated</Text>
            </View>
          </View>

          <View style={styles.qrSection}>
            <Text style={styles.qrTitle}>Your Health ID</Text>
            <View style={styles.qrBox}>
              <Ionicons name="qr-code" size={120} color="#000000" />
            </View>
            <Text style={styles.qrSubtitle}>Scan to access your health summary</Text>
            <View style={styles.qrButtons}>
              <TouchableOpacity style={styles.qrButton} onPress={handleShareQR}>
                <Ionicons name="share-outline" size={20} color={COLORS.primary} />
                <Text style={styles.qrButtonText}>Share QR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.qrButton} onPress={handleDownloadQR}>
                <Ionicons name="download-outline" size={20} color={COLORS.primary} />
                <Text style={styles.qrButtonText}>Download QR</Text>
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
              <Text style={styles.gridValue}>Elevated</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="fitness" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Conditions</Text>
              <Text style={styles.gridValue}>Hypertension</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="medkit" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Medications</Text>
              <Text style={styles.gridValue}>3 Active</Text>
            </View>
            <View style={styles.gridItem}>
              <View style={[styles.gridIcon, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="calendar" size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.gridLabel}>Last Check-in</Text>
              <Text style={styles.gridValue}>2 days ago</Text>
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
            Your blood pressure has improved over the last week. Continue with your current medication routine.
          </Text>
        </View>

        {/* D. Medical Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.medicalCard}>
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Blood Group</Text>
              <Text style={styles.medicalValue}>O+</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Allergies</Text>
              <Text style={styles.medicalValue}>Penicillin, Dust</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.medicalRow}>
              <Text style={styles.medicalLabel}>Emergency Contact</Text>
              <Text style={styles.medicalValue}>Meera: +91 98765 43210</Text>
            </View>
          </View>
        </View>

        {/* E. Past Records */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Past Records</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All Records →</Text>
            </TouchableOpacity>
          </View>
          {recentRecords.map((record) => (
            <TouchableOpacity key={record.id} style={styles.recordCard}>
              <View style={styles.recordIcon}>
                <Ionicons name="document-text" size={22} color={COLORS.primary} />
              </View>
              <View style={styles.recordInfo}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordDate}>{record.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          ))}
        </View>

        {/* F. Family Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family</Text>
          <View style={styles.familyQRCard}>
            <View style={styles.familyQRLeft}>
              <View style={styles.familyQRCode}>
                <Ionicons name="qr-code" size={32} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.familyQRTitle}>Family QR</Text>
                <Text style={styles.familyQRSubtitle}>Scan to view family health</Text>
              </View>
            </View>
            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={20} color={COLORS.text.light} />
            </TouchableOpacity>
          </View>
          
          {familyMembers.map((member, index) => (
            <View key={index} style={styles.memberCard}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberInitial}>{member.name[0]}</Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberAge}>{member.age} years</Text>
              </View>
              <View style={[styles.memberRisk, { backgroundColor: getRiskColor(member.risk) + '20' }]}>
                <Text style={[styles.memberRiskText, { color: getRiskColor(member.risk) }]}>
                  {member.risk}
                </Text>
              </View>
            </View>
          ))}
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
            
            <TouchableOpacity style={styles.actionButton}>
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
          
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]}>
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
    marginBottom: 16,
  },
  qrButtons: {
    flexDirection: 'row',
    gap: 12,
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
