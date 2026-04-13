// app/(onboarding)/family-setup.tsx
import { useAuthStore } from '@/store/auth.store';
import { TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import QRCode from 'react-native-qrcode-svg';

import {
    createFamilyForPatient,
    getPatientById,
    getPatientByPhone,
    joinFamilyForPatient,
    type PatientRecord
} from '@/services/auth.service';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CODE_LENGTH = 6;

export default function FamilySetupScreen() {
  const router = useRouter();
  const { patientId, phoneNumber, setSessionState } = useAuthStore();
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showFamilyNameModal, setShowFamilyNameModal] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [showGeneratedCodeModal, setShowGeneratedCodeModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleBack = () => router.back();

  const requirePatient = async (): Promise<PatientRecord> => {
    console.log('=== Requiring Patient ===');
    console.log('PatientId:', patientId, 'PhoneNumber:', phoneNumber);

    if (patientId) {
      const storePatient = await getPatientById(patientId);
      if (storePatient) {
        console.log('Found patient by ID:', storePatient.id);
        return storePatient;
      }
    }

    if (phoneNumber) {
      const phonePatient = await getPatientByPhone(phoneNumber);
      if (phonePatient) {
        console.log('Found patient by phone:', phonePatient.id);
        return phonePatient;
      }
    }

    // If we reach here, create a temporary patient object from available data
    if (phoneNumber) {
      console.log('Creating temporary patient from phone:', phoneNumber);
      return {
        id: patientId || `temp_${phoneNumber}`,
        name: 'User',
        phone: phoneNumber,
        age: null,
        gender: null,
        family_id: null,
        created_at: new Date().toISOString(),
      };
    }

    throw new Error('Please complete your profile before creating or joining a family.');
  };

  // Handle create family button click
  const handleCreateClick = () => {
    setShowFamilyNameModal(true);
  };

  // Create family with name and generate code
  const handleCreateFamily = async () => {
    if (!familyName.trim()) {
      Alert.alert('Error', 'Please enter a family name');
      return;
    }

    setIsCreating(true);
    try {
      const patient = await requirePatient();
      const { joinCode } = await createFamilyForPatient(familyName.trim(), patient);

      setGeneratedCode(joinCode);
      setShowFamilyNameModal(false);
      setShowGeneratedCodeModal(true);
      setSessionState({
        patientId: patient.id,
        hasProfile: true,
        hasFamilyGroup: true,
      });
      
    } catch (error: any) {
      console.error('Error creating family:', error);
      Alert.alert('Error', error.message || 'Failed to create family. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinFlow = async () => {
    const code = codeDigits.join('');
    if (code.length !== CODE_LENGTH) {
      Alert.alert('Error', 'Please enter a valid 6-digit code');
      return;
    }

    setIsJoining(true);
    try {
      const patient = await requirePatient();
      const family = await joinFamilyForPatient(code, patient);

      setSessionState({
        patientId: patient.id,
        hasProfile: true,
        hasFamilyGroup: true,
      });

      Alert.alert('Success!', `You've successfully joined "${family.family_name}" family!`, [
        {
          text: 'Continue',
          onPress: () => router.push('/(tabs)/home'),
        },
      ]);

      setCodeDigits(Array(CODE_LENGTH).fill(''));
    } catch (error: any) {
      console.error('Error joining family:', error);
      Alert.alert('Error', error.message || 'Failed to join family. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };


  const handleQRScan = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission Required', 'Please grant camera permission to scan QR codes');
        return;
      }
    }
    setShowQRScanner(true);
  };

  const handleBarCodeScanned = (result: any) => {
    try {
      const scannedCode = String(result.data || '').trim().toUpperCase();
      console.log('Scanned QR code:', scannedCode);
      
      let code = '';
      
      // Try different patterns to extract the 6-digit code
      // Pattern 1: SWASTHYA_FAMILY:XXXXXX
      let match = scannedCode.match(/SWASTHYA_FAMILY[:\s]+(\d{6})/i);
      if (match) {
        code = match[1];
      }
      
      // Pattern 2: Just 6 digits (exact match)
      if (!code) {
        match = scannedCode.match(/^(\d{6})$/);
        if (match) {
          code = match[1];
        }
      }
      
      // Pattern 3: 6 digits anywhere in the string (last resort)
      if (!code) {
        match = scannedCode.match(/(\d{6})/);
        if (match) {
          code = match[1];
        }
      }
      
      // Validate the code format
      if (!code || code.length !== CODE_LENGTH || !/^\d{6}$/.test(code)) {
        Alert.alert(
          'Invalid QR Code',
          'This QR code does not contain a valid 6-digit family join code.\n\nMake sure you\'re scanning a valid Swasthya family QR code.',
          [{ text: 'Try Again', onPress: () => setShowQRScanner(true) }]
        );
        return;
      }
      
      console.log('Extracted family code:', code);
      const digits = code.split('');
      
      const newDigits = [...codeDigits];
      for (let i = 0; i < Math.min(digits.length, CODE_LENGTH); i++) {
        if (digits[i] && /^\d$/.test(digits[i])) {
          newDigits[i] = digits[i];
        }
      }
      setCodeDigits(newDigits);
      setShowQRScanner(false);
      
      // Auto-join after scanning if code is complete
      if (newDigits.every(d => d !== '')) {
        setTimeout(() => handleJoinFlow(), 500);
      }
    } catch (error) {
      console.error('QR scan error:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setShowQRScanner(true);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const char = value.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...codeDigits];
    newDigits[index] = char;
    setCodeDigits(newDigits);

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (codeDigits[index]) {
        const newDigits = [...codeDigits];
        newDigits[index] = '';
        setCodeDigits(newDigits);
      } else if (index > 0) {
        const newDigits = [...codeDigits];
        newDigits[index - 1] = '';
        setCodeDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleFocus = (index: number) => {
    const firstEmpty = codeDigits.findIndex((d) => d === '');
    if (firstEmpty !== -1 && firstEmpty < index) {
      inputRefs.current[firstEmpty]?.focus();
    }
  };

  const copyToClipboard = async (code: string) => {
    try {
      // expo-clipboard is optional in this project, so load it only when available.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(code);
      Alert.alert('Copied!', 'Family code copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Family Code', `Your family code is: ${code}`);
    }
  };

  const isCodeComplete = codeDigits.every((d) => d !== '');

  return (
    <LinearGradient
      colors={['#116acf', '#116acf', '#4da0fe']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            bounces={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                activeOpacity={0.6}
              >
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Swasthya AI</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Step Indicator */}
            <View style={styles.stepContainer}>
              <Text style={styles.stepText}>Step 2 of 2</Text>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeSection}>
              <Text style={styles.mainTitle}>Welcome Home</Text>
              <Text style={[styles.mainSubtitle, styles.cursiveText]}>
                Synchronize your health journey with those who matter most.
              </Text>
            </View>

            {/* Create Family Card */}
            <TouchableOpacity
              activeOpacity={0.95}
              onPress={handleCreateClick}
              disabled={isCreating}
            >
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardTextSection}>
                    <Text style={styles.cardTitle}>Create your Wonder Family</Text>
                    <Text style={styles.cardDescription}>
                      Start a new private hub for your family&apos;s health data and goal tracking.
                    </Text>
                  </View>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="people-outline" size={28} color="#116acf" />
                  </View>
                </View>
                <View style={styles.cardButton}>
                  {isCreating ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.cardButtonText}>Create</Text>
                      <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                    </>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* Join Family Card */}
            <View style={[styles.card, styles.joinCard]}>
              <View style={styles.cardContent}>
                <View style={styles.cardTextSection}>
                  <Text style={styles.cardTitle}>Join a Family</Text>
                  <Text style={styles.cardDescription}>
                    Already have a family group? Enter the unique invite code shared with you.
                  </Text>
                </View>
                <View style={[styles.cardIconBox, { backgroundColor: '#f5f5f7' }]}>
                  <Ionicons name="key-outline" size={28} color="#737686" />
                </View>
              </View>

              {/* Code Input */}
              <View style={styles.codeInputContainer}>
                <View style={styles.codeInputRow}>
                  {codeDigits.map((digit, index) => (
                    <React.Fragment key={index}>
                      {index === 3 && <View style={styles.separatorDot} />}
                      <TextInput
                        ref={(el) => { inputRefs.current[index] = el; }}
                        style={[
                          styles.codeInput,
                          digit ? styles.codeInputFilled : null,
                        ]}
                        maxLength={1}
                        keyboardType="number-pad"
                        value={digit}
                        onChangeText={(value) => handleCodeChange(index, value)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(index, nativeEvent.key)}
                        onFocus={() => handleFocus(index)}
                        placeholderTextColor="#c3c6d7"
                        placeholder="·"
                        selectTextOnFocus
                        caretHidden
                      />
                    </React.Fragment>
                  ))}
                </View>

                {/* Action row */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.qrButton}
                    onPress={handleQRScan}
                    activeOpacity={0.75}
                  >
                    <Ionicons name="qr-code-outline" size={20} color="#116acf" />
                    <Text style={styles.qrButtonText}>Scan QR</Text>
                  </TouchableOpacity>

                  {/* Join Button */}
                  <TouchableOpacity
                    style={[
                      styles.joinButton,
                      isCodeComplete ? styles.joinButtonActive : styles.joinButtonDisabled,
                    ]}
                    onPress={handleJoinFlow}
                    activeOpacity={0.8}
                    disabled={!isCodeComplete || isJoining}
                  >
                    <LinearGradient
                      colors={isCodeComplete ? ['#10b981', '#059669'] : ['#e7e7f3', '#e7e7f3']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.joinButtonGradient}
                    >
                      {isJoining ? (
                        <ActivityIndicator color={isCodeComplete ? "#ffffff" : "#a0a3b8"} size="small" />
                      ) : (
                        <>
                          <Text
                            style={[
                              styles.joinButtonText,
                              isCodeComplete ? styles.joinButtonTextActive : styles.joinButtonTextDisabled,
                            ]}
                          >
                            Join
                          </Text>
                          <Ionicons
                            name="arrow-forward"
                            size={18}
                            color={isCodeComplete ? '#ffffff' : '#a0a3b8'}
                          />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Family Name Modal */}
      <Modal
        visible={showFamilyNameModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFamilyNameModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFamilyNameModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            
            <Ionicons name="heart-circle-outline" size={50} color="#116acf" />
            
            <Text style={styles.modalTitle}>Create Your Family</Text>
            <Text style={styles.modalSubtitle}>
              Give your family a name to get started
            </Text>

            <TextInput
              style={styles.familyNameInput}
              placeholder="e.g., Smith Family"
              placeholderTextColor="#9CA3AF"
              value={familyName}
              onChangeText={setFamilyName}
              autoFocus
              maxLength={50}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowFamilyNameModal(false);
                  setFamilyName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.createButton,
                  !familyName.trim() && styles.createButtonDisabled,
                ]}
                onPress={handleCreateFamily}
                disabled={!familyName.trim() || isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.createButtonText}>Create Family</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Generated Code Modal */}
      <Modal
        visible={showGeneratedCodeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGeneratedCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.codeModalContent]}>
            <View style={styles.modalHandle} />
            
            <Ionicons name="checkmark-circle" size={70} color="#10b981" />
            
            <Text style={styles.codeModalTitle}>Family Created! 🎉</Text>
            <Text style={styles.codeModalSubtitle}>
              Your family &quot;{familyName}&quot; has been created
            </Text>

            <View style={styles.codeDisplayContainer}>
              <Text style={styles.codeLabel}>Your 6-Digit Family Code</Text>
              <Text style={styles.codeDisplay}>{generatedCode}</Text>
              <View style={styles.qrCodeContainer}>
                <QRCode value={`SWASTHYA_FAMILY:${generatedCode}`} size={150} />
              </View>
              <TouchableOpacity 
                onPress={() => copyToClipboard(generatedCode)}
                style={styles.copyButton}
              >
                <Ionicons name="copy-outline" size={20} color="#116acf" />
                <Text style={styles.copyButtonText}>Copy Code</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.codeNote}>
              Share this 6-digit code with family members to join your family group
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => {
                setShowGeneratedCodeModal(false);
                router.push('/(tabs)/home');
              }}
            >
              <Text style={styles.continueButtonText}>Continue to Dashboard</Text>
              <Ionicons name="arrow-forward" size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowQRScanner(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowQRScanner(false)} 
              style={styles.modalCloseButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </View>
          
          <CameraView
            style={styles.camera}
            facing="back"
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
          >
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrame}>
                <View style={styles.scanCornerTL} />
                <View style={styles.scanCornerTR} />
                <View style={styles.scanCornerBL} />
                <View style={styles.scanCornerBR} />
              </View>
            </View>
          </CameraView>
          
          <Text style={styles.scanInstruction}>
            Position the QR code inside the frame
          </Text>
        </SafeAreaView>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  headerSpacer: { width: 40 },

  // Step Indicator
  stepContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  stepText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  progressBar: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    width: '100%',
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },

  // Welcome
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 34,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  cursiveText: {
    fontFamily: TYPOGRAPHY.fonts.accent,
    fontSize: 20,
    color: 'rgba(255,255,255,0.9)',
  },

  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 6,
  },
  joinCard: {
    marginBottom: 0,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTextSection: { flex: 1, marginRight: 12 },
  cardTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#434655',
    lineHeight: 18,
  },
  cardIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#dbe1ff',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardButton: {
    backgroundColor: '#116acf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 6,
  },
  cardButtonText: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
  },

  // Code Input
  codeInputContainer: { rowGap: 14 },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  codeInput: {
    width: 44,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#f3f3fe',
    fontSize: 20,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
    textAlign: 'center',
    borderWidth: 1.5,
    borderColor: '#e4e4f0',
  },
  codeInputFilled: {
    borderColor: '#116acf',
    backgroundColor: '#eef4ff',
  },
  separatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c3c6d7',
    marginHorizontal: 2,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#eef4ff',
    borderWidth: 1.5,
    borderColor: '#d0e2ff',
  },
  qrButtonText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
  },
  joinButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonActive: {
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonText: {
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.bold,
  },
  joinButtonTextActive: {
    color: '#ffffff',
  },
  joinButtonTextDisabled: {
    color: '#a0a3b8',
  },

  // Family Name Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  familyNameInput: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: '#6B7280',
  },
  createButton: {
    backgroundColor: '#116acf',
  },
  createButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
  },

  // Generated Code Modal
  codeModalContent: {
    alignItems: 'center',
  },
  codeModalTitle: {
    fontSize: 24,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  codeModalSubtitle: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  codeDisplayContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  codeLabel: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: '#6B7280',
    marginBottom: 8,
  },
  codeDisplay: {
    fontSize: 42,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
    letterSpacing: 8,
    marginBottom: 12,
  },
  qrCodeContainer: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
  },
  copyButtonText: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: '#116acf',
  },
  codeNote: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: '#116acf',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  continueButtonText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
  },

  // QR Scanner Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
  },
  scanOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  scanCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
  },
  scanCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
  },
  scanCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#ffffff',
  },
  scanCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ffffff',
  },
  scanInstruction: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 12,
  },
});
