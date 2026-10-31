import React, { useRef } from 'react';
import { UploadCloud, FileText, Trash2, Users, FileCheck } from 'lucide-react';

export default function ResumeUploader({
  files,
  setFiles,
  useSampleResumes,
  setUseSampleResumes
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  };

  return (
    <div className="corp-card space-y-4">
      
      {/* Header */}
      <div className="corp-card-header">
        <div>
          <h2 className="corp-card-title">
            <FileCheck className="w-5 h-5 text-indigo-600" />
            2. Applicant Resumes Intake
          </h2>
          <p className="corp-card-subtitle">Upload candidate resumes in PDF, DOCX, or text format for automated screening</p>
        </div>

        {/* Optional Demo Candidate Toggle */}
        <button
          type="button"
          onClick={() => setUseSampleResumes(!useSampleResumes)}
          className={`corp-btn corp-btn-sm ${
            useSampleResumes ? 'corp-btn-primary' : 'corp-btn-secondary'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{useSampleResumes ? '✓ Demo Resumes Active' : '+ Load Benchmark Resumes'}</span>
        </button>
      </div>

      {/* Drag and Drop Zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="corp-dropzone group"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 border border-indigo-200 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
          <UploadCloud className="w-6 h-6" />
        </div>
        
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-800">
            Drag and drop candidate resumes here, or <span className="text-indigo-600 underline">browse files</span>
          </p>
          <p className="text-[11px] text-slate-500">Supports Adobe PDF (.pdf), Word (.docx), or plain text (.txt)</p>
        </div>
      </div>

      {/* Uploaded Resumes List */}
      {files.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Uploaded Files ({files.length}):</span>
            <button
              type="button"
              onClick={() => setFiles([])}
              className="text-red-600 hover:text-red-700 font-semibold transition-colors"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">{file.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({formatFileSize(file.size)})</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : !useSampleResumes && (
        <p className="text-center text-xs text-slate-400 py-1 italic">
          No applicant resumes uploaded yet.
        </p>
      )}

      {useSampleResumes && (
        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between">
          <span className="font-medium">✓ 6 Benchmark applicant profiles loaded for evaluation.</span>
          <button
            onClick={() => setUseSampleResumes(false)}
            className="text-xs font-semibold text-indigo-700 hover:underline"
          >
            Clear
          </button>
        </div>
      )}

    </div>
  );
}
