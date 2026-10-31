import React from 'react';
import { Award, Brain, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

export default function ScoreBreakdownBar({ breakdown, weights, compact = false }) {
  if (!breakdown) return null;

  const metrics = [
    {
      key: 'skill_match',
      label: 'Skill Match',
      icon: Award,
      score: breakdown.skill_match ?? 0,
      weight: weights?.skill_match ? `${Math.round(weights.skill_match * 100)}%` : '50%',
      barColor: 'from-emerald-500 to-teal-600'
    },
    {
      key: 'semantic_match',
      label: 'Semantic Fit',
      icon: Brain,
      score: breakdown.semantic_match ?? 0,
      weight: weights?.semantic_match ? `${Math.round(weights.semantic_match * 100)}%` : '20%',
      barColor: 'from-indigo-600 to-indigo-700'
    },
    {
      key: 'experience_match',
      label: 'Experience',
      icon: Briefcase,
      score: breakdown.experience_match ?? 0,
      weight: weights?.experience_match ? `${Math.round(weights.experience_match * 100)}%` : '15%',
      barColor: 'from-sky-500 to-blue-600'
    },
    {
      key: 'education_match',
      label: 'Education',
      icon: GraduationCap,
      score: breakdown.education_match ?? 0,
      weight: weights?.education_match ? `${Math.round(weights.education_match * 100)}%` : '10%',
      barColor: 'from-amber-500 to-amber-600'
    },
    {
      key: 'certification_match',
      label: 'Certs',
      icon: ShieldCheck,
      score: breakdown.certification_match ?? 0,
      weight: weights?.certification_match ? `${Math.round(weights.certification_match * 100)}%` : '5%',
      barColor: 'from-purple-500 to-purple-600'
    }
  ];

  if (compact) {
    return (
      <div className="grid grid-cols-5 gap-2 pt-2.5 border-t border-slate-100">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.key} className="flex flex-col text-center">
              <span className="text-[10px] text-slate-500 truncate flex items-center justify-center gap-0.5 font-medium">
                <Icon className="w-2.5 h-2.5 opacity-80" />
                {m.label.split(' ')[0]}
              </span>
              <span className="text-xs font-bold text-slate-800 font-mono mt-0.5">{m.score}%</span>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1 border border-slate-200/60">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <div key={m.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-slate-700">
                <Icon className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">{m.label}</span>
                <span className="text-[10px] text-slate-400">({m.weight} weight)</span>
              </div>
              <span className="font-bold text-slate-900 font-mono">{m.score}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${m.barColor} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(0, m.score))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
