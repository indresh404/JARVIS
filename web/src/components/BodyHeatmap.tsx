import React, { useState } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, ShieldCheck } from 'lucide-react';

interface BodyHeatmapProps {
  zones: { [key: string]: number }; // zone -> score (0-100)
  symptoms?: any[];
}

export const BodyHeatmap: React.FC<BodyHeatmapProps> = ({ zones, symptoms }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const getZoneColor = (score: number | undefined) => {
    if (score === undefined || score === 0) return '#F3F4F6'; // gray-100
    if (score < 25) return '#10B981'; // risk-low
    if (score < 50) return '#EAB308'; // risk-moderate
    if (score < 75) return '#F97316'; // risk-elevated
    return '#EF4444'; // risk-high
  };

  const zoneData = symptoms?.reduce((acc: any, s: any) => {
    acc[s.body_zone] = s;
    return acc;
  }, {}) || {};

  const Zone = ({ name, d, label }: { name: string; d: string; label: string }) => (
    <path
      d={d}
      fill={getZoneColor(zones[name])}
      className={cn(
        "transition-all duration-300 hover:opacity-80 stroke-white stroke-[0.2]",
        zones[name] > 0 ? "cursor-pointer" : "cursor-default"
      )}
      onClick={() => zones[name] > 0 && setSelectedZone(name)}
    >
      <title>{label}: {zones[name] || 0}%</title>
    </path>
  );

  return (
    <div className="relative flex flex-col items-center justify-center gap-10 p-8 bg-white rounded-[40px] border border-gray-100 shadow-2xl overflow-hidden">
      <div className="flex flex-col md:flex-row gap-20">
        <div className="text-center">
          <p className="text-[10px] font-black text-text-muted uppercase mb-8 tracking-[0.3em]">Anterior View</p>
          <svg viewBox="0 0 100 200" className="w-64 h-[500px] drop-shadow-2xl">
            {/* Realistic Body Outline with better curves */}
            <path d="M50,5 C55,5 60,10 60,20 C60,25 58,30 50,30 C42,30 40,25 40,20 C40,10 45,5 50,5 M30,35 C25,35 20,40 20,50 L15,100 C15,110 20,115 25,115 L35,115 L35,190 C35,195 40,200 45,200 L48,200 L48,120 L52,120 L52,200 L55,200 C60,200 65,195 65,190 L65,115 L75,115 C80,115 85,110 85,100 L80,50 C80,40 75,35 70,35 Z" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.5" />
            
            {/* Head & Neck */}
            <Zone name="head" label="Head" d="M50,8 a12,12 0 1,1 0,24 a12,12 0 1,1 0,-24" />
            <Zone name="neck" label="Neck" d="M45,30 h10 v5 h-10 z" />
            
            {/* Torso */}
            <Zone name="chest" label="Chest" d="M35,40 h30 v25 c0,5 -5,10 -15,10 s-15,-5 -15,-10 z" />
            <Zone name="lungs" label="Lungs" d="M38,42 q12,0 12,10 q0,10 -12,10 q-12,0 -12,-10 q0,-10 12,-10 M62,42 q12,0 12,10 q0,10 -12,10 q-12,0 -12,-10 q0,-10 12,-10" />
            <Zone name="stomach" label="Stomach" d="M40,78 h20 v15 q0,5 -10,5 t-10,-5 z" />
            <Zone name="abdomen" label="Lower Abdomen" d="M40,98 h20 v12 h-20 z" />
            
            {/* Arms & Joints */}
            <Zone name="shoulders" label="Shoulders" d="M25,35 h10 v10 h-10 z M65,35 h10 v10 h-10 z" />
            <Zone name="arms" label="Arms" d="M22,45 q-5,20 -5,50 l5,0 q0,-30 5,-50 z M78,45 q5,20 5,50 l-5,0 q0,-30 -5,-50 z" />
            <Zone name="elbows" label="Elbows" d="M18,70 h6 v6 h-6 z M76,70 h6 v6 h-6 z" />
            <Zone name="wrists" label="Wrists" d="M18,95 h6 v4 h-6 z M76,95 h6 v4 h-6 z" />
            
            {/* Legs & Joints */}
            <Zone name="hips" label="Hips" d="M35,110 h30 v10 h-30 z" />
            <Zone name="legs" label="Legs" d="M38,120 h10 v70 q0,5 -5,5 t-5,-5 z M52,120 h10 v70 q0,5 -5,5 t-5,-5 z" />
            <Zone name="knees" label="Knees" d="M38,155 h10 v8 h-10 z M52,155 h10 v8 h-10 z" />
            <Zone name="ankles" label="Ankles" d="M38,185 h10 v4 h-10 z M52,185 h10 v4 h-10 z" />
            <Zone name="feet" label="Feet" d="M35,195 h12 v5 h-12 z M53,195 h12 v5 h-12 z" />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-[10px] font-black text-text-muted uppercase mb-8 tracking-[0.3em]">Posterior View</p>
          <svg viewBox="0 0 100 200" className="w-64 h-[500px] drop-shadow-2xl">
            <path d="M50,5 C55,5 60,10 60,20 C60,25 58,30 50,30 C42,30 40,25 40,20 C40,10 45,5 50,5 M30,35 C25,35 20,40 20,50 L15,100 C15,110 20,115 25,115 L35,115 L35,190 C35,195 40,200 45,200 L48,200 L48,120 L52,120 L52,200 L55,200 C60,200 65,195 65,190 L65,115 L75,115 C80,115 85,110 85,100 L80,50 C80,40 75,35 70,35 Z" fill="#F9FAFB" stroke="#E5E7EB" strokeWidth="0.5" />
            
            <Zone name="head" label="Head" d="M50,8 a12,12 0 1,1 0,24 a12,12 0 1,1 0,-24" />
            <Zone name="neck" label="Neck" d="M45,30 h10 v5 h-10 z" />
            <Zone name="back" label="Upper Back" d="M35,40 h30 v35 h-30 z" />
            <Zone name="joints" label="Lower Back" d="M35,80 h30 v15 h-30 z" />
            <Zone name="shoulders" label="Shoulders" d="M25,35 h10 v10 h-10 z M65,35 h10 v10 h-10 z" />
            <Zone name="legs" label="Legs" d="M38,120 h10 v70 q0,5 -5,5 t-5,-5 z M52,120 h10 v70 q0,5 -5,5 t-5,-5 z" />
            <Zone name="knees" label="Knees" d="M38,155 h10 v8 h-10 z M52,155 h10 v8 h-10 z" />
            <Zone name="feet" label="Feet" d="M35,195 h12 v5 h-12 z M53,195 h12 v5 h-12 z" />
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-4">
        {[
          { label: 'Low', color: 'bg-risk-low' },
          { label: 'Moderate', color: 'bg-risk-moderate' },
          { label: 'Elevated', color: 'bg-risk-elevated' },
          { label: 'High', color: 'bg-risk-high' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={cn("w-2.5 h-2.5 rounded-full", item.color)} />
            <span className="text-[10px] font-bold text-text-muted uppercase">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Detail Popup */}
      <AnimatePresence>
        {selectedZone && zoneData[selectedZone] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute inset-x-8 bottom-8 z-20 bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-3xl shadow-2xl"
          >
            <button 
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={18} className="text-text-muted" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-risk-high" size={20} />
                  <h4 className="font-bold text-lg text-text-primary capitalize">{selectedZone} Issue: {zoneData[selectedZone].symptom_name}</h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {zoneData[selectedZone].description || "No detailed description available for this symptom."}
                </p>
              </div>

              <div className="flex-1 bg-brand-primary/5 rounded-2xl p-4 space-y-3 border border-brand-primary/10">
                <div className="flex items-center gap-2 text-brand-primary">
                  <ShieldCheck size={18} />
                  <h5 className="font-bold text-sm uppercase tracking-wider">Precautions</h5>
                </div>
                <p className="text-xs text-brand-primary/80 leading-relaxed italic">
                  {zoneData[selectedZone].precautions || "Consult with a specialist for specific precautions."}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
