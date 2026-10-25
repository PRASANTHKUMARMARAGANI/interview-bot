'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  RotateCcw,
  Plus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { InterviewQuestion } from '@/types';
import { getDemoQuestionsForRole } from '@/lib/demo-engine';

export default function QuestionLabPage() {
  const [selectedRole, setSelectedRole] = useState('Frontend Developer');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Generate catalog of questions for selected role
  const questions: InterviewQuestion[] = getDemoQuestionsForRole(selectedRole, 5, 'Intermediate');

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.expectedConcepts.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 text-xs font-medium border border-violet-500/20 mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rubric Intelligence Catalog</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Question Lab & Rubric Explorer
          </h1>
          <p className="text-sm text-slate-400">
            Inspect model answers, expected concept vectors, and multi-dimensional evaluation rubrics across engineering roles.
          </p>
        </div>

        <Link
          href="/repeat-test"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Launch Repeat Lab</span>
        </Link>
      </div>

      {/* FILTER CONTROLS */}
      <div className="glass-panel p-6 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Role Select */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Target Engineering Role:</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          >
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="AI / ML Engineer">AI / ML Engineer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full-Stack Developer">Full-Stack Developer</option>
            <option value="Java / Python Developer">Java / Python Developer</option>
            <option value="Project Viva">Project Viva</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Question Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          >
            <option value="All">All Categories</option>
            <option value="HR">HR & Background</option>
            <option value="Resume-Project">Resume & Project Deep Dive</option>
            <option value="Technical">Technical Fundamentals</option>
            <option value="Problem-Solving">Problem-Solving / Architecture</option>
            <option value="Coding-Aptitude">Coding & Practical Logic</option>
          </select>
        </div>

        {/* Search Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Search Keywords:</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by concept (e.g. bundle, attention, locks)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 p-2.5 text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* QUESTION CARDS CATALOG */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800/80 hover:border-slate-700 transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-cyan-300 border border-indigo-500/20">
                      {q.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Difficulty: <span className="text-white">{q.difficulty}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white leading-relaxed">
                    Q{idx + 1}: {q.questionText}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Expected Concepts */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {q.expectedConcepts.map((concept, i) => (
                  <span key={i} className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    {concept}
                  </span>
                ))}
              </div>

              {/* Expanded Rubric Details */}
              {isExpanded && (
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-4 text-xs">
                  {/* Model Answer Hint */}
                  <div className="space-y-1">
                    <span className="font-semibold text-cyan-300 block">Exemplary Model Answer Summary:</span>
                    <p className="text-slate-300 leading-relaxed italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                      &ldquo;{q.modelAnswerHint}&rdquo;
                    </p>
                  </div>

                  {/* Rubric Criteria Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-indigo-300 block mb-1">Technical Precision Criteria:</span>
                      <p className="text-slate-400">{q.rubric.technicalCorrectness}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-emerald-300 block mb-1">Relevance Criteria:</span>
                      <p className="text-slate-400">{q.rubric.relevance}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-amber-300 block mb-1">Reasoning Criteria:</span>
                      <p className="text-slate-400">{q.rubric.reasoning}</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="font-semibold text-violet-300 block mb-1">Communication Criteria:</span>
                      <p className="text-slate-400">{q.rubric.communication}</p>
                    </div>
                  </div>

                  {/* Adaptive Follow-up Preview */}
                  {q.followUpQuestion && (
                    <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20">
                      <span className="font-semibold text-indigo-400 block mb-0.5">Adaptive Follow-Up Probe:</span>
                      <p className="text-slate-300">{q.followUpQuestion}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
