'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Play,
  FileText,
  Sparkles,
  Bot,
  Mic,
  Brain,
  RotateCcw,
  CheckCircle2,
  Code2,
  Globe,
  Award,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart2,
  Briefcase
} from 'lucide-react';
import { AIAvatar } from '@/components/avatar';
import { AvatarState } from '@/types';
import { seedSampleCompletedSession } from '@/lib/storage';

export default function LandingPage() {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  const handleSeedDemo = () => {
    seedSampleCompletedSession();
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-blue-600/20 to-cyan-400/20 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Heading & CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border-indigo-500/30 text-xs text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Next-Gen Conversational Interview Preparation</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Practice Smarter.{' '}
                <span className="text-gradient">Speak Confidently.</span>{' '}
                Get Interview Ready.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Meet <span className="font-semibold text-white">InterviewX AI</span> — your personal, enterprise-caliber AI interviewer. Analyze your resume, practice vocal mock interviews with an animated avatar, and receive transparent rubric evaluations with evidence quotes.
              </p>

              {/* Distinct Portal Entry Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  href="/candidate"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-lg shadow-cyan-500/25 flex items-center gap-2.5 transition-all group"
                >
                  <Play className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
                  <span>Student Portal (Take Interview)</span>
                </Link>

                <Link
                  href="/interviewer"
                  className="px-6 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2.5 transition-all group"
                >
                  <Briefcase className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Interviewer Portal (Review Submissions)</span>
                </Link>

                <Link
                  href="/assessment/demo-session-alex-morgan"
                  onClick={handleSeedDemo}
                  className="px-5 py-3.5 rounded-xl font-semibold text-sm glass-panel hover:bg-slate-800/80 text-amber-300 border border-amber-500/30 flex items-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Sample Student Dossier</span>
                </Link>
              </div>

              {/* Highlights Checklist */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PDF & DOCX Parsing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Voice Speech Recognition</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Telugu, Hindi & English</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Repeat-Testing Lab</span>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Interactive AI Avatar Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-5 flex flex-col items-center"
            >
              <div className="w-full max-w-md glass-panel-glow rounded-3xl p-6 sm:p-8 flex flex-col items-center border border-indigo-500/30">
                <div className="text-center mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                    Live Avatar Engine
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Interactive AI Interviewer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Click states below to test dynamic avatar reaction animations:
                  </p>
                </div>

                {/* Animated Avatar */}
                <div className="py-4">
                  <AIAvatar state={avatarState} size="xl" showStatusLabel={true} />
                </div>

                {/* Avatar State Switcher Controls */}
                <div className="grid grid-cols-5 gap-1.5 w-full mt-4 pt-4 border-t border-slate-800">
                  {(['idle', 'speaking', 'listening', 'thinking', 'success'] as AvatarState[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => setAvatarState(st)}
                      className={`px-2 py-1.5 rounded-lg text-[10px] font-semibold capitalize transition-all ${
                        avatarState === st
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/50'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Live Room Teaser */}
                <div className="mt-5 w-full bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-left">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-medium text-slate-300">Sample Question 1 of 5</span>
                    <span className="text-cyan-400">Adaptive Mode</span>
                  </div>
                  <p className="text-xs text-slate-200 italic line-clamp-2">
                    &ldquo;In your resume, you described optimizing Next.js bundle sizes by 28%. How did you identify and eliminate bottlenecks?&rdquo;
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CORE CAPABILITIES GRID */}
      <section className="py-16 bg-slate-950/60 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Enterprise Features
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Engineered for Complete Interview Preparation
            </h2>
            <p className="text-sm text-slate-400">
              From resume skill extraction to live vocal response analysis and repeated question retesting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-indigo-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Resume-Grounded Questions</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parse PDF and DOCX files to generate targeted inquiries grounded in your actual projects, frameworks, internships, and stated metrics. No hallucinated resume claims.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-violet-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
                <Mic className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Voice Speech & Text Fallback</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Browser-based speech recognition and text-to-speech engine supporting English, Telugu, and Hindi. Seamlessly fall back to typed answers anytime.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-cyan-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Calibrated Rubric Scoring</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates responses across Technical Accuracy (35%), Relevance (25%), Reasoning (20%), Communication (10%), and Practical Application (10%) with exact evidence quotes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-amber-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Repeated Question Testing</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Retest identical interview questions to measure rubric deltas, completeness gains, and conceptual improvements side-by-side.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-emerald-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Coding Challenge Playground</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Practice coding algorithmic problems with Big-O time and space complexity analysis, test case display, and senior AI code reviews in safe review-only mode.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-panel p-6 rounded-2xl space-y-3 hover:border-pink-500/40 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-base">Documentation Studio Export</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generate complete 8-section academic project reports and individual candidate assessment dossiers downloadable in formatted DOCX and PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-STEP WORKFLOW */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Structured Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              How InterviewX AI Works
            </h2>
            <p className="text-sm text-slate-400">
              Four seamless steps from upload to comprehensive assessment report.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Upload or Pick Resume',
                desc: 'Upload your PDF/DOCX resume or select one of two verified fictional sample resumes (Frontend or AI/ML).',
                href: '/resume'
              },
              {
                step: '02',
                title: 'Configure Interview',
                desc: 'Choose your target role, difficulty (Beginner to Adaptive), language (English, Telugu, Hindi), and timer limit.',
                href: '/interview/setup'
              },
              {
                step: '03',
                title: 'Live Voice Interview',
                desc: 'Interact with the animated AI interviewer. Speak via microphone or type answers with live word count.',
                href: '/interview/setup'
              },
              {
                step: '04',
                title: 'Review Score & DOCX',
                desc: 'Inspect weighted rubric scores, feedback evidence, learning resources, and export DOCX/PDF reports.',
                href: '/dashboard'
              }
            ].map((st, i) => (
              <div key={st.step} className="glass-panel p-6 rounded-2xl relative space-y-3">
                <div className="text-3xl font-black text-indigo-500/40">{st.step}</div>
                <h4 className="font-bold text-white text-base">{st.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{st.desc}</p>
                <Link
                  href={st.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 pt-2"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MULTILINGUAL & ETHICAL STANDARDS SECTION */}
      <section className="py-16 bg-slate-950/70 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
                <Globe className="w-3.5 h-3.5" />
                <span>Multilingual Support</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Practice in English, Telugu, or Hindi
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                InterviewX AI preserves technical terminology, code keywords, and framework names in their standard engineering format while translating conversational framing into Telugu and Hindi. Candidates are never penalized for accents or regional linguistic expressions.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  English (en-US)
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/70 text-indigo-300 border border-indigo-700/50">
                  తెలుగు (te-IN)
                </span>
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-violet-950/70 text-violet-300 border border-violet-700/50">
                  हिन्दी (hi-IN)
                </span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl space-y-4 border border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-bold text-white text-base">Ethical & Bias-Free Assessment</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All evaluations strictly analyze technical correctness, reasoning logic, relevance, and communication clarity against explicit rubrics. The system strictly excludes protected demographic characteristics, facial appearance, tone bias, or accent evaluations.
              </p>
              <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-3">
                <span className="font-medium text-slate-300">Practice Benchmarking:</span> All outputs are explicitly intended for educational mock interview practice and skill development.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Ace Your Next Technical Interview?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Choose your target role, test your knowledge with real-time AI feedback, and generate your comprehensive academic evaluation dossier.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/interview/setup"
              className="px-8 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-xl hover:shadow-cyan-500/25 transition-all"
            >
              Start Free Mock Interview
            </Link>
            <Link
              href="/documentation"
              className="px-8 py-3.5 rounded-xl font-bold text-sm glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
            >
              View Documentation Studio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
