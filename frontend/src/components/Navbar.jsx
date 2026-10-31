import React from 'react';
import { Briefcase, Users, Brain, Compass, Building } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, backendHealth }) {
  return (
    <header className="corp-navbar">
      <div className="corp-navbar-inner">
        
        {/* Brand */}
        <div className="corp-brand" onClick={() => setActiveTab('multi_job')}>
          <div className="corp-brand-icon">
            <Building className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="corp-brand-title">
              <span>MatchRank</span>
              <span className="corp-badge-ats">AI Enterprise</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">35-Position Career Matcher & Automated Screening Engine</p>
          </div>
        </div>

        {/* Corporate Nav Tabs (4 Clean Focused Workflows) */}
        <nav className="corp-nav-tabs">
          <button
            onClick={() => setActiveTab('multi_job')}
            className={`corp-nav-tab-btn ${activeTab === 'multi_job' ? 'active' : ''}`}
          >
            <Compass className={`w-4 h-4 ${activeTab === 'multi_job' ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>35 Positions Matcher</span>
          </button>

          <button
            onClick={() => setActiveTab('matcher')}
            className={`corp-nav-tab-btn ${activeTab === 'matcher' ? 'active' : ''}`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Candidate Screening</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`corp-nav-tab-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
          >
            <Users className="w-4 h-4" />
            <span>Talent Pipeline</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_intelligence')}
            className={`corp-nav-tab-btn ${activeTab === 'ai_intelligence' ? 'active' : ''}`}
          >
            <Brain className="w-4 h-4" />
            <span>AI & ML Hub</span>
          </button>
        </nav>

        {/* Recruiter Profile / Status */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <span className="pulse-dot" />
            <span>{backendHealth?.sample_jobs_available || 35} Live Positions • 460+ Skills</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="corp-avatar">HR</div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 leading-tight">Talent Acquisition</p>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise Recruiter</p>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}
