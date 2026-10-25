'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, Shield, GraduationCap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/80 bg-slate-950/80 mt-auto py-10 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Academic Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 p-[1px] flex items-center justify-center">
                <div className="w-full h-full rounded-[7px] bg-slate-950 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-bold text-white text-base">InterviewX AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Academic 2026
              </span>
            </div>
            <p className="text-slate-400 max-w-md leading-relaxed text-[13px]">
              &ldquo;Practice Smarter. Speak Confidently. Get Interview Ready.&rdquo;
              An enterprise-grade, conversational AI mock interviewer featuring resume-grounded questions, multi-state visual avatars, and transparent rubric evaluation.
            </p>
            <div className="flex items-center gap-2 pt-2 text-indigo-400 font-medium">
              <GraduationCap className="w-4 h-4" />
              <span>Prepared for Academic Project Demonstration — 26 October 2026</span>
            </div>
          </div>

          {/* Col 2: Core Modules */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-sm tracking-wide">Core Modules</h4>
            <ul className="space-y-1.5">
              <li><Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Candidate Dashboard</Link></li>
              <li><Link href="/resume" className="hover:text-cyan-400 transition-colors">Resume Studio & Parser</Link></li>
              <li><Link href="/interview/setup" className="hover:text-cyan-400 transition-colors">Interview Room Setup</Link></li>
              <li><Link href="/repeat-test" className="hover:text-cyan-400 transition-colors">Repeated Question Testing</Link></li>
              <li><Link href="/coding" className="hover:text-cyan-400 transition-colors">Coding Playground</Link></li>
            </ul>
          </div>

          {/* Col 3: Documentation & Settings */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-200 text-sm tracking-wide">Documentation & Lab</h4>
            <ul className="space-y-1.5">
              <li><Link href="/documentation" className="hover:text-cyan-400 transition-colors">Academic Documentation Studio</Link></li>
              <li><Link href="/questions" className="hover:text-cyan-400 transition-colors">Question Lab & Rubrics</Link></li>
              <li><Link href="/settings" className="hover:text-cyan-400 transition-colors">Settings & Gemini API</Link></li>
            </ul>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Ethical & Bias-Free Rubrics</span>
              </span>
            </div>
          </div>
        </div>

        {/* Legal & Educational Disclaimer */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p className="max-w-2xl leading-relaxed text-slate-400">
            <span className="font-semibold text-amber-400/90">Educational Practice Assessment Notice:</span> InterviewX AI evaluates responses against educational engineering rubrics to enhance candidate interview confidence. Evaluation scores and recommendations are simulated practice metrics and do not represent actual employment, corporate offers, or corporate rejections.
          </p>
          <p className="text-slate-400 whitespace-nowrap">
            &copy; 2026 InterviewX AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
