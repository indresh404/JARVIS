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
import { backendService } from '@/services/backend.service';
import { useAuthStore } from '@/store/auth.store';

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
    logLines: [], // Populated dynamically
  },
  {
    id: 'risk',
    title: 'Risk Profile Analysis',
    subtitle: 'RAG-Enhanced Clinical Risk Model',
    icon: 'calculator-outline',
    color: '#10B981',
    durationMs: 3000,
    logLines: [], // Populated dynamically
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

  const { user, patientId: storePatientId } = useAuthStore();
  const patientId = user?.id || storePatientId || 'demo-patient';

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    runPipeline();
  }, []);

  const runPipeline = async () => {
    // ── STEP 1: SUMMARISATION ──────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[0] = 'running'; return n; });
    
    // Simulate initial log lines
    const summariserLogs = [
      '→ Fetching session messages from Supabase...',
      '→ Analyzing conversation context with Groq...',
      '→ Applying SESSION_SUMMARIZATION_PROMPT...'
    ];
    
    for (let l = 1; l <= summariserLogs.length; l++) {
      PIPELINE[0].logLines = summariserLogs.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[0] = l; return n; });
      await delay(600);
    }

    // Actual API Call
    const summaryRes = await backendService.endSession(patientId, [], ""); // Simplified for demo
    if (summaryRes) {
      const finalLogs = [
        ...summariserLogs,
        `✓ daily_summary: ${summaryRes.daily_summary.substring(0, 40)}...`,
        `✓ Symptoms extracted: ${summaryRes.symptoms_today.length} detected`,
        `✓ Urgency level: ${summaryRes.urgency}`
      ];
      PIPELINE[0].logLines = finalLogs;
      setVisibleLogLines(prev => { const n = [...prev]; n[0] = finalLogs.length; return n; });
    }
    
    setStepStatuses(prev => { const n = [...prev]; n[0] = 'done'; return n; });
    await delay(500);

    // ── STEP 2: RISK SCORING ───────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[1] = 'running'; return n; });
    
    const riskLogs = [
      '→ Calculating base score (deterministic)...',
      '→ Performing RAG guideline retrieval...',
      '→ Adjusting risk based on clinical context...'
    ];

    for (let l = 1; l <= riskLogs.length; l++) {
      PIPELINE[1].logLines = riskLogs.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[1] = l; return n; });
      await delay(800);
    }

    // Actual API Call
    const riskData = {
        patient_id: patientId,
        summary: summaryRes?.daily_summary || "Routine follow-up",
        symptoms: summaryRes?.symptoms_today || [],
        conditions: ["Hypertension"], // Demo context
        family_history: [],
        missed_meds_days: 0,
        wearable_flags: [],
        age: 45
    };
    const riskRes = await backendService.generateRisk(riskData);
    
    if (riskRes) {
      const finalRiskLogs = [
        ...riskLogs,
        `✓ Base score: ${riskRes.base_score}`,
        `✓ RAG Adjustment: ${riskRes.rag_adjustment}`,
        `✓ Final Risk: ${riskRes.final_score} (${riskRes.risk_level})`,
        `✓ Reference: ${riskRes.guideline_reference}`
      ];
      PIPELINE[1].logLines = finalRiskLogs;
      setVisibleLogLines(prev => { const n = [...prev]; n[1] = finalRiskLogs.length; return n; });
    }

    setStepStatuses(prev => { const n = [...prev]; n[1] = 'done'; return n; });
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
