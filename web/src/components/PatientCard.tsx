import React from 'react';
import { RiskBadge } from './RiskBadge';
import { Patient } from '../types';
import { cn } from '../lib/utils';
import { ChevronRight, Clock, AlertCircle } from 'lucide-react';

interface PatientCardProps {
  patient: Patient;
  onClick: (id: string) => void;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient, onClick }) => {
  const riskColorClass = {
    Low: 'border-risk-low',
    Moderate: 'border-risk-moderate',
    Elevated: 'border-risk-elevated',
    High: 'border-risk-high',
  };

  return (
    <div 
      onClick={() => onClick(patient.id)}
      className={cn(
        "card-base card-interactive p-4 flex items-center justify-between border-l-4",
        riskColorClass[patient.risk_level] || riskColorClass.Low
      )}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-text-primary font-bold text-lg">
          {patient.name.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-text-primary flex items-center gap-2">
            {patient.name}
            {patient.risk_level === 'High' && <AlertCircle size={14} className="text-risk-high" />}
          </h3>
          <p className="text-sm text-text-secondary">{patient.age} years • {patient.gender}</p>
          <div className="flex items-center gap-1 mt-1 text-xs text-text-muted">
            <Clock size={12} />
            <span>Last check-in: {patient.last_visit_date ? new Date(patient.last_visit_date).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-text-muted uppercase font-bold tracking-wider">Risk Score</p>
          <p className={cn(
            "text-xl font-mono font-bold",
            patient.risk_level === 'High' ? 'text-risk-high' : 'text-text-primary'
          )}>
            {patient.risk_score}
          </p>
        </div>
        <RiskBadge level={patient.risk_level} />
        <ChevronRight size={20} className="text-gray-300" />
      </div>
    </div>
  );
};
