import { COLORS, TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(30);

  // Get phone number from navigation params
  const phoneNumber = params.phone as string || '+91 XXXXX XXXXX';
  const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91 ${phoneNumber}`;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input on mount
  useEffect(() => {
    setTimeout(() => {
      inputs.current[0]?.focus();
    }, 100);
  }, []);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Auto-advance to next box on input
    if (text !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are filled
    if (text !== '' && index === 5 && newCode.every(digit => digit !== '')) {
      setTimeout(() => {
        handleVerify();
      }, 100);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Handle backspace to go to previous box
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleBack = () => {
    // Always try to go back, if fails then navigate to login
    if (navigation.canGoBack()) {
      router.back();
    } else {
      // Navigate directly to login screen
      router.replace('/(auth)/login');
    }
  };

  const handleVerify = async () => {
    Keyboard.dismiss();
    const otpCode = code.join('');

    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    // Simulate OTP verification
    // In production, verify with your backend/Supabase

    // After OTP verification, check if user has profile in Supabase
    // const { data: profile } = await supabase
    //   .from('profiles')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .single();

    // Simulate checking profile existence
    const hasProfile = false; // Replace with actual Supabase check

    if (hasProfile) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(onboarding)/chat');
    }
  };

  const handleResendOTP = () => {
    setTimer(30);
    Alert.alert('OTP Resent', `A new OTP has been sent to ${formattedPhone}`);
    // Clear existing OTP
    setCode(['', '', '', '', '', '']);
    inputs.current[0]?.focus();
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

          {/* OTP Inputs - 6 Individual White Square Boxes with Blue Gradient Border */}
          <View style={styles.otpContainer}>
            {code.map((digit, index) => (
              <View key={index} style={styles.otpBoxWrapper}>
                <LinearGradient
                  colors={
                    focusedIndex === index || digit !== ''
                      ? ['#2563EB', '#3B82F6', '#60A5FA']  // Blue gradient when focused/filled
                      : ['#E2E8F0', '#E2E8F0', '#E2E8F0']   // Gray gradient when empty
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
              <TouchableOpacity onPress={handleResendOTP} activeOpacity={0.7}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Verify Button with Gradient */}
          <TouchableOpacity onPress={handleVerify} activeOpacity={0.8}>
            <LinearGradient
              colors={['#2563EB', '#3B82F6', '#60A5FA']}  // Blue gradient matching login page
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.verifyButton}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
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
    backgroundColor: '#F8FAFC',  // Light background matching login page
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
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
    fontFamily: TYPOGRAPHY?.fonts?.bold || 'System',
    fontSize: 28,
    fontWeight: '700',
    color: '#1E3A8A',  // Dark blue matching login page
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY?.fonts?.regular || 'System',
    fontSize: 14,
    color: '#64748B',  // Muted text color
    marginBottom: 4,
  },
  phoneNumber: {
    fontFamily: TYPOGRAPHY?.fonts?.semibold || 'System',
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',  // Dark text color
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
    fontFamily: TYPOGRAPHY?.fonts?.bold || 'System',
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
    fontFamily: TYPOGRAPHY?.fonts?.regular || 'System',
    color: '#64748B',
  },
  resendText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY?.fonts?.semibold || 'System',
    fontWeight: '600',
    color: '#2563EB',  // Blue color matching login page
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
    fontFamily: TYPOGRAPHY?.fonts?.semibold || 'System',
    fontWeight: '600',
  },
});