import React from 'react';
import {
  Award, Briefcase, GraduationCap, FileText, CheckCircle2, AlertCircle,
  ChevronRight, CheckSquare, Square, Star, ExternalLink, Mail, Phone
} from 'lucide-react';
import SkillTag from './SkillTag';

export default function CandidateTable({
  leaderboard,
  jobDetails,
  selectedForCompare,
  onToggleCompare,
  onOpenDetails
}) {
  if (!leaderboard || leaderboard.length === 0) return null;

  const getScoreBadge = (score) => {
    if (score >= 80) return 'corp-badge-success';
    if (score >= 70) return 'corp-badge-info';
    if (score >= 50) return 'corp-badge-warning';
    return 'corp-badge-danger';
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold shadow-xs';
    if (rank === 2) return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  };

  return (
    <div className="corp-table-container">
      <div className="overflow-x-auto">
        <table className="corp-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <span className="sr-only">Select</span>
              </th>
              <th style={{ width: '60px' }}>Rank</th>
              <th>Candidate Information</th>
              <th>Overall Match</th>
              <th>Skills Alignment</th>
              <th>Experience</th>
              <th>Education</th>
              <th>ATS Health</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((cand) => {
              const isSelected = selectedForCompare.includes(cand.candidate_id || cand.candidate_name);
              const matchedSkills = cand.skills_analysis?.matched_required || [];
              const missingSkills = cand.skills_analysis?.missing_required || [];
              const reqTotal = jobDetails?.required_skills?.length || (matchedSkills.length + missingSkills.length);

              return (
                <tr key={cand.candidate_id || cand.candidate_name} className={isSelected ? 'bg-indigo-50/50' : ''}>
                  
                  {/* Select Box for comparison */}
                  <td>
                    <button
                      type="button"
                      onClick={() => onToggleCompare(cand.candidate_id || cand.candidate_name)}
                      className="text-slate-400 hover:text-indigo-600 focus:outline-none transition-colors"
                      title="Select to compare"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                      )}
                    </button>
                  </td>

                  {/* Rank */}
                  <td>
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs border ${getRankBadge(cand.rank)}`}>
                      #{cand.rank}
                    </span>
                  </td>

                  {/* Candidate Information */}
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0 shadow-xs">
                        {cand.candidate_name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDetails(cand)}
                            className="font-bold text-slate-900 hover:text-indigo-600 text-sm transition-colors text-left"
                          >
                            {cand.candidate_name}
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          {cand.contact?.email && (
                            <span className="truncate max-w-[160px]">{cand.contact.email}</span>
                          )}
                          <span>•</span>
                          <span className="text-slate-400 truncate max-w-[120px]">{cand.filename}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Overall Match Score */}
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`corp-badge ${getScoreBadge(cand.overall_match)} font-mono font-bold text-xs`}>
                          {cand.overall_match}%
                        </span>
                        <span className="text-xs text-slate-600 font-medium">
                          {cand.tier}
                        </span>
                      </div>
                      <div className="w-24 corp-progress-bg">
                        <div
                          className={`corp-progress-fill ${cand.overall_match >= 80 ? 'fill-emerald' : cand.overall_match >= 65 ? 'fill-indigo' : 'fill-amber'}`}
                          style={{ width: `${cand.overall_match}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Skills Alignment */}
                  <td>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-700 block">
                        <b className="text-emerald-700">{matchedSkills.length}</b> / {reqTotal} Skills Matched
                      </span>
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {matchedSkills.slice(0, 3).map((s, i) => (
                          <span key={i} className="corp-badge corp-badge-success text-[10px]">
                            ✓ {s}
                          </span>
                        ))}
                        {matchedSkills.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center font-medium">
                            +{matchedSkills.length - 3} more
                          </span>
                        )}
                        {missingSkills.length > 0 && (
                          <span className="corp-badge corp-badge-danger text-[10px]">
                            × {missingSkills.length} missing
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Experience */}
                  <td>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        {cand.experience_analysis?.candidate_years} Yrs
                      </span>
                      <span className={`text-[11px] font-medium ${cand.experience_analysis?.status === 'Qualified' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {cand.experience_analysis?.status} (Req: {cand.experience_analysis?.required_years}y)
                      </span>
                    </div>
                  </td>

                  {/* Education */}
                  <td>
                    <div>
                      <span className="text-xs font-medium text-slate-700 block truncate max-w-[130px]">
                        {cand.education_analysis?.candidate_degree || 'Bachelor'}
                      </span>
                      {cand.certifications?.length > 0 && (
                        <span className="corp-badge corp-badge-purple text-[10px] mt-0.5">
                          {cand.certifications.length} Certs
                        </span>
                      )}
                    </div>
                  </td>

                  {/* ATS Health */}
                  <td>
                    <div className="text-xs">
                      <span className="font-mono font-bold text-slate-800">
                        {cand.ats_compatibility?.overall_ats_score || 'N/A'}/100
                      </span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[100px]">
                        {cand.ats_compatibility?.rating?.split(' ')[0] || 'Good'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(cand)}
                      className="corp-btn corp-btn-secondary corp-btn-sm"
                    >
                      <span>View Dossier</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
