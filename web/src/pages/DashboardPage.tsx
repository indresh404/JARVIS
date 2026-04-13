import React, { useState, useEffect } from 'react';
import { Search, Sparkles, CheckCircle2, Users } from 'lucide-react';
import { api } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Patient, BriefingEntry } from '../types';
import { PatientCard } from '../components/PatientCard';
import { RiskBadge } from '../components/RiskBadge';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardPageProps {
  onPatientClick: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onPatientClick }) => {
  const isUsingPlaceholder = (supabase as any).supabaseUrl?.includes('placeholder');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [briefing, setBriefing] = useState<BriefingEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [dbStatus, setDbStatus] = useState<'connected' | 'error' | 'checking'>('checking');

  const loadData = async () => {
    try {
      setIsLoading(true);
      setDbStatus('checking');
      const [patientsData, briefingData] = await Promise.all([
        api.getPatients(),
        api.getMorningBriefing('doctor-123') // Mock doctor ID
      ]);
      setPatients(patientsData);
      setBriefing(briefingData);
      setDbStatus('connected');
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setDbStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      await api.seedAllData();
      await loadData();
    } catch (err) {
      console.error('Failed to seed data:', err);
      alert('Failed to seed data. Make sure your Supabase tables (users, doctors, reviews, symptoms, doctor_alerts, daily_summaries) exist.');
    } finally {
      setIsSeeding(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-10">
      {isUsingPlaceholder && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-primary/10 border border-brand-primary/20 p-4 rounded-2xl flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="text-brand-primary" size={20} />
            <p className="text-sm font-medium text-brand-primary">
              <span className="font-bold">Demo Mode Active:</span> You are viewing sample data because Supabase is not yet connected.
            </p>
          </div>
          <button 
            onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
            className="text-xs font-bold bg-brand-primary text-white px-3 py-1.5 rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Connect Database
          </button>
        </motion.div>
      )}

      {/* Morning Briefing Card */}
      <section>
        <div className="bg-gradient-to-r from-brand-primary to-[#0d52a1] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-brand-primary-light" size={24} />
              <h2 className="text-xl font-bold">Morning Briefing</h2>
              <span className="text-sm opacity-80 ml-auto">{new Date().toLocaleDateString()}</span>
            </div>

            {briefing.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {briefing.map((entry, idx) => (
                  <motion.div 
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onPatientClick(entry.patient_id)}
                    className="flex-shrink-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 w-64 cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold truncate pr-2">{entry.name}</span>
                      <RiskBadge level={entry.risk_level} className="scale-75 origin-right" />
                    </div>
                    <p className="text-xs opacity-90 line-clamp-2">{entry.flag}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 py-4">
                <CheckCircle2 className="text-risk-low" size={32} />
                <div>
                  <p className="font-bold text-lg">All patients stable</p>
                  <p className="text-sm opacity-80">No urgent flags today. Great job!</p>
                </div>
              </div>
            )}
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-brand-primary-light/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Patient List Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-text-primary">Patient Triage</h2>
            <div className={cn(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter",
              dbStatus === 'connected' ? "bg-risk-low/10 text-risk-low" : 
              dbStatus === 'error' ? "bg-risk-high/10 text-risk-high" : "bg-gray-100 text-gray-400"
            )}>
              {dbStatus === 'connected' ? 'Live DB' : dbStatus === 'error' ? 'DB Error' : 'Connecting...'}
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredPatients.length > 0 ? (
          <div className="grid gap-4">
            {filteredPatients.map(patient => (
              <PatientCard 
                key={patient.id} 
                patient={patient} 
                onClick={onPatientClick} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 space-y-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
              <Users className="text-gray-300" size={32} />
            </div>
            <div>
              <p className="text-text-primary font-bold">No patients found</p>
              <p className="text-text-muted text-sm max-w-xs mx-auto">
                Connect your Supabase database and add entries to the <code className="bg-gray-100 px-1 rounded text-brand-primary">users</code> table to see them here.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                className="text-brand-primary text-sm font-bold hover:underline"
              >
                Open Supabase Dashboard
              </button>
              <button 
                onClick={handleSeedData}
                disabled={isSeeding}
                className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50 transition-all text-sm"
              >
                {isSeeding ? 'Seeding...' : 'Seed Sample Patients'}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
