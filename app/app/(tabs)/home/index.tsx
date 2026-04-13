// app/(tabs)/home/index.tsx
import { BodyMapVisualization3D } from '@/components/bodymap/BodyMapVisualization3D';
import { BodyMapCard } from '@/components/home/BodyMapCard';
import { GovernmentSchemeCard } from '@/components/home/GovernmentSchemeCard';
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonHomeScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useSegments } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Top Navigation Bar Component (inline)
const TopNavBar = ({ 
  onScanPress, 
  onNotificationPress, 
  onProfilePress, 
  notificationCount = 3, 
  userName = 'Indresh',
  activeScreen = 'DASHBOARD'
}: any) => {
  // Get the title based on active screen
  const getTitle = () => {
    switch(activeScreen) {
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
              <Text style={styles.avatarText}>{userName[0]}</Text>
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

export default function HomeScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [bodyMapVisible, setBodyMapVisible] = useState(false);

  // Skeleton loading timeout: 4 seconds fixed duration
  const SKELETON_DURATION = 4000; // 4 seconds
  const MAX_SKELETON_TIME = 90000; // 4 minutes max timeout
  const skeletonStartTime = React.useRef<number>(Date.now());

  const handleIntroComplete = () => {
    // Start skeleton loading after intro animation
    skeletonStartTime.current = Date.now();
    
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
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
      {/* Top Navigation Bar with dynamic title */}
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      
      <ScreenIntroGate
        loaderText="Loading your health dashboard..."
        loaderDuration={3000}
        introSource={require('../../../assets/lottie_animations/heart_animation.json')}
        introText="Tracking your heartbeat and getting everything ready"
        backgroundColor="#F9FAFB"
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded ? (
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
                  <Text style={styles.welcomeTitle}>Welcome back, Rahul</Text>
                  <Text style={styles.welcomeDescription}>Your individualized health intelligence hub is ready</Text>
                </View>

                {/* Government Scheme Card */}
                <GovernmentSchemeCard />

                {/* 3D Body Map Card */}
                <BodyMapCard onPress={() => setBodyMapVisible(true)} />

                {/* Additional Content Areas */}
                <View style={styles.contentSection}>
                  <Text style={styles.sectionTitle}>Health Status</Text>
                  <Text style={styles.placeholderText}>More health components coming soon...</Text>
                </View>
              </View>
            </ScrollView>

            {/* Body Map Modal */}
            <BodyMapVisualization3D 
              visible={bodyMapVisible} 
              onClose={() => setBodyMapVisible(false)} 
            />

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
});
