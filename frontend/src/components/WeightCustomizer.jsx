import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp, Award, Brain, Briefcase, GraduationCap, ShieldCheck } from 'lucide-react';

const PRESETS = {
  balanced: {
    name: 'Balanced (Default)',
    weights: { skill_match: 0.50, semantic_match: 0.20, experience_match: 0.15, education_match: 0.10, certification_match: 0.05 }
  },
  skill_heavy: {
    name: 'Skill Intensive (65%)',
    weights: { skill_match: 0.65, semantic_match: 0.15, experience_match: 0.10, education_match: 0.05, certification_match: 0.05 }
  },
  experience_heavy: {
    name: 'Experience Heavy (35%)',
    weights: { skill_match: 0.35, semantic_match: 0.15, experience_match: 0.35, education_match: 0.10, certification_match: 0.05 }
  }
};

export default function WeightCustomizer({ weights, setWeights }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateWeight = (key, val) => {
    setWeights(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  const applyPreset = (presetKey) => {
    if (PRESETS[presetKey]) {
      setWeights(PRESETS[presetKey].weights);
    }
  };

  const total = Object.values(weights).reduce((a, b) => a + b, 0);

  const sliders = [
    { key: 'skill_match', label: 'Skill Match', icon: Award, desc: 'Exact & synonym skill match' },
    { key: 'semantic_match', label: 'Semantic Context', icon: Brain, desc: 'TF-IDF n-gram relevance' },
    { key: 'experience_match', label: 'Experience Fit', icon: Briefcase, desc: 'Candidate vs required yrs' },
    { key: 'education_match', label: 'Education Level', icon: GraduationCap, desc: 'Highest degree rank' },
    { key: 'certification_match', label: 'Certifications', icon: ShieldCheck, desc: 'Accredited certificates' }
  ];

  return (
    <div className="corp-card space-y-3">
      
      {/* Header bar with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-indigo-600 transition-colors text-left"
        >
          <Sliders className="w-4 h-4 text-indigo-600 flex-shrink-0" />
          <span>Scoring Model Formula</span>
          <span className="text-[11px] font-normal text-slate-500">
            ({Math.round((weights.skill_match / total) * 100)}% Skills • {Math.round((weights.semantic_match / total) * 100)}% Context • {Math.round((weights.experience_match / total) * 100)}% Exp • {Math.round((weights.education_match / total) * 100)}% Edu • {Math.round((weights.certification_match / total) * 100)}% Certs)
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />}
        </button>

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {Object.entries(PRESETS).map(([key, item]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* Expandable Sliders */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 animate-fadeIn">
          {sliders.map((s) => {
            const Icon = s.icon;
            const currentVal = weights[s.key] ?? 0.1;
            const pct = Math.round((currentVal / (total || 1)) * 100);

            return (
              <div key={s.key} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                    <Icon className="w-3.5 h-3.5 text-indigo-600" /> {s.label}
                  </span>
                  <span className="font-mono font-bold text-indigo-600 text-xs">{pct}%</span>
                </div>

                <input
                  type="range"
                  min="0.0"
                  max="1.0"
                  step="0.05"
                  value={currentVal}
                  onChange={(e) => updateWeight(s.key, e.target.value)}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <p className="text-[10px] text-slate-500 truncate">{s.desc}</p>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
