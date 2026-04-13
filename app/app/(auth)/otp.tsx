// app/(auth)/otp.tsx
import { useAuthStore } from '@/store/auth.store';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { getPatientByPhone, normalizePhone, getStoredOTP, clearStoredOTP } from '@/services/auth.service';

// Define colors directly (no external imports)
const COLORS = {
  primary: '#3B82F6',
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

const TYPOGRAPHY = {
  fonts: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
};

export default function OTPVerifyScreen() {
  const router = useRouter();
  const setSessionState = useAuthStore((state) => state.setSessionState);
  const params = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [displayOTP, setDisplayOTP] = useState<string>(''); // For dev testing
  const inputs = useRef<Array<TextInput | null>>([]);

  const phoneNumber = normalizePhone((params.phone as string) || '');
  const formattedPhone = phoneNumber ? `+91 ${phoneNumber}` : '+91 XXXXX XXXXX';

  // Load and auto-fill OTP on mount
  useEffect(() => {
    const loadOTP = async () => {
      try {
        const storedOtp = await getStoredOTP(phoneNumber);
        console.log('Loaded OTP for phone', phoneNumber, ':', storedOtp);
        
        if (storedOtp) {
          setDisplayOTP(storedOtp); // Show for dev testing
          const otpDigits = storedOtp.split('');
          setCode(otpDigits);
          console.log('Auto-filled OTP:', otpDigits);
        } else {
          console.log('No OTP found for phone:', phoneNumber);
          Alert.alert('Error', 'OTP not found. Please try logging in again.');
          router.back();
        }
      } catch (error) {
        console.error('Error loading OTP:', error);
      }
    };

    if (phoneNumber) {
      loadOTP();
    }
  }, [phoneNumber]);

  // Timer for OTP expiry
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    if (text !== '' && index === 5 && newCode.every(digit => digit !== '')) {
      setTimeout(() => {
        handleVerify();
      }, 100);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otpCode = code.join('');

    console.log('=== OTP Verification Started ===');
    console.log('Entered OTP:', otpCode);
    console.log('Phone Number:', phoneNumber);

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsVerifying(true);

    try {
      // Get the stored OTP for verification
      const storedOtp = await getStoredOTP(phoneNumber);
      console.log('Stored OTP:', storedOtp);
      console.log('Verification - Entered:', otpCode, 'Stored:', storedOtp, 'Match:', otpCode === storedOtp);

      if (!storedOtp) {
        Alert.alert('OTP Expired', 'Your OTP has expired. Please request a new one.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        setIsVerifying(false);
        return;
      }

      // Verify the entered OTP matches the stored one
      if (otpCode !== storedOtp) {
        console.log('OTP Mismatch!');
        Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
        setCode(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        setIsVerifying(false);
        return;
      }

      console.log('OTP Verified Successfully!');

      // Clear the stored OTP after successful verification
      await clearStoredOTP();

      // Check if patient already exists
      const existingPatient = await getPatientByPhone(phoneNumber);
      console.log('Patient found:', existingPatient?.id);

      if (existingPatient) {
        // Existing user - update auth state and route
        setSessionState({
          userId: existingPatient.id,
          patientId: existingPatient.id,
          phoneNumber,
          isLoggedIn: true,
          hasProfile: Boolean(existingPatient.age && existingPatient.gender),
          hasFamilyGroup: Boolean(existingPatient.family_id),
        });

        console.log('Existing user logged in:', existingPatient.id);

        if (existingPatient.family_id) {
          console.log('Routing to home (has family)');
          router.replace('/(tabs)/home');
        } else if (existingPatient.age && existingPatient.gender) {
          console.log('Routing to family setup (has profile)');
          router.replace('/(onboarding)/family-setup');
        } else {
          console.log('Routing to user details (incomplete profile)');
          router.replace({
            pathname: '/(onboarding)/user-details',
            params: { phone: phoneNumber },
          });
        }
      } else {
        // New user - create temporary auth state and route to profile setup
        console.log('New user detected, routing to profile setup');
        
        setSessionState({
          userId: phoneNumber, // Use phone as temp ID
          patientId: phoneNumber,
          phoneNumber,
          isLoggedIn: true,
          hasProfile: false,
          hasFamilyGroup: false,
        });

        router.replace({
          pathname: '/(onboarding)/user-details',
          params: { phone: phoneNumber },
        });
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error);
      Alert.alert('Verification Failed', error?.message || 'Failed to verify OTP. Please try again.');
      
      // Clear OTP on failure
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    console.log('=== Resending OTP ===');
    
    try {
      // Generate new random OTP
      const { generateRandomOTP, storeOTPLocally } = await import('@/services/auth.service');
      const newOtp = generateRandomOTP();
      console.log('Generated new OTP:', newOtp);
      
      await storeOTPLocally(phoneNumber, newOtp);
      console.log('New OTP stored');
      
      // Update display
      setDisplayOTP(newOtp);
      
      // Reset timer and form
      setTimer(30);
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
      
      Alert.alert('OTP Resent', `A new verification code has been sent to ${formattedPhone}`);
      setIsResending(false);
    } catch (error: any) {
      console.error('Error resending OTP:', error);
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
            <View style={styles.backButtonBg}>
              <Ionicons name="arrow-back" size={24} color={COLORS.primary || '#2563EB'} />
            </View>
          </TouchableOpacity>

          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Verify your number</Text>
            <Text style={styles.subtitle}>
              We sent a verification code to
            </Text>
            <Text style={styles.phoneNumber}>{formattedPhone}</Text>
          </View>

          {/* Dev OTP Display */}
          {displayOTP && (
            <View style={styles.otpDisplayBox}>
              <Text style={styles.otpDisplayLabel}>OTP Code (auto-filled below):</Text>
              <Text style={styles.otpDisplayValue}>{displayOTP}</Text>
            </View>
          )}

          {/* OTP Inputs */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.otpBoxWrapper}>
                <LinearGradient
                  colors={
                    focusedIndex === index || digit !== ''
                      ? ['#2563EB', '#3B82F6', '#60A5FA']
                      : ['#E2E8F0', '#E2E8F0', '#E2E8F0']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.otpGradientBorder}
                >
                  <View style={styles.otpInnerBox}>
                    <TextInput
                      ref={(ref) => { inputs.current[index] = ref; }}
                      style={styles.otpBox}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={digit}
                      onChangeText={(text) => handleChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(-1)}
                      selectTextOnFocus
                    />
                  </View>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Resend Section */}
          <View style={styles.resendContainer}>
            {timer > 0 ? (
              <Text style={styles.timerText}>Resend code in {timer}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={isResending} activeOpacity={0.7}>
                {isResending ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={styles.resendText}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <View style={{ flex: 1 }} />

          {/* Verify Button */}
          <TouchableOpacity onPress={handleVerify} activeOpacity={0.8} disabled={isVerifying}>
            <LinearGradient
              colors={['#2563EB', '#3B82F6', '#60A5FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyButton}
            >
              {isVerifying ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Text style={styles.verifyButtonText}>Verify</Text>
                  <Ionicons name="checkmark-circle" size={22} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 50,
  },
  backButton: {
    marginBottom: 24,
    width: 40,
    height: 40,
  },
  backButtonBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  headerSection: {
    marginBottom: 48,
  },
  title: {
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fonts.regular,
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  phoneNumber: {
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    gap: 10,
  },
  otpBoxWrapper: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 55,
  },
  otpGradientBorder: {
    flex: 1,
    padding: 2,
    borderRadius: 12,
  },
  otpInnerBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBox: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 22,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#1E293B',
    padding: 0,
    margin: 0,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  timerText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#64748B',
  },
  resendText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontWeight: '600',
    color: '#2563EB',
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: 56,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.semibold,
    fontWeight: '600',
  },
  otpDisplayBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FBBF24',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  otpDisplayLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#92400E',
    marginBottom: 6,
  },
  otpDisplayValue: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fonts.bold,
    fontWeight: '700',
    color: '#D97706',
    letterSpacing: 4,
  },
});
