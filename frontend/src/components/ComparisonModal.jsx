import React from 'react';
import { X, Award, Briefcase, GraduationCap, ShieldCheck, Check, AlertCircle, FileText, Download } from 'lucide-react';
import SkillTag from './SkillTag';
import { exportToCSV } from '../utils/exportUtils';

export default function ComparisonModal({ candidates, jobDetails, onClose }) {
  if (!candidates || candidates.length === 0) return null;

  return (
    <div className="corp-modal-overlay" onClick={onClose}>
      <div className="corp-modal-dialog max-w-5xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="corp-modal-header">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Side-by-Side Candidate Comparison Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparing {candidates.length} candidates against <b className="text-indigo-700">{jobDetails?.title || 'Job Requirements'}</b>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportToCSV(candidates, `Comparison_${jobDetails?.title || 'Candidates'}`)}
              className="corp-btn corp-btn-secondary corp-btn-sm"
            >
              <Download className="w-3.5 h-3.5" /> Export Matrix (CSV)
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Comparison Table */}
        <div className="p-6 max-h-[70vh] overflow-x-auto overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3.5 text-slate-600 font-bold uppercase text-[11px] w-48">Attribute</th>
                {candidates.map((c, i) => (
                  <th key={i} className="p-3.5 text-slate-900 font-bold bg-slate-100/70 border-l border-slate-200 min-w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{c.candidate_name}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {c.badge || `#${c.rank}`}
                      </span>
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                      {c.contact?.email}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              
              {/* Overall Match Score */}
              <tr className="bg-indigo-50/40 font-bold">
                <td className="p-3.5 text-indigo-900 font-bold">Overall Match Score</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 font-mono text-lg text-indigo-700 font-extrabold border-l border-slate-200">
                    {c.overall_match}%
                    <span className="text-xs text-slate-600 font-medium block">{c.tier}</span>
                  </td>
                ))}
              </tr>

              {/* Skill Match */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Skill Overlap (50%)</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 font-mono font-bold text-slate-800 border-l border-slate-200">
                    {c.score_breakdown?.skill_match}%
                  </td>
                ))}
              </tr>

              {/* Semantic Match */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Semantic Context (20%)</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 font-mono font-bold text-slate-800 border-l border-slate-200">
                    {c.score_breakdown?.semantic_match}%
                  </td>
                ))}
              </tr>

              {/* Experience Match */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Experience Fit (15%)</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 border-l border-slate-200">
                    <span className="font-mono font-bold text-slate-800 block">{c.score_breakdown?.experience_match}%</span>
                    <span className="text-[11px] text-slate-500">
                      {c.experience_analysis?.candidate_years} yrs ({c.experience_analysis?.status})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Education Match */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Education & Degree (10%)</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 border-l border-slate-200">
                    <span className="font-mono font-bold text-slate-800 block">{c.score_breakdown?.education_match}%</span>
                    <span className="text-[11px] text-slate-500">{c.education_analysis?.candidate_degree}</span>
                  </td>
                ))}
              </tr>

              {/* ATS Compatibility */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">ATS Health Score</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 border-l border-slate-200">
                    <span className="font-mono font-bold text-slate-800">
                      {c.ats_compatibility?.overall_ats_score}/100
                    </span>
                    <span className="text-[11px] text-slate-500 block">{c.ats_compatibility?.rating}</span>
                  </td>
                ))}
              </tr>

              {/* Matched Skills */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Matched Required Skills</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 border-l border-slate-200">
                    <div className="flex flex-wrap gap-1">
                      {(c.skills_analysis?.matched_required || []).map((skill, sIdx) => (
                        <SkillTag key={sIdx} name={skill} type="matched" size="xs" />
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Missing Skills */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Missing Required Skills</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 border-l border-slate-200">
                    <div className="flex flex-wrap gap-1">
                      {(c.skills_analysis?.missing_required || []).length > 0 ? (
                        c.skills_analysis.missing_required.map((skill, sIdx) => (
                          <SkillTag key={sIdx} name={skill} type="missing" size="xs" />
                        ))
                      ) : (
                        <span className="text-emerald-700 font-semibold text-xs">All Matched!</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Salary Band */}
              <tr>
                <td className="p-3.5 text-slate-700 font-semibold">Market Salary Estimate</td>
                {candidates.map((c, i) => (
                  <td key={i} className="p-3.5 font-mono font-bold text-slate-800 border-l border-slate-200">
                    {c.salary_estimate?.range_display || 'N/A'}
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="corp-modal-footer">
          <p className="text-xs text-slate-500">
            Export or select candidate names to view full individual dossiers.
          </p>
          <button
            onClick={onClose}
            className="corp-btn corp-btn-primary corp-btn-sm"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
}
