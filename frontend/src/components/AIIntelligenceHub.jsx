import React, { useState } from 'react';
import { Brain, Zap, Layers, Cpu, Sparkles, BookOpen } from 'lucide-react';
import MLModelStudio from './MLModelStudio';
import SkillExtractorPlayground from './SkillExtractorPlayground';
import TaxonomyBrowser from './TaxonomyBrowser';

export default function AIIntelligenceHub() {
  const [activeSubTab, setActiveSubTab] = useState('ml_studio'); // 'ml_studio', 'nlp_sandbox', 'taxonomy'

  return (
    <div className="space-y-6">
      
      {/* Sub-Navigation Bar */}
      <div className="corp-card p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-2xs">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">
              AI & Machine Learning Intelligence Hub
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              ML classification models, NLP entity extraction, and skills taxonomy
            </p>
          </div>
        </div>

        {/* Segmented Sub-Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('ml_studio')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'ml_studio'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Model & Accuracy</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('nlp_sandbox')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'nlp_sandbox'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>NLP Skill Sandbox</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('taxonomy')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeSubTab === 'taxonomy'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skills Database</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Views */}
      <div className="animate-fadeIn">
        {activeSubTab === 'ml_studio' && <MLModelStudio />}
        {activeSubTab === 'nlp_sandbox' && <SkillExtractorPlayground />}
        {activeSubTab === 'taxonomy' && <TaxonomyBrowser />}
      </div>

    </div>
  );
}
