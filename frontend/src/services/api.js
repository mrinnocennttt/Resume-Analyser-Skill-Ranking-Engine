/**
 * API Service for interacting with FastAPI MatchRank Backend.
 * Supports Live URL Scraping, Live Market Jobs, Recruiter CRM Pipeline, and Persistence.
 */

const API_BASE = '/api';

export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  } catch (err) {
    console.error('Health check failed:', err);
    return { status: 'offline' };
  }
}

export async function fetchSampleJobs() {
  const res = await fetch(`${API_BASE}/sample-jobs`);
  if (!res.ok) throw new Error('Failed to fetch sample jobs');
  return await res.json();
}

export async function fetchLiveMarketJobs() {
  const res = await fetch(`${API_BASE}/live-market-jobs`);
  if (!res.ok) throw new Error('Failed to fetch live market jobs');
  return await res.json();
}

export async function scrapeJobUrl(url) {
  const res = await fetch(`${API_BASE}/scrape-job-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to scrape job URL');
  }
  return await res.json();
}

export async function fetchSampleResumes() {
  const res = await fetch(`${API_BASE}/sample-resumes`);
  if (!res.ok) throw new Error('Failed to fetch sample resumes');
  return await res.json();
}

export async function fetchTaxonomy() {
  const res = await fetch(`${API_BASE}/taxonomy`);
  if (!res.ok) throw new Error('Failed to fetch taxonomy');
  return await res.json();
}

export async function parseJobDescription(title, text) {
  const res = await fetch(`${API_BASE}/parse-jd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, text })
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to parse Job Description');
  }
  return await res.json();
}

export async function extractSkillsLive(text) {
  const res = await fetch(`${API_BASE}/extract-skills`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error('Failed to extract skills');
  return await res.json();
}

export async function matchAndRankCandidates({
  jobTitle,
  jobDescription,
  weights,
  useSampleResumes,
  files
}) {
  const formData = new FormData();
  formData.append('job_title', jobTitle || 'Software Engineer');
  formData.append('job_description', jobDescription);
  formData.append('use_sample_resumes', useSampleResumes ? 'true' : 'false');
  
  if (weights) {
    formData.append('weights_json', JSON.stringify(weights));
  }

  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
  }

  const res = await fetch(`${API_BASE}/match-and-rank`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to match and rank candidates');
  }

  return await res.json();
}

// Recruiter CRM Pipeline Endpoints
export async function fetchRecruiterPipeline() {
  const res = await fetch(`${API_BASE}/pipeline`);
  if (!res.ok) throw new Error('Failed to fetch pipeline');
  return await res.json();
}

export async function updateCandidatePipelineStatus(payload) {
  const res = await fetch(`${API_BASE}/candidate-status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update candidate status');
  return await res.json();
}

export async function matchResumeToAllJobs({ file, resumeText, useSampleId, weights }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  if (resumeText) {
    formData.append('resume_text', resumeText);
  }
  if (useSampleId) {
    formData.append('use_sample_id', useSampleId);
  }
  if (weights) {
    formData.append('weights_json', JSON.stringify(weights));
  }

  const res = await fetch(`${API_BASE}/match-resume-to-all-jobs`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Failed to match resume across 35 job positions');
  }

  return await res.json();
}

// ML Model Management & Inference APIs
export async function fetchMLModelInfo() {
  const res = await fetch(`${API_BASE}/ml-model/info`);
  if (!res.ok) throw new Error('Failed to fetch ML model metrics');
  return await res.json();
}

export async function trainMLModel() {
  const res = await fetch(`${API_BASE}/ml-model/train`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to train ML model');
  return await res.json();
}

export async function predictMLRole(text, topK = 5) {
  const res = await fetch(`${API_BASE}/ml-model/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, top_k: topK })
  });
  if (!res.ok) throw new Error('Failed to run ML prediction');
  return await res.json();
}

