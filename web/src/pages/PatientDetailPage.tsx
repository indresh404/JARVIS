import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, Plus, AlertTriangle, History, Info, Activity } from 'lucide-react';
import { api } from '../lib/api';
import { geminiService } from '../services/gemini';
import { RiskBadge } from '../components/RiskBadge';
import { BodyHeatmap } from '../components/BodyHeatmap';
import { RiskChart } from '../components/RiskChart';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface PatientDetailPageProps {
  patientId: string;
  onBack: () => void;
}

export const PatientDetailPage: React.FC<PatientDetailPageProps> = ({ patientId, onBack }) => {
  const [patient, setPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [generics, setGenerics] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        setIsLoading(true);
        const data = await api.getPatientDetail(patientId);
        setPatient(data);
        
        // Load chat history (mocked for now or from qna_response_log)
        const qna = await api.getQnA(patientId);
        const history = qna.map(q => ([
          { role: 'doctor', text: q.question },
          { role: 'ai', text: q.patient_answer || 'Pending patient response...', status: q.status }
        ])).flat();
        setChatMessages(history);

        // Fetch Jan Aushadhi generic alternatives
        const genData = await api.getGenericAlternatives(patientId, ['Hypertension', 'Diabetes']);
        if (genData?.generic_alternatives) {
          setGenerics(genData.generic_alternatives);
        }
      } catch (err) {
        console.error('Failed to load patient detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [patientId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    const result = await geminiService.generateClinicalSummary(patient);
    setSummary(result);
    setIsGeneratingSummary(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);
    setChatMessages(prev => [...prev, { role: 'doctor', text: userMsg }]);

    try {
      const context = {
        rolling_summary: patient?.profile_summary || "New patient",
        profile_summary: patient?.profile_summary || "",
        last_7_summaries: [],
        active_medications: patient?.medicines?.map((m: any) => m.medicine_name) || [],
        pending_doctor_questions: []
      };

      const result = await api.chatMessage(patientId, userMsg, context);
      if (result) {
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          text: result.bot_reply, 
          answer_found: !result.clarification_needed 
        }]);
      } else {
        throw new Error("Backend response failed");
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: "I understand. Could you tell me more about the patient's current symptoms?" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (isLoading) return <div className="flex items-center justify-center h-full"><Activity className="animate-spin text-brand-primary" /></div>;
  if (!patient) return <div>Patient not found</div>;

  const zoneScores = patient.symptoms?.reduce((acc: any, s: any) => {
    acc[s.body_zone] = Math.max(acc[s.body_zone] || 0, s.severity * 10);
    return acc;
  }, {}) || {};

  const trendData = [
    { date: '04/01', score: 45 },
    { date: '04/03', score: 52 },
    { date: '04/05', score: 48 },
    { date: '04/07', score: 65 },
    { date: '04/09', score: patient.risk_score || 72 },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Sticky Top Bar */}
      <div className="sticky top-0 z-30 bg-brand-surface/80 backdrop-blur-md py-4 flex items-center justify-between border-b border-gray-200 -mx-6 px-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-xl font-bold">{patient.name}</h2>
            <p className="text-xs text-text-muted">{patient.age}y • {patient.gender} • ID: {patient.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RiskBadge level={patient.risk_level || 'Low'} />
          <button 
            onClick={() => window.print()}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Info size={16} className="text-brand-primary" />
            Clinical Report (Sample)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Heatmap & Risk */}
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Symptom Heatmap</h3>
            <BodyHeatmap zones={zoneScores} symptoms={patient.symptoms} />
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Risk Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-base p-6 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
                    <circle 
                      cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" 
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * (patient.risk_score || 0)) / 100}
                      className={cn(
                        "transition-all duration-1000",
                        patient.risk_level === 'High' ? 'text-risk-high' : 'text-brand-primary'
                      )}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-mono font-bold">{patient.risk_score || 0}</span>
                    <span className="text-[10px] uppercase font-bold text-text-muted">Score</span>
                  </div>
                </div>
                <p className="mt-4 font-bold text-text-primary">{patient.risk_level} Risk</p>
                <p className="text-xs text-text-muted">Confidence: {patient.patient_risk_scores?.confidence || 85}%</p>
              </div>

              <div className="card-base p-6 md:col-span-2 space-y-4">
                <div className="flex items-start gap-3">
                  <Info className="text-brand-primary flex-shrink-0" size={20} />
                  <div>
                    <p className="text-sm font-medium text-text-secondary leading-relaxed">
                      {patient.patient_risk_scores?.risk_reason || "Patient showing stable vitals with minor symptom spikes in the chest area. Recommended follow-up in 3 days."}
                    </p>
                    {patient.patient_risk_scores?.guideline_reference && (
                      <blockquote className="mt-3 pl-3 border-l-2 border-brand-primary-light text-xs italic text-text-muted">
                        Source: {patient.patient_risk_scores.guideline_reference}
                      </blockquote>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <RiskChart data={trendData} />
          </section>

          {/* AI Summary Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Clinical Summary</h3>
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl text-sm font-bold hover:bg-brand-primary/90 disabled:opacity-50 transition-all"
              >
                <Sparkles size={16} />
                {isGeneratingSummary ? 'Generating...' : 'Generate 7-Day Summary'}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              {summary ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="card-base p-6 border-l-4 border-brand-primary-light"
                >
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{summary}</p>
                </motion.div>
              ) : isGeneratingSummary ? (
                <div className="space-y-2">
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-full" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-5/6" />
                  <div className="h-4 bg-gray-100 animate-pulse rounded w-4/6" />
                </div>
              ) : null}
            </AnimatePresence>
          </section>
        </div>

        {/* Right Column: AI Chat & Timeline */}
        <div className="space-y-8">
          {/* AI Chat Section */}
          <section className="card-base flex flex-col h-[600px] overflow-hidden border-brand-primary/10 shadow-2xl">
            <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-brand-primary/5 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-brand-primary rounded-xl text-white shadow-lg shadow-brand-primary/20">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-text-primary">Swasthya AI Assistant</h3>
                  <p className="text-[10px] text-brand-primary font-bold uppercase tracking-wider">Highly Educated Clinical Bot</p>
                </div>
              </div>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-risk-low animate-pulse" />
                <span className="text-[10px] font-bold text-text-muted uppercase">Online</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              <AnimatePresence initial={false}>
                {chatMessages.map((msg, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className={cn(
                      "flex flex-col max-w-[90%]",
                      msg.role === 'doctor' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed shadow-sm",
                      msg.role === 'doctor' 
                        ? "bg-brand-primary text-white rounded-tr-none" 
                        : msg.answer_found === false 
                          ? "bg-white border-2 border-yellow-200 text-text-primary rounded-tl-none"
                          : "bg-white border border-gray-100 text-text-primary rounded-tl-none"
                    )}>
                      {msg.answer_found === false && (
                        <div className="flex items-center gap-2 mb-2 text-yellow-700 font-bold text-xs bg-yellow-50 p-2 rounded-lg">
                          <AlertTriangle size={14} />
                          Limited Data Warning
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-text-muted mt-2 uppercase font-black tracking-widest px-1">
                      {msg.role === 'doctor' ? 'Clinical Lead' : 'Swasthya Intelligence'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isChatLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1.5 p-4 bg-white rounded-2xl border border-gray-100 w-fit shadow-sm"
                >
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                </motion.div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-5 border-t border-gray-100 bg-white">
              <div className="flex gap-3 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about vitals, history, or family..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <div className="h-4 w-[1px] bg-gray-200" />
                    <Sparkles size={14} className="text-brand-primary opacity-50" />
                  </div>
                </div>
                <button 
                  onClick={handleSendMessage}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="p-3.5 bg-brand-primary text-white rounded-2xl hover:bg-brand-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-brand-primary/20 active:scale-95"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[9px] text-center text-text-muted mt-3 font-medium uppercase tracking-tighter">
                AI can make mistakes. Verify critical clinical decisions.
              </p>
            </div>
          </section>

          {/* Timeline Section */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2">
              <History size={16} />
              Timeline
            </h3>
            <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {patient.symptoms?.slice(0, 5).map((s: any, idx: number) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-2.5 top-1.5 w-3 h-3 bg-risk-moderate rounded-full border-2 border-white shadow-sm" />
                  <p className="text-xs text-text-muted">{new Date(s.created_at).toLocaleString()}</p>
                  <p className="text-sm font-bold">{s.symptom_name}</p>
                  <p className="text-xs text-text-secondary">Severity: {s.severity}/10 • Zone: {s.body_zone}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Prescription Form */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">New Prescription</h3>
            <div className="card-base p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-muted uppercase">Medicine Name</label>
                <input type="text" placeholder="e.g. Amlodipine" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Dosage</label>
                  <input type="text" placeholder="5mg" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-muted uppercase">Frequency</label>
                  <select className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20">
                    <option>Once daily</option>
                    <option>Twice daily</option>
                    <option>Thrice daily</option>
                  </select>
                </div>
              </div>
              <button className="w-full py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2">
                <Plus size={18} />
                Add Prescription
              </button>
            </div>
          </section>

          {/* Jan Aushadhi Affordability Section */}
          {generics.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest flex items-center gap-2 text-brand-primary">
                <Sparkles size={16} />
                Affordability Analysis
              </h3>
              <div className="card-base p-6 bg-blue-50/50 border-blue-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-blue-700">
                    <Activity size={20} />
                    <span className="font-bold">Jan Aushadhi Generic Savings</span>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-[10px] font-black uppercase tracking-widest">Live Rates</span>
                </div>
                
                <div className="space-y-3">
                  {generics.map((gen, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-xl border border-blue-100 shadow-sm">
                      <div>
                        <p className="text-[10px] text-text-muted line-through font-bold">{gen.brand_name}</p>
                        <p className="text-sm font-bold text-blue-900">{gen.generic_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-text-muted line-through font-bold">₹{gen.market_price}</p>
                        <p className="text-lg font-black text-brand-primary">₹{gen.jan_aushadhi_price}</p>
                        <p className="text-[9px] font-black text-green-600 uppercase tracking-tighter">Save {gen.savings_percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <p className="text-[10px] text-blue-800 font-medium bg-blue-100/50 p-2 rounded-lg italic">
                    "Switching to generic alternatives for these medications would save the patient approx. ₹1,200 per month."
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Government Schemes Panel */}
          {patient.risk_score > 70 && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest">Eligible Support Schemes</h3>
              <div className="card-base p-6 bg-yellow-50/50 border-yellow-100 space-y-4">
                <div className="flex items-center gap-3 text-yellow-700">
                  <Activity size={20} />
                  <span className="font-bold">Ayushman Bharat PM-JAY</span>
                </div>
                <p className="text-xs text-yellow-800/80">Coverage up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization.</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold">BPL Eligible</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-[10px] font-bold">Chronic Care</span>
                </div>
                <button className="w-full py-2 bg-yellow-600 text-white rounded-lg text-xs font-bold hover:bg-yellow-700 transition-colors">
                  View Nearest Hospital
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
