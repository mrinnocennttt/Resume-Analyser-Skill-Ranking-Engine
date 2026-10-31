import React, { useState } from 'react';
import { Briefcase, Sparkles, Globe, Link2, CheckCircle2, Clock, GraduationCap, Building2, Search, Filter } from 'lucide-react';
import SkillTag from './SkillTag';
import { scrapeJobUrl } from '../services/api';

export default function JobDescriptionPanel({
  sampleJobs,
  selectedJobId,
  onSelectJob,
  jobTitle,
  setJobTitle,
  jobDescription,
  setJobDescription,
  parsedJd,
  onParseJd,
  isParsing
}) {
  const [activeTab, setActiveTab] = useState('custom'); // 'custom', 'templates', 'url'
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');

  const handleScrape = async () => {
    if (!scrapeUrl.trim()) return;
    setIsScraping(true);
    try {
      const data = await scrapeJobUrl(scrapeUrl);
      if (data.title) setJobTitle(data.title);
      if (data.description) {
        setJobDescription(data.description);
        onParseJd();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const requiredSkills = parsedJd?.required_skills || [];
  const visibleSkills = showAllSkills ? requiredSkills : requiredSkills.slice(0, 8);

  // Filter templates across all 35 roles
  const sampleCategories = sampleJobs ? ['All', ...Array.from(new Set(sampleJobs.map(j => j.category)))] : [];
  const filteredTemplates = (sampleJobs || []).filter(job => {
    if (templateCategory !== 'All' && job.category !== templateCategory) return false;
    if (!templateSearch.trim()) return true;
    const term = templateSearch.toLowerCase();
    return job.title.toLowerCase().includes(term) || (job.category && job.category.toLowerCase().includes(term));
  });

  return (
    <div className="corp-card space-y-4">
      
      {/* Header */}
      <div className="corp-card-header">
        <div>
          <h2 className="corp-card-title">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            1. Target Job Requisition & Criteria
          </h2>
          <p className="corp-card-subtitle">Select from 35 industry positions, import via live URL, or write custom specs</p>
        </div>

        {/* Source Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'custom' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Custom
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1 rounded-md transition-all ${
              activeTab === 'templates' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            35 Role Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'url' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3 h-3" />
            Live URL
          </button>
        </div>
      </div>

      {/* Templates Selector across 35 Positions */}
      {activeTab === 'templates' && sampleJobs && (
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Choose from 35 Pre-configured Roles:
            </label>
            <span className="text-[11px] text-indigo-600 font-semibold font-mono">
              {sampleJobs.length} Positions Available
            </span>
          </div>

          {/* Search & Category Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search 35 roles..."
                className="corp-input pl-8 py-1.5 text-xs"
              />
            </div>
            <select
              value={templateCategory}
              onChange={(e) => setTemplateCategory(e.target.value)}
              className="corp-select text-xs py-1.5"
            >
              {sampleCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Scrollable list of 35 roles */}
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {filteredTemplates.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => onSelectJob(job.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border text-left transition-all ${
                  selectedJobId === job.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{job.title.split('(')[0].trim()}</span>
                <span className="text-[10px] opacity-70 ml-1">({job.category})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* URL Scraper Input */}
      {activeTab === 'url' && (
        <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
          <label className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-indigo-600" /> Import from Job Posting URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://company.greenhouse.io/... or https://jobs.lever.co/..."
              className="corp-input text-xs"
            />
            <button
              type="button"
              onClick={handleScrape}
              disabled={isScraping || !scrapeUrl.trim()}
              className="corp-btn corp-btn-primary corp-btn-sm"
            >
              {isScraping ? 'Importing...' : 'Fetch Specs'}
            </button>
          </div>
        </div>
      )}

      {/* Job Title */}
      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
          Requisition Title
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g. Senior Machine Learning Engineer, Lead DevOps..."
          className="corp-input font-medium"
        />
      </div>

      {/* Job Description Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Job Description & Technical Requirements
          </label>
          <button
            type="button"
            onClick={onParseJd}
            disabled={isParsing || !jobDescription.trim()}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isParsing ? 'Analyzing...' : 'Parse Competencies'}
          </button>
        </div>
        <textarea
          rows={5}
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste job description, required qualifications, and responsibilities here..."
          className="corp-textarea font-sans"
        />
      </div>

      {/* Extracted Requirements Preview */}
      {parsedJd && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Extracted Criteria
            </span>
            <div className="flex items-center gap-3 text-slate-600 font-medium text-[11px]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-blue-600" /> {parsedJd.required_experience_years || 2}+ Yrs Required
              </span>
              <span className="flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-amber-600" /> {parsedJd.required_education || "Bachelor's"} Target
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
              <span>Required Core Skills ({requiredSkills.length}):</span>
              {requiredSkills.length > 8 && (
                <button
                  type="button"
                  onClick={() => setShowAllSkills(!showAllSkills)}
                  className="text-indigo-600 hover:underline"
                >
                  {showAllSkills ? 'Show Less' : `+${requiredSkills.length - 8} more`}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {visibleSkills.map((skill, i) => (
                <span key={i} className="corp-badge corp-badge-success text-[11px]">
                  ✓ {skill}
                </span>
              ))}
              {requiredSkills.length === 0 && (
                <span className="text-xs text-slate-400 italic">No skills extracted yet. Click "Parse Competencies".</span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
