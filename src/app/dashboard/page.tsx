'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  ExternalLink
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  getStoredSessions,
  seedSampleCompletedSession,
  getStoredResumes
} from '@/lib/storage';
import { InterviewSession } from '@/types';

export default function DashboardPage() {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let s = getStoredSessions();
    if (s.length === 0) {
      seedSampleCompletedSession();
      s = getStoredSessions();
    }
    setSessions(s);
  }, []);

  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.finalAssessment);
  const totalInterviews = sessions.length;
  const completedCount = completedSessions.length;

  const avgScore =
    completedCount > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.finalAssessment?.overallScore || 0), 0) /
            completedCount
        )
      : 0;

  const bestScore =
    completedCount > 0
      ? Math.max(...completedSessions.map((s) => s.finalAssessment?.overallScore || 0))
      : 0;

  // Chart data: Score progression
  const progressionData = completedSessions
    .slice()
    .reverse()
    .map((s, idx) => ({
      name: `Session ${idx + 1}`,
      role: s.targetRole,
      score: Math.round(s.finalAssessment?.overallScore || 0)
    }));

  // Chart data: Average category scores
  const categoryScoresData = [
    {
      category: 'Technical',
      score:
        completedCount > 0
          ? Math.round(
              completedSessions.reduce(
                (acc, s) => acc + (s.finalAssessment?.categoryScores?.technicalCorrectness || 0),
                0
              ) / completedCount
            )
          : 85
    },
    {
      category: 'Relevance',
      score:
        completedCount > 0
          ? Math.round(
              completedSessions.reduce(
                (acc, s) => acc + (s.finalAssessment?.categoryScores?.relevanceAndCompleteness || 0),
                0
              ) / completedCount
            )
          : 88
    },
    {
      category: 'Reasoning',
      score:
        completedCount > 0
          ? Math.round(
              completedSessions.reduce(
                (acc, s) => acc + (s.finalAssessment?.categoryScores?.problemSolvingReasoning || 0),
                0
              ) / completedCount
            )
          : 82
    },
    {
      category: 'Communication',
      score:
        completedCount > 0
          ? Math.round(
              completedSessions.reduce(
                (acc, s) => acc + (s.finalAssessment?.categoryScores?.communicationClarity || 0),
                0
              ) / completedCount
            )
          : 90
    },
    {
      category: 'Application',
      score:
        completedCount > 0
          ? Math.round(
              completedSessions.reduce(
                (acc, s) => acc + (s.finalAssessment?.categoryScores?.practicalApplication || 0),
                0
              ) / completedCount
            )
          : 86
    }
  ];

  const handleResetSampleSession = () => {
    seedSampleCompletedSession();
    setSessions(getStoredSessions());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Practice Performance Analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Candidate Interview Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Track interview score trends, review detailed question scorecards, and identify targeted skill improvements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetSampleSession}
            className="px-3.5 py-2 rounded-xl text-xs font-medium glass-panel text-slate-300 hover:text-white border border-slate-700/60 flex items-center gap-1.5"
            title="Seed realistic completed session for demonstration"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Demo Session</span>
          </button>

          <Link
            href="/interview/setup"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Mock Interview</span>
          </Link>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Interviews */}
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Play className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{totalInterviews}</div>
          <div className="text-[11px] text-slate-400">
            {completedCount} completed assessment reports
          </div>
        </div>

        {/* Card 2: Average Score */}
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400">
            {avgScore > 0 ? `${avgScore}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400">Across all completed interviews</div>
        </div>

        {/* Card 3: Best Performance */}
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Peak Score</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {bestScore > 0 ? `${bestScore}%` : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-400">
            {bestScore >= 85 ? 'Strong Match Benchmark' : 'Candidate Benchmark'}
          </div>
        </div>

        {/* Card 4: Quick Retest Lab */}
        <div className="glass-panel p-5 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Retest Lab</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <Link
            href="/repeat-test"
            className="inline-block text-base font-bold text-amber-300 hover:text-amber-200"
          >
            Open Retest Lab &rarr;
          </Link>
          <div className="text-[11px] text-slate-400">Compare attempt deltas & growth</div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown Radar / Bar */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Competency Breakdown</h3>
            <span className="text-xs text-slate-400">Weighted Rubric Average</span>
          </div>
          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryScoresData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="category" stroke="#94A3B8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Bar dataKey="score" fill="#6366F1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Score Progression Trend */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base">Score Progression</h3>
            <span className="text-xs text-slate-400">Historical Trend</span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            {progressionData.length > 0 && mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      color: '#F8FAFC'
                    }}
                  />
                  <Bar dataKey="score" fill="#06B6D4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 space-y-2">
                <AlertCircle className="w-6 h-6 text-slate-500 mx-auto" />
                <p>Complete at least one interview to view progression trends.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RECENT SESSIONS TABLE */}
      <div className="glass-panel rounded-2xl overflow-hidden space-y-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-base">Recent Interview Sessions</h3>
            <p className="text-xs text-slate-400">
              Click on any session to inspect detailed question transcripts, rubrics, and export reports.
            </p>
          </div>
          <Link
            href="/interview/setup"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>Start New</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {sessions.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-white font-semibold text-sm">No Interview Sessions Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start your first practice session or click &ldquo;Load Demo Session&rdquo; to test with pre-evaluated sample data.
            </p>
            <button
              onClick={handleResetSampleSession}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
            >
              Load Sample Session
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Candidate & Role</th>
                  <th className="py-3 px-4 font-semibold">Mode & Difficulty</th>
                  <th className="py-3 px-4 font-semibold">Questions</th>
                  <th className="py-3 px-4 font-semibold">Score / 100</th>
                  <th className="py-3 px-4 font-semibold">Recommendation</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {sessions.map((sess) => {
                  const assessment = sess.finalAssessment;
                  const score = assessment?.overallScore;
                  return (
                    <tr key={sess.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{sess.candidateName}</div>
                        {(sess.candidateRollNo || sess.candidateVerification?.declaredRollNo) && (
                          <div className="font-mono text-cyan-400 text-[10px] font-bold">
                            Roll: {sess.candidateRollNo || sess.candidateVerification?.declaredRollNo}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-400">{sess.targetRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>{sess.mode}</div>
                        <div className="text-[11px] text-cyan-400">{sess.difficulty}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        {sess.attempts?.length || 0} / {sess.questionCount || sess.questions?.length} answered
                      </td>
                      <td className="py-3.5 px-4">
                        {score !== undefined ? (
                          <span
                            className={`font-black text-sm ${
                              score >= 85
                                ? 'text-emerald-400'
                                : score >= 65
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {score}
                          </span>
                        ) : (
                          <span className="text-slate-400">In Progress</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {assessment ? (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                              assessment.recommendation === 'Strong Match'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                                : assessment.recommendation === 'Consider Further'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {assessment.recommendation}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/assessment/${sess.id}`}
                            className="px-2.5 py-1 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 border border-indigo-500/30 font-medium"
                          >
                            View Report
                          </Link>
                          {sess.status === 'in_progress' && (
                            <Link
                              href="/interview/room"
                              className="px-2.5 py-1 rounded bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 font-medium"
                            >
                              Resume
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
