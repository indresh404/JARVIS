import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { COLORS, STYLES } from '../../constants/Colors';

export default function UserDetailsScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleContinue = () => {
    router.push('/(onboarding)/family-setup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Progress Bar top */}
          <View style={styles.topBar}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarFill} />
            </View>
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </View>

          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.subtitle}>This helps us personalise your health monitoring</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formContainer}>
            
            {/* Full Name */}
            <View style={[
              styles.inputContainer,
              focusedInput === 'name' && styles.inputContainerFocused,
              focusedInput === 'name' && STYLES.shadow
            ]}>
              <TextInput
                style={styles.textInput}
                placeholder="Full Name"
                placeholderTextColor={COLORS.text.muted}
                value={name}
                onChangeText={setName}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Age */}
            <View style={[
              styles.inputContainer,
              focusedInput === 'age' && styles.inputContainerFocused,
              focusedInput === 'age' && STYLES.shadow
            ]}>
              <TextInput
                style={styles.textInput}
                placeholder="Age"
                placeholderTextColor={COLORS.text.muted}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                onFocus={() => setFocusedInput('age')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Gender */}
            <View style={styles.genderContainer}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderPill,
                    gender === g && styles.genderPillSelected
                  ]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.genderPillText,
                    gender === g && styles.genderPillTextSelected
                  ]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* City */}
            <View style={[
              styles.inputContainer,
              focusedInput === 'city' && styles.inputContainerFocused,
              focusedInput === 'city' && STYLES.shadow
            ]}>
              <TextInput
                style={styles.textInput}
                placeholder="City"
                placeholderTextColor={COLORS.text.muted}
                value={city}
                onChangeText={setCity}
                onFocus={() => setFocusedInput('city')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 40 }} />

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TouchableOpacity 
              style={[styles.primaryButton, STYLES.shadowPrimary]} 
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
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
    width: '50%',
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
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text.primary,
    height: '100%',
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  genderPill: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  genderPillText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text.secondary,
  },
  genderPillTextSelected: {
    color: COLORS.white,
    fontFamily: 'Inter_600SemiBold',
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
