'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Bot,
  User,
  Mic,
  MicOff,
  AlertCircle,
  FileText,
  Clock,
  Layers
} from 'lucide-react';
import {
  InterviewSession,
  InterviewQuestion,
  RepeatTestRecord,
  QuestionEvaluation
} from '@/types';
import {
  getStoredSessions,
  getStoredRepeatTests,
  saveRepeatTest,
  seedSampleCompletedSession,
  getStoredSettings
} from '@/lib/storage';
import { startSpeechRecognition, stopSpeechRecognition } from '@/lib/audio';

export default function RepeatTestPage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-slate-400">Loading repeated question testing lab...</div>}>
      <RepeatTestContent />
    </React.Suspense>
  );
}

function RepeatTestContent() {
  const searchParams = useSearchParams();

  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [retestAnswer, setRetestAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeComparison, setActiveComparison] = useState<RepeatTestRecord | null>(null);
  const [savedRecords, setSavedRecords] = useState<RepeatTestRecord[]>([]);

  useEffect(() => {
    let sList = getStoredSessions();
    if (sList.length === 0) {
      seedSampleCompletedSession();
      sList = getStoredSessions();
    }
    setSessions(sList);

    const paramSessionId = searchParams.get('sessionId');
    const paramQuestionId = searchParams.get('questionId');

    if (paramSessionId && sList.some((s) => s.id === paramSessionId)) {
      setSelectedSessionId(paramSessionId);
    } else if (sList.length > 0) {
      setSelectedSessionId(sList[0].id);
    }

    setSavedRecords(getStoredRepeatTests());
  }, [searchParams]);

  const activeSession = sessions.find((s) => s.id === selectedSessionId);
  const availableAttempts = activeSession?.attempts || [];

  useEffect(() => {
    const paramQuestionId = searchParams.get('questionId');
    if (paramQuestionId && availableAttempts.some((a) => a.question.id === paramQuestionId)) {
      setSelectedQuestionId(paramQuestionId);
    } else if (availableAttempts.length > 0) {
      setSelectedQuestionId(availableAttempts[0].question.id);
    }
  }, [selectedSessionId, availableAttempts, searchParams]);

  const currentAttempt = availableAttempts.find((a) => a.question.id === selectedQuestionId);

  const handleToggleMic = () => {
    if (isRecording) {
      stopSpeechRecognition();
      setIsRecording(false);
    } else {
      setErrorMsg(null);
      const stopFn = startSpeechRecognition({
        lang: activeSession?.language || 'en-US',
        onStart: () => setIsRecording(true),
        onResult: (text) => setRetestAnswer((prev) => prev ? `${prev} ${text}` : text),
        onError: (err) => {
          setErrorMsg(err);
          setIsRecording(false);
        },
        onEnd: () => setIsRecording(false)
      });
      if (!stopFn) setIsRecording(false);
    }
  };

  const handleSubmitRetest = async () => {
    if (!currentAttempt || !retestAnswer.trim()) {
      setErrorMsg('Please enter a response for the retest.');
      return;
    }

    setIsEvaluating(true);
    setErrorMsg(null);

    const appSettings = getStoredSettings();

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentAttempt.question,
          candidateAnswer: retestAnswer.trim(),
          targetRole: activeSession?.targetRole || 'Software Engineer',
          customKey: appSettings.apiKey || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.evaluation) {
        throw new Error(data.error || 'Retest evaluation failed.');
      }

      const newEval: QuestionEvaluation = data.evaluation;
      const originalScore = currentAttempt.evaluation?.score || 70;
      const retestScore = newEval.score;
      const delta = retestScore - originalScore;

      const newRecord: RepeatTestRecord = {
        id: `repeat-${Date.now()}`,
        originalSessionId: activeSession?.id || 'demo-session',
        questionId: currentAttempt.question.id,
        questionText: currentAttempt.question.questionText,
        category: currentAttempt.question.category,
        originalAttempt: {
          answer: currentAttempt.candidateAnswer,
          score: originalScore,
          evaluation: currentAttempt.evaluation!,
          timestamp: currentAttempt.submittedAt
        },
        repeatedAttempt: {
          answer: retestAnswer.trim(),
          score: retestScore,
          evaluation: newEval,
          timestamp: new Date().toISOString()
        },
        scoreDelta: delta,
        comparisonAnalysis: {
          completenessChange:
            delta >= 0
              ? 'The retest incorporated previously omitted concepts and deeper explanations.'
              : 'The retest was more concise but missed certain structural depth.',
          technicalAccuracyChange:
            newEval.technicalCorrectness >= (currentAttempt.evaluation?.technicalCorrectness || 0)
              ? 'Technical precision was maintained or heightened with concrete terminology.'
              : 'Minor technical ambiguity observed compared to the initial attempt.',
          reasoningChange:
            newEval.reasoning >= (currentAttempt.evaluation?.reasoning || 0)
              ? 'Better articulated architectural trade-offs and decision justifications.'
              : 'Reasoning remained consistent with baseline attempt.',
          keyImprovementsNoted: newEval.strengths,
          remainingGaps: newEval.missingConcepts
        },
        createdAt: new Date().toISOString()
      };

      const updatedRecords = saveRepeatTest(newRecord);
      setSavedRecords(updatedRecords);
      setActiveComparison(newRecord);
    } catch (err: any) {
      console.error('Retest error:', err);
      setErrorMsg(err.message || 'Error occurred during retest evaluation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-medium border border-amber-500/20 mb-2">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Dedicated Repeat-Testing Workflow</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Repeated Question Testing Lab
          </h1>
          <p className="text-sm text-slate-400">
            Re-attempt identical interview questions to measure answer delta, concept coverage, and score improvements.
          </p>
        </div>
      </div>

      {/* QUESTION SELECTOR */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            1. Select Interview Session:
          </label>
          <select
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          >
            {sessions.map((sess) => (
              <option key={sess.id} value={sess.id}>
                {sess.candidateName} — {sess.targetRole} ({new Date(sess.startedAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            2. Choose Question to Retest:
          </label>
          <select
            value={selectedQuestionId}
            onChange={(e) => {
              setSelectedQuestionId(e.target.value);
              setActiveComparison(null);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          >
            {availableAttempts.map((att, i) => (
              <option key={att.question.id} value={att.question.id}>
                Q{i + 1}: {att.question.questionText.slice(0, 70)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* QUESTION BANNER */}
      {currentAttempt && (
        <div className="glass-panel p-6 rounded-3xl space-y-2 border border-indigo-500/30">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-cyan-300 border border-indigo-500/30 font-semibold">
              {currentAttempt.question.category}
            </span>
            <span className="text-slate-400">Preserved verbatim question wording:</span>
          </div>
          <h2 className="text-lg font-bold text-white leading-relaxed">
            &ldquo;{currentAttempt.question.questionText}&rdquo;
          </h2>
        </div>
      )}

      {/* SIDE-BY-SIDE COMPARATIVE WORKSPACE */}
      {currentAttempt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Original Attempt */}
          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Attempt 1 (Original)
              </span>
              <span className="text-sm font-black text-slate-200">
                Score: {currentAttempt.evaluation?.score || 0}/100
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-slate-400 font-medium">Original Recorded Answer:</span>
              <p className="text-xs text-slate-200 italic leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                &ldquo;{currentAttempt.candidateAnswer}&rdquo;
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-400">Original Strengths:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                {(currentAttempt.evaluation?.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-400">Identified Gaps to Correct:</span>
              <ul className="text-xs text-slate-300 list-disc list-inside space-y-0.5">
                {(currentAttempt.evaluation?.missingConcepts || []).map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 2: Repeated Attempt (Retest) */}
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-cyan-500/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Attempt 2 (Retest & Improvement)
              </span>
              {activeComparison && (
                <span className="text-sm font-black text-cyan-400">
                  New Score: {activeComparison.repeatedAttempt.score}/100
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-300 block">
                Deliver an improved response addressing previously missing concepts:
              </label>
              <textarea
                rows={6}
                value={retestAnswer}
                onChange={(e) => setRetestAnswer(e.target.value)}
                placeholder="Type your refined answer here, or click 'Start Voice Recording'..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handleToggleMic}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isRecording
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/40'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Stop Recording' : 'Voice Input'}</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitRetest}
                disabled={isEvaluating || !retestAnswer.trim()}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
              >
                {isEvaluating ? (
                  <span>Evaluating Retest...</span>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Evaluate Improvement</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RETEST COMPARATIVE ANALYSIS RESULTS */}
      {activeComparison && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-emerald-500/40 bg-emerald-950/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Comparative Learning Analysis
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                Score Delta & Growth Breakdown
              </h3>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-400">Score Improvement:</span>
              <span
                className={`text-3xl font-black ${
                  activeComparison.scoreDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {activeComparison.scoreDelta >= 0 ? `+${activeComparison.scoreDelta}` : activeComparison.scoreDelta} pts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-cyan-300">Completeness Comparison:</span>
              <p className="text-slate-300 leading-relaxed">
                {activeComparison.comparisonAnalysis.completenessChange}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-indigo-300">Technical Depth:</span>
              <p className="text-slate-300 leading-relaxed">
                {activeComparison.comparisonAnalysis.technicalAccuracyChange}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-semibold text-violet-300">Reasoning & Structure:</span>
              <p className="text-slate-300 leading-relaxed">
                {activeComparison.comparisonAnalysis.reasoningChange}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 text-xs space-y-1">
            <span className="font-semibold text-emerald-400">Key Progress Evidence:</span>
            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
              {activeComparison.comparisonAnalysis.keyImprovementsNoted.map((imp, i) => (
                <li key={i}>{imp}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
