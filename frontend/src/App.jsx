import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles, Play, Award, CheckSquare, RefreshCw, Layers, Cpu,
  Briefcase, FileText, Sliders, AlertCircle, Users, Zap, LayoutList, LayoutGrid, Compass, X
} from 'lucide-react';

import Navbar from './components/Navbar';
import MultiJobMatcher from './components/MultiJobMatcher';
import JobDescriptionPanel from './components/JobDescriptionPanel';
import ResumeUploader from './components/ResumeUploader';
import WeightCustomizer from './components/WeightCustomizer';
import CandidateTable from './components/CandidateTable';
import CandidateCard from './components/CandidateCard';
import CandidateDetailModal from './components/CandidateDetailModal';
import ComparisonModal from './components/ComparisonModal';
import AnalyticsSummary from './components/AnalyticsSummary';
import RecruiterPipeline from './components/RecruiterPipeline';
import AIIntelligenceHub from './components/AIIntelligenceHub';

import {
  checkHealth,
  fetchSampleJobs,
  fetchLiveMarketJobs,
  parseJobDescription,
  matchAndRankCandidates
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('multi_job'); // default to 35-position Role Finder
  const [backendHealth, setBackendHealth] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  // Clean Initial Data States
  const [sampleJobs, setSampleJobs] = useState([]);
  const [liveMarketJobs, setLiveMarketJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [parsedJd, setParsedJd] = useState(null);
  const [isParsingJd, setIsParsingJd] = useState(false);

  // Resumes
  const [files, setFiles] = useState([]);
  const [useSampleResumes, setUseSampleResumes] = useState(false);

  // Weights
  const [weights, setWeights] = useState({
    skill_match: 0.50,
    semantic_match: 0.20,
    experience_match: 0.15,
    education_match: 0.10,
    certification_match: 0.05
  });

  // Results & Leaderboard
  const [isMatching, setIsMatching] = useState(false);
  const [rankingResults, setRankingResults] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState('All');

  // Modals
  const [activeCandidateModal, setActiveCandidateModal] = useState(null);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  // Initial load - Fetch available options
  useEffect(() => {
    checkHealth().then(setBackendHealth);
    fetchSampleJobs().then(setSampleJobs).catch(console.error);
    fetchLiveMarketJobs().then(setLiveMarketJobs).catch(console.error);
  }, []);

  // Handle template selection
  const handleSelectJob = (id) => {
    setSelectedJobId(id);
    const job = sampleJobs.find(j => j.id === id);
    if (job) {
      setJobTitle(job.title);
      setJobDescription(job.description);
      setIsParsingJd(true);
      parseJobDescription(job.title, job.description)
        .then(res => {
          setParsedJd(res);
          setIsParsingJd(false);
        })
        .catch(() => setIsParsingJd(false));
    } else {
      setJobTitle('');
      setJobDescription('');
      setParsedJd(null);
    }
  };

  // Manual parse JD
  const handleParseJd = async () => {
    if (!jobDescription.trim()) return;
    setIsParsingJd(true);
    try {
      const res = await parseJobDescription(jobTitle || 'Role', jobDescription);
      setParsedJd(res);
    } catch (err) {
      console.error('Failed to parse JD:', err);
    } finally {
      setIsParsingJd(false);
    }
  };

  // Run Ranking Engine
  const handleRunMatcher = async () => {
    if (!jobDescription.trim()) {
      alert('Please enter or paste a Job Description before matching.');
      return;
    }
    if (!useSampleResumes && files.length === 0) {
      alert('Please upload candidate resumes to evaluate, or click "+ Load Benchmark Resumes".');
      return;
    }

    setIsMatching(true);
    try {
      const result = await matchAndRankCandidates({
        jobTitle: jobTitle || 'Target Role',
        jobDescription,
        weights,
        useSampleResumes,
        files
      });
      setRankingResults(result);
      setParsedJd(result.job_details);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

    } catch (err) {
      console.error('Matching failed:', err);
      alert(`Matching error: ${err.message}`);
    } finally {
      setIsMatching(false);
    }
  };

  // Toggle comparison item
  const handleToggleCompare = (idOrName) => {
    setSelectedForCompare(prev => {
      if (prev.includes(idOrName)) {
        return prev.filter(item => item !== idOrName);
      } else {
        if (prev.length >= 4) {
          alert('You can compare a maximum of 4 candidates simultaneously.');
          return prev;
        }
        return [...prev, idOrName];
      }
    });
  };

  // Filter leaderboard
  const filteredLeaderboard = (rankingResults?.leaderboard || []).filter(cand => {
    if (selectedTier !== 'All' && cand.tier !== selectedTier) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = cand.candidate_name?.toLowerCase().includes(term);
    const skillMatch = cand.skills_analysis?.matched_required?.some(s => s.toLowerCase().includes(term));
    return nameMatch || skillMatch;
  });

  const compareCandidatesList = (rankingResults?.leaderboard || []).filter(c =>
    selectedForCompare.includes(c.candidate_id || c.candidate_name)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-indigo-600 selection:text-white">
      
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        backendHealth={backendHealth}
      />

      <main className="main-wrapper">
        
        {/* TAB 1: ROLE FINDER (35 POSITIONS MATCHING ENGINE) */}
        {activeTab === 'multi_job' && (
          <MultiJobMatcher
            onSelectJobForScreening={(job) => {
              setSelectedJobId(job.job_id || job.id);
              setJobTitle(job.title);
              setJobDescription(job.description || `Title: ${job.title}\nCategory: ${job.category}\nDepartment: ${job.department}`);
              setActiveTab('matcher');
            }}
          />
        )}

        {/* TAB 2: CANDIDATE SCREENING (SPECIFIC ROLE MATCHING) */}
        {activeTab === 'matcher' && (
          <div className="space-y-6">
            
            {/* Top Action Banner */}
            <div className="corp-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                    Requisition Screening
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Single-Role Leaderboard</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Single-Requisition Candidate Screening Leaderboard
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Select any of the 35 pre-configured roles or enter custom specs, then upload multiple candidate resumes to rank them.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunMatcher}
                disabled={isMatching}
                className="corp-btn corp-btn-primary corp-btn-lg self-start sm:self-auto shadow-sm"
              >
                {isMatching ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing NLP Features...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Screening Engine</span>
                  </>
                )}
              </button>
            </div>

            {/* Step 1 & 2 Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Step 1: Job Description */}
              <JobDescriptionPanel
                sampleJobs={sampleJobs}
                liveMarketJobs={liveMarketJobs}
                selectedJobId={selectedJobId}
                onSelectJob={handleSelectJob}
                jobTitle={jobTitle}
                setJobTitle={setJobTitle}
                jobDescription={jobDescription}
                setJobDescription={setJobDescription}
                parsedJd={parsedJd}
                onParseJd={handleParseJd}
                isParsing={isParsingJd}
              />

              {/* Step 2: Resumes */}
              <ResumeUploader
                files={files}
                setFiles={setFiles}
                useSampleResumes={useSampleResumes}
                setUseSampleResumes={setUseSampleResumes}
              />

            </div>

            {/* Step 3: Scoring Model Formula Accordion */}
            <WeightCustomizer
              weights={weights}
              setWeights={setWeights}
            />

            {/* Action CTA if not yet run */}
            {!rankingResults && (
              <div className="corp-card text-center py-12 space-y-4 border-dashed border-2 border-slate-300 bg-white">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100 shadow-xs">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-800">Ready to Evaluate Candidates for this Role</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Select a job from the 35 positions above and upload candidate resumes, then click below to generate candidate rankings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunMatcher}
                  disabled={isMatching}
                  className="corp-btn corp-btn-primary corp-btn-lg"
                >
                  {isMatching ? 'Processing NLP Pipeline...' : '⚡ Match & Rank Candidates'}
                </button>
              </div>
            )}

            {/* LEADERBOARD RESULTS */}
            {rankingResults && (
              <section className="space-y-5 pt-4 border-t border-slate-200 animate-fadeIn">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-500" />
                      Candidate Ranking Leaderboard
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Ranked candidates for <b className="text-indigo-700">{rankingResults.job_details?.title}</b>
                    </p>
                  </div>

                  {/* View Mode Toggle (Table vs Grid) */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                        viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutList className="w-3.5 h-3.5" />
                      Table View
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                        viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      Grid Cards
                    </button>
                  </div>
                </div>

                {/* Analytics Summary Banner */}
                <AnalyticsSummary
                  analytics={rankingResults.analytics}
                  jobDetails={rankingResults.job_details}
                  leaderboard={rankingResults.leaderboard}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedTier={selectedTier}
                  setSelectedTier={setSelectedTier}
                  selectedForCompare={selectedForCompare}
                  onOpenCompare={() => setIsCompareModalOpen(true)}
                />

                {/* Candidate Results Render */}
                {filteredLeaderboard.length > 0 ? (
                  viewMode === 'table' ? (
                    <CandidateTable
                      leaderboard={filteredLeaderboard}
                      jobDetails={rankingResults.job_details}
                      selectedForCompare={selectedForCompare}
                      onToggleCompare={handleToggleCompare}
                      onOpenDetails={(cand) => setActiveCandidateModal(cand)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredLeaderboard.map((candidate) => (
                        <CandidateCard
                          key={candidate.candidate_id || candidate.candidate_name}
                          candidate={candidate}
                          jobDetails={rankingResults.job_details}
                          isSelectedForCompare={selectedForCompare.includes(candidate.candidate_id || candidate.candidate_name)}
                          onToggleCompare={handleToggleCompare}
                          onOpenDetails={(cand) => setActiveCandidateModal(cand)}
                        />
                      ))}
                    </div>
                  )
                ) : (
                  <div className="corp-card text-center py-12 text-slate-500 space-y-3">
                    <p className="text-sm font-semibold text-slate-700">No candidates match your search filter.</p>
                    <button
                      onClick={() => { setSearchTerm(''); setSelectedTier('All'); }}
                      className="corp-btn corp-btn-secondary corp-btn-sm"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}

              </section>
            )}

          </div>
        )}

        {/* TAB 3: TALENT CRM PIPELINE */}
        {activeTab === 'pipeline' && (
          <RecruiterPipeline
            onSelectCandidate={(cand) => setActiveCandidateModal(cand)}
          />
        )}

        {/* TAB 4: AI & ML INTELLIGENCE HUB */}
        {activeTab === 'ai_intelligence' && (
          <AIIntelligenceHub />
        )}

      </main>

      {/* Floating Comparison Tray */}
      {selectedForCompare.length > 0 && (
        <div className="floating-compare-bar">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
            <span className="text-xs font-bold text-white">
              {selectedForCompare.length} Candidate{selectedForCompare.length > 1 ? 's' : ''} Selected
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCompareModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Compare Matrix</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedForCompare([])}
            className="text-slate-400 hover:text-white p-1 text-xs transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Candidate Deep Dive Modal */}
      {activeCandidateModal && (
        <CandidateDetailModal
          candidate={activeCandidateModal}
          jobDetails={rankingResults?.job_details || parsedJd}
          onClose={() => setActiveCandidateModal(null)}
        />
      )}

      {/* Side-by-Side Comparison Modal */}
      {isCompareModalOpen && (
        <ComparisonModal
          candidates={compareCandidatesList}
          jobDetails={rankingResults?.job_details || parsedJd}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}

    </div>
  );
}
