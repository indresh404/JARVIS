// app/(tabs)/checkin/index.tsx
import { ScreenIntroGate } from '@/components/ui/ScreenIntroGate';
import { SkeletonCheckInScreen } from '@/components/ui/SkeletonLoader';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert, TextInput } from 'react-native';
import { getPendingCheckins, submitCheckin } from '@/services/supabase.service';
import { useAuthStore } from '@/store/auth.store';

const TopNavBar = ({ 
  onScanPress, 
  onNotificationPress, 
  onProfilePress, 
  notificationCount = 3, 
  userName = 'Rahul',
  activeScreen = 'checkin'
}: any) => {
  const getTitle = () => {
    switch(activeScreen) {
      case 'home': return 'DASHBOARD';
      case 'checkin': return 'CHECK-IN';
      case 'meds': return 'MEDICATIONS';
      case 'profile': return 'PROFILE';
      default: return 'CHECK-IN';
    }
  };

  return (
    <View style={styles.topNavContainer}>
      <View style={styles.topNavBar}>
        <TouchableOpacity activeOpacity={0.8} onPress={onScanPress} style={styles.leftButton}>
          <LinearGradient colors={['#0474FC', '#0360D0']} style={styles.gradientButton}>
            <Ionicons name="scan-outline" size={22} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.centerPill}>
          <View style={styles.pillContent}>
            <View style={styles.blueDot} />
            <Text style={styles.pillText}>{getTitle()}</Text>
          </View>
        </View>

        <View style={styles.rightSection}>
          <TouchableOpacity activeOpacity={0.8} onPress={onNotificationPress} style={styles.iconButton}>
            <View style={styles.iconContainer}>
              <Ionicons name="notifications-outline" size={22} color="#374151" />
              {notificationCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.badgeText}>{notificationCount > 9 ? '9+' : notificationCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} onPress={onProfilePress} style={styles.avatarButton}>
            <LinearGradient
              colors={['#0474FC', '#0360D0']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function CheckinScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId;

  useEffect(() => {
    if (patientId) {
      loadQuestions();
    } else {
      Alert.alert('Error', 'Unable to load patient information. Please log in again.');
      setLoading(false);
    }
  }, [patientId]);
  
  const loadQuestions = async () => {
    if (!patientId) {
      Alert.alert('Error', 'Patient ID not found');
      setLoading(false);
      return;
    }

    try {
      const data = await getPendingCheckins(patientId);
      if (!data || data.length === 0) {
        Alert.alert('No Check-ins', 'No pending check-ins at this time.');
        setQuestions([]);
        setAnswers([]);
      } else {
        setQuestions(data);
        setAnswers(data.map((q: any) => ({ question_id: q.id, answer: '' })));
      }
    } catch (error) {
      console.error("Check-in error:", error);
      Alert.alert('Error', 'Failed to load check-ins. Please try again.');
      setQuestions([]);
      setAnswers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, text: string) => {
    setAnswers(prev => prev.map(a => a.question_id === questionId ? { ...a, answer: text } : a));
  };

  const handleSubmit = async () => {
    if (!patientId) {
      Alert.alert('Error', 'Patient ID not found');
      return;
    }

    try {
      await submitCheckin(patientId, answers);
      Alert.alert("Success", "Check-in completed!");
      setQuestions([]);
      setAnswers([]);
      await loadQuestions();
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert("Error", "Failed to submit check-in. Please try again.");
    }
  };

  const handleIntroComplete = () => {
    setIsDataLoaded(true);
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TopNavBar 
        onScanPress={() => console.log('Scan pressed')}
        onNotificationPress={() => console.log('Notification pressed')}
        onProfilePress={() => console.log('Profile pressed')}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />
      <ScreenIntroGate
        loaderText="Preparing your check-in experience..."
        loaderDuration={2000}
        backgroundColor="#F9FAFB"
        onIntroComplete={handleIntroComplete}
      >
        {!isDataLoaded || loading ? (
          <SkeletonCheckInScreen />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Daily Health Check-in</Text>
              <Text style={styles.subtitle}>Help us track your progress</Text>
            </View>

            {questions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={80} color="#10B981" />
                <Text style={styles.emptyTitle}>You&apos;re all set!</Text>
                <Text style={styles.emptySubtitle}>No pending questions for today.</Text>
              </View>
            ) : (
              <View>
                {questions.map((q) => (
                  <View key={q.id} style={styles.questionCard}>
                    <Text style={styles.questionText}>{q.question_text}</Text>
                    <View style={styles.optionsContainer}>
                      {['Feeling Great', 'Okay', 'Not Good'].map(option => (
                        <TouchableOpacity 
                          key={option}
                          style={[
                            styles.optionButton,
                            answers.find(a => a.question_id === q.id)?.answer === option && styles.optionButtonActive
                          ]}
                          onPress={() => handleAnswer(q.id, option)}
                        >
                          <Text style={[
                            styles.optionText,
                            answers.find(a => a.question_id === q.id)?.answer === option && styles.optionTextActive
                          ]}>{option}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.answerInput}
                      placeholder="Add details (optional)"
                      placeholderTextColor="#9CA3AF"
                      value={answers.find(a => a.question_id === q.id)?.answer || ''}
                      onChangeText={(text) => handleAnswer(q.id, text)}
                      multiline
                    />
                  </View>
                ))}
                
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>Complete Check-in</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        )}
      </ScreenIntroGate>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    marginBottom: 20,
    width: '100%',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  optionButtonActive: {
    borderColor: '#0474FC',
    backgroundColor: '#E8F1FE',
  },
  optionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
  },
  optionTextActive: {
    color: '#0474FC',
    fontWeight: '600',
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    minHeight: 46,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
  },
  submitButton: {
    backgroundColor: '#0474FC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
    width: '100%',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Top Navigation Bar Styles
  topNavContainer: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  leftButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  gradientButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPill: {
    flex: 1,
    marginHorizontal: 12,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0474FC',
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#1F2937',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  avatarButton: {
    shadowColor: '#0474FC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
