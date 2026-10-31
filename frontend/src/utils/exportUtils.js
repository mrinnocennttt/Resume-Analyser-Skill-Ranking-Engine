/**
 * Utility functions for exporting candidate leaderboards and reports.
 */

export function exportToCSV(leaderboard, jobTitle) {
  if (!leaderboard || leaderboard.length === 0) return;

  const headers = [
    "Rank",
    "Candidate Name",
    "Overall Match (%)",
    "Tier",
    "Skill Match (%)",
    "Semantic Match (%)",
    "Experience Match (%)",
    "Education Match (%)",
    "Cert Match (%)",
    "Candidate Exp (Yrs)",
    "Matched Skills",
    "Missing Skills",
    "ATS Score",
    "Email",
    "Phone"
  ];

  const rows = leaderboard.map(cand => [
    cand.rank,
    `"${cand.candidate_name}"`,
    cand.overall_match,
    `"${cand.tier}"`,
    cand.score_breakdown.skill_match,
    cand.score_breakdown.semantic_match,
    cand.score_breakdown.experience_match,
    cand.score_breakdown.education_match,
    cand.score_breakdown.certification_match,
    cand.experience_analysis.candidate_years,
    `"${(cand.skills_analysis.matched_required || []).join(', ')}"`,
    `"${(cand.skills_analysis.missing_required || []).join(', ')}"`,
    cand.ats_compatibility?.overall_ats_score || 'N/A',
    `"${cand.contact?.email || ''}"`,
    `"${cand.contact?.phone || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [
    headers.join(","),
    ...rows.map(e => e.join(","))
  ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Candidate_Rankings_${(jobTitle || "Job").replace(/\s+/g, "_")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data, filename = "Candidate_Evaluation_Report.json") {
  const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
  const link = document.createElement("a");
  link.setAttribute("href", jsonStr);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
