import React from 'react';
import { cn } from '../lib/utils';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className }) => {
  const colors = {
    Low: 'bg-risk-low text-white',
    Moderate: 'bg-risk-moderate text-white',
    Elevated: 'bg-risk-elevated text-white',
    High: 'bg-risk-high text-white',
  };

  return (
    <span className={cn(
      'px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
      colors[level] || colors.Low,
      className
    )}>
      {level}
    </span>
  );
};
