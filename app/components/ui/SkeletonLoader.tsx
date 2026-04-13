import React, { useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, View } from 'react-native';

// Shimmer effect animation component
export const ShimmerPlaceholder = ({ width = '100%', height = 100, borderRadius = 12, style }: any) => {
  const animatedValue = new Animated.Value(0);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();
    
    return () => {
      animation.reset();
    };
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.4, 1, 0.4],
  });

  return (
    <Animated.View
      style={[
        styles.shimmerContainer,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// ============= HOME SCREEN SKELETONS =============

// Skeleton Risk Score Card (for health metrics)
export const SkeletonRiskScore = () => (
  <View style={styles.card}>
    <ShimmerPlaceholder width="40%" height={18} borderRadius={9} style={{ marginBottom: 16 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ alignItems: 'center', gap: 8 }}>
          <ShimmerPlaceholder width={70} height={70} borderRadius={35} />
          <ShimmerPlaceholder width={50} height={12} borderRadius={6} />
        </View>
      ))}
    </View>
  </View>
);

// Skeleton Pie Chart Component
export const SkeletonPieChart = () => (
  <View style={styles.card}>
    <ShimmerPlaceholder width="50%" height={18} borderRadius={9} style={{ marginBottom: 16 }} />
    <View style={{ alignItems: 'center', marginBottom: 16 }}>
      <ShimmerPlaceholder width={200} height={200} borderRadius={100} />
    </View>
    <View style={{ gap: 8 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ShimmerPlaceholder width={12} height={12} borderRadius={2} />
          <ShimmerPlaceholder width="60%" height={12} borderRadius={6} />
        </View>
      ))}
    </View>
  </View>
);

// Skeleton Line/Bar Chart Component
export const SkeletonLineChart = () => (
  <View style={styles.card}>
    <ShimmerPlaceholder width="50%" height={18} borderRadius={9} style={{ marginBottom: 12 }} />
    <ShimmerPlaceholder width="100%" height={180} borderRadius={12} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <ShimmerPlaceholder key={i} width="18%" height={40} borderRadius={4} />
      ))}
    </View>
  </View>
);

// HOME SCREEN - Full Skeleton with Graphs, Pie Charts, Risk Score
export const SkeletonHomeScreen = () => (
  <ScrollView style={styles.skeletonContainer} contentContainerStyle={{ paddingBottom: 100 }}>
    {/* Welcome Header */}
    <View style={{ marginBottom: 20 }}>
      <ShimmerPlaceholder width="70%" height={24} borderRadius={12} style={{ marginBottom: 8 }} />
      <ShimmerPlaceholder width="80%" height={14} borderRadius={7} />
    </View>

    {/* Risk Score Card */}
    <View style={{ marginBottom: 20 }}>
      <SkeletonRiskScore />
    </View>

    {/* Line Chart (e.g., Heart Rate Trend) */}
    <View style={{ marginBottom: 20 }}>
      <SkeletonLineChart />
    </View>

    {/* Pie Chart (e.g., Activity Distribution) */}
    <View style={{ marginBottom: 20 }}>
      <SkeletonPieChart />
    </View>

    {/* Bar Chart (e.g., Weekly Stats) */}
    <View style={{ marginBottom: 20 }}>
      <SkeletonLineChart />
    </View>
  </ScrollView>
);

// ============= GENERIC SKELETONS FOR OTHER SCREENS =============

// Generic skeleton card component
export const SkeletonCard = ({ style }: any) => (
  <View style={[styles.card, style]}>
    <ShimmerPlaceholder width="60%" height={16} borderRadius={8} style={{ marginBottom: 12 }} />
    <ShimmerPlaceholder width="100%" height={150} borderRadius={12} style={{ marginBottom: 12 }} />
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <ShimmerPlaceholder width="48%" height={12} borderRadius={6} />
      <ShimmerPlaceholder width="48%" height={12} borderRadius={6} />
    </View>
  </View>
);

// CHECK-IN SCREEN - Generic Skeleton
export const SkeletonCheckInScreen = () => (
  <ScrollView style={styles.skeletonContainer} contentContainerStyle={{ paddingBottom: 100 }}>
    <ShimmerPlaceholder width="60%" height={24} borderRadius={12} style={{ marginBottom: 20 }} />
    {[1, 2, 3].map((i) => (
      <SkeletonCard key={i} style={{ marginBottom: 12 }} />
    ))}
  </ScrollView>
);

// MEDICATIONS SCREEN - Generic Skeleton
export const SkeletonMedsScreen = () => (
  <ScrollView style={styles.skeletonContainer} contentContainerStyle={{ paddingBottom: 100 }}>
    <ShimmerPlaceholder width="60%" height={24} borderRadius={12} style={{ marginBottom: 20 }} />
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.medListItem}>
        <ShimmerPlaceholder width={50} height={50} borderRadius={8} style={{ marginRight: 12 }} />
        <View style={{ flex: 1 }}>
          <ShimmerPlaceholder width="70%" height={16} borderRadius={8} style={{ marginBottom: 8 }} />
          <ShimmerPlaceholder width="50%" height={12} borderRadius={6} />
        </View>
      </View>
    ))}
  </ScrollView>
);

// PROFILE SCREEN - Generic Skeleton
export const SkeletonProfileScreen = () => (
  <ScrollView style={styles.skeletonContainer} contentContainerStyle={{ paddingBottom: 100 }}>
    {/* Profile Header */}
    <View style={styles.profileHeaderSkeleton}>
      <ShimmerPlaceholder width={80} height={80} borderRadius={40} style={{ marginBottom: 12 }} />
      <ShimmerPlaceholder width="60%" height={20} borderRadius={10} style={{ marginBottom: 8 }} />
      <ShimmerPlaceholder width="40%" height={14} borderRadius={7} />
    </View>

    {/* Profile Sections */}
    {[1, 2, 3].map((i) => (
      <View key={i} style={{ marginTop: 20, marginBottom: 20 }}>
        <ShimmerPlaceholder width="40%" height={18} borderRadius={9} style={{ marginBottom: 12 }} />
        <SkeletonCard />
      </View>
    ))}
  </ScrollView>
);

// ============= STYLES =============

const styles = StyleSheet.create({
  shimmerContainer: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  skeletonContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  medListItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileHeaderSkeleton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
});
