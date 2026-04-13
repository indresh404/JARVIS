import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface RiskChartProps {
  data: { date: string; score: number }[];
  events?: { date: string; label: string; type: 'med' | 'symptom' }[];
}

export const RiskChart: React.FC<RiskChartProps> = ({ data, events }) => {
  return (
    <div className="h-64 w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
          />
          
          {events?.map((event, idx) => (
            <ReferenceLine 
              key={idx}
              x={event.date} 
              stroke={event.type === 'med' ? '#116acf' : '#EF4444'} 
              strokeDasharray="3 3"
              label={{ 
                value: event.label, 
                position: 'top', 
                fill: event.type === 'med' ? '#116acf' : '#EF4444',
                fontSize: 8,
                fontWeight: 'bold'
              }} 
            />
          ))}

          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#116acf" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#116acf', strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
