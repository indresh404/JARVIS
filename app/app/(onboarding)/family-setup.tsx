// app/(onboarding)/family-setup.tsx
import { TYPOGRAPHY } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
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
import { GestureHandlerRootView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const CODE_LENGTH = 6;

export default function FamilySetupScreen() {
  const router = useRouter();
  const [codeDigits, setCodeDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const scaleCreate = useSharedValue(1);
  const scaleJoin = useSharedValue(1);

  const handleBack = () => router.back();

  const handleCreate = () => router.push('/(tabs)/home');

  const handleJoin = () => {
    const code = codeDigits.join('');
    if (code.length === CODE_LENGTH) {
      router.push('/(tabs)/home');
    }
  };

  const handleQRScan = async () => {
    const { status } = await requestPermission();
    if (status === 'granted') {
      setShowQRScanner(true);
    } else {
      Alert.alert('Permission Required', 'Please grant camera permission to scan QR codes');
    }
  };

  const handleBarCodeScanned = (result: any) => {
    // Extract the code from QR (assuming the QR contains the family code)
    const scannedCode = result.data;
    // Extract only the last 6 digits if the code is longer
    const code = scannedCode.slice(-6);
    const digits = code.split('');
    
    // Fill the code inputs
    const newDigits = [...codeDigits];
    for (let i = 0; i < Math.min(digits.length, CODE_LENGTH); i++) {
      if (digits[i] && /^\d$/.test(digits[i])) {
        newDigits[i] = digits[i];
      }
    }
    setCodeDigits(newDigits);
    setShowQRScanner(false);
    
    // Auto-join if code is complete
    if (newDigits.every(d => d !== '')) {
      setTimeout(() => {
        router.push('/(tabs)/home');
      }, 500);
    }
  };

  // Code input logic
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

  const handleCardPressIn = (card: 'create' | 'join') => {
    const sv = card === 'create' ? scaleCreate : scaleJoin;
    sv.value = withSpring(0.98, { damping: 15 });
  };

  const handleCardPressOut = (card: 'create' | 'join') => {
    const sv = card === 'create' ? scaleCreate : scaleJoin;
    sv.value = withSpring(1, { damping: 15 });
  };

  const createAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleCreate.value }],
  }));

  const joinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleJoin.value }],
  }));

  const isCodeComplete = codeDigits.every((d) => d !== '');

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={['#2563eb', '#1e40af', '#1e3a8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

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
              <Text style={styles.headerTitle}>Vitality</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Welcome */}
            <Animated.View
              entering={FadeInDown.delay(100).springify()}
              style={styles.welcomeSection}
            >
              <Text style={styles.mainTitle}>Welcome Home</Text>
              <Text style={styles.mainSubtitle}>
                Synchronize your health journey with those who matter most.
              </Text>
            </Animated.View>

            {/* Create Family Card */}
            <TouchableWithoutFeedback
              onPressIn={() => handleCardPressIn('create')}
              onPressOut={() => handleCardPressOut('create')}
            >
              <Animated.View
                entering={FadeInDown.delay(200).springify()}
                style={[styles.card, createAnimatedStyle]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardTextSection}>
                    <Text style={styles.cardTitle}>Create your Wonder Family</Text>
                    <Text style={styles.cardDescription}>
                      Start a new private hub for your family's health data and goal tracking.
                    </Text>
                  </View>
                  <View style={styles.cardIconBox}>
                    <Ionicons name="people-outline" size={28} color="#116acf" />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.cardButton}
                  onPress={handleCreate}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cardButtonText}>Create</Text>
                  <Ionicons name="chevron-forward" size={20} color="#ffffff" />
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>

            {/* Join Family Card */}
            <TouchableWithoutFeedback
              onPressIn={() => handleCardPressIn('join')}
              onPressOut={() => handleCardPressOut('join')}
            >
              <Animated.View
                entering={FadeInDown.delay(300).springify()}
                style={[styles.card, joinAnimatedStyle]}
              >
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
                <Animated.View
                  entering={FadeInUp.delay(350).springify()}
                  style={styles.codeInputContainer}
                >
                  <View style={styles.codeInputRow}>
                    {codeDigits.map((digit, index) => (
                      <React.Fragment key={index}>
                        {index === 3 && (
                          <View style={styles.separatorDot} />
                        )}
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
                    {/* QR Scan Button */}
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
                        !isCodeComplete && styles.joinButtonDisabled,
                      ]}
                      onPress={handleJoin}
                      activeOpacity={0.8}
                      disabled={!isCodeComplete}
                    >
                      <Text
                        style={[
                          styles.joinButtonText,
                          !isCodeComplete && styles.joinButtonTextDisabled,
                        ]}
                      >
                        Join
                      </Text>
                      <Ionicons
                        name="arrow-forward"
                        size={16}
                        color={isCodeComplete ? '#116acf' : '#a0a3b8'}
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* QR Scanner Modal */}
      <Modal
        visible={showQRScanner}
        animationType="slide"
        presentationStyle="fullScreen"
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
              <View style={styles.scanLine} />
            </View>
          </CameraView>
          
          <Text style={styles.scanInstruction}>
            Position the QR code inside the frame
          </Text>
        </SafeAreaView>
      </Modal>
    </GestureHandlerRootView>
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
    marginBottom: 28,
    marginTop: 4,
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

  // Welcome
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 36,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.medium,
    color: 'rgba(238,239,255,0.8)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Cards
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTextSection: { flex: 1, marginRight: 12 },
  cardTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: TYPOGRAPHY.fonts.regular,
    color: '#434655',
    lineHeight: 20,
  },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 12,
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
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  cardButtonText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
  },

  // Code Input
  codeInputContainer: { rowGap: 14 },
  codeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  codeInput: {
    width: 42,
    height: 50,
    borderRadius: 10,
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
    gap: 10,
    alignItems: 'center',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#e7e7f3',
  },
  joinButtonDisabled: {
    backgroundColor: '#f3f3f8',
  },
  joinButtonText: {
    fontSize: 16,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#116acf',
  },
  joinButtonTextDisabled: {
    color: '#a0a3b8',
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
  modalTitle: {
    fontSize: 18,
    fontFamily: TYPOGRAPHY.fonts.bold,
    color: '#ffffff',
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
  scanLine: {
    position: 'absolute',
    width: 220,
    height: 2,
    backgroundColor: '#00ff00',
    borderRadius: 1,
    opacity: 0.8,
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
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