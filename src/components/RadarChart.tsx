import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { RiasecType } from '../data/questions';

interface RadarChartProps {
  scores: Record<RiasecType | string, number>;
  className?: string;
}

const RIASEC_LABELS: Record<string, { name: string; full: string }> = {
  R: { name: 'Realistic', full: 'Realistic (Practical/Hands-on)' },
  I: { name: 'Investigative', full: 'Investigative (Analytical/STEM)' },
  A: { name: 'Artistic', full: 'Artistic (Creative/Design)' },
  S: { name: 'Social', full: 'Social (Empathetic/Teaching)' },
  E: { name: 'Enterprising', full: 'Enterprising (Leadership/Business)' },
  C: { name: 'Conventional', full: 'Conventional (Data/Structured)' },
};

export const InterestRadarChart: React.FC<RadarChartProps> = ({ scores, className = '' }) => {
  const data = [
    { type: 'R', label: 'Realistic (R)', score: scores.R || 0, fullMark: 10 },
    { type: 'I', label: 'Investigative (I)', score: scores.I || 0, fullMark: 10 },
    { type: 'A', label: 'Artistic (A)', score: scores.A || 0, fullMark: 10 },
    { type: 'S', label: 'Social (S)', score: scores.S || 0, fullMark: 10 },
    { type: 'E', label: 'Enterprising (E)', score: scores.E || 0, fullMark: 10 },
    { type: 'C', label: 'Conventional (C)', score: scores.C || 0, fullMark: 10 },
  ];

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div className="w-full h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#cbd5e1" strokeDasharray="3 3" />
            <PolarAngleAxis
              dataKey="label"
              tick={{ fill: '#14305E', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 10]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              stroke="#e2e8f0"
            />
            <Radar
              name="Interest Score"
              dataKey="score"
              stroke="#14305E"
              strokeWidth={2.5}
              fill="#1B7A9C"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Compact Score Chips */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2 w-full mt-2">
        {data.map((item) => (
          <div
            key={item.type}
            className="flex flex-col items-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
          >
            <span className="text-[10px] font-bold text-slate-500">{item.type}</span>
            <span className="text-xs font-extrabold text-[#14305E]">{item.score}/10</span>
          </div>
        ))}
      </div>
    </div>
  );
};
