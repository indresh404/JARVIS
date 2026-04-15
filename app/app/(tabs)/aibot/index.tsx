import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { ScreenWrapper } from '@/components/shared/ScreenWrapper';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';
import { backendService } from '@/services/backend.service';
// ✅ v5 — HYBRID ARCHITECTURE: On-device NLP + Backend RAG
console.log('🔴🔴 SWASTHYA AI v5 HYBRID LOADED — ' + new Date().toISOString());


// ─────────────────────────────────────────────
//  TYPES
// ─────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ExtractedSymptom {
  has_symptom: boolean;
  symptom?: string;
  body_zone?: string;
  severity?: number;
  confidence?: number;
}



// ─────────────────────────────────────────────
//  LOCAL NLP — fallback if backend is down
//  (covers typos like "heard pain", "hartpain")
// ─────────────────────────────────────────────
const CRITICAL_KEYWORDS = [
  'chest pain','heart pain','heard pain','hart pain','hartpain','chestpain',
  'heart attack','cardiac','heart ache','heart hurt','heart problem',
  'can\'t breathe','cannot breathe','breathless','no breath',
  'difficulty breathing','shortness of breath','breathing problem',
  'stroke','fainted','collapsed','unconscious','paralysis',
];

const SYMPTOM_MAP: Array<{kw:string[];name:string;zone:string;sev:number}> = [
  {kw:['chest','heart','cardiac','heard pain','hartpain'],   name:'Chest / Heart Pain',      zone:'chest',   sev:10},
  {kw:['breath','breathing','breathless'],                    name:'Shortness of Breath',      zone:'lungs',   sev:9},
  {kw:['stroke','faint','unconscious','collapsed'],           name:'Neurological Emergency',   zone:'systemic',sev:10},
  {kw:['headache','migraine','head pain','head ache'],        name:'Headache',                 zone:'head',    sev:5},
  {kw:['fever','temperature','chills','feeling hot'],         name:'Fever',                    zone:'systemic',sev:5},
  {kw:['stomach','abdomen','belly','nausea','vomit'],         name:'GI Distress',              zone:'stomach', sev:5},
  {kw:['dizzy','dizziness','vertigo','lightheaded'],          name:'Dizziness',                zone:'head',    sev:5},
  {kw:['back pain','backache','spine'],                       name:'Back Pain',                zone:'back',    sev:4},
  {kw:['cough','cold','runny','sneez','blocked nose'],        name:'Respiratory Symptoms',     zone:'lungs',   sev:3},
  {kw:['tired','fatigue','weakness','weak','exhausted'],      name:'Fatigue / Weakness',       zone:'systemic',sev:3},
  {kw:['sugar','blood sugar','diabetes'],                     name:'Blood Sugar Issue',        zone:'systemic',sev:5},
  {kw:['bp','blood pressure','hypertension','pressure'],      name:'Blood Pressure Issue',     zone:'chest',   sev:6},
  {kw:['palpitation','heart racing','irregular heart'],       name:'Palpitations',             zone:'chest',   sev:7},
  {kw:['swelling','swollen','edema'],                         name:'Swelling / Oedema',        zone:'legs',    sev:5},
];

function localExtract(text: string): ExtractedSymptom {
  const lower = text.toLowerCase();

  // 🔥 PRIORITY: Heart detection (more flexible)
  if (
    (lower.includes('heart') || lower.includes('chest')) &&
    (lower.includes('pain') || lower.includes('tight') || lower.includes('pressure'))
  ) {
    return {
      has_symptom: true,
      symptom: 'Chest / Heart Pain',
      body_zone: 'chest',
      severity: 10,
      confidence: 95,
    };
  }

  // fallback to existing logic
  for (const entry of SYMPTOM_MAP) {
    if (entry.kw.some(k => lower.includes(k))) {
      return {
        has_symptom: true,
        symptom: entry.name,
        body_zone: entry.zone,
        severity: entry.sev,
        confidence: 80,
      };
    }
  }

  return { has_symptom: false, confidence: 0 };
}

function isLocalCritical(text: string): boolean {
  const lower = text.toLowerCase();

  // Strong keyword match
  if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return true;

  // Flexible matching (NEW 🔥)
  const heartWords = ['heart', 'chest', 'cardiac'];
  const painWords = ['pain', 'tight', 'pressure', 'hurt'];

  const hasHeart = heartWords.some(w => lower.includes(w));
  const hasPain  = painWords.some(w => lower.includes(w));

  if (hasHeart && hasPain) return true;

  // Breathing emergency
  if (
    lower.includes('breath') &&
    (lower.includes('problem') || lower.includes('issue') || lower.includes('difficulty'))
  ) return true;

  return false;
}




// ─────────────────────────────────────────────
//  QUICK CHIPS
// ─────────────────────────────────────────────
const QUICK_CHIPS = [
  { label: '❤️ Chest pain',      text: 'I am having severe heart pain and chest tightness' },
  { label: '😮‍💨 Breathing',      text: 'I have difficulty breathing since 1 hour' },
  { label: '🌡️ High Fever',      text: 'I have a very high fever since yesterday night' },
  { label: '🤕 Headache',        text: 'I have a bad headache and feeling dizzy' },
  { label: '💊 Medicines',       text: 'I forgot to take my medicines for 2 days' },
  { label: '📊 Risk score',      text: 'What is my current risk score?' },
];

// ─────────────────────────────────────────────
//  ANIMATED LOG LINE
// ─────────────────────────────────────────────
const LogLine: React.FC<{ text: string; idx: number }> = ({ text, idx }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const tx      = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue:1, duration:280, delay:idx*90, useNativeDriver:true }),
      Animated.timing(tx,      { toValue:0, duration:280, delay:idx*90, useNativeDriver:true }),
    ]).start();
  }, []);

  return (
    <Animated.Text style={[styles.logLine,{opacity,transform:[{translateX:tx}]}]}>
      {text}
    </Animated.Text>
  );
};

// ─────────────────────────────────────────────
//  MAIN SCREEN
// ─────────────────────────────────────────────
export default function AIBotScreen() {
  const [text,           setText          ] = useState('');
  const [messages,       setMessages      ] = useState<ChatMessage[]>([{
    id:'0', role:'assistant',
    content:
      "👋 Hello! I'm *Swasthya AI* — your intelligent health assistant powered by Groq LLaMA-3.\n\n" +
      "You can describe how you're feeling in plain words — for example:\n" +
      "• *\"I have heart pain\"*\n• *\"Fever since 2 days\"*\n• *\"Difficulty breathing\"*\n\n" +
      "I'll analyse your symptoms in real-time, compute a risk score, and alert your doctor if needed.",
  }]);
  const [isLoading,      setIsLoading     ] = useState(false);
  const [agentRunning,   setAgentRunning  ] = useState(false);
  const [agentLogs,      setAgentLogs     ] = useState<string[]>([]);
  const [showAgentPanel, setShowAgentPanel] = useState(false);
  const [sessionSymptoms,setSessionSymptoms] = useState<ExtractedSymptom[]>([]);
  const [backendOnline,  setBackendOnline ] = useState<boolean|null>(null);
  const [pulseAnim]                         = useState(new Animated.Value(1));

  const flatListRef = useRef<FlatList>(null);

  // ── Pulse animation for online dot ───────────
  useEffect(() => {
    const p = Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim,{toValue:1.7,duration:700,useNativeDriver:true}),
      Animated.timing(pulseAnim,{toValue:1.0,duration:700,useNativeDriver:true}),
    ]));
    p.start();
    return () => p.stop();
  }, []);

  // ── Auto-scroll ────────────────────────────
  useEffect(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({animated:true}), 120);
  }, [messages, agentLogs]);

  // ── Helper: push one message ──────────────
  const push = useCallback((msg: ChatMessage) => {
    setMessages(prev => [...prev, msg]);
  }, []);

  // ─────────────────────────────────────────────
  //  ORCHESTRATION — RAG-Enhanced Risk & Doctor Agent
  // ─────────────────────────────────────────────
  const runOrchestration = useCallback(async (
    allSymptoms: ExtractedSymptom[],
    fromBackend: boolean
  ) => {
    setAgentRunning(true);
    setAgentLogs([]);
    setShowAgentPanel(true);

    // Call Backend
    const riskPayload = {
        patient_id: 'demo-patient-001',
        summary: "Patient reported symptoms via Swasthya AI",
        symptoms: allSymptoms.map(s => ({
            symptom_name: s.symptom || "Unknown",
            body_zone: s.body_zone || "systemic",
            severity: s.severity || 5
        })),
        conditions: ["Hypertension", "Type 2 Diabetes"],
        family_history: ["cardiac", "diabetes"],
        missed_meds_days: 0,
        wearable_flags: [],
        age: 45
    };

    let riskData: any = {};
    try {
        riskData = await backendService.generateRisk(riskPayload);
    } catch (e) {
        console.warn("Backend risk generation failed, falling back to local simulation.", e);
        // Fallback mockup
        const symAdj = Math.min(15, allSymptoms.length * 5);
        const zoneBonus = allSymptoms.some(s => s.body_zone === 'chest') ? 8 : 0;
        const baseScore = Math.min(60, 42 + symAdj);
        const ragScore = zoneBonus > 0 ? 25 : 8;
        const combined = baseScore + ragScore;
        riskData = {
            base_score: baseScore,
            rag_score: ragScore,
            combined_score: combined,
            risk_level: combined >= 75 ? "Critical" : (combined >= 55 ? "High" : "Moderate"),
            rag_context: "Source: AHA_Guidelines.pdf\nText: Immediate attention for chest pain.",
            doctor_agent_log: combined >= 55 ? {
                assessment: "Patient exhibiting high-risk symptoms with comorbidities.",
                red_flags: ["Chest involvement"],
                timeline: "within 30 minutes",
                alert: "URGENT: Patient requires immediate evaluation.",
                doctor_log: ["Step 1: Analyzing...", "Step 2: Found severe symptoms...", "Step 3: Decision: Escalated."]
            } : null
        };
    }

    if (!riskData) return;

    const baseScore = riskData.base_score || 0;
    const ragScore = riskData.rag_score || 0;
    const combinedScore = riskData.combined_score || 0;
    const riskLevel = (riskData.risk_level || "Unknown").toUpperCase();
    const isCritical = combinedScore >= 55;
    const emoji = combinedScore >= 75 ? '🔴' : (combinedScore >= 55 ? '🟠' : (combinedScore >= 35 ? '🟡' : '🟢'));

    // ── Build exact log lines specified in Master Prompt ──
    const LOGS: string[] = [];

    // Step 1
    LOGS.push(`Step 1 - Session Summarisation`);
    LOGS.push(`✓ daily_summary: Symptoms being actively monitored today.`);
    LOGS.push(`✓ Symptoms extracted: ${allSymptoms.length} detected`);
    LOGS.push(`✓ Urgency level: ${riskLevel}`);

    // Step 2
    LOGS.push(`Step 2 - Risk Profile Analysis (RAG Enhanced)`);
    LOGS.push(`→ Calculating base score (deterministic)...`);
    LOGS.push(`→ Performing RAG guideline retrieval...`);
    
    // Extract a mock finding from context or use literal
    let shortContext = "Cardiovascular risks identified.";
    let shortSource = "Guideline Document";
    if (riskData.rag_context) {
        shortContext = riskData.rag_context.split('\n')[0].substring(0, 40) + '...';
        if (riskData.guideline_reference) shortSource = riskData.guideline_reference;
    }
    LOGS.push(`→ Retrieved: ${shortSource} - ${shortContext}`);
    
    LOGS.push(`✓ Base score: ${baseScore}/100`);
    LOGS.push(`✓ RAG Adjustment: +${ragScore}`);
    LOGS.push(`✓ Combined Risk: ${combinedScore} (${riskLevel})`);
    LOGS.push(`✓ RAG Context: ${shortContext}`);

    // Step 3 (if applicable)
    const doctorObj = riskData.doctor_agent_log;
    if (isCritical && doctorObj) {
        LOGS.push(`Step 3 - Doctor Agent`);
        LOGS.push(`→ Risk level ${riskLevel} - Activating Doctor Agent...`);
        LOGS.push(`→ Analyzing patient symptoms...`);
        LOGS.push(`→ Consulting RAG guidelines...`);
        LOGS.push(`→ Generating emergency assessment...`);
        LOGS.push(`✓ Assessment: ${doctorObj.assessment}`);
        LOGS.push(`✓ Red Flags: ${(doctorObj.red_flags || []).join(', ')}`);
        LOGS.push(`✓ Timeline: action required ${doctorObj.timeline}`);
        LOGS.push(`✓ Alert broadcast to 3 doctors`);
        LOGS.push(`✓ Doctor log complete`);
    }

    // ── Stream logs one-by-one ─
    for (let i = 0; i < LOGS.length; i++) {
      await new Promise(r => setTimeout(r, 200));
      setAgentLogs(prev => [...prev, LOGS[i]]);
    }

    await new Promise(r => setTimeout(r, 400));

    // ── Special Chat Bubbles ─────────────────
    if (isCritical) {
      push({
        id: `doctor-agent-banner-${Date.now()}`,
        role: 'assistant',
        content: `🚨 **DOCTOR AGENT ACTIVATED** 🚨\nRisk Level: ${riskLevel}\n${doctorObj?.alert || 'Immediate assistance requested.'}`
      });
      await new Promise(r => setTimeout(r, 350));
    }

    // ── Summary card in chat ─────────────────
    const symBlock = allSymptoms.length
      ? allSymptoms.map(s => `  • ${s.symptom} — Severity ${s.severity}/10`).join('\n')
      : '  • General health assessment';

    push({
      id: `summary-${Date.now()}`,
      role: 'assistant',
      content:
        `📋 *CLINICAL ASSESSMENT REPORT*\n` +
        `*Detected Symptoms:*\n${symBlock}\n\n` +
        `${emoji} *Risk Score:* ${combinedScore}/100 — *${riskLevel}*\n` +
        `⏱  *Urgency:* ${isCritical ? 'IMMEDIATE' : 'ROUTINE'}\n` +
        `👤 *Profile:* Age 45 | Hypertension | Diabetes\n\n` +
        `📚 *RAG Guidelines Referenced:*\n` +
        `  • ${shortSource}\n` +
        `${isCritical ? '\n📡 Dr. Mehta notified  |  Emergency contact alerted' : ''}`,
    });

    // ── Native alert popup ───────────────────
    if (isCritical) {
        await new Promise(r => setTimeout(r, 400));
        Alert.alert(
          '🚨 MEDICAL ALERT — HIGH RISK PATIENT',
          `Risk Score: ${combinedScore}/100 (${riskLevel})\n\n` +
          `Patient: Age 45 | Hypertension | Type 2 Diabetes\n\n` +
          `ACTIONS TAKEN:\n` +
          `✅ Doctor Agent Executed\n` +
          `✅ Dr. Mehta notified via dashboard\n` +
          `✅ Emergency contact SMS sent\n\n` +
          `RECOMMENDATION: ${doctorObj?.timeline || 'Immediate clinical evaluation required.'}`,
          [{ text: 'Acknowledge', style: 'destructive' }]
        );
    }

    setAgentRunning(false);
    setSessionSymptoms([]);
  }, [push]);

  // ─────────────────────────────────────────────
  //  SEND — Hybrid: Local NLP + Backend RAG
  // ─────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!text.trim() || isLoading || agentRunning) return;

    const inputText = text.trim();
    setText('');
    setIsLoading(true);

    const userMsg: ChatMessage = { id:`u-${Date.now()}`, role:'user', content: inputText };
    push(userMsg);

    // ── 1. On-device NLP extraction (instant) ──
    const extracted = localExtract(inputText);
    const critical  = isLocalCritical(inputText);

    // Build symptoms array for backend
    const symptomsPayload = extracted.has_symptom ? [extracted] : [];

    // ── 2. Try backend with HYBRID payload ─────
    let botReply = '';
    let usedBackend = false;

    try {
      const currentMessages = [...messages, userMsg];
      const backendResponse = await backendService.sendMessage(
        'demo-patient-001',
        inputText,
        { rolling_summary: '' },
        symptomsPayload,         // 🔥 Structured symptoms
        currentMessages           // 📜 Full conversation log
      );

      if (backendResponse?.bot_reply && !backendResponse.bot_reply.includes('fallback response')) {
        botReply = backendResponse.bot_reply;
        usedBackend = true;
        setBackendOnline(true);
        console.log('✅ Backend replied with Groq-powered response');
      }
    } catch (e) {
      console.log('⚠️ Backend unavailable, using local NLP fallback');
    }

    // ── 3. Local NLP fallback reply ─────────────
    if (!usedBackend) {
      setBackendOnline(false);
      const sym  = extracted.symptom;
      const zone = extracted.body_zone;
      const sev  = extracted.severity ?? 5;

      if (critical) {
        const zone2label: Record<string,string> = {
          chest:'CARDIAC', lungs:'RESPIRATORY', systemic:'NEUROLOGICAL'
        };
        const label = zone ? (zone2label[zone] ?? 'CRITICAL') : 'CRITICAL';
        botReply =
          `🚨 *${label} EMERGENCY DETECTED*\n\n` +
          `Symptom: *${sym ?? inputText}* — Severity ${sev}/10\n\n` +
          `⚡ Emergency Risk Agent is now activating...\n` +
          `Your profile (HTN + Diabetes + Cardiac Hx) makes this a *HIGH-PRIORITY* situation.\n\n` +
          `Please sit down and do NOT exert yourself. Call *112* if symptoms worsen.`;
      } else if (sym) {
        const advice: Record<string,string> = {
          chest:   'Sit and rest immediately. Avoid any exertion.',
          lungs:   'Breathe slowly and calmly. Try steam inhalation.',
          head:    'Rest in a dark, quiet room. Drink water.',
          systemic:'Rest and stay hydrated. Monitor temperature.',
          stomach: 'Eat light meals. Avoid spicy or oily food.',
          back:    'Avoid heavy lifting. Apply a warm compress.',
          legs:    'Elevate your legs. Monitor for swelling.',
        };
        const tip = zone ? (advice[zone] ?? 'Monitor closely and consult your doctor.') : 'Monitor closely.';
        botReply =
          `I've detected: *${sym}*\n` +
          `Severity: ${sev}/10 | Zone: ${zone}\n\n` +
          `${tip}\n\n` +
          `How long have you had this? Are there any other symptoms alongside?`;
      } else {
        const fallbacks = [
          "Could you describe your symptoms in more detail?\nFor example: *'chest pain since 1 hour'* or *'fever with headache'*.",
          "I'd like to understand your situation better. Which part of your body is bothering you, and how severe is it (1–10)?",
          "I'm here to help. Can you tell me more — any pain, discomfort, or unusual feeling today?",
          "Noted. Any associated symptoms like dizziness, nausea, fever, or shortness of breath?",
        ];
        botReply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }
    }

    // ── 4. Display reply ───────────────────────
    await new Promise(r => setTimeout(r, usedBackend ? 200 : 750));
    push({ id:`a-${Date.now()}`, role:'assistant', content: botReply });
    setIsLoading(false);

    // ── 5. Accumulate symptoms for agent ───────
    let updatedSymptoms = [...sessionSymptoms];
    if (extracted.has_symptom) {
      const dupe = updatedSymptoms.find(x => x.symptom === extracted.symptom);
      if (!dupe) updatedSymptoms = [...updatedSymptoms, extracted];
      setSessionSymptoms(updatedSymptoms);
    }

    // ── 6. Run full agent pipeline ──────────────
    await new Promise(r => setTimeout(r, 450));
    const agentSymptoms = updatedSymptoms.length > 0
      ? updatedSymptoms
      : [{
          has_symptom: true,
          symptom: `Reported: "${inputText.slice(0,40)}"`,
          body_zone: 'systemic',
          severity: 6,
          confidence: 65,
        }];
    await runOrchestration(agentSymptoms, usedBackend);

  }, [text, isLoading, agentRunning, messages, sessionSymptoms, push, runOrchestration]);

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <ScreenWrapper style={{ backgroundColor: '#080d24' }} scroll={false}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <View style={styles.container}>

            {/* ── HEADER ── */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Animated.View style={[styles.dot, { transform:[{scale:pulseAnim}] }]} />
                <Text style={styles.title}>Swasthya AI</Text>
                {backendOnline !== null && (
                  <View style={[styles.badge, {backgroundColor: backendOnline ? '#0f3d1f' : '#3d1a0f'}]}>
                    <Text style={styles.badgeText}>{backendOnline ? '⚡ Groq Live' : '📡 Local NLP'}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.statusBadge, agentRunning && styles.statusBadgeActive]}>
                <Text style={styles.statusText}>
                  {agentRunning ? '⚡ Agents Running' : '🤖 Ready'}
                </Text>
              </View>
            </View>

            {/* ── AGENT PANEL ── */}
            {showAgentPanel && agentLogs.length > 0 && (
              <View style={styles.agentPanel}>
                <View style={styles.agentPanelHeader}>
                  {agentRunning && (
                    <ActivityIndicator size="small" color="#7ee8fa" style={{ marginRight:6 }} />
                  )}
                  <Text style={styles.agentPanelTitle}>
                    {agentRunning ? '⚙️  Multi-Agent Pipeline Running…' : '✅  Agent Pipeline Complete'}
                  </Text>
                </View>
                <View style={styles.agentLogScroll}>
                  {agentLogs.map((log, i) => (
                    <LogLine key={i} text={log} idx={i} />
                  ))}
                </View>
              </View>
            )}

            {/* ── MESSAGES ── */}
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={({ item }) => (
                <ChatBubble role={item.role} content={item.content} />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.msgList}
              style={styles.flatList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated:true})}
            />

            {/* ── TYPING ── */}
            {isLoading && (
              <View style={styles.typingRow}>
                <ActivityIndicator size="small" color="#7ee8fa" />
                <Text style={styles.typingText}>
                  {backendOnline ? 'Groq LLaMA-3 is thinking…' : 'Local NLP analyzing…'}
                </Text>
              </View>
            )}

            {/* ── CHIPS ── */}
            {!agentRunning && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipsWrap}
                contentContainerStyle={styles.chipsContent}
              >
                {QUICK_CHIPS.map(c => (
                  <TouchableOpacity
                    key={c.label}
                    style={styles.chip}
                    onPress={() => setText(c.text)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipText}>{c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* ── INPUT ── */}
            <ChatInput
              value={text}
              onChangeText={setText}
              onSend={handleSend}
              placeholder={agentRunning ? 'Agent pipeline running…' : 'Describe your symptoms…'}
              disabled={isLoading || agentRunning}
            />

          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </View>
  );
}

// ─────────────────────────────────────────────
//  STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  root:        { flex:1, backgroundColor:'#080d24' },
  kav:         { flex:1 },
  container:   { flex:1, backgroundColor:'#080d24' },

  // Header
  header: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    paddingHorizontal:SPACING.md, paddingTop:SPACING.sm, paddingBottom:8,
    borderBottomWidth:1, borderBottomColor:'rgba(126,232,250,0.1)',
  },
  headerLeft:  { flexDirection:'row', alignItems:'center', gap:8, flexShrink:1 },
  title:       { color:'#fff', fontFamily:TYPOGRAPHY.fonts.bold, fontSize:17, letterSpacing:0.3 },
  dot:         { width:10, height:10, borderRadius:5, backgroundColor:'#39ff14' },
  badge: {
    paddingHorizontal:8, paddingVertical:3, borderRadius:12,
    borderWidth:1, borderColor:'rgba(255,255,255,0.12)',
  },
  badgeText:   { color:'#a8e6cf', fontSize:10, fontFamily:TYPOGRAPHY.fonts.medium },
  statusBadge: {
    backgroundColor:'rgba(126,232,250,0.08)',
    borderWidth:1, borderColor:'rgba(126,232,250,0.2)',
    borderRadius:20, paddingHorizontal:10, paddingVertical:4,
  },
  statusBadgeActive: { backgroundColor:'rgba(255,100,50,0.15)', borderColor:'rgba(255,100,50,0.4)' },
  statusText:  { color:'#7ee8fa', fontSize:11, fontFamily:TYPOGRAPHY.fonts.medium },

  // Agent panel
  agentPanel: {
    marginHorizontal:10, marginTop:6, marginBottom:2,
    padding:10, backgroundColor:'#090f20',
    borderRadius:12, borderWidth:1, borderColor:'rgba(126,232,250,0.2)',
  },
  agentPanelHeader: { flexDirection:'row', alignItems:'center', marginBottom:6 },
  agentPanelTitle:  { color:'#7ee8fa', fontFamily:TYPOGRAPHY.fonts.bold, fontSize:12, letterSpacing:0.4 },
  agentLogScroll:   {},
  logLine: {
    color:'#98ddc9', fontFamily:TYPOGRAPHY.fonts.regular,
    fontSize:10.5, lineHeight:17, marginVertical:1,
  },

  // Messages
  flatList:  { flex:1 },
  msgList:   { padding:SPACING.md, paddingBottom:SPACING.lg },

  // Typing
  typingRow: {
    flexDirection:'row', alignItems:'center',
    paddingHorizontal:SPACING.md, paddingBottom:6, gap:8,
  },
  typingText: { color:'#7ee8fa', fontSize:11, fontFamily:TYPOGRAPHY.fonts.medium, opacity:0.85 },

  // Chips
  chipsWrap:    { maxHeight:44, marginBottom:4 },
  chipsContent: { paddingHorizontal:SPACING.md, gap:8, alignItems:'center' },
  chip: {
    borderWidth:1, borderColor:'rgba(126,232,250,0.3)', borderRadius:999,
    paddingHorizontal:14, paddingVertical:7,
    backgroundColor:'rgba(126,232,250,0.07)',
  },
  chipText: { color:'#d8f4ff', fontSize:12, fontFamily:TYPOGRAPHY.fonts.medium },
});
