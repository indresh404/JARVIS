// app/(onboarding)/agent-log.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';

// ── Types ──────────────────────────────────────────────────────────────────────
type StepStatus = 'waiting' | 'running' | 'done' | 'error';

interface AgentStep {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  logLines: string[];
  durationMs: number;
}

// ── Pipeline definition ────────────────────────────────────────────────────────
const PIPELINE: AgentStep[] = [
  {
    id: 'summarise',
    title: 'Session Summarisation',
    subtitle: 'Groq LLaMA-3.3 → END_SESSION_PROMPT',
    icon: 'document-text-outline',
    color: '#0474FC',
    durationMs: 2200,
    logLines: [
      '→ Reading conversation_messages from Supabase...',
      '→ Fetching rolling_summary for patient...',
      '→ Calling Groq with END_SESSION_PROMPT...',
      '✓ daily_summary generated',
      '✓ symptoms_today extracted: [headache, fatigue]',
      '✓ urgency: Routine',
      '✓ Inserted into daily_summaries table',
    ],
  },
  {
    id: 'risk_base',
    title: 'Base Risk Scoring',
    subtitle: 'Pure Python — no LLM involved',
    icon: 'calculator-outline',
    color: '#10B981',
    durationMs: 1400,
    logLines: [
      '→ Conditions: [Hypertension] → +15',
      '→ Symptom severity 4-6: headache → +10',
      '→ Missed meds days: 1 (< 3 threshold) → +0',
      '→ Age > 60: false → +0',
      '→ Wearable flags: none → +0',
      '✓ base_score = 25',
    ],
  },
  {
    id: 'rag',
    title: 'RAG — Clinical Guidelines Retrieval',
    subtitle: 'FAISS + all-MiniLM-L6-v2 embeddings',
    icon: 'library-outline',
    color: '#8B5CF6',
    durationMs: 2600,
    logLines: [
      '→ Query: "hypertension headache risk assessment"',
      '→ Embedding query with all-MiniLM-L6-v2...',
      '→ FAISS search over 3 indexed chunks...',
      '✓ Top match: "sample_hypertension.pdf" (score: 0.91)',
      '→ Sending base_score + guideline to Groq for adjustment...',
      '✓ adjustment: +5 (BP-related headache warrants monitoring)',
      '✓ final_score = 30 | risk_level: Low',
      '✓ guideline_reference: sample_hypertension.pdf',
    ],
  },
  {
    id: 'predict',
    title: 'ML Risk Prediction',
    subtitle: 'Linear Regression on 14-day score history',
    icon: 'trending-up-outline',
    color: '#F59E0B',
    durationMs: 1800,
    logLines: [
      '→ Reading last 14 patient_risk_scores...',
      '→ Running LinearRegression (scikit-learn)...',
      '✓ score_slope: +1.2 (mild upward trend)',
      '✓ volatility: 4.3 (stable)',
      '✓ trajectory: Stable',
      '✓ projected_scores[7]: [31,32,33,34,35,36,37]',
      '→ Early warning check: no repeat symptom pattern',
      '✓ early_warning: false',
      '✓ Upserting health_predictions table',
    ],
  },
  {
    id: 'anomaly',
    title: 'Wearable Anomaly Detection',
    subtitle: 'Isolation Forest + Statistical Fallback',
    icon: 'pulse-outline',
    color: '#EF4444',
    durationMs: 1500,
    logLines: [
      '→ metric: heart_rate | current: [88, 91, 87]',
      '→ baseline_14day mean: 75 | std: 6.2',
      '→ stat_anomaly check: values within 1.5σ → false',
      '→ IsolationForest model not found for this patient',
      '✓ detection_source: statistical_fallback',
      '✓ anomaly_detected: false',
    ],
  },
  {
    id: 'safety',
    title: 'Drug Interaction Safety Check',
    subtitle: 'OpenFDA API → Groq fallback if needed',
    icon: 'shield-checkmark-outline',
    color: '#06B6D4',
    durationMs: 2000,
    logLines: [
      '→ Active medicines: [Amlodipine 5mg, Aspirin 81mg]',
      '→ Calling OpenFDA for interaction pairs...',
      '✓ OpenFDA: no interaction found for pair 1',
      '✓ OpenFDA: no interaction found for pair 2',
      '✓ medicine_risk_score: 12 | no conflicts',
      '✓ No alerts generated',
    ],
  },
  {
    id: 'schemes',
    title: 'Government Scheme Matching',
    subtitle: 'Pure Python rules — no LLM',
    icon: 'medal-outline',
    color: '#F97316',
    durationMs: 900,
    logLines: [
      '→ Patient: age 45 | state: Maharashtra | income: low',
      '→ Conditions: [hypertension]',
      '→ Matching against SCHEMES_DATA dict...',
      '✓ Match: Ayushman Bharat PMJAY (coverage: ₹5,00,000)',
      '✓ Match: Pradhan Mantri Jan Arogya Yojana',
      '✓ nearby_hospitals: [KEM Hospital, AIIMS Nagpur]',
      '✓ Upserted patient_schemes table',
    ],
  },
  {
    id: 'profile',
    title: 'Profile Summary Agent',
    subtitle: 'Groq → PROFILE_PROMPT → permanent facts',
    icon: 'person-circle-outline',
    color: '#EC4899',
    durationMs: 1900,
    logLines: [
      '→ Reading all daily_summaries for patient...',
      '→ Sending to Groq with PROFILE_PROMPT...',
      '✓ permanent_conditions: [Hypertension]',
      '✓ recurring_patterns: [Morning headaches after exertion]',
      '✓ permanent_medications: [Amlodipine 5mg, Aspirin 81mg]',
      '✓ users table updated with new profile_summary',
    ],
  },
  {
    id: 'family',
    title: 'Family AI Agent',
    subtitle: 'Cross-member pattern detection',
    icon: 'people-outline',
    color: '#84CC16',
    durationMs: 2100,
    logLines: [
      '→ Loading family_groups for family_id: FAM-2291...',
      '→ Members: 3 (adult ×2, child ×1)',
      '→ Reading symptom_categories (anonymised)...',
      '→ Sending to Groq with FAMILY_PROMPT...',
      '✓ Shared pattern: respiratory — 2 members this week',
      '✓ environmental_risk_flag: true',
      '✓ family_summary written to family_groups table',
    ],
  },
];

// ── Log Line Component ─────────────────────────────────────────────────────────
const LogLine = ({ line, delay }: { line: string; delay: number }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start();
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  const isSuccess = line.startsWith('✓');
  const isArrow = line.startsWith('→');

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 3 }}>
      <Text style={[
        styles.logLine,
        isSuccess && styles.logLineSuccess,
        isArrow && styles.logLineArrow,
      ]}>
        {line}
      </Text>
    </Animated.View>
  );
};

// ── Step Card Component ────────────────────────────────────────────────────────
const StepCard = ({
  step,
  status,
  visibleLogLines,
}: {
  step: AgentStep;
  status: StepStatus;
  visibleLogLines: number;
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideIn = useRef(new Animated.Value(40)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status !== 'waiting') {
      Animated.parallel([
        Animated.timing(slideIn, { toValue: 0, duration: 350, useNativeDriver: true }),
        Animated.timing(fadeIn, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [status]);

  useEffect(() => {
    if (status === 'running') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [status]);

  if (status === 'waiting') return null;

  const borderColor = status === 'done' ? step.color + '40' : step.color;

  return (
    <Animated.View style={[
      styles.stepCard,
      { borderLeftColor: borderColor, opacity: fadeIn, transform: [{ translateY: slideIn }] }
    ]}>
      {/* Header */}
      <View style={styles.stepHeader}>
        <Animated.View style={[
          styles.stepIconBg,
          { backgroundColor: step.color + '15', transform: [{ scale: pulseAnim }] }
        ]}>
          <Ionicons name={step.icon as any} size={20} color={step.color} />
        </Animated.View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: status === 'done' ? '#ECFDF5' : '#FEF3C7' }
        ]}>
          {status === 'running' ? (
            <Text style={[styles.statusText, { color: '#D97706' }]}>Running</Text>
          ) : (
            <Text style={[styles.statusText, { color: '#059669' }]}>✓ Done</Text>
          )}
        </View>
      </View>

      {/* Logs */}
      <View style={styles.logContainer}>
        {step.logLines.slice(0, visibleLogLines).map((line, idx) => (
          <LogLine key={idx} line={line} delay={idx * 180} />
        ))}
        {status === 'running' && visibleLogLines < step.logLines.length && (
          <Text style={styles.cursor}>▌</Text>
        )}
      </View>
    </Animated.View>
  );
};

// ── Main Screen ────────────────────────────────────────────────────────────────
export default function AgentLogScreen() {
  const params = useLocalSearchParams<{ patient_id?: string }>();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(
    PIPELINE.map(() => 'waiting')
  );
  const [visibleLogLines, setVisibleLogLines] = useState<number[]>(
    PIPELINE.map(() => 0)
  );
  const [allDone, setAllDone] = useState(false);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    runPipeline();
  }, []);

  const runPipeline = async () => {
    for (let i = 0; i < PIPELINE.length; i++) {
      // Mark as running
      setStepStatuses(prev => {
        const n = [...prev]; n[i] = 'running'; return n;
      });

      // Animate log lines in one by one
      const step = PIPELINE[i];
      const lineInterval = (step.durationMs * 0.8) / step.logLines.length;
      for (let l = 1; l <= step.logLines.length; l++) {
        await delay(lineInterval);
        setVisibleLogLines(prev => {
          const n = [...prev]; n[i] = l; return n;
        });
      }
      await delay(step.durationMs * 0.2);

      // Mark done
      setStepStatuses(prev => {
        const n = [...prev]; n[i] = 'done'; return n;
      });
      setCurrentStep(i + 1);
      if (i < PIPELINE.length - 1) await delay(300);
    }
    setAllDone(true);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const completedCount = stepStatuses.filter(s => s === 'done').length;
  const progressPct = (completedCount / PIPELINE.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Top bar */}
      <Animated.View style={[styles.topBar, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0474FC" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.topTitle}>Agent Pipeline</Text>
          <Text style={styles.topSub}>
            {allDone ? 'All agents complete' : `Running agent ${completedCount + 1} of ${PIPELINE.length}…`}
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{completedCount}/{PIPELINE.length}</Text>
        </View>
      </Animated.View>

      {/* Progress bar */}
      <View style={styles.progressOuter}>
        <Animated.View style={[styles.progressInner, { width: `${progressPct}%` as any }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro card */}
        <Animated.View style={[styles.introCard, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#0474FC', '#0360D0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.introGradient}
          >
            <Ionicons name="git-network-outline" size={28} color="#FFFFFF" />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.introTitle}>Multi-Agent AI Pipeline</Text>
              <Text style={styles.introSub}>
                9 specialised agents working in sequence after your session
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Step Cards */}
        {PIPELINE.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            status={stepStatuses[i]}
            visibleLogLines={visibleLogLines[i]}
          />
        ))}

        {/* Done state */}
        {allDone && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Pipeline Complete</Text>
            <Text style={styles.doneSub}>
              Your health data has been summarised, scored, checked for anomalies,
              matched to schemes, and your profile has been updated.
            </Text>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => router.replace('/(tabs)/home')}
            >
              <LinearGradient
                colors={['#0474FC', '#0360D0']}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.doneBtnGradient}
              >
                <Ionicons name="home-outline" size={20} color="#FFF" />
                <Text style={styles.doneBtnText}>Back to Dashboard</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 12 : 40,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  topSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
  counterBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  counterText: { fontSize: 13, fontWeight: '700', color: '#0474FC' },
  progressOuter: { height: 3, backgroundColor: '#E5E7EB' },
  progressInner: { height: 3, backgroundColor: '#0474FC' },
  scroll: { padding: 16, paddingTop: 20 },

  introCard: { marginBottom: 20, borderRadius: 16, overflow: 'hidden', elevation: 3 },
  introGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  introTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  introSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 },

  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  stepSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: { fontSize: 11, fontWeight: '600' },

  logContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    minHeight: 40,
  },
  logLine: { fontSize: 11, color: '#94A3B8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', lineHeight: 18 },
  logLineSuccess: { color: '#34D399' },
  logLineArrow: { color: '#60A5FA' },
  cursor: { color: '#60A5FA', fontSize: 14 },

  doneCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  doneEmoji: { fontSize: 40, marginBottom: 12 },
  doneTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  doneSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  doneBtn: { width: '100%', borderRadius: 14, overflow: 'hidden' },
  doneBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 10,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
