import React, { useState, useEffect } from 'react';
import { Layers, Search, Tag, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { fetchTaxonomy } from '../services/api';
import SkillTag from './SkillTag';

export default function TaxonomyBrowser() {
  const [taxonomy, setTaxonomy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchTaxonomy().then(setTaxonomy).catch(console.error);
  }, []);

  if (!taxonomy) return null;

  const categories = taxonomy.categories || {};
  const totalSkills = taxonomy.total_skills || 0;

  const filteredCategories = Object.entries(categories).filter(([cat, skills]) => {
    if (selectedCategory !== 'All' && cat !== selectedCategory) return false;
    if (!searchTerm.trim()) return true;
    return (
      cat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="corp-card flex flex-col md:flex-row md:items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Skills Knowledge Base & Ontology
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Curated ontology of {totalSkills}+ technical and domain competencies across {Object.keys(categories).length} categories
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search skills (e.g. React, PyTorch, Docker)..."
            className="corp-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Domains ({totalSkills})
        </button>
        {Object.keys(categories).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat} ({categories[cat].length})
          </button>
        ))}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCategories.map(([catName, skills]) => {
          const matchingSkills = searchTerm
            ? skills.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
            : skills;

          return (
            <div key={catName} className="corp-card space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {catName}
                  </h3>
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                    {skills.length} skills
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto pr-1">
                  {matchingSkills.map((s, idx) => (
                    <SkillTag key={idx} name={s} type="neutral" size="xs" />
                  ))}
                  {matchingSkills.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No skills matching "{searchTerm}"</span>
                  )}
                </div>
              </div>

              <div className="pt-2.5 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>Canonical Taxonomy Entity</span>
                <span>Ontology Node</span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
