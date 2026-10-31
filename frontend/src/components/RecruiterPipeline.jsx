import React, { useState, useEffect } from 'react';
import { Users, Star, MessageSquare, CheckCircle, ArrowRight, Clock, Trash2, RefreshCw } from 'lucide-react';
import { fetchRecruiterPipeline, updateCandidatePipelineStatus } from '../services/api';

const STAGES = [
  { id: 'Reviewing', label: '📥 Under Review', headerBg: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'Shortlisted', label: '⭐ Shortlisted', headerBg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  { id: 'Interviewing', label: '🗓️ Interviewing', headerBg: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'Offer', label: '💼 Offer Extended', headerBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'Archived', label: '📦 Archived', headerBg: 'bg-slate-100 text-slate-600 border-slate-200' }
];

export default function RecruiterPipeline({ onSelectCandidate }) {
  const [pipelineData, setPipelineData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeNoteEditId, setActiveNoteEditId] = useState(null);
  const [noteText, setNoteText] = useState('');

  const loadPipeline = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRecruiterPipeline();
      setPipelineData(data);
    } catch (err) {
      console.error('Failed to load pipeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPipeline();
  }, []);

  const handleMoveStage = async (candidate, newStage) => {
    try {
      await updateCandidatePipelineStatus({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.candidate_name,
        candidate_email: candidate.candidate_email,
        job_id: candidate.job_id,
        job_title: candidate.job_title,
        overall_match: candidate.overall_match,
        tier: candidate.tier,
        status: newStage,
        notes: candidate.notes,
        rating: candidate.rating
      });
      loadPipeline();
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  const handleSaveNote = async (candidate) => {
    try {
      await updateCandidatePipelineStatus({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.candidate_name,
        candidate_email: candidate.candidate_email,
        job_id: candidate.job_id,
        job_title: candidate.job_title,
        overall_match: candidate.overall_match,
        tier: candidate.tier,
        status: candidate.status,
        notes: noteText,
        rating: candidate.rating
      });
      setActiveNoteEditId(null);
      loadPipeline();
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  const handleUpdateRating = async (candidate, newRating) => {
    try {
      await updateCandidatePipelineStatus({
        candidate_id: candidate.candidate_id,
        candidate_name: candidate.candidate_name,
        candidate_email: candidate.candidate_email,
        job_id: candidate.job_id,
        job_title: candidate.job_title,
        overall_match: candidate.overall_match,
        tier: candidate.tier,
        status: candidate.status,
        notes: candidate.notes,
        rating: newRating
      });
      loadPipeline();
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="corp-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Talent Operations
            </span>
            <span className="text-xs text-slate-500 font-medium">SQLite Realtime Persistence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Recruiter Talent CRM & Candidate Pipeline
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage hiring workflow, schedule interviews, star-rate applicants, and persist screening feedback in real-time
          </p>
        </div>

        <button
          onClick={loadPipeline}
          disabled={isLoading}
          className="corp-btn corp-btn-secondary corp-btn-sm self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const candidatesInStage = pipelineData?.[stage.id] || [];

          return (
            <div
              key={stage.id}
              className="corp-card p-4 flex flex-col justify-between min-w-[250px] bg-slate-50/70 border-slate-200"
            >
              <div>
                <div className={`flex items-center justify-between p-2.5 rounded-xl mb-3.5 border ${stage.headerBg}`}>
                  <h3 className="text-xs font-bold uppercase tracking-wider">{stage.label}</h3>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white text-slate-800 font-mono font-bold shadow-xs border border-slate-200">
                    {candidatesInStage.length}
                  </span>
                </div>

                {/* Candidate cards in this stage */}
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {candidatesInStage.map((cand) => (
                    <div
                      key={cand.id}
                      className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2.5 shadow-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{cand.candidate_name}</h4>
                          <p className="text-[10px] text-slate-500 truncate max-w-[130px]">{cand.job_title}</p>
                        </div>
                        <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                          {cand.overall_match}%
                        </span>
                      </div>

                      {/* 5-star rating */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleUpdateRating(cand, star)}
                            className="text-slate-300 hover:text-amber-500 transition-colors"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${star <= (cand.rating || 3) ? 'fill-amber-400 text-amber-500' : ''}`}
                            />
                          </button>
                        ))}
                      </div>

                      {/* Recruiter Notes */}
                      {activeNoteEditId === cand.id ? (
                        <div className="space-y-1.5 pt-1">
                          <textarea
                            rows={2}
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add recruiter feedback / screening notes..."
                            className="corp-textarea text-[11px] p-2 min-h-0"
                          />
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => setActiveNoteEditId(null)}
                              className="corp-btn corp-btn-secondary corp-btn-sm text-[10px] py-0.5 px-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveNote(cand)}
                              className="corp-btn corp-btn-primary corp-btn-sm text-[10px] py-0.5 px-2"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setActiveNoteEditId(cand.id);
                            setNoteText(cand.notes || '');
                          }}
                          className="text-[10px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-indigo-300 flex items-start gap-1.5 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0 text-indigo-600" />
                          <span className="line-clamp-2">{cand.notes || 'Click to add interview notes...'}</span>
                        </div>
                      )}

                      {/* Move Stage Selector */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 font-medium">Move to:</span>
                        <select
                          value={cand.status}
                          onChange={(e) => handleMoveStage(cand, e.target.value)}
                          className="corp-select text-[10px] py-0.5 px-1.5"
                        >
                          {STAGES.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.label.split(' ')[1]}
                            </option>
                          ))}
                        </select>
                      </div>

                    </div>
                  ))}

                  {candidatesInStage.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 italic">
                      No candidates in this stage
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2.5 text-[10px] text-slate-400 border-t border-slate-200 flex items-center justify-between mt-3">
                <span>Realtime SQLite Sync</span>
                <Clock className="w-3 h-3" />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
