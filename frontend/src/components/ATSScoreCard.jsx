import React from 'react';
import { CheckCircle2, AlertTriangle, FileText, Zap } from 'lucide-react';

export default function ATSScoreCard({ atsData }) {
  if (!atsData) return null;

  const { overall_ats_score, rating, components, power_verbs_found, strengths, improvement_tips } = atsData;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-700 border-emerald-300 bg-emerald-50';
    if (score >= 70) return 'text-indigo-700 border-indigo-300 bg-indigo-50';
    if (score >= 50) return 'text-amber-700 border-amber-300 bg-amber-50';
    return 'text-red-700 border-red-300 bg-red-50';
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">ATS Resume Health Score</h4>
            <p className="text-xs text-slate-500">{rating}</p>
          </div>
        </div>

        <div className={`px-3.5 py-1 rounded-xl border font-mono font-extrabold text-base ${getScoreColor(overall_ats_score)}`}>
          {overall_ats_score}<span className="text-xs font-normal opacity-70">/100</span>
        </div>
      </div>

      {/* Grid of sub-scores */}
      {components && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Contact Details</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{components.contact_info}/20</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Structure & Headers</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{components.structure}/25</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Action Verbs</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{components.action_verbs}/20</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Quantifiable Metrics</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{components.quantifiable_metrics}/20</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
            <span className="text-slate-500 block text-[11px] font-semibold uppercase">Word Count & Format</span>
            <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">{components.length_formatting}/15</span>
          </div>
        </div>
      )}

      {/* Power verbs */}
      {power_verbs_found && power_verbs_found.length > 0 && (
        <div>
          <span className="text-[11px] uppercase tracking-wider text-slate-700 font-bold block mb-1.5 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Action Verbs Detected
          </span>
          <div className="flex flex-wrap gap-1.5">
            {power_verbs_found.map((verb, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-mono font-medium">
                {verb}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Strengths & Tips */}
      <div className="space-y-3 pt-2 border-t border-slate-200 text-xs">
        {strengths && strengths.length > 0 && (
          <div className="space-y-1">
            <span className="text-emerald-700 font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths
            </span>
            <ul className="list-none space-y-1 pl-4 text-slate-700">
              {strengths.map((str, i) => (
                <li key={i} className="relative before:content-['•'] before:absolute before:-left-3 before:text-emerald-500 font-medium">
                  {str}
                </li>
              ))}
            </ul>
          </div>
        )}

        {improvement_tips && improvement_tips.length > 0 && (
          <div className="space-y-1">
            <span className="text-amber-700 font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> ATS Optimization Tips
            </span>
            <ul className="list-none space-y-1 pl-4 text-slate-700">
              {improvement_tips.map((tip, i) => (
                <li key={i} className="relative before:content-['•'] before:absolute before:-left-3 before:text-amber-500 font-medium">
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
