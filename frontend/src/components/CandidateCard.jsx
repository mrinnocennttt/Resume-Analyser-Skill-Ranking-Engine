import React from 'react';
import { Award, Briefcase, ChevronRight, CheckCircle2, AlertCircle, CheckSquare, Square, Mail, ShieldCheck } from 'lucide-react';
import SkillTag from './SkillTag';
import ScoreBreakdownBar from './ScoreBreakdownBar';

export default function CandidateCard({
  candidate,
  jobDetails,
  isSelectedForCompare,
  onToggleCompare,
  onOpenDetails
}) {
  const {
    rank,
    badge,
    candidate_name,
    overall_match,
    tier,
    contact,
    score_breakdown,
    skills_analysis,
    experience_analysis,
    ats_compatibility,
    filename,
    salary_estimate
  } = candidate;

  const matchedList = skills_analysis?.matched_required || [];
  const missingList = skills_analysis?.missing_required || [];

  const getRankBadge = () => {
    if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold shadow-xs';
    if (rank === 2) return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
  };

  const getTierBadge = () => {
    if (tier === 'Top Match') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (tier === 'Strong Fit') return 'bg-blue-50 text-blue-800 border-blue-200';
    if (tier === 'Moderate Fit') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className={`corp-card space-y-3.5 relative transition-all ${rank === 1 ? 'border-amber-300 bg-amber-50/10' : ''}`}>
      
      {/* Top Banner for Rank 1 */}
      {rank === 1 && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 rounded-t-xl" />
      )}

      {/* Top Row: Info + Big Match Score */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-start gap-3">
          
          {/* Checkbox */}
          <button
            type="button"
            onClick={() => onToggleCompare(candidate.candidate_id || candidate.candidate_name)}
            className="mt-1 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Select to compare"
          >
            {isSelectedForCompare ? (
              <CheckSquare className="w-5 h-5 text-indigo-600" />
            ) : (
              <Square className="w-5 h-5 text-slate-300 hover:text-slate-500" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base flex-shrink-0 shadow-xs">
            {candidate_name?.charAt(0) || 'C'}
          </div>

          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{candidate_name}</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase border ${getRankBadge()}`}>
                {badge || `#${rank}`}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${getTierBadge()}`}>
                {tier}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{contact?.email || filename}</span>
              <span>•</span>
              <span className="text-slate-700 font-semibold">{experience_analysis?.candidate_years} yrs exp</span>
            </div>
          </div>
        </div>

        {/* Match Score */}
        <div className="text-right flex-shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Match Score</span>
          <span className="text-2xl font-extrabold text-indigo-600 font-mono">
            {overall_match}%
          </span>
        </div>
      </div>

      {/* Matched vs Missing Skills Summary */}
      <div className="space-y-2 text-xs">
        {/* Matched Skills */}
        <div className="space-y-1">
          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchedList.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {matchedList.slice(0, 6).map((skill, i) => (
              <SkillTag key={i} name={skill} type="matched" size="xs" />
            ))}
            {matchedList.length > 6 && (
              <span className="text-[10px] text-slate-400 self-center font-medium">+{matchedList.length - 6} more</span>
            )}
            {matchedList.length === 0 && (
              <span className="text-slate-400 italic text-[11px]">None matched</span>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        {missingList.length > 0 && (
          <div className="space-y-1">
            <span className="text-red-700 font-bold flex items-center gap-1 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" /> Missing Skills ({missingList.length}):
            </span>
            <div className="flex flex-wrap gap-1">
              {missingList.slice(0, 4).map((skill, i) => (
                <SkillTag key={i} name={skill} type="missing" size="xs" />
              ))}
              {missingList.length > 4 && (
                <span className="text-[10px] text-slate-400 self-center font-medium">+{missingList.length - 4} more</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mini metric progress bars */}
      <ScoreBreakdownBar breakdown={score_breakdown} compact={true} />

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onToggleCompare(candidate.candidate_id || candidate.candidate_name)}
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          {isSelectedForCompare ? '✓ Selected to Compare' : '+ Compare'}
        </button>

        <button
          type="button"
          onClick={() => onOpenDetails(candidate)}
          className="corp-btn corp-btn-primary corp-btn-sm"
        >
          <span>View Dossier</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
