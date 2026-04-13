// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Tabs, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View } from 'react-native';

const FAB_SIZE = 62;
const TAB_CONFIG = [
  { name: 'Home', icon: 'home-outline', activeIcon: 'home', route: '/(tabs)/home' },
  { name: 'Check-in', icon: 'checkmark-circle-outline', activeIcon: 'checkmark-circle', route: '/(tabs)/checkin' },
  { name: 'Meds', icon: 'medkit-outline', activeIcon: 'medkit', route: '/(tabs)/meds' },
  { name: 'Profile', icon: 'person-outline', activeIcon: 'person', route: '/(tabs)/profile' },
] as const;

// Primary Color
const PRIMARY_COLOR = '#0474FC';

export default function TabLayout() {
  const segments = useSegments();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Smooth animation values
  const navbarGlow = useRef(new Animated.Value(0)).current;
  const navbarBounce = useRef(new Animated.Value(1)).current;
  const fabPulseRing = useRef(new Animated.Value(0)).current;
  const fabShadowAnim = useRef(new Animated.Value(1)).current;
  const tabScaleAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;
  const tabTextAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(0))).current;

  // Smooth continuous pulse animation for FAB
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabPulseRing, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabPulseRing, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Smooth floating animation for FAB
    Animated.loop(
      Animated.sequence([
        Animated.timing(fabShadowAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fabShadowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fabPulseRing, fabShadowAnim]);

  const getActiveTab = () => {
    const currentRoute = segments[segments.length - 1];
    if (currentRoute === 'home') return 0;
    if (currentRoute === 'checkin') return 1;
    if (currentRoute === 'meds') return 2;
    if (currentRoute === 'profile') return 3;
    return 0;
  };

  // Smooth FAB Press Animation
  const handleFabPress = () => {
    // Smooth scale animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
      Animated.spring(navbarBounce, {
        toValue: 0.99,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth return animation
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.spring(navbarBounce, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }, 150);

    // Smooth rotation
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      }).start();
    });

    // Smooth pulse
    Animated.sequence([
      Animated.spring(pulseAnim, {
        toValue: 1.15,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();

    // Smooth navbar glow
    Animated.sequence([
      Animated.timing(navbarGlow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(navbarGlow, {
        toValue: 0,
        duration: 400,
        useNativeDriver: false,
      }),
    ]).start();

    setTimeout(() => {
      router.push('/(onboarding)/chat');
    }, 200);
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const pulseRingScale = fabPulseRing.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.4],
  });

  const pulseRingOpacity = fabPulseRing.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0],
  });

  const navbarGlowIntensity = navbarGlow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.5],
  });

  const fabShadowScale = fabShadowAnim.interpolate({
    inputRange: [1, 1.1],
    outputRange: [1, 1.05],
  });

  const activeTab = getActiveTab();
  const leftTabs = TAB_CONFIG.slice(0, 2);
  const rightTabs = TAB_CONFIG.slice(2, 4);

  const animateTabState = (tabIndex: number, isPressed: boolean) => {
    Animated.parallel([
      Animated.spring(tabScaleAnims[tabIndex], {
        toValue: isPressed ? 0.92 : 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
      Animated.timing(tabTextAnims[tabIndex], {
        toValue: isPressed ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const getTextScale = (tabIndex: number) =>
    tabTextAnims[tabIndex].interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.05],
    });

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="home" options={{ title: 'Home' }} />
        <Tabs.Screen name="checkin" options={{ title: 'Check-in' }} />
        <Tabs.Screen name="meds" options={{ title: 'Meds' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
        <Tabs.Screen name="aibot" options={{ href: null }} />
      </Tabs>

      <View style={styles.navContainer}>
        {/* Smooth Animated Navbar */}
        <Animated.View 
          style={[
            styles.navbar,
            {
              transform: [{ scale: navbarBounce }],
              shadowOpacity: navbarGlowIntensity,
            }
          ]}
        >
          <View style={styles.navContent}>
            {leftTabs.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnims[idx] }] }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(tab.route as any)}
                    onPressIn={() => animateTabState(idx, true)}
                    onPressOut={() => animateTabState(idx, false)}
                    activeOpacity={0.7}
                    style={styles.navItem}
                  >
                    <Animated.View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Animated.Text style={[
                      styles.navLabel, 
                      isActive && styles.activeNavLabel,
                      { transform: [{ scale: getTextScale(idx) }] }
                    ]}>
                      {tab.name}
                    </Animated.Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            <View style={styles.fabSpace} />

            {rightTabs.map((tab, idx) => {
              const isActive = activeTab === idx + 2;
              const tabIndex = idx + 2;
              return (
                <Animated.View
                  key={tab.name}
                  style={{ transform: [{ scale: tabScaleAnims[tabIndex] }] }}
                >
                  <TouchableOpacity
                    onPress={() => router.push(tab.route as any)}
                    onPressIn={() => animateTabState(tabIndex, true)}
                    onPressOut={() => animateTabState(tabIndex, false)}
                    activeOpacity={0.7}
                    style={styles.navItem}
                  >
                    <Animated.View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                      <Ionicons 
                        name={isActive ? (tab.activeIcon as any) : (tab.icon as any)} 
                        size={24} 
                        color="#FFFFFF" 
                      />
                    </Animated.View>
                    <Animated.Text style={[
                      styles.navLabel, 
                      isActive && styles.activeNavLabel,
                      { transform: [{ scale: getTextScale(tabIndex) }] }
                    ]}>
                      {tab.name}
                    </Animated.Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Smooth Floating Action Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleFabPress}
          style={styles.fabOuter}
        >
          {/* Smooth Pulsing Ring */}
          <Animated.View
            style={[
              styles.fabPulseRing,
              {
                transform: [{ scale: pulseRingScale }],
                opacity: pulseRingOpacity,
              }
            ]}
          />
          
          <Animated.View
            style={[
              styles.fabButton,
              {
                transform: [
                  { scale: scaleAnim },
                  { rotate: rotateInterpolate },
                  { scale: fabShadowScale }
                ]
              }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Ionicons name="chatbubble-ellipses" size={30} color={PRIMARY_COLOR} />
            </Animated.View>
            <View style={styles.fabRipple} />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 55,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  navbar: {
    width: '95%', // Changed from '100%' to '90%' - DECREASED WIDTH
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 35,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'center', // Centers the navbar
  },
  navContent: {
    flexDirection: 'row',
    height: 75,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24, // Adjusted for new width
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  activeNavLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fabSpace: {
    width: FAB_SIZE - 12,
  },
  fabOuter: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    zIndex: 200,
  },
  fabButton: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  fabRipple: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: PRIMARY_COLOR,
    opacity: 0.08,
  },
  fabPulseRing: {
    position: 'absolute',
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: PRIMARY_COLOR,
    top: 0,
    left: 0,
  },
});
