import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Briefcase, Sparkles, UploadCloud, FileText, CheckCircle2, AlertCircle,
  TrendingUp, Award, Search, Filter, ChevronRight, X, DollarSign, Brain,
  Layers, UserCheck, ShieldCheck, GraduationCap, Clock, RefreshCw, Zap,
  LayoutList, LayoutGrid, ArrowRight, Check, Compass, Trash2, PlusCircle,
  Download, HelpCircle, BookOpen, UserPlus
} from 'lucide-react';
import SkillTag from './SkillTag';
import ScoreBreakdownBar from './ScoreBreakdownBar';
import { matchResumeToAllJobs, updateCandidatePipelineStatus } from '../services/api';

const BENCHMARK_PROFILES = [
  { id: 'cand_1', label: 'Rahul Sharma', role: 'Machine Learning & NLP', exp: '6.0 yrs', skills: 'PyTorch, NLP, Docker, FastAPI', avatar: 'RS', color: 'bg-indigo-100 text-indigo-700' },
  { id: 'cand_2', label: 'Priya Patel', role: 'Senior Full Stack Web', exp: '8.0 yrs', skills: 'React, Node, TypeScript, AWS', avatar: 'PP', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'cand_3', label: 'Alex Chen', role: 'DevOps & Cloud Lead', exp: '7.0 yrs', skills: 'Kubernetes, AWS, Terraform, CI/CD', avatar: 'AC', color: 'bg-blue-100 text-blue-700' },
  { id: 'cand_4', label: 'Ananya Gupta', role: 'Lead Data Scientist', exp: '6.0 yrs', skills: 'Python, Spark, Pandas, SQL', avatar: 'AG', color: 'bg-purple-100 text-purple-700' },
  { id: 'cand_5', label: 'David Miller', role: 'Enterprise Java Backend', exp: '10.0 yrs', skills: 'Java, Spring Boot, Hibernate, SQL', avatar: 'DM', color: 'bg-amber-100 text-amber-700' },
  { id: 'cand_6', label: 'Marcus Chen', role: 'Senior Frontend Dev', exp: '5.0 yrs', skills: 'React, Next.js, Tailwind, HTML5', avatar: 'MC', color: 'bg-rose-100 text-rose-700' }
];

// Clean Light SVG Radial Gauge Component
function RadialGauge({ score, size = 110, strokeWidth = 9 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getColors = () => {
    if (score >= 80) return { stroke: '#10b981', bg: '#ecfdf5', text: 'text-emerald-700' };
    if (score >= 65) return { stroke: '#4f46e5', bg: '#eef2ff', text: 'text-indigo-700' };
    return { stroke: '#f59e0b', bg: '#fffbeb', text: 'text-amber-700' };
  };

  const colors = getColors();

  return (
    <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-2xl font-extrabold font-mono tracking-tight leading-none ${colors.text}`}>
          {score}%
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">
          Fit Match
        </span>
      </div>
    </div>
  );
}

export default function MultiJobMatcher({ onSelectJobForScreening }) {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [selectedSampleId, setSelectedSampleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [selectedJobModal, setSelectedJobModal] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [pipelineToast, setPipelineToast] = useState('');
  const [modalTab, setModalTab] = useState('breakdown'); // 'breakdown', 'skills', 'interview', 'salary'

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');

  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setSelectedSampleId('');
      setResumeText('');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setSelectedSampleId('');
      setResumeText('');
    }
  };

  const handleSelectSample = (sampleId) => {
    setSelectedSampleId(sampleId);
    setFile(null);
    setResumeText('');
  };

  const runMultiJobMatching = async (sampleOverride) => {
    const activeSampleId = sampleOverride !== undefined ? sampleOverride : selectedSampleId;
    if (!file && !resumeText.trim() && !activeSampleId) {
      alert('Please upload a resume file or select a candidate profile.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await matchResumeToAllJobs({
        file,
        resumeText,
        useSampleId: activeSampleId
      });
      setResults(data);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      // Scroll smoothly to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);

    } catch (err) {
      console.error(err);
      alert(`Role matching error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Add Candidate to Pipeline
  const handleAddToPipeline = async (job, status = 'Shortlisted') => {
    if (!results?.candidate_profile) return;
    try {
      await updateCandidatePipelineStatus({
        candidate_id: `cand_${Date.now()}`,
        candidate_name: results.candidate_profile.name || 'Candidate',
        candidate_email: results.candidate_profile.email || '',
        job_id: job.job_id || 'job_1',
        job_title: job.title,
        overall_match: job.overall_match,
        tier: job.tier,
        status: status,
        notes: `Matched with ${job.overall_match}% score in 35 Positions Career Engine.`,
        rating: job.overall_match >= 85 ? 5 : job.overall_match >= 70 ? 4 : 3
      });
      setPipelineToast(`✓ ${results.candidate_profile.name} added to pipeline for "${job.title}"!`);
      setTimeout(() => setPipelineToast(''), 3500);
    } catch (err) {
      console.error('Failed to add candidate to pipeline:', err);
    }
  };

  // Get unique categories
  const allCategories = results?.ranked_jobs
    ? ['All', ...Array.from(new Set(results.ranked_jobs.map(j => j.category)))]
    : [];

  // Filtered jobs
  const filteredJobs = (results?.ranked_jobs || []).filter(job => {
    if (selectedCategory !== 'All' && job.category !== selectedCategory) return false;
    if (selectedTier !== 'All' && job.tier !== selectedTier) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = job.title.toLowerCase().includes(term);
    const catMatch = job.category.toLowerCase().includes(term);
    const skillMatch = job.skills_analysis?.matched_required?.some(s => s.toLowerCase().includes(term));
    return titleMatch || catMatch || skillMatch;
  });

  const getRankBadge = (rank) => {
    if (rank === 1) return 'bg-amber-100 text-amber-800 border-amber-300 font-extrabold shadow-2xs';
    if (rank === 2) return 'bg-slate-200 text-slate-800 border-slate-300 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300 font-bold';
    return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
  };

  const getTierBadge = (tier) => {
    if (tier === 'Top Match') return 'corp-badge-success';
    if (tier === 'Strong Fit') return 'corp-badge-info';
    if (tier === 'Moderate Fit') return 'corp-badge-warning';
    return 'corp-badge-neutral';
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {pipelineToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-3 animate-fadeIn border border-slate-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-xs font-semibold">{pipelineToast}</span>
        </div>
      )}

      {/* Top Banner & Intake Box */}
      <div className="corp-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-indigo-600" />
                35 Positions Career Engine
              </span>
              <span className="text-xs text-slate-500 font-medium">35 Tech Positions Pre-Loaded</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Resume-to-Role Matcher & Career Fit Ranker
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Upload candidate resume or select a benchmark candidate profile to scan, rank, and identify which of the 35 pre-configured tech positions they match best.
            </p>
          </div>

          <button
            type="button"
            onClick={() => runMultiJobMatching()}
            disabled={isLoading || (!file && !resumeText.trim() && !selectedSampleId)}
            className="corp-btn corp-btn-primary corp-btn-lg self-start md:self-auto shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Evaluating 35 Positions...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-white" />
                <span>Match Across 35 Positions</span>
              </>
            )}
          </button>
        </div>

        {/* Input Intake Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
          
          {/* File Upload Box */}
          <div className="lg:col-span-6 space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              1. Upload Candidate Resume (PDF, DOCX, TXT)
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="corp-dropzone group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>

              {file ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-900">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{file.name}</span>
                    <span className="text-[11px] text-indigo-600 font-mono">({(file.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="ml-1 text-slate-400 hover:text-red-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">Document ready. Click "Match Across 35 Positions".</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-800">
                    Click to browse files or drag & drop resume here
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Supports Adobe PDF (.pdf), Microsoft Word (.docx), or plain text (.txt)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Benchmark Profiles Selector */}
          <div className="lg:col-span-6 space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Or Select a Benchmark Candidate Profile:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BENCHMARK_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectSample(p.id)}
                  className={`p-3 rounded-xl text-left text-xs border transition-all flex items-start gap-2.5 ${
                    selectedSampleId === p.id
                      ? 'bg-indigo-50 text-indigo-950 border-indigo-400 font-semibold shadow-xs ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${p.color}`}>
                    {p.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900 truncate">{p.label}</p>
                      {selectedSampleId === p.id && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0 ml-1" />}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{p.role}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{p.exp} • {p.skills}</p>
                  </div>
                </button>
              ))}
            </div>

            {selectedSampleId && (
              <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Benchmark profile selected. Click "Match Across 35 Positions" to evaluate.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* MATCH RESULTS SECTION */}
      {results && (
        <div ref={resultsRef} className="space-y-6 animate-fadeIn">
          
          {/* Top Hero Banner: Best Match & Profile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Best Match Hero Card */}
            <div className="lg:col-span-7 corp-card p-6 bg-gradient-to-br from-indigo-50/70 via-white to-emerald-50/40 border-indigo-200 space-y-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-amber-500" />
                    Top Career Recommendation #1
                  </span>
                </div>
                <span className="corp-badge corp-badge-success font-mono font-bold text-xs">
                  {results.best_match_job.tier}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {results.best_match_job.title}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Department: <b className="text-slate-800">{results.best_match_job.department}</b> • Domain: <b className="text-indigo-700">{results.best_match_job.category}</b>
                  </p>
                </div>

                <RadialGauge score={results.best_match_job.overall_match} size={105} strokeWidth={8} />
              </div>

              {results.best_match_job.summary && (
                <p className="text-xs text-slate-700 bg-white/90 p-3.5 rounded-xl border border-indigo-100 leading-relaxed font-medium shadow-xs">
                  {results.best_match_job.summary}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-indigo-100 text-xs">
                <span className="text-slate-700 flex items-center gap-1.5 font-semibold">
                  <DollarSign className="w-4 h-4 text-emerald-600" /> Market Band: <b className="text-slate-900 font-mono">{results.best_match_job.salary_range}</b>
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const fullJob = results.ranked_jobs.find(j => j.title === results.best_match_job.title) || results.ranked_jobs[0];
                      setSelectedJobModal(fullJob);
                    }}
                    className="corp-btn corp-btn-primary corp-btn-sm"
                  >
                    <span>View Fit Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const fullJob = results.ranked_jobs.find(j => j.title === results.best_match_job.title) || results.ranked_jobs[0];
                      handleAddToPipeline(fullJob, 'Shortlisted');
                    }}
                    className="corp-btn corp-btn-secondary corp-btn-sm text-indigo-700"
                    title="Add candidate to Recruiter Pipeline"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Shortlist</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Extracted Candidate Profile Card */}
            <div className="lg:col-span-5 corp-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Candidate Profile Summary
                  </h3>
                </div>
                <span className="corp-badge corp-badge-neutral text-[11px] font-mono font-bold">
                  ATS Health: {results.candidate_profile.ats_score}/100
                </span>
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">{results.candidate_profile.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{results.candidate_profile.email} • {results.candidate_profile.phone}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Experience</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">{results.candidate_profile.estimated_years_experience} Yrs</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-semibold uppercase">Degree</span>
                  <span className="font-bold text-slate-800 text-sm truncate block">{results.candidate_profile.highest_degree}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                  Extracted Competencies ({results.candidate_profile.total_skills_detected}):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                  {results.candidate_profile.top_skills.map((skill, idx) => (
                    <SkillTag key={idx} name={skill} type="category" size="xs" />
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Tier Metrics & Search/Filter Bar */}
          <div className="space-y-4">
            
            {/* Metric counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="corp-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase block tracking-wider">Total Evaluated</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">{results.total_jobs_evaluated} Roles</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>

              <div className="corp-card p-4 flex items-center justify-between border-emerald-200 bg-emerald-50/20">
                <div>
                  <span className="text-[11px] text-emerald-800 font-bold uppercase block tracking-wider">Top Match (≥80%)</span>
                  <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-0.5">{results.tier_distribution['Top Match'] || 0} Roles</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              <div className="corp-card p-4 flex items-center justify-between border-blue-200 bg-blue-50/20">
                <div>
                  <span className="text-[11px] text-blue-800 font-bold uppercase block tracking-wider">Strong Fit Tier</span>
                  <span className="text-2xl font-extrabold text-blue-700 font-mono mt-0.5">{results.tier_distribution['Strong Fit'] || 0} Roles</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-800">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>

              <div className="corp-card p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-bold uppercase block tracking-wider">Moderate / Other</span>
                  <span className="text-2xl font-extrabold text-slate-700 font-mono mt-0.5">
                    {(results.tier_distribution['Moderate Fit'] || 0) + (results.tier_distribution['Low Relevance'] || 0)} Roles
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <Layers className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and View Mode Toolbar */}
            <div className="corp-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
                {/* Search */}
                <div className="relative min-w-[200px] flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by role title, category, or skill..."
                    className="corp-input pl-9 text-xs"
                  />
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="corp-select text-xs w-auto"
                >
                  {allCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Domains (13)' : cat}
                    </option>
                  ))}
                </select>

                {/* Tier Dropdown */}
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="corp-select text-xs w-auto"
                >
                  <option value="All">All Tiers</option>
                  <option value="Top Match">Top Match (≥80%)</option>
                  <option value="Strong Fit">Strong Fit (70-79%)</option>
                  <option value="Moderate Fit">Moderate Fit (50-69%)</option>
                  <option value="Low Relevance">Low Relevance (&lt;50%)</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                    viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutList className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>

          </div>

          {/* JOB CARDS RENDER */}
          {filteredJobs.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.map((job) => {
                  const matchedSkills = job.skills_analysis?.matched_required || [];
                  const missingSkills = job.skills_analysis?.missing_required || [];

                  return (
                    <div
                      key={job.job_id}
                      onClick={() => setSelectedJobModal(job)}
                      className="corp-card p-5 space-y-4 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                    >
                      <div className="space-y-3">
                        {/* Card Header: Rank & Tier */}
                        <div className="flex items-center justify-between">
                          <span className={`px-2.5 py-1 rounded-lg text-xs border font-mono ${getRankBadge(job.rank)}`}>
                            {job.badge}
                          </span>
                          <span className={`corp-badge ${getTierBadge(job.tier)} text-[11px] font-semibold`}>
                            {job.tier}
                          </span>
                        </div>

                        {/* Title & Domain */}
                        <div>
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                            {job.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {job.category} • {job.department}
                          </p>
                        </div>

                        {/* Match Bar */}
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Overall Compatibility</span>
                            <span className="font-extrabold font-mono text-slate-900 text-sm">
                              {job.overall_match}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                job.overall_match >= 80 ? 'bg-emerald-500' :
                                job.overall_match >= 65 ? 'bg-indigo-600' : 'bg-amber-500'
                              }`}
                              style={{ width: `${job.overall_match}%` }}
                            />
                          </div>
                        </div>

                        {/* Matched Required Skills */}
                        <div>
                          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                            Matched Skills ({matchedSkills.length}/{job.required_skills_count}):
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                            {matchedSkills.length > 0 ? (
                              matchedSkills.slice(0, 5).map((skill, i) => (
                                <SkillTag key={i} name={skill} type="matched" size="xs" />
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">No exact skill overlap</span>
                            )}
                            {matchedSkills.length > 5 && (
                              <span className="text-[10px] text-slate-500 font-mono self-center">
                                +{matchedSkills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                        <span className="font-mono font-semibold text-slate-800">
                          {job.salary_range}
                        </span>
                        <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                          Fit Details <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="corp-table-container">
                <div className="overflow-x-auto">
                  <table className="corp-table">
                    <thead>
                      <tr>
                        <th style={{ width: '80px' }}>Rank</th>
                        <th>Job Position & Domain</th>
                        <th>Compatibility Score</th>
                        <th>Skill Overlap</th>
                        <th>Salary Range</th>
                        <th>Required Exp</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr
                          key={job.job_id}
                          onClick={() => setSelectedJobModal(job)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td>
                            <span className={`px-2.5 py-1 rounded-lg text-xs border font-mono ${getRankBadge(job.rank)}`}>
                              #{job.rank}
                            </span>
                          </td>
                          <td>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{job.title}</p>
                              <p className="text-xs text-slate-500">{job.category} • {job.department}</p>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <span className={`corp-badge ${getTierBadge(job.tier)} text-xs font-mono font-bold`}>
                                {job.overall_match}%
                              </span>
                              <span className="text-xs text-slate-500 font-medium">({job.tier})</span>
                            </div>
                          </td>
                          <td>
                            <span className="text-xs text-slate-700 font-semibold">
                              <b className="text-emerald-700">{job.skills_analysis?.matched_required?.length || 0}</b> / {job.required_skills_count} Skills
                            </span>
                          </td>
                          <td className="font-mono text-xs text-slate-800 font-medium">
                            {job.salary_range}
                          </td>
                          <td className="text-xs text-slate-600">
                            {job.required_experience} Yrs
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedJobModal(job);
                              }}
                              className="corp-btn corp-btn-secondary corp-btn-sm"
                            >
                              <span>Inspect</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            <div className="corp-card text-center py-16 text-slate-400 space-y-2">
              <Search className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No jobs matched your filter criteria.</p>
              <button
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedTier('All'); }}
                className="corp-btn corp-btn-secondary corp-btn-sm"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      )}

      {/* DETAIL MODAL FOR SELECTED JOB */}
      {selectedJobModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-indigo-50/40">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${getRankBadge(selectedJobModal.rank)}`}>
                    Rank #{selectedJobModal.rank}
                  </span>
                  <span className={`corp-badge ${getTierBadge(selectedJobModal.tier)} text-xs font-bold`}>
                    {selectedJobModal.tier}
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900">{selectedJobModal.title}</h2>
                <p className="text-xs text-slate-500">{selectedJobModal.category} • {selectedJobModal.department}</p>
              </div>

              <button
                onClick={() => setSelectedJobModal(null)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Controls */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/50 text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setModalTab('breakdown')}
                className={`pb-2.5 border-b-2 font-bold transition-all ${
                  modalTab === 'breakdown' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Match Score Breakdown
              </button>
              <button
                onClick={() => setModalTab('skills')}
                className={`pb-2.5 border-b-2 font-bold transition-all ${
                  modalTab === 'skills' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Skills Alignment Matrix
              </button>
              <button
                onClick={() => setModalTab('interview')}
                className={`pb-2.5 border-b-2 font-bold transition-all ${
                  modalTab === 'interview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                AI Interview Kit
              </button>
              <button
                onClick={() => setModalTab('salary')}
                className={`pb-2.5 border-b-2 font-bold transition-all ${
                  modalTab === 'salary' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Salary & Roadmap
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              
              {/* TAB 1: BREAKDOWN */}
              {modalTab === 'breakdown' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/60 border border-indigo-100">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">Composite Fit Score</span>
                      <span className="text-3xl font-extrabold text-indigo-700 font-mono">{selectedJobModal.overall_match}%</span>
                    </div>
                    <RadialGauge score={selectedJobModal.overall_match} size={75} strokeWidth={6} />
                  </div>

                  {selectedJobModal.summary && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                      {selectedJobModal.summary}
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">5-Factor Scoring Analysis:</span>
                    <ScoreBreakdownBar breakdown={selectedJobModal.score_breakdown} />
                  </div>

                  {selectedJobModal.key_strengths?.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Key Candidate Strengths:</span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {selectedJobModal.key_strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SKILLS MATRIX */}
              {modalTab === 'skills' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Matched Required Skills ({selectedJobModal.skills_analysis?.matched_required?.length || 0}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJobModal.skills_analysis?.matched_required?.map((s, i) => (
                        <SkillTag key={i} name={s} type="matched" size="sm" />
                      ))}
                    </div>
                  </div>

                  {selectedJobModal.skills_analysis?.missing_required?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                        Missing Required Skills ({selectedJobModal.skills_analysis.missing_required.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJobModal.skills_analysis.missing_required.map((s, i) => (
                          <SkillTag key={i} name={s} type="missing" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJobModal.skills_analysis?.matched_preferred?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-blue-800 uppercase tracking-wider block">
                        Matched Preferred / Bonus Skills:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJobModal.skills_analysis.matched_preferred.map((s, i) => (
                          <SkillTag key={i} name={s} type="preferred" size="sm" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: AI INTERVIEW KIT */}
              {modalTab === 'interview' && (
                <div className="space-y-4">
                  {selectedJobModal.interview_kit?.technical_questions?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedJobModal.interview_kit.technical_questions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px]">
                              Question {idx + 1} • {q.topic || 'Core Tech'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{q.difficulty || 'Medium'}</span>
                          </div>
                          <p className="font-bold text-slate-900">{q.question}</p>
                          <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100 text-[11px]">
                            <b>Look for:</b> {q.expected_answer_points}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No interview questions generated for this position.</p>
                  )}
                </div>
              )}

              {/* TAB 4: SALARY & ROADMAP */}
              {modalTab === 'salary' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Estimated Market Compensation</span>
                    <div className="text-2xl font-extrabold text-emerald-800 font-mono">
                      {selectedJobModal.salary_estimate?.estimated_annual_salary || selectedJobModal.salary_range}
                    </div>
                    <p className="text-xs text-emerald-700">Based on candidate's demonstrated skill depth and years of experience.</p>
                  </div>

                  {selectedJobModal.growth_areas?.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">Recommended Learning Roadmap:</span>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {selectedJobModal.growth_areas.map((area, i) => (
                          <li key={i} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                            <span>{area}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Position ID: {selectedJobModal.job_id}</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleAddToPipeline(selectedJobModal, 'Shortlisted');
                  }}
                  className="corp-btn corp-btn-primary corp-btn-sm shadow-xs"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Shortlist Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedJobModal(null)}
                  className="corp-btn corp-btn-secondary corp-btn-sm"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
