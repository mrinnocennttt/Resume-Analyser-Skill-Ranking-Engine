import React, { useState } from 'react';
import {
  X, Award, Brain, Briefcase, GraduationCap, ShieldCheck, Mail, Phone,
  Globe, Code, FileText, CheckCircle2, AlertCircle, Download, DollarSign,
  HelpCircle, BookOpen, Star, MessageSquare, Check, Sparkles, Users
} from 'lucide-react';
import SkillTag from './SkillTag';
import ScoreBreakdownBar from './ScoreBreakdownBar';
import ATSScoreCard from './ATSScoreCard';
import { exportToJSON } from '../utils/exportUtils';
import { updateCandidatePipelineStatus } from '../services/api';

export default function CandidateDetailModal({ candidate, jobDetails, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [pipelineStatus, setPipelineStatus] = useState(candidate?.status || 'Reviewing');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [rating, setRating] = useState(candidate?.rating || 4);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!candidate) return null;

  const {
    candidate_name,
    candidate_id,
    rank,
    badge,
    overall_match,
    tier,
    contact,
    score_breakdown,
    skills_analysis,
    experience_analysis,
    education_analysis,
    certifications,
    semantic_details,
    ats_compatibility,
    explanation,
    full_raw_text,
    interview_kit,
    salary_estimate,
    learning_roadmap
  } = candidate;

  const handleUpdateStatus = async (newStatus) => {
    setPipelineStatus(newStatus);
    try {
      await updateCandidatePipelineStatus({
        candidate_id: candidate_id || candidate_name,
        candidate_name,
        candidate_email: contact?.email || '',
        job_id: jobDetails?.id || 'job_1',
        job_title: jobDetails?.title || 'Target Role',
        overall_match,
        tier,
        status: newStatus,
        notes: recruiterNote,
        rating
      });
      setSaveSuccessMsg(`Moved to ${newStatus}!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update CRM status:', err);
    }
  };

  const handleSaveNoteAndRating = async () => {
    try {
      await updateCandidatePipelineStatus({
        candidate_id: candidate_id || candidate_name,
        candidate_name,
        candidate_email: contact?.email || '',
        job_id: jobDetails?.id || 'job_1',
        job_title: jobDetails?.title || 'Target Role',
        overall_match,
        tier,
        status: pipelineStatus,
        notes: recruiterNote,
        rating
      });
      setSaveSuccessMsg('Saved to Pipeline CRM!');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const getRankBadge = () => {
    if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold';
    if (rank === 2) return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
  };

  return (
    <div className="corp-modal-overlay" onClick={onClose}>
      <div className="corp-modal-dialog" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="corp-modal-header">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl flex-shrink-0 shadow-xs">
              {candidate_name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{candidate_name}</h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase border ${getRankBadge()}`}>
                  {badge || `#${rank}`}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {tier}
                </span>
              </div>

              {/* Contact bar */}
              <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-xs text-slate-500">
                {contact?.email && contact.email !== 'Not specified' && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-indigo-600" />
                    {contact.email}
                  </span>
                )}
                {contact?.phone && contact.phone !== 'Not specified' && (
                  <span className="flex items-center gap-1 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    {contact.phone}
                  </span>
                )}
                {contact?.linkedin && (
                  <a href={contact.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                    <Globe className="w-3.5 h-3.5" /> LinkedIn
                  </a>
                )}
                {contact?.github && (
                  <a href={contact.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:underline">
                    <Code className="w-3.5 h-3.5" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Score & Close */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Overall Fit</span>
              <span className="text-2xl font-extrabold text-indigo-600 font-mono">{overall_match}%</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'overview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Screening Scorecard
          </button>
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'interview' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Interview Kit ({interview_kit?.questions?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'skills' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Skills Matrix ({skills_analysis?.matched_required?.length || 0} Matched)
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'roadmap' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Skill Gap Roadmap ({learning_roadmap?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('ats')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'ats' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ATS Resume Health ({ats_compatibility?.overall_ats_score || 0}/100)
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 py-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
              activeTab === 'raw' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Raw Resume Text
          </button>
        </div>

        {/* Modal Content */}
        <div className="corp-modal-body">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              
              {/* Market Compensation Banner */}
              {salary_estimate && (
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                        Estimated Market Compensation
                      </span>
                      <span className="text-lg font-bold text-slate-900 font-mono">
                        {salary_estimate.range_display} <span className="text-xs font-normal text-slate-500">({salary_estimate.currency})</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {salary_estimate.seniority_level}
                    </span>
                    <span className="text-xs text-slate-600">Median: <b>{salary_estimate.median_salary}</b></span>
                  </div>
                </div>
              )}

              {/* Recruiter Evaluation Summary */}
              {explanation?.summary && (
                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 space-y-1">
                  <h3 className="text-xs uppercase tracking-wider text-indigo-900 font-bold flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-indigo-600" /> Recruiter Evaluation Summary
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed">{explanation.summary}</p>
                </div>
              )}

              {/* 5-Factor Score Breakdown */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 shadow-xs">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Explainable Multi-Factor Scorecard
                </h3>
                <ScoreBreakdownBar breakdown={score_breakdown} />
              </div>

              {/* Strengths & Gaps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Core Strengths
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc font-medium">
                    {(explanation?.key_strengths || []).map((str, i) => (
                      <li key={i}>{str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-2">
                  <h4 className="text-xs uppercase tracking-wider text-red-800 font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-red-600" /> Growth Areas & Missing Gaps
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-700 pl-4 list-disc font-medium">
                    {(explanation?.growth_areas || []).length > 0 ? (
                      explanation.growth_areas.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))
                    ) : (
                      <li className="text-emerald-700 font-semibold">No major gaps identified for this role!</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* CRM Pipeline Actions Section */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-indigo-600" /> Recruiter Pipeline & CRM Actions
                  </h4>
                  {saveSuccessMsg && (
                    <span className="text-xs text-emerald-700 font-bold">{saveSuccessMsg}</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-600 font-semibold">Stage:</span>
                  {['Reviewing', 'Shortlisted', 'Interviewing', 'Offer', 'Archived'].map((stage) => (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => handleUpdateStatus(stage)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                        pipelineStatus === stage
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {stage}
                    </button>
                  ))}
                </div>

                {/* Star rating & Note */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
                  <div className="sm:col-span-4 flex items-center gap-2">
                    <span className="text-xs text-slate-600 font-semibold">Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className="text-slate-300 hover:text-amber-500 transition-colors"
                        >
                          <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-500' : ''}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="sm:col-span-8 flex gap-2">
                    <input
                      type="text"
                      value={recruiterNote}
                      onChange={(e) => setRecruiterNote(e.target.value)}
                      placeholder="Add screening feedback or interview notes..."
                      className="corp-input text-xs flex-1"
                    />
                    <button
                      onClick={handleSaveNoteAndRating}
                      className="corp-btn corp-btn-primary corp-btn-sm whitespace-nowrap"
                    >
                      Save CRM
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: AI INTERVIEW KIT */}
          {activeTab === 'interview' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-200 flex items-center justify-between text-xs text-indigo-950 font-medium">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  AI-Generated Targeted Interview Questions tailored for <b>{candidate_name}</b>
                </span>
                <span className="text-slate-500">Probing matched skills & missing gaps</span>
              </div>

              <div className="space-y-3">
                {(interview_kit?.questions || []).map((q, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider">
                        {q.category} • {q.skill}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Question #{idx + 1}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      "{q.question}"
                    </p>
                    <p className="text-[11px] text-slate-500 italic">
                      🎯 Recruiter Target: {q.target}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS MATRIX */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-emerald-200 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Core Required Skills Matched ({skills_analysis?.matched_required?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(skills_analysis?.matched_required || []).map((skill, i) => (
                    <SkillTag key={i} name={skill} type="matched" size="sm" />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-red-200 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-red-800 uppercase tracking-wider flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" /> Missing Required Skills ({skills_analysis?.missing_required?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(skills_analysis?.missing_required || []).map((skill, i) => (
                    <SkillTag key={i} name={skill} type="missing" size="sm" />
                  ))}
                </div>
              </div>

              {skills_analysis?.bonus_skills?.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-purple-200 space-y-2 shadow-xs">
                  <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                    Additional Domain Competencies ({skills_analysis.bonus_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills_analysis.bonus_skills.map((skill, i) => (
                      <SkillTag key={i} name={skill} type="bonus" size="xs" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SKILL GAP ROADMAP */}
          {activeTab === 'roadmap' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-amber-600" />
                  Actionable Skill Upskilling Roadmaps & Training Resources for Missing Requirements
                </span>
              </div>

              <div className="space-y-3">
                {(learning_roadmap || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        {item.skill}
                      </h4>
                      <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                        {item.estimated_time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">
                      <b>Curated Resource:</b> {item.recommended_resource}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      <b>Core Topics:</b> {item.key_focus_topics}
                    </p>
                  </div>
                ))}
                {(learning_roadmap || []).length === 0 && (
                  <div className="p-6 text-center text-xs text-emerald-700 font-semibold bg-emerald-50 rounded-xl border border-emerald-200">
                    ✓ No skill gaps! Candidate meets all required technical competencies.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: ATS RESUME HEALTH */}
          {activeTab === 'ats' && (
            <ATSScoreCard atsData={ats_compatibility} />
          )}

          {/* TAB 6: RAW EXTRACTED TEXT */}
          {activeTab === 'raw' && (
            <div className="space-y-2">
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed border border-slate-800">
                {full_raw_text || 'No text extracted'}
              </pre>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="corp-modal-footer">
          <button
            onClick={() => exportToJSON(candidate, `${candidate_name.replace(/\s+/g, '_')}_Evaluation.json`)}
            className="corp-btn corp-btn-secondary corp-btn-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export Scorecard (JSON)
          </button>

          <button
            onClick={onClose}
            className="corp-btn corp-btn-primary corp-btn-sm"
          >
            Close Scorecard
          </button>
        </div>

      </div>
    </div>
  );
}
