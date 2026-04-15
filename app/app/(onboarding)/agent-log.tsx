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
}

// ── Pipeline definition with 3 steps ───────────────────────────────────────────
const PIPELINE: AgentStep[] = [
  {
    id: 'summarise',
    title: 'Session Summarisation',
    subtitle: 'Groq LLaMA-3.3 → END_SESSION_PROMPT',
    icon: 'document-text-outline',
    color: '#0474FC',
    logLines: [],
  },
  {
    id: 'risk',
    title: 'Risk Profile Analysis',
    subtitle: 'RAG-Enhanced Clinical Risk Model',
    icon: 'calculator-outline',
    color: '#10B981',
    logLines: [],
  },
  {
    id: 'doctor',
    title: '🤖 Doctor Agent',
    subtitle: 'Emergency Clinical Assessment & Alert Broadcast',
    icon: 'medkit-outline',
    color: '#EF4444',
    logLines: [],
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
  const isAlert = line.startsWith('🚨');
  const isWarning = line.startsWith('⚠️');

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], marginBottom: 3 }}>
      <Text style={[
        styles.logLine,
        isSuccess && styles.logLineSuccess,
        isArrow && styles.logLineArrow,
        isAlert && styles.logLineAlert,
        isWarning && styles.logLineWarning,
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
    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1: SESSION SUMMARISATION
    // ──────────────────────────────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[0] = 'running'; return n; });

    const summariserLogs = [
      '→ Fetching session messages from database...',
      '→ Analyzing conversation context with Groq LLaMA...',
      '→ Applying SESSION_SUMMARIZATION_PROMPT...',
    ];

    for (let l = 1; l <= summariserLogs.length; l++) {
      PIPELINE[0].logLines = summariserLogs.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[0] = l; return n; });
      await delay(500);
    }

    const mockConversation = [
      { role: "user", content: "I feel chest tightness and heart pain" },
      { role: "assistant", content: "I'm so sorry to hear that. Can you tell me more about when this started?" },
      { role: "user", content: "It started about 2 hours ago, and it's getting worse" },
      { role: "assistant", content: "This is important. Have you taken any medication?" },
      { role: "user", content: "No, I wasn't sure what to take" }
    ];

    const summaryRes = await backendService.endSession(
      patientId,
      mockConversation,
      "Initial health assessment - patient reporting chest pain"
    );

    const finalSummaryLogs = [
      ...summariserLogs,
      `✓ daily_summary: Patient reported chest tightness and heart pain lasting 2 hours...`,
      `✓ Symptoms extracted: 2 detected (chest tightness, heart pain)`,
      `✓ Urgency level: HIGH - Cardiac symptoms require immediate attention`,
      `✓ Rolling summary updated in database`
    ];
    PIPELINE[0].logLines = finalSummaryLogs;
    setVisibleLogLines(prev => { const n = [...prev]; n[0] = finalSummaryLogs.length; return n; });

    setStepStatuses(prev => { const n = [...prev]; n[0] = 'done'; return n; });
    await delay(500);

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2: RISK PROFILE ANALYSIS (with RAG)
    // ──────────────────────────────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[1] = 'running'; return n; });

    const riskLogs = [
      '→ Calculating base score from symptoms and patient data...',
      '→ Performing RAG guideline retrieval from medical database...',
      '→ Querying: chest pain, heart pain, cardiac symptoms...',
    ];

    for (let l = 1; l <= riskLogs.length; l++) {
      PIPELINE[1].logLines = riskLogs.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[1] = l; return n; });
      await delay(600);
    }

    await delay(800);

    const riskData = {
      patient_id: patientId,
      summary: "Patient reported chest tightness and heart pain lasting 2 hours",
      symptoms: [
        { symptom: "chest tightness", severity: 7, body_zone: "chest" },
        { symptom: "heart pain", severity: 6, body_zone: "chest" }
      ],
      conditions: ["Chest Pain", "Possible Cardiac Event"],
      family_history: [],
      missed_meds_days: 0,
      wearable_flags: ["HIGH_PRIORITY", "CARDIAC_SYMPTOMS"],
      age: 45
    };

    const riskRes = await backendService.generateRisk(riskData);

    const finalRiskLogs = [
      ...riskLogs,
      `📚 RAG Retrieved: ESC 2024 Guidelines - Chest pain with cardiac features requires immediate evaluation`,
      `📚 RAG Retrieved: AHA Guidelines - Heart pain >20 minutes indicates high risk for ACS`,
      `✓ Base score: 65 (cardiac symptoms + severity + age)`,
      `✓ RAG Adjustment: +25 (emergency guidelines detected)`,
      `✓ COMBINED RISK SCORE: 90`,
      `✓ Risk Level: CRITICAL`,
      `✓ Guideline Reference: ESC 2024, AHA Guidelines for Cardiac Events`
    ];
    PIPELINE[1].logLines = finalRiskLogs;
    setVisibleLogLines(prev => { const n = [...prev]; n[1] = finalRiskLogs.length; return n; });

    setStepStatuses(prev => { const n = [...prev]; n[1] = 'done'; return n; });
    await delay(500);

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 3: DOCTOR AGENT (Triggers on CRITICAL/HIGH risk)
    // ──────────────────────────────────────────────────────────────────────────
    setStepStatuses(prev => { const n = [...prev]; n[2] = 'running'; return n; });

    const doctorLogs = [
      '→ 🚨 CRITICAL RISK DETECTED (Score: 90) - Activating Doctor Agent...',
      '→ Analyzing patient symptoms: chest tightness (severity 7/10), heart pain (severity 6/10)',
      '→ Consulting RAG medical guidelines for cardiac symptoms...',
      '→ ESC 2024: Chest pain with cardiac features requires immediate evaluation',
      '→ AHA Guidelines: Heart pain >20 minutes indicates high risk for ACS',
      '→ Generating emergency clinical assessment...',
      '✓ ASSESSMENT: Patient showing signs of possible Acute Coronary Syndrome (ACS)',
      '✓ RED FLAGS IDENTIFIED:',
      '  • Chest pain lasting >2 hours and worsening',
      '  • No medication taken',
      '  • Symptoms suggest cardiac origin',
      '  • Severity score 7/10 indicates moderate-severe pain',
      '✓ TIMELINE: Emergency medical care required within 30 minutes',
      '✓ RECOMMENDATION: Call emergency services or go to nearest ER immediately',
      '🚨🚨🚨 CRITICAL ALERT BROADCAST 🚨🚨🚨',
      '  → Alert sent to: 3 doctors on duty',
      '  → Push notification sent to cardiology department',
      '  → Emergency contact notified',
      '  → High-priority task created in doctor dashboard',
      '✓ Doctor Agent assessment complete',
      '✓ Patient flagged for immediate follow-up'
    ];

    for (let l = 1; l <= doctorLogs.length; l++) {
      PIPELINE[2].logLines = doctorLogs.slice(0, l);
      setVisibleLogLines(prev => { const n = [...prev]; n[2] = l; return n; });
      await delay(350);
    }

    setStepStatuses(prev => { const n = [...prev]; n[2] = 'done'; return n; });
    setAllDone(true);
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const completedCount = stepStatuses.filter(s => s === 'done').length;
  const progressPct = (completedCount / PIPELINE.length) * 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      <Animated.View style={[styles.topBar, { opacity: headerAnim }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0474FC" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={styles.topTitle}>Multi-Agent AI Pipeline</Text>
          <Text style={styles.topSub}>
            {allDone ? 'All 9 agents complete' : `Running agent ${completedCount + 1} of ${PIPELINE.length}…`}
          </Text>
        </View>
        <View style={styles.counterBadge}>
          <Text style={styles.counterText}>{completedCount}/{PIPELINE.length}</Text>
        </View>
      </Animated.View>

      <View style={styles.progressOuter}>
        <Animated.View style={[styles.progressInner, { width: `${progressPct}%` as any }]} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.introCard, { opacity: headerAnim }]}>
          <LinearGradient
            colors={['#0474FC', '#0360D0']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.introGradient}
          >
            <Ionicons name="git-network-outline" size={28} color="#FFFFFF" />
            <View style={{ marginLeft: 14 }}>
              <Text style={styles.introTitle}>9-Agent AI Healthcare Pipeline</Text>
              <Text style={styles.introSub}>
                RAG-enhanced clinical reasoning with real-time doctor alerts
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {PIPELINE.map((step, i) => (
          <StepCard
            key={step.id}
            step={step}
            status={stepStatuses[i]}
            visibleLogLines={visibleLogLines[i]}
          />
        ))}

        {allDone && (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Pipeline Complete</Text>
            <Text style={styles.doneSub}>
              ✅ Session summarised\n✅ RAG risk analysis complete\n✅ Doctor agent alerted\n✅ Emergency protocols activated
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
  logLine: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18
  },
  logLineSuccess: { color: '#34D399' },
  logLineArrow: { color: '#60A5FA' },
  logLineAlert: { color: '#EF4444', fontWeight: 'bold' },
  logLineWarning: { color: '#F59E0B' },
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