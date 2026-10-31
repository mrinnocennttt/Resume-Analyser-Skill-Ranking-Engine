import React from 'react';
import { Users, Award, TrendingUp, Search, Download, CheckSquare, Sparkles } from 'lucide-react';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

export default function AnalyticsSummary({
  analytics,
  jobDetails,
  leaderboard,
  searchTerm,
  setSearchTerm,
  selectedTier,
  setSelectedTier,
  selectedForCompare,
  onOpenCompare,
  viewMode,
  setViewMode
}) {
  if (!analytics || !leaderboard) return null;

  const { total_candidates, average_score, highest_score, tier_distribution } = analytics;

  return (
    <div className="space-y-4">
      
      {/* 4 Stat Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        
        <div className="corp-card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-semibold uppercase tracking-wider">Total Candidates</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{total_candidates}</span>
          </div>
        </div>

        <div className="corp-card p-4 flex items-center gap-3.5 border-amber-200 bg-amber-50/30">
          <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 flex-shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-amber-800 block font-semibold uppercase tracking-wider">Top Match</span>
            <span className="text-2xl font-extrabold text-amber-700 font-mono">{highest_score}%</span>
          </div>
        </div>

        <div className="corp-card p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block font-semibold uppercase tracking-wider">Average Score</span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">{average_score}%</span>
          </div>
        </div>

        <div className="corp-card p-4 flex items-center gap-3.5 border-emerald-200 bg-emerald-50/30">
          <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-emerald-800 block font-semibold uppercase tracking-wider">Top Match Tier</span>
            <span className="text-2xl font-extrabold text-emerald-700 font-mono">{tier_distribution?.['Top Match'] || 0}</span>
          </div>
        </div>

      </div>

      {/* Filter & Action Controls Bar */}
      <div className="corp-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search candidate or skill..."
            className="corp-input pl-9 text-xs"
          />
        </div>

        {/* Tier filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['All', 'Top Match', 'Strong Fit', 'Moderate Fit', 'Low Relevance'].map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setSelectedTier(tier)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTier === tier
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {selectedForCompare.length > 1 && (
            <button
              onClick={onOpenCompare}
              className="corp-btn corp-btn-primary corp-btn-sm"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              Compare ({selectedForCompare.length})
            </button>
          )}

          <button
            onClick={() => exportToCSV(leaderboard, jobDetails?.title)}
            className="corp-btn corp-btn-secondary corp-btn-sm"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>

          <button
            onClick={() => exportToJSON({ job: jobDetails, analytics, leaderboard }, `MatchRank_${jobDetails?.title || 'Report'}.json`)}
            className="corp-btn corp-btn-secondary corp-btn-sm"
            title="Download JSON evaluation"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
        </div>

      </div>

    </div>
  );
}
