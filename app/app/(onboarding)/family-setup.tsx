import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, STYLES } from '../../constants/Colors';

export default function FamilySetupScreen() {
  const router = useRouter();

  const handleCreate = () => {
    router.push('/(tabs)/home');
  };

  const handleJoin = () => {
    router.push('/(tabs)/home');
  };

  const handleSkip = () => {
    router.push('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Progress Bar top */}
        <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.topBar}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarFill} />
          </View>
          <Text style={styles.stepText}>Step 2 of 2</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Text style={styles.title}>Set up your family</Text>
          <Text style={styles.subtitle}>Swasthya AI works best when your whole family is connected</Text>
        </Animated.View>

        <View style={styles.cardsContainer}>
          {/* Create Family Card */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TouchableOpacity 
              style={[styles.card, styles.createCard, STYLES.shadowPrimary]} 
              onPress={handleCreate}
              activeOpacity={0.8}
            >
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Recommended</Text>
              </View>
              
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primaryLight }]}>
                <Ionicons name="home" size={32} color={COLORS.primary} />
              </View>
              
              <Text style={styles.cardTitle}>Create a Family Group</Text>
              <Text style={styles.cardSubtitle}>Invite your family using a unique group code</Text>
              
              <Text style={styles.actionText}>Create & Continue →</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Join Family Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <TouchableOpacity 
              style={[styles.card, styles.joinCard, STYLES.shadow]} 
              onPress={handleJoin}
              activeOpacity={0.8}
            >
              <View style={[styles.iconCircle, { backgroundColor: COLORS.greenLight }]}>
                <Ionicons name="people" size={32} color={COLORS.green} />
              </View>
              
              <Text style={styles.cardTitle}>Join Existing Family</Text>
              <Text style={styles.cardSubtitle}>Enter a 6-digit code from a family member</Text>
              
              <Text style={[styles.actionText, { color: COLORS.green }]}>Join Family →</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View style={{ flex: 1, minHeight: 40 }} />

        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.skipContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip for now</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginRight: 16,
  },
  progressBarFill: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text.muted,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text.secondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  cardsContainer: {
    gap: 16,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  createCard: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  joinCard: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.primary,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.primary,
  },
  skipContainer: {
    alignItems: 'center',
  },
  skipText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text.muted,
    textDecorationLine: 'underline',
  },
});
