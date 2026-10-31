import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap, Sparkles, Layers, Tag, ArrowRight, RefreshCw, BarChart2,
  CheckCircle2, Clock, Terminal, Copy, Check
} from 'lucide-react';
import { extractSkillsLive } from '../services/api';
import SkillTag from './SkillTag';

const SAMPLE_TEXTS = {
  ml_bio: "Experienced Senior Applied ML Engineer with 4 years building NLP pipelines, fine-tuning Hugging Face Transformers, PyTorch models, and deploying FastAPI microservices with Docker on AWS. Proficient in scikit-learn, Pandas, NumPy, PostgreSQL, and Prompt Engineering for LLMs / RAG pipelines.",
  fullstack_bio: "Full Stack Developer proficient in React, Next.js, TypeScript, Tailwind CSS, and Node.js. Built scalable REST APIs, GraphQL endpoints, and managed PostgreSQL and Redis caching. Familiar with Docker and GitHub Actions CI/CD pipelines.",
  devops_bio: "DevOps Infrastructure Specialist with expertise in Kubernetes (k8s), Helm, Terraform, and multi-region AWS cloud deployments. Automated CI/CD pipelines with GitLab CI, configured Prometheus and Grafana monitoring, and managed Linux servers.",
  data_bio: "Lead Data Scientist with 5 years experience in Python, Apache Spark, PySpark, BigQuery, Snowflake, and dbt. Built end-to-end ETL pipelines and predictive machine learning models in scikit-learn and XGBoost. Created executive dashboards in Tableau and PowerBI.",
  sec_bio: "Cybersecurity Analyst specializing in SOC operations, penetration testing with Burp Suite, Metasploit, and Wireshark. Skilled in OWASP top 10 vulnerability remediation, SIEM telemetry with Elasticsearch, IAM policies, and Linux network security.",
  design_bio: "Lead UI/UX Product Designer with expertise in Figma, design systems, interactive prototyping, and user research. Strong understanding of information architecture, usability testing, and collaboration with frontend teams using HTML5 and Tailwind CSS."
};

export default function SkillExtractorPlayground() {
  const [inputText, setInputText] = useState(SAMPLE_TEXTS.ml_bio);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const runExtraction = async (textToExtract) => {
    const text = textToExtract !== undefined ? textToExtract : inputText;
    if (!text || !text.trim()) {
      setResults(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await extractSkillsLive(text);
      setResults(data);
    } catch (err) {
      console.error('Skill extraction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runExtraction(SAMPLE_TEXTS.ml_bio);
  }, []);

  const loadSample = (key) => {
    const text = SAMPLE_TEXTS[key];
    setInputText(text);
    runExtraction(text);
  };

  const handleCopySkills = () => {
    if (results?.skills?.length) {
      navigator.clipboard.writeText(results.skills.join(', '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Normalize data keys (supporting backend count / categorized)
  const extractedSkills = results?.skills || [];
  const categorized = results?.categorized || results?.categories || {};
  const totalCount = results?.count ?? results?.total_count ?? extractedSkills.length;
  const occurrences = results?.occurrences || {};
  const domainDist = results?.domain_distribution || {};

  // Calculate domain percentages
  const domainBreakdown = useMemo(() => {
    const total = Object.values(domainDist).reduce((sum, n) => sum + n, 0) || 1;
    return Object.entries(domainDist)
      .map(([domain, cnt]) => ({
        domain,
        count: cnt,
        percentage: Math.round((cnt / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [domainDist]);

  return (
    <div className="space-y-6">
      
      {/* Intro Header */}
      <div className="corp-card space-y-4 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Live NLP Pipeline
                </span>
                <span className="text-xs text-slate-500 font-medium">460+ Canonical Skills</span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                NLP Skill Extraction & Ontology Sandbox
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySkills}
              disabled={extractedSkills.length === 0}
              className="corp-btn corp-btn-secondary corp-btn-sm"
              title="Copy extracted skills as comma-separated list"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Skills List</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2 pt-1 flex-wrap text-xs border-t border-slate-100">
          <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider mr-1">Load Preset:</span>
          <button
            onClick={() => loadSample('ml_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            AI / ML Engineer
          </button>
          <button
            onClick={() => loadSample('fullstack_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            Full Stack Web
          </button>
          <button
            onClick={() => loadSample('devops_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            DevOps & Cloud
          </button>
          <button
            onClick={() => loadSample('data_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            Data Scientist
          </button>
          <button
            onClick={() => loadSample('sec_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            Cybersecurity
          </button>
          <button
            onClick={() => loadSample('design_bio')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold transition-all"
          >
            UI/UX Product Design
          </button>
        </div>
      </div>

      {/* Main Grid: Input and Extracted Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Input Textarea */}
        <div className="lg:col-span-6 corp-card space-y-4 p-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                Raw Unstructured Text Input
              </label>
              <span className="text-xs text-slate-400 font-mono">{inputText.length} chars</span>
            </div>

            <textarea
              rows={11}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste candidate bio, resume section, or job requirements here..."
              className="corp-textarea font-sans text-xs leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setInputText('');
                setResults(null);
              }}
              className="corp-btn corp-btn-secondary corp-btn-sm"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => runExtraction(inputText)}
              disabled={isLoading || !inputText.trim()}
              className="corp-btn corp-btn-primary corp-btn-sm shadow-xs"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Extracting Skills...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-white" />
                  <span>Extract Skills</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Extracted Output & Domain Breakdown */}
        <div className="lg:col-span-6 corp-card space-y-4 p-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-600" /> Extracted Canonical Skills
              </h3>
              <p className="text-[11px] text-slate-500">Normalized against 460+ enterprise ontology</p>
            </div>
            <span className="font-mono font-bold text-sm text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-200">
              {totalCount} Skills Identified
            </span>
          </div>

          {/* Domain Distribution Bars */}
          {domainBreakdown.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <BarChart2 className="w-3.5 h-3.5 text-indigo-600" />
                  Domain Affinity Distribution
                </span>
                <span className="text-[11px] text-slate-500 font-mono">{domainBreakdown.length} Domains Active</span>
              </div>
              <div className="space-y-1.5">
                {domainBreakdown.slice(0, 4).map((d) => (
                  <div key={d.domain} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-medium text-slate-700">
                      <span>{d.domain}</span>
                      <span className="font-mono font-bold text-indigo-700">{d.count} ({d.percentage}%)</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Skills List */}
          {Object.keys(categorized).length > 0 ? (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {Object.entries(categorized).map(([catName, skillList]) => (
                <div key={catName} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-indigo-600" /> {catName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold">
                      {skillList.length} skills
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillList.map((skill, i) => {
                      const occ = occurrences[skill];
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200/80 shadow-2xs"
                        >
                          {skill}
                          {occ && occ > 1 && (
                            <span className="text-[10px] font-bold font-mono px-1 rounded bg-indigo-200 text-indigo-800">
                              {occ}x
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-xs text-slate-400 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No technical skills detected in the current text.</p>
              <p className="text-[11px] text-slate-400">Try loading a preset sample above or type a paragraph mentioning frameworks, libraries, or tools.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
