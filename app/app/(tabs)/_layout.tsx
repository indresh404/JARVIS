// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { router, Slot, useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity, View, Easing } from 'react-native';

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
  
  // Smooth animation values
  const navbarGlow = useRef(new Animated.Value(0)).current;
  const navbarBounce = useRef(new Animated.Value(1)).current;
  const fabPulseRing = useRef(new Animated.Value(0)).current;
  const fabShadowAnim = useRef(new Animated.Value(1)).current;
  const tabScaleAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(1))).current;
  const tabTextAnims = useRef(TAB_CONFIG.map(() => new Animated.Value(0))).current;

  // Continuous subtle pulse for active tab
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

  const handleFabPress = () => {
    router.push('/(onboarding)/chat');
  };

  const handleTabPress = (route: string, index: number) => {
    // Smooth ripple effect on press
    Animated.parallel([
      Animated.timing(tabScaleAnims[index], {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(tabTextAnims[index], {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();

    // Smooth return
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(tabScaleAnims[index], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(tabTextAnims[index], {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    }, 100);

    router.push(route as any);
  };

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
      <Slot />
      
      {/* Bottom Navigation Bar */}
      <View style={styles.navContainer}>
        <View style={styles.navbar}>
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
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                      {
                        shadowColor: PRIMARY_COLOR,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                      }
                    ]}>
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
                    <Animated.View style={[
                      styles.iconWrapper,
                      isActive && styles.activeIconWrapper,
                      {
                        shadowColor: PRIMARY_COLOR,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.3,
                        shadowRadius: 10,
                      }
                    ]}>
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
        </View>

        {/* Floating Action Button - Clean & Simple */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleFabPress}
          style={styles.fabOuter}
        >
          <View style={styles.fabButton}>
            <Ionicons name="chatbubble-ellipses" size={30} color={PRIMARY_COLOR} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 50,
    left: 16,
    right: 16,
    alignItems: 'center',
    zIndex: 100,
  },
  navbar: {
    width: '95%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 35,
    shadowColor: PRIMARY_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: 'center',
  },
  navContent: {
    flexDirection: 'row',
    height: 65,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  navLabel: {
    fontSize: 11,
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
    bottom: 25,
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
