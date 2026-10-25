'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Play,
  Settings2,
  User,
  Briefcase,
  FileText,
  Clock,
  Layers,
  Globe,
  Sparkles,
  Bot,
  AlertCircle,
  Volume2
} from 'lucide-react';
import {
  InterviewRole,
  InterviewDifficulty,
  InterviewLanguage,
  InterviewSession,
  ResumeData
} from '@/types';
import { getStoredResumes, saveSession, getStoredSettings } from '@/lib/storage';

const ROLE_OPTIONS: InterviewRole[] = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI / ML Engineer',
  'Data Analyst',
  'Java / Python Developer',
  'Project Viva',
  'HR & Behavioral',
  'Aptitude & Reasoning',
  'Custom Role'
];

export default function InterviewSetupPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-slate-400">Loading interview setup...</div>}>
      <InterviewSetupContent />
    </React.Suspense>
  );
}

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [candidateName, setCandidateName] = useState('Alex Morgan');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [targetRole, setTargetRole] = useState<string>('Frontend Developer');
  const [customRoleText, setCustomRoleText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [mode, setMode] = useState('Technical & System Design');
  const [language, setLanguage] = useState<InterviewLanguage>('en-US');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState<number>(120);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  useEffect(() => {
    const list = getStoredResumes();
    setResumes(list);

    const paramResumeId = searchParams.get('resumeId');
    const paramRole = searchParams.get('role');

    if (paramResumeId) {
      setSelectedResumeId(paramResumeId);
      const match = list.find((r) => r.id === paramResumeId);
      if (match?.parsed.fullName) {
        setCandidateName(match.parsed.fullName.replace(/\(.*\)/, '').trim());
      }
    } else if (list.length > 0) {
      setSelectedResumeId(list[0].id);
      if (list[0].parsed.fullName) {
        setCandidateName(list[0].parsed.fullName.replace(/\(.*\)/, '').trim());
      }
    }

    if (paramRole) {
      setTargetRole(paramRole);
    }

    const appSettings = getStoredSettings();
    setLanguage(appSettings.preferredLanguage || 'en-US');
    setDifficulty(appSettings.defaultDifficulty || 'Intermediate');
    setTtsEnabled(appSettings.ttsEnabled ?? true);
  }, [searchParams]);

  const handleStartInterview = async () => {
    setErrorNotice(null);
    const finalRole = targetRole === 'Custom Role' && customRoleText.trim() ? customRoleText.trim() : targetRole;
    const finalName = isAnonymous ? 'Anonymous Candidate' : candidateName.trim() || 'Candidate';

    const chosenResume = resumes.find((r) => r.id === selectedResumeId);
    const resumeSummary = chosenResume ? `${chosenResume.parsed.summary} Skills: ${chosenResume.parsed.skills.join(', ')}` : '';

    const appSettings = getStoredSettings();

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: finalName,
          targetRole: finalRole,
          jobDescription,
          resumeSummary,
          count: questionCount,
          difficulty,
          language,
          customKey: appSettings.apiKey || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.questions || data.questions.length === 0) {
        throw new Error(data.error || 'Failed to generate interview questions.');
      }

      const newSession: InterviewSession = {
        id: `sess-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        candidateName: finalName,
        targetRole: finalRole,
        jobDescription,
        resumeId: chosenResume?.id,
        resumeFileName: chosenResume?.fileName,
        mode,
        language,
        difficulty,
        questionCount,
        timeLimitSeconds,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        questions: data.questions,
        attempts: [],
        isDemoSession: data.isDemoFallback ?? (appSettings.provider === 'demo')
      };

      saveSession(newSession);

      startTransition(() => {
        router.push(`/interview/room?id=${newSession.id}`);
      });
    } catch (err: any) {
      console.error('Interview start error:', err);
      setErrorNotice(err.message || 'Could not initiate interview session. Please check parameters.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-cyan-400 text-xs font-medium border border-blue-500/20">
          <Settings2 className="w-3.5 h-3.5" />
          <span>Session Parameters</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Configure Your Mock Interview
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Tailor questions to your target role, select difficulty, choose voice language, and ground the discussion in your verified resume.
        </p>
      </div>

      {errorNotice && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Main Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        {/* Candidate Identity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>Candidate Name</span>
            </label>
            <input
              type="text"
              disabled={isAnonymous}
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Alex Morgan"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white disabled:opacity-50"
            />
            <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>Anonymous Evaluation Mode</span>
            </label>
          </div>

          {/* Resume Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Resume Context Source</span>
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
            >
              <option value="">None / Fresh Candidate Profile</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.fileName} ({r.parsed.fullName})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-2">
              Questions will probe real projects and skills extracted from this file.
            </p>
          </div>
        </div>

        {/* Target Role & Custom Role */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
            <span>Target Interview Role</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {ROLE_OPTIONS.map((role) => (
              <button
                type="button"
                key={role}
                onClick={() => setTargetRole(role)}
                className={`p-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                  targetRole === role
                    ? 'bg-indigo-600/30 border-cyan-400 text-cyan-300 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {targetRole === 'Custom Role' && (
            <input
              type="text"
              placeholder="Enter custom role title (e.g. Cloud Security Architect)..."
              value={customRoleText}
              onChange={(e) => setCustomRoleText(e.target.value)}
              className="w-full mt-2 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          )}
        </div>

        {/* Job Description (Optional) */}
        <div>
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target Job Description (Optional)</span>
          </label>
          <textarea
            rows={2}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste job posting requirements, key qualifications, or team tech stack..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
          />
        </div>

        {/* Multi-Grid Options: Language, Difficulty, Questions, Timer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Language */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              <span>Language</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as InterviewLanguage)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="en-US">English (en-US)</option>
              <option value="te-IN">తెలుగు - Telugu (te-IN)</option>
              <option value="hi-IN">हिन्दी - Hindi (hi-IN)</option>
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Difficulty Level</span>
            </label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Adaptive">Adaptive (Dynamic Follow-ups)</option>
            </select>
          </div>

          {/* Question Count */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Bot className="w-3.5 h-3.5 text-violet-400" />
              <span>Number of Questions</span>
            </label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value={3}>3 Questions (Quick Practice)</option>
              <option value={5}>5 Questions (Standard Mock)</option>
              <option value={8}>8 Questions (In-Depth Technical)</option>
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Time Limit / Answer</span>
            </label>
            <select
              value={timeLimitSeconds}
              onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value={60}>60 Seconds (Rapid Fire)</option>
              <option value={120}>120 Seconds (2 Minutes - Standard)</option>
              <option value={180}>180 Seconds (3 Minutes - Detailed)</option>
              <option value={0}>No Timer (Relaxed Practice)</option>
            </select>
          </div>
        </div>

        {/* Avatar Voice Toggle */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Enable Browser Text-to-Speech Voice for Interviewer Questions</span>
          </div>
          <input
            type="checkbox"
            checked={ttsEnabled}
            onChange={(e) => setTtsEnabled(e.target.checked)}
            className="rounded border-slate-700 text-indigo-600 focus:ring-0"
          />
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleStartInterview}
            disabled={isPending}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
          >
            {isPending ? (
              <span>Preparing Interview Room & Questions...</span>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Enter Live Interview Room</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
