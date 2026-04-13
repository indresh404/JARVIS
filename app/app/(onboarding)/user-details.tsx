import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { getCurrentPatient, normalizePhone } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

import { COLORS, STYLES } from '../../constants/Colors';
import { supabase } from '@/services/supabaseClient';
export default function UserDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const { patientId, phoneNumber: storedPhone } = useAuthStore();

  // Form states
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // UI states
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // Refs for input focus management
  const ageInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const locationInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const initialPhone = normalizePhone(params.phone || storedPhone || '');
    if (initialPhone) {
      setPhoneNumber(initialPhone);
    }

    const hydrateExistingProfile = async () => {
      try {
        const patient = patientId ? await getCurrentPatient() : null;
        if (!patient) return;

        setName(patient.name || '');
        setAge(patient.age ? String(patient.age) : '');
        setPhoneNumber(patient.phone || initialPhone);
        setGender(patient.gender || null);
      } catch (error) {
        console.error('Failed to hydrate patient profile', error);
      }
    };

    void hydrateExistingProfile();
  }, [params.phone, patientId, storedPhone]);

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please enable location permissions to automatically detect your location.',
          [{ text: 'OK' }]
        );
        setIsLoadingLocation(false);
        return;
      }

      // Get current position
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const locationParts = [];

        if (address.city) locationParts.push(address.city);
        if (address.district) locationParts.push(address.district);
        if (address.region) locationParts.push(address.region);

        const locationString = locationParts.join(', ');

        if (locationString) {
          setLocation(locationString);
          // Clear location error if any
          if (errors.location) {
            setErrors({ ...errors, location: '' });
          }
        } else {
          Alert.alert('Info', 'Could not determine your city/region. Please enter manually.');
        }
      } else {
        Alert.alert('Info', 'Could not determine your location. Please enter manually.');
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your location. Please check your GPS and try again, or enter manually.'
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Validate individual field
  const validateField = (fieldName: string, value: string | null) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value?.trim()) {
          newErrors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          newErrors.name = 'Name must be at least 2 characters';
        } else if (value.trim().length > 50) {
          newErrors.name = 'Name must be less than 50 characters';
        } else {
          delete newErrors.name;
        }
        break;

      case 'age':
        if (!value?.trim()) {
          newErrors.age = 'Age is required';
        } else {
          const ageNum = parseInt(value);
          if (isNaN(ageNum)) {
            newErrors.age = 'Please enter a valid number';
          } else if (ageNum < 1 || ageNum > 120) {
            newErrors.age = 'Please enter a valid age (1-120)';
          } else {
            delete newErrors.age;
          }
        }
        break;

      case 'phoneNumber':
        if (!value?.trim()) {
          newErrors.phoneNumber = 'Phone number is required';
        } else {
          const phoneRegex = /^[0-9]{10}$/;
          if (!phoneRegex.test(value.trim())) {
            newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
          } else {
            delete newErrors.phoneNumber;
          }
        }
        break;

      case 'gender':
        if (!value) {
          newErrors.gender = 'Please select your gender';
        } else {
          delete newErrors.gender;
        }
        break;

      case 'location':
        if (!value?.trim()) {
          newErrors.location = 'Location is required';
        } else if (value.trim().length < 2) {
          newErrors.location = 'Please enter a valid location';
        } else {
          delete newErrors.location;
        }
        break;
    }

    setErrors(newErrors);
  };

  // Validation function
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    }

    // Age validation
    if (!age.trim()) {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(age);
      if (isNaN(ageNum)) {
        newErrors.age = 'Please enter a valid number';
      } else if (ageNum < 1 || ageNum > 120) {
        newErrors.age = 'Please enter a valid age (1-120)';
      }
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneNumber.trim())) {
        newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
      }
    }

    // Gender validation
    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }

    // Location validation
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    } else if (location.trim().length < 2) {
      newErrors.location = 'Please enter a valid location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    // Mark all fields as touched
    setTouched({
      name: true,
      age: true,
      phoneNumber: true,
      gender: true,
      location: true
    });

    if (validateForm()) {
      saveProfile();
    }
  };


  const saveProfile = async () => {
    const authStore = useAuthStore.getState();
    const { patientId: storePatientId, phoneNumber: storePhone } = authStore;
    
    // Use phone number as the source of truth for new users
    const userPhone = normalizePhone(phoneNumber);
    if (!userPhone) {
      Alert.alert('Error', 'Invalid phone number');
      return;
    }

    setIsSaving(true);
    try {
      console.log('=== Saving User Profile ===');
      console.log('Phone:', userPhone, 'Name:', name, 'Age:', age, 'Gender:', gender);

      // Check if user already exists by phone
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('phone', userPhone)
        .maybeSingle();

      console.log('Existing user:', existingUser?.id);

      let userId = existingUser?.id;

      // If user doesn't exist, insert new record
      if (!userId) {
        console.log('Creating new user record');
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            name: name.trim(),
            age: parseInt(age),
            phone: userPhone,
            gender: gender,
          })
          .select('id')
          .maybeSingle();

        if (insertError) {
          console.error('Insert error:', insertError);
          Alert.alert('Error Saving Profile', 'Failed to create user: ' + insertError.message);
          setIsSaving(false);
          return;
        }

        userId = newUser?.id;
        console.log('New user created with ID:', userId);
      } else {
        // Update existing user
        console.log('Updating existing user:', userId);
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: name.trim(),
            age: parseInt(age),
            gender: gender,
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Update error:', updateError);
          Alert.alert('Error Saving Profile', updateError.message);
          setIsSaving(false);
          return;
        }
      }

      // Update auth store with real user ID
      authStore.setSessionState({
        userId: userId,
        patientId: userId,
        phoneNumber: userPhone,
        isLoggedIn: true,
        hasProfile: true,
        hasFamilyGroup: false,
      });

      console.log('Profile saved successfully, user ID:', userId);
      setIsSaving(false);
      router.push('/(onboarding)/family-setup');
    } catch (error: any) {
      console.error('Save profile error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred while saving your profile');
      setIsSaving(false);
    }
  };

  const isFormValid = () => {
    return name.trim() &&
      age.trim() &&
      normalizePhone(phoneNumber).length === 10 &&
      gender &&
      location.trim() &&
      !errors.name &&
      !errors.age &&
      !errors.phoneNumber &&
      !errors.gender &&
      !errors.location;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Bar */}
          <View style={styles.topBar}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarFill} />
            </View>
            <Text style={styles.stepText}>Step 1 of 2</Text>
          </View>

          {/* Header */}
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <Text style={styles.title}>Tell us about you</Text>
            <Text style={styles.subtitle}>
              This helps us personalise your health monitoring experience
            </Text>
          </Animated.View>

          {/* Form Fields */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formContainer}>

            {/* Full Name Field */}
            <View>
              <Text style={styles.label}>Full Name</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'name' && styles.inputContainerFocused,
                touched.name && errors.name && styles.inputContainerError
              ]}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.text.muted}
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    setTouched({ ...touched, name: true });
                    validateField('name', text);
                  }}
                  onFocus={() => setFocusedInput('name')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => ageInputRef.current?.focus()}
                  autoCapitalize="words"
                />
              </View>
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            {/* Age Field */}
            <View>
              <Text style={styles.label}>Age</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'age' && styles.inputContainerFocused,
                touched.age && errors.age && styles.inputContainerError
              ]}>
                <TextInput
                  ref={ageInputRef}
                  style={styles.textInput}
                  placeholder="Enter your age"
                  placeholderTextColor={COLORS.text.muted}
                  value={age}
                  onChangeText={(text) => {
                    setAge(text);
                    setTouched({ ...touched, age: true });
                    validateField('age', text);
                  }}
                  keyboardType="number-pad"
                  onFocus={() => setFocusedInput('age')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  maxLength={3}
                />
              </View>
              {touched.age && errors.age && (
                <Text style={styles.errorText}>{errors.age}</Text>
              )}
            </View>

            {/* Phone Number Field */}
            <View>
              <Text style={styles.label}>Phone Number</Text>
              <View style={[
                styles.inputContainer,
                focusedInput === 'phoneNumber' && styles.inputContainerFocused,
                touched.phoneNumber && errors.phoneNumber && styles.inputContainerError
              ]}>
                <TextInput
                  ref={phoneInputRef}
                  style={styles.textInput}
                  placeholder="Enter 10-digit mobile number"
                  placeholderTextColor={COLORS.text.muted}
                  value={phoneNumber}
                  onChangeText={(text) => {
                    setPhoneNumber(normalizePhone(text));
                    setTouched({ ...touched, phoneNumber: true });
                    validateField('phoneNumber', normalizePhone(text));
                  }}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedInput('phoneNumber')}
                  onBlur={() => {
                    setFocusedInput(null);
                  }}
                  returnKeyType="next"
                  onSubmitEditing={() => locationInputRef.current?.focus()}
                  maxLength={10}
                />
              </View>
              {touched.phoneNumber && errors.phoneNumber && (
                <Text style={styles.errorText}>{errors.phoneNumber}</Text>
              )}
            </View>

            {/* Gender Field */}
            <View>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderContainer}>
                {['Male', 'Female', 'Other'].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderPill,
                      gender === g && styles.genderPillSelected,
                      touched.gender && errors.gender && !gender && styles.genderPillError
                    ]}
                    onPress={() => {
                      setGender(g);
                      const newTouched = { ...touched, gender: true };
                      setTouched(newTouched);
                      validateField('gender', g);
                    }}
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
              {touched.gender && errors.gender && (
                <Text style={styles.errorText}>{errors.gender}</Text>
              )}
            </View>

            {/* Location Field */}
            <View>
              <Text style={styles.label}>Location</Text>
              <View style={[
                styles.locationWrapper,
                focusedInput === 'location' && styles.inputContainerFocused,
                touched.location && errors.location && styles.inputContainerError
              ]}>
                <View style={styles.locationInputContainer}>
                  <TextInput
                    ref={locationInputRef}
                    style={[styles.textInput, styles.locationInput]}
                    placeholder="Location"
                    placeholderTextColor={COLORS.text.muted}
                    value={location}
                    onChangeText={(text) => {
                      setLocation(text);
                      setTouched({ ...touched, location: true });
                      validateField('location', text);
                    }}
                    onFocus={() => setFocusedInput('location')}
                    onBlur={() => {
                      setFocusedInput(null);
                    }}
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={getCurrentLocation}
                    disabled={isLoadingLocation}
                    activeOpacity={0.7}
                  >
                    {isLoadingLocation ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Text style={styles.locationButtonText}>📍</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {touched.location && errors.location && (
                <Text style={styles.errorText}>{errors.location}</Text>
              )}
              <Text style={styles.locationHint}>
                Tap the 📍 button to automatically detect your current location
              </Text>
            </View>

          </Animated.View>

          {/* Spacer */}
          <View style={{ flex: 1, minHeight: 20 }} />

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                STYLES?.shadowPrimary,
                !isFormValid() && styles.primaryButtonDisabled
              ]}
              onPress={handleContinue}
              activeOpacity={0.8}
              disabled={!isFormValid() || isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color={COLORS.white || '#FFFFFF'} />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
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
    backgroundColor: COLORS.surface || '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
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
    backgroundColor: COLORS.border || '#E5E7EB',
    borderRadius: 2,
    marginRight: 16,
  },
  progressBarFill: {
    width: '50%',
    height: '100%',
    backgroundColor: COLORS.primary || '#007AFF',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.muted || '#6B7280',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: COLORS.text?.primary || '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text?.secondary || '#6B7280',
    marginBottom: 32,
    lineHeight: 22,
  },
  formContainer: {
    gap: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: COLORS.text?.primary || '#1F2937',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  inputContainerFocused: {
    borderColor: COLORS.primary || '#007AFF',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
  },
  textInput: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.primary || '#1F2937',
    height: '100%',
    padding: 0,
  },
  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  genderPill: {
    flex: 1,
    height: 56,
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderPillSelected: {
    backgroundColor: COLORS.primary || '#007AFF',
    borderColor: COLORS.primary || '#007AFF',
  },
  genderPillError: {
    borderColor: '#FF3B30',
  },
  genderPillText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: COLORS.text?.secondary || '#6B7280',
  },
  genderPillTextSelected: {
    color: COLORS.white || '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  locationWrapper: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.border || '#E5E7EB',
    borderRadius: 14,
    minHeight: 56,
    justifyContent: 'center',
  },
  locationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationInput: {
    flex: 1,
    paddingHorizontal: 16,
  },
  locationButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButtonText: {
    fontSize: 22,
  },
  locationHint: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: COLORS.text?.muted || '#9CA3AF',
    marginTop: 6,
    marginLeft: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary || '#007AFF',
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#FF3B30',
    marginTop: 6,
    marginLeft: 12,
  },
});
