'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  RefreshCw,
  Search
} from 'lucide-react';
import { ResumeData, InterviewRole } from '@/types';
import { getStoredResumes, saveResume } from '@/lib/storage';
import { SAMPLE_RESUME_A, SAMPLE_RESUME_B } from '@/lib/samples';

export default function ResumeStudioPage() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [targetRole, setTargetRole] = useState<string>('Frontend Developer');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkillInput, setNewSkillInput] = useState('');

  useEffect(() => {
    const list = getStoredResumes();
    setResumes(list);
    if (list.length > 0) {
      setActiveResume(list[0]);
      if (list[0].jobMatch?.targetRole) {
        setTargetRole(list[0].jobMatch.targetRole);
      }
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetRole', targetRole);

    try {
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      const newResume: ResumeData = data.resume;
      const updatedList = saveResume(newResume);
      setResumes(updatedList);
      setActiveResume(newResume);
      setUploadSuccess(`Successfully parsed "${file.name}" with ${newResume.parsed.confidenceScore}% extraction confidence.`);
    } catch (err: any) {
      setUploadError(err.message || 'Error occurred while processing file.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSelectSample = (sample: ResumeData) => {
    saveResume(sample);
    setActiveResume(sample);
    setTargetRole(sample.jobMatch?.targetRole || 'Frontend Developer');
    setUploadSuccess(`Loaded ${sample.parsed.fullName}.`);
    setUploadError(null);
  };

  const handleAddSkill = () => {
    if (!activeResume || !newSkillInput.trim()) return;
    const skill = newSkillInput.trim();
    if (activeResume.parsed.skills.includes(skill)) return;

    const updated: ResumeData = {
      ...activeResume,
      parsed: {
        ...activeResume.parsed,
        skills: [...activeResume.parsed.skills, skill]
      }
    };
    setActiveResume(updated);
    saveResume(updated);
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!activeResume) return;
    const updated: ResumeData = {
      ...activeResume,
      parsed: {
        ...activeResume.parsed,
        skills: activeResume.parsed.skills.filter((s) => s !== skillToRemove)
      }
    };
    setActiveResume(updated);
    saveResume(updated);
  };

  const handleFieldChange = (field: keyof ResumeData['parsed'], value: any) => {
    if (!activeResume) return;
    const updated: ResumeData = {
      ...activeResume,
      parsed: {
        ...activeResume.parsed,
        [field]: value
      }
    };
    setActiveResume(updated);
    saveResume(updated);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20 mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Resume Intelligence & Grounding</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Resume Studio & Skill Match
          </h1>
          <p className="text-sm text-slate-400">
            Upload candidate PDF/DOCX resumes, inspect extracted skills and projects, and generate role-calibrated interview questions.
          </p>
        </div>

        {activeResume && (
          <Link
            href={`/interview/setup?resumeId=${activeResume.id}&role=${encodeURIComponent(targetRole)}`}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-2"
          >
            <span>Start Interview with This Resume</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* SAMPLE SELECTOR & UPLOAD TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Slot */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Candidate Resume (PDF / DOCX)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Files are parsed locally and securely using server-side extraction. Stored in your private local browser profile.
          </p>

          {/* Drag & Drop Box */}
          <label className="border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all text-center">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 text-cyan-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-sm font-semibold text-white">Click to upload</span> or drag and drop
              <p className="text-xs text-slate-400 mt-0.5">PDF or DOCX document (Max size: 6MB)</p>
            </div>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>

          {isUploading && (
            <div className="flex items-center gap-2 text-xs text-cyan-400 animate-pulse">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Parsing document structure and extracting technical skills...</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Fictional Sample Resumes for Demonstration */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Fictional Sample Resumes</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
              Academic Testing
            </span>
          </div>
          <p className="text-xs text-slate-400">
            For academic review and testing without uploading private documents, select a pre-verified sample:
          </p>

          <div className="space-y-2.5 pt-1">
            {/* Sample A */}
            <div
              onClick={() => handleSelectSample(SAMPLE_RESUME_A)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeResume?.id === SAMPLE_RESUME_A.id
                  ? 'bg-indigo-600/20 border-cyan-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Sample A: Alex Morgan</span>
                <span className="text-[10px] text-cyan-400 font-medium">Junior Frontend Dev</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                React, Next.js 15/16, TypeScript, Redux, Tailwind CSS, Core Web Vitals optimization.
              </p>
            </div>

            {/* Sample B */}
            <div
              onClick={() => handleSelectSample(SAMPLE_RESUME_B)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                activeResume?.id === SAMPLE_RESUME_B.id
                  ? 'bg-indigo-600/20 border-cyan-500 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Sample B: Priya Sharma</span>
                <span className="text-[10px] text-violet-400 font-medium">Junior AI/ML Engineer</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                Python, PyTorch, Scikit-Learn, Transformers, FastAPI, Docker, RAG architecture.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVE RESUME PROFILE & JOB MATCH */}
      {activeResume && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Parsed Resume Details & Editable Fields */}
          <div className="lg:col-span-8 space-y-6">
            {/* Uncertainty Flags Notice if any */}
            {activeResume.parsed.uncertainExtractionFlags &&
              activeResume.parsed.uncertainExtractionFlags.length > 0 && (
                <div className="glass-panel p-4 rounded-xl border-amber-500/40 bg-amber-950/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Extraction Uncertainty Flags (Manual Verification Recommended)</span>
                  </div>
                  <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-0.5">
                    {activeResume.parsed.uncertainExtractionFlags.map((flag, idx) => (
                      <li key={idx}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Candidate Identity Card */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Candidate Identity & Contact</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    Confidence: <span className="font-bold text-cyan-400">{activeResume.parsed.confidenceScore}%</span>
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-2.5 py-1 rounded text-xs bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                  >
                    {isEditing ? 'Finish Editing' : 'Edit Profile'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeResume.parsed.fullName}
                      onChange={(e) => handleFieldChange('fullName', e.target.value)}
                      className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  ) : (
                    <div className="font-semibold text-white mt-1 text-sm">{activeResume.parsed.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Email</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeResume.parsed.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  ) : (
                    <div className="font-semibold text-slate-200 mt-1">{activeResume.parsed.email || 'Not detected'}</div>
                  )}
                </div>

                <div>
                  <label className="text-slate-400 font-medium">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={activeResume.parsed.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  ) : (
                    <div className="font-semibold text-slate-200 mt-1">{activeResume.parsed.phone || 'Not detected'}</div>
                  )}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Professional Summary</label>
                {isEditing ? (
                  <textarea
                    rows={3}
                    value={activeResume.parsed.summary}
                    onChange={(e) => handleFieldChange('summary', e.target.value)}
                    className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white"
                  />
                ) : (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800">
                    {activeResume.parsed.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Extracted Skills Tag Cloud */}
            <div className="glass-panel p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Technical & Domain Skills ({activeResume.parsed.skills.length})</span>
                </h4>
              </div>

              {/* Skills Tags */}
              <div className="flex flex-wrap gap-2">
                {activeResume.parsed.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-950/60 text-cyan-300 border border-indigo-500/30"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-slate-400 hover:text-rose-400 transition-colors"
                      title="Remove skill"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Custom Skill */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. GraphQL, Docker, PyTorch)..."
                  value={newSkillInput}
                  onChange={(e) => setNewSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 flex-1"
                />
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Experience & Projects */}
            <div className="glass-panel p-6 rounded-2xl space-y-5">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-400" />
                <span>Work Experience & Featured Projects</span>
              </h4>

              {/* Experience items */}
              <div className="space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Experience</span>
                {activeResume.parsed.experience.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{exp.title}</span>
                      <span className="text-[11px] text-cyan-400">{exp.duration}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">{exp.company}</div>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5 pt-1">
                      {exp.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Projects items */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Academic & Personal Projects</span>
                {activeResume.parsed.projects.map((proj, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{proj.name}</span>
                      <div className="flex gap-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Job-Specific Skill Match Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="glass-panel p-6 rounded-2xl space-y-4 sticky top-20">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span>Job-Specific Skill Match</span>
              </h4>

              {/* Target Role Selector */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Target Job Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Full-Stack Developer">Full-Stack Developer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="Java / Python Developer">Java / Python Developer</option>
                  <option value="Project Viva">Project Viva / College Defense</option>
                </select>
              </div>

              {/* Match Score Gauge */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center space-y-1">
                <span className="text-xs text-slate-400">Relevance Match Score</span>
                <div className="text-4xl font-black text-cyan-400">
                  {activeResume.jobMatch?.matchScore || 88}%
                </div>
                <p className="text-[11px] text-slate-400">
                  Calculated against core requirements for {targetRole}
                </p>
              </div>

              {/* Matching Skills */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-emerald-400">Matching Verified Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {(activeResume.jobMatch?.matchingSkills || ['React', 'TypeScript', 'Next.js', 'Tailwind']).map((sk) => (
                    <span key={sk} className="text-[11px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      ✓ {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="space-y-1.5 pt-2">
                <span className="text-xs font-semibold text-amber-400">Potential Skill Gaps to Review:</span>
                <div className="flex flex-wrap gap-1">
                  {(activeResume.jobMatch?.missingSkills || ['GraphQL', 'E2E Testing']).map((sk) => (
                    <span key={sk} className="text-[11px] px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      • {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Recommendations */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <span className="text-xs font-semibold text-slate-300">Preparation Guidance:</span>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-1">
                  {(activeResume.jobMatch?.recommendations || [
                    'Review architectural trade-offs from featured projects',
                    'Practice live answering under timed countdowns'
                  ]).map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <Link
                href={`/interview/setup?resumeId=${activeResume.id}&role=${encodeURIComponent(targetRole)}`}
                className="w-full mt-4 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
              >
                <span>Launch Mock Interview</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
