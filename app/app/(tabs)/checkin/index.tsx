// app/(tabs)/checkin/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, Alert, TextInput, ActivityIndicator
} from 'react-native';
import { BACKEND_URL, API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/auth.store';

const STATIC_QUESTIONS = [
  { id: '1', question_text: 'How are you feeling today overall?', asked_by: 'ai', created_at: '2026-04-10T08:00:00Z', category: 'general', options: ['Feeling Great', 'Okay', 'Not Good'] },
  { id: '2', question_text: 'Have you taken your prescribed medications today?', asked_by: 'doctor', created_at: '2026-04-10T09:30:00Z', category: 'medication', options: ['Yes, all taken', 'Some missed', 'Not yet'] },
  { id: '3', question_text: 'Are you experiencing any unusual symptoms?', asked_by: 'ai', created_at: '2026-04-10T10:15:00Z', category: 'symptoms', options: ['None', 'Mild', 'Moderate', 'Severe'] },
  { id: '4', question_text: 'How would you rate your sleep quality last night?', asked_by: 'doctor', created_at: '2026-04-09T18:00:00Z', category: 'sleep', options: ['Excellent', 'Good', 'Fair', 'Poor'] },
  { id: '5', question_text: 'Have you experienced any stress or anxiety today?', asked_by: 'ai', created_at: '2026-04-10T07:00:00Z', category: 'mental', options: ['None', 'Mild', 'Moderate', 'High'] },
];

const TopNavBar = ({ onScanPress, onNotificationPress, onProfilePress, notificationCount = 3, userName = 'Rahul', activeScreen = 'checkin' }: any) => {
  const getTitle = () => {
    switch (activeScreen) {
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
            <LinearGradient colors={['#0474FC', '#0360D0']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{userName[0]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const QuestionTag = ({ askedBy, date }: { askedBy: 'ai' | 'doctor'; date: string }) => {
  const isAI = askedBy === 'ai';
  const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <View style={styles.tagContainer}>
      <View style={[styles.tag, isAI ? styles.aiTag : styles.doctorTag]}>
        <Ionicons name={isAI ? 'hardware-chip-outline' : 'medkit-outline'} size={14} color={isAI ? '#8B5CF6' : '#059669'} />
        <Text style={[styles.tagText, isAI ? styles.aiTagText : styles.doctorTagText]}>
          {isAI ? 'AI Suggested' : 'Doctor Asked'}
        </Text>
      </View>
      <View style={styles.dateTag}>
        <Ionicons name="calendar-outline" size={12} color="#6B7280" />
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>
    </View>
  );
};

export default function CheckinScreen() {
  const segments = useSegments();
  const currentRoute = segments[segments.length - 1];
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, { answer: string; notes: string }>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(0);
  const { user } = useAuthStore();

  const startStaggeredReveal = (count: number) => {
    setVisibleCount(0);
    for (let i = 1; i <= count; i++) {
      setTimeout(() => setVisibleCount(i), i * 600);
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.CHECKINS.GENERATE}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id: user?.id || 'demo-patient' }),
        });
        const data = await response.json();
        if (data.questions && data.questions.length > 0) {
          const mapped = data.questions.map((q: any, i: number) => ({
            id: String(i + 1),
            question_text: q.text,
            asked_by: q.pending_question_id ? 'doctor' : 'ai',
            created_at: new Date().toISOString(),
            category: q.expected_data_type || 'general',
            options: ['Feeling Great', 'Okay', 'Not Good', 'Poor'],
          }));
          setQuestions(mapped);
          startStaggeredReveal(mapped.length);
        } else {
          setQuestions(STATIC_QUESTIONS);
          startStaggeredReveal(STATIC_QUESTIONS.length);
        }
      } catch (error) {
        setQuestions(STATIC_QUESTIONS);
        startStaggeredReveal(STATIC_QUESTIONS.length);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [user]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], answer } }));
  };

  const handleNotes = (questionId: string, notes: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: { ...prev[questionId], notes } }));
  };

  const toggleNotes = (questionId: string) => {
    setExpandedNotes(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmit = async () => {
    const unansweredQuestions = questions.filter(q => !answers[q.id]?.answer);
    if (unansweredQuestions.length > 0) {
      Alert.alert('Incomplete Check-in', `Please answer ${unansweredQuestions.length} more question(s) before submitting.`, [{ text: 'OK' }]);
      return;
    }
    Alert.alert(
      'Submit Check-in',
      'Are you sure you want to submit your health check-in?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit',
          onPress: () => {
            Alert.alert('Check-in Submitted', 'Your daily health check-in has been recorded successfully!', [{ text: 'OK' }]);
            setAnswers({});
            setExpandedNotes({});
          }
        }
      ]
    );
  };

  const getProgress = () => {
    const answered = Object.keys(answers).filter(id => answers[id]?.answer).length;
    return { answered, total: questions.length };
  };

  const progress = getProgress();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <TopNavBar
        onScanPress={() => {}}
        onNotificationPress={() => {}}
        onProfilePress={() => {}}
        notificationCount={3}
        userName="Rahul"
        activeScreen={currentRoute}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Health Check-in</Text>
          <Text style={styles.subtitle}>Help us track your progress</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(progress.answered / Math.max(progress.total, 1)) * 100}%` as any }]} />
            </View>
            <Text style={styles.progressText}>{progress.answered} / {progress.total} questions answered</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#0474FC" />
            <Text style={{ marginTop: 10, color: '#6B7280' }}>Loading questions from AI...</Text>
          </View>
        ) : (
          <View>
            {questions.slice(0, visibleCount).map((q, qIndex) => {
              const currentAnswer = answers[q.id]?.answer || '';
              const currentNotes = answers[q.id]?.notes || '';
              const isExpanded = expandedNotes[q.id] || false;
              const isLast = qIndex === visibleCount - 1;

              return (
                <View key={q.id} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[styles.timelineCircle, q.asked_by === 'doctor' ? styles.timelineCircleDoctor : styles.timelineCircleAI]}>
                      <Ionicons name={q.asked_by === 'doctor' ? 'person' : 'hardware-chip-outline'} size={12} color="#FFFFFF" />
                    </View>
                    {!isLast && <View style={styles.timelineLine} />}
                  </View>

                  <View style={styles.questionCard}>
                    <QuestionTag askedBy={q.asked_by as 'ai' | 'doctor'} date={q.created_at} />
                    <Text style={styles.questionText}>{q.question_text}</Text>

                    <View style={styles.optionsContainer}>
                      {(q.options as string[]).map((option) => (
                        <TouchableOpacity
                          key={option}
                          style={[styles.optionButton, currentAnswer === option && styles.optionButtonActive]}
                          onPress={() => handleAnswer(q.id, option)}
                        >
                          <Text style={[styles.optionText, currentAnswer === option && styles.optionTextActive]}>
                            {option}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity style={styles.notesToggle} onPress={() => toggleNotes(q.id)}>
                      <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color="#6B7280" />
                      <Text style={styles.notesToggleText}>
                        {isExpanded ? 'Hide additional details' : 'Add additional details (optional)'}
                      </Text>
                    </TouchableOpacity>

                    {isExpanded && (
                      <TextInput
                        style={styles.answerInput}
                        placeholder="e.g., Started feeling this way after lunch..."
                        placeholderTextColor="#9CA3AF"
                        value={currentNotes}
                        onChangeText={(text) => handleNotes(q.id, text)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    )}
                  </View>
                </View>
              );
            })}

            {visibleCount > 0 && visibleCount === questions.length && (
              <TouchableOpacity
                style={[styles.submitButton, progress.answered !== progress.total && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={progress.answered !== progress.total}
              >
                <Text style={styles.submitButtonText}>
                  Complete Check-in ({progress.answered}/{progress.total})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  scrollContent: { padding: 16, paddingTop: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 16 },
  progressContainer: { marginTop: 4 },
  progressBar: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%' as any, backgroundColor: '#0474FC', borderRadius: 3 },
  progressText: { fontSize: 12, color: '#6B7280', marginTop: 6 },

  // Timeline
  timelineItem: { flexDirection: 'row', marginBottom: 16 },
  timelineLeft: { alignItems: 'center', width: 30, paddingTop: 2 },
  timelineCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  timelineCircleAI: { backgroundColor: '#0474FC' },
  timelineCircleDoctor: { backgroundColor: '#8B5CF6' },
  timelineLine: { flex: 1, width: 2, backgroundColor: '#E5E7EB', marginTop: 4 },

  questionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginLeft: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tagContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  aiTag: { backgroundColor: '#F5F3FF' },
  doctorTag: { backgroundColor: '#ECFDF5' },
  tagText: { fontSize: 11, fontWeight: '600' },
  aiTagText: { color: '#8B5CF6' },
  doctorTagText: { color: '#059669' },
  dateTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 11, color: '#6B7280' },

  questionText: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 14, lineHeight: 22 },
  optionsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  optionButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  optionButtonActive: { borderColor: '#0474FC', backgroundColor: '#EFF6FF' },
  optionText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  optionTextActive: { color: '#0474FC', fontWeight: '700' },
  notesToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  notesToggleText: { fontSize: 12, color: '#6B7280' },
  answerInput: { marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 14, color: '#111827', minHeight: 80 },

  submitButton: { backgroundColor: '#0474FC', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  submitButtonDisabled: { backgroundColor: '#93C5FD' },
  submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Nav
  topNavContainer: { paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 50 : 40, paddingBottom: 12, backgroundColor: '#F9FAFB' },
  topNavBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 5 },
  leftButton: {},
  gradientButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  centerPill: { flex: 1, marginHorizontal: 12 },
  pillContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 },
  blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0474FC', marginRight: 8 },
  pillText: { fontSize: 13, fontWeight: '600', letterSpacing: 1.2, color: '#1F2937' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconButton: {},
  iconContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notificationBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: '#EF4444', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FFFFFF' },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '700' },
  avatarButton: {},
  avatarGradient: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
});