import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, STYLES } from '../../constants/Colors';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const inputs = useRef<Array<TextInput | null>>([]);
  const [timer, setTimer] = useState(28);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text !== '' && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && code[index] === '') {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    Keyboard.dismiss();
    router.push('/(onboarding)/user-details');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            {/* Back Button */}
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.text.secondary} />
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={32} color={COLORS.primary} />
            </View>

            {/* Titles */}
            <Text style={styles.title}>Enter OTP</Text>
            <View style={styles.subtitleRow}>
              <Text style={styles.subtitle}>Sent to +91 XXXXX XXXXX </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.changeText}>Change number</Text>
              </TouchableOpacity>
            </View>

            {/* OTP Inputs */}
            <View style={styles.otpContainer}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                    focusedIndex === index && STYLES.shadow,
                    digit !== '' && styles.otpBoxFilled
                  ]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(-1)}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Resend Timer */}
            <TouchableOpacity 
              style={styles.resendContainer} 
              disabled={timer > 0}
              onPress={() => setTimer(28)}
            >
              {timer > 0 ? (
                <Text style={styles.timerText}>Resend in 0:{timer.toString().padStart(2, '0')}</Text>
              ) : (
                <Text style={styles.resendText}>Resend OTP</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Verify Button */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <TouchableOpacity 
              style={[styles.primaryButton, STYLES.shadowPrimary]} 
              onPress={handleVerify}
            >
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text.secondary,
  },
  changeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: COLORS.primary,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 52,
    height: 60,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text.primary,
  },
  otpBoxFocused: {
    borderColor: COLORS.primary,
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
  },
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text.muted,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: COLORS.primary,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});
