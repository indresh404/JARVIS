// app/(auth)/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

// Define colors directly (no external imports)
const COLORS = {
  surface: '#F8FAFC',
  white: '#FFFFFF',
  blue: {
    500: '#3B82F6',
    900: '#1E3A8A',
  },
  gray: {
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
  },
  text: {
    primary: '#1F2937',
    secondary: '#4B5563',
    muted: '#6B7280',
  },
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
};

const TYPOGRAPHY = {
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  sizes: {
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputBorderAnim = useRef(new Animated.Value(0)).current;
  const buttonPopAnim = useRef(new Animated.Value(1)).current;
  const googleButtonPopAnim = useRef(new Animated.Value(1)).current;
  const backButtonPopAnim = useRef(new Animated.Value(1)).current;

  // Background animation values
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating orb animations
    const createFloatAnimation = (animValue: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 3000,
              useNativeDriver: true,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 3000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    };

    createFloatAnimation(orb1Anim, 0);
    createFloatAnimation(orb2Anim, 1000);
    createFloatAnimation(orb3Anim, 2000);
  }, []);

  // Handle input focus animation
  useEffect(() => {
    Animated.spring(inputBorderAnim, {
      toValue: isFocused ? 1 : 0,
      tension: 50,
      friction: 7,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  // INSTANT POP EFFECT - NO DELAY
  const animatePop = (animValue: Animated.Value) => {
    Animated.spring(animValue, {
      toValue: 0.92,
      tension: 300,
      friction: 2,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(animValue, {
        toValue: 1,
        tension: 200,
        friction: 3,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleContinue = async () => {
    // TRIGGER POP EFFECT IMMEDIATELY - FIRST THING
    animatePop(buttonPopAnim);

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: phoneNumber },
      });
    }, 1500);
  };

  const handleGoogleSignIn = () => {
    animatePop(googleButtonPopAnim);
    Alert.alert('Google Sign In', 'Google authentication would be integrated here');
  };

  const handleBack = () => {
    animatePop(backButtonPopAnim);
    router.back();
  };

  const inputBorderColor = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.gray[300], COLORS.blue[500]],
  });

  const inputShadowOpacity = inputBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.15],
  });

  // Orb position interpolation
  const orb1Translate = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const orb2Translate = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 35],
  });

  const orb3Translate = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const orb2Scale = orb2Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const orb3Scale = orb3Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.15, 1],
  });

  return (
    <View style={styles.container}>
      {/* Clean White Background */}
      <View style={styles.background} />

      {/* Floating Gradient Orbs */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            transform: [
              { translateY: orb1Translate },
              { scale: orb1Scale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            transform: [
              { translateY: orb2Translate },
              { scale: orb2Scale },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orb3,
          {
            transform: [
              { translateY: orb3Translate },
              { scale: orb3Scale },
            ],
          },
        ]}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={1}
          >
            <Animated.View
              style={[
                styles.backButtonBg,
                {
                  transform: [{ scale: backButtonPopAnim }],
                },
              ]}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.blue[900]} />
            </Animated.View>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={[styles.title, { fontWeight: 'bold' }]}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          {/* Form Section */}
          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <Animated.View
                style={[
                  styles.phoneInputWrapper,
                  {
                    borderColor: inputBorderColor,
                    shadowColor: COLORS.blue[500],
                    shadowOpacity: inputShadowOpacity,
                    shadowRadius: 8,
                    elevation: isFocused ? 4 : 2,
                  },
                ]}
              >
                <View style={styles.countryCode}>
                  <Text style={styles.flagIcon}>🇮🇳</Text>
                  <Text style={styles.countryCodeText}>+91</Text>
                  <Ionicons name="chevron-down" size={16} color={COLORS.gray[500]} />
                </View>
                <TextInput
                  ref={inputRef}
                  placeholder="Phone number"
                  placeholderTextColor={COLORS.gray[400]}
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  maxLength={10}
                  style={styles.input}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />
              </Animated.View>
            </View>

            {/* Continue Button with Gradient - INSTANT POP */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleContinue}
              disabled={loading}
            >
              <Animated.View
                style={[
                  styles.buttonWrapper,
                  {
                    transform: [{ scale: buttonPopAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#3B82F6', '#2563EB', '#1D4ED8']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueButton}
                >
                  {loading ? (
                    <View style={styles.loadingContainer}>
                      <Animated.View style={styles.loadingDot} />
                      <Text style={styles.continueButtonText}>Processing...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.continueButtonText}>Continue</Text>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            activeOpacity={0.8}
          >
            <Animated.View
              style={[
                styles.googleButton,
                {
                  transform: [{ scale: googleButtonPopAnim }],
                },
              ]}
            >
              <Ionicons name="logo-google" size={22} color="#EA4335" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    marginBottom: SPACING.xl,
    width: 40,
    height: 40,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerSection: {
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: 28,
    color: COLORS.blue[900],
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.muted,
  },
  form: {
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  inputWrapper: {
    gap: SPACING.sm,
  },
  inputLabel: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.secondary,
    marginLeft: SPACING.xs,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray[300],
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    height: 52,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  flagIcon: {
    fontSize: 18,
  },
  countryCodeText: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
  },
  input: {
    flex: 1,
    height: 52,
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
  },
  buttonWrapper: {
    width: '100%',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    height: 56,
    borderRadius: 14,
    shadowColor: COLORS.blue[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 16,
    color: COLORS.white,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[300],
  },
  dividerText: {
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.text.muted,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.md,
    height: 52,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontFamily: TYPOGRAPHY.fonts.medium,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.text.secondary,
  },
  // Animated gradient orbs
  orb: {
    position: 'absolute',
    borderRadius: 200,
    opacity: 0.08,
  },
  orb1: {
    width: 300,
    height: 300,
    backgroundColor: '#3b70c6ff',
    top: -120,
    right: -100,
  },
  orb2: {
    width: 250,
    height: 250,
    backgroundColor: '#8254edff',
    bottom: 80,
    left: -100,
  },
  orb3: {
    width: 200,
    height: 200,
    backgroundColor: '#3854f3ff',
    bottom: 250,
    right: -100,
  },
});