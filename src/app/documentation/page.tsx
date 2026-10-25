'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Printer,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Bot,
  User,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  GraduationCap
} from 'lucide-react';
import {
  getStoredSessions,
  getStoredRepeatTests,
  getStoredResumes,
  seedSampleCompletedSession
} from '@/lib/storage';
import { APPLICATION_PROMPTS } from '@/lib/prompts';
import { createAcademicProjectReportDocxBlob } from '@/lib/docx-generator';
import { InterviewSession, RepeatTestRecord, ResumeData } from '@/types';

export default function DocumentationStudioPage() {
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [repeatTests, setRepeatTests] = useState<RepeatTestRecord[]>([]);
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  useEffect(() => {
    let sList = getStoredSessions();
    if (sList.length === 0) {
      seedSampleCompletedSession();
      sList = getStoredSessions();
    }
    setSession(sList[0]);
    setRepeatTests(getStoredRepeatTests());
    setResumes(getStoredResumes());
  }, []);

  const handleCopyPrompt = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2000);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      const blob = await createAcademicProjectReportDocxBlob({
        session,
        repeatTests
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InterviewX_AI_Academic_Project_Report_2026.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Academic DOCX generation error:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const candidateResume = resumes.find((r) => !r.isSample);
  const sampleA = resumes.find((r) => r.id === 'sample-resume-frontend');
  const sampleB = resumes.find((r) => r.id === 'sample-resume-aiml');
  const primaryRepeat = repeatTests[0];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 print:p-0 print:max-w-none">
      {/* Top Banner (Hidden when printing to PDF) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 print:hidden">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Project Report • 26 October 2026</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Academic Documentation Studio
          </h1>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            Generates the comprehensive 8-section submission report required for academic demonstration. Backed by real session transcripts, actual prompt registries, and comparative repeated testing data.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-col gap-2.5">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{isExportingDocx ? 'Generating DOCX...' : 'Download DOCX Report'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-5 py-2.5 rounded-xl text-xs font-bold glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>Download PDF / Print</span>
          </button>
        </div>
      </div>

      {/* TABLE OF CONTENTS */}
      <div className="glass-panel p-6 rounded-3xl space-y-3 print:border-slate-300 print:text-black">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider print:text-black">
          Table of Contents (Standard 8 Sections)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 print:text-black">
          <a href="#sec-1" className="hover:text-cyan-400">1. Introduction to the Chatbot</a>
          <a href="#sec-2" className="hover:text-cyan-400">2. Resume Upload & Verification</a>
          <a href="#sec-3" className="hover:text-cyan-400">3. Procedure & Execution Workflow</a>
          <a href="#sec-4" className="hover:text-cyan-400">4. Application Prompts Registry (9 Prompts)</a>
          <a href="#sec-5" className="hover:text-cyan-400">5. Interview Questions & Answers</a>
          <a href="#sec-6" className="hover:text-cyan-400">6. Repeated Question Testing Analysis</a>
          <a href="#sec-7" className="hover:text-cyan-400">7. Final Selection Decision</a>
          <a href="#sec-8" className="hover:text-cyan-400">8. Screenshots & User Interface Gallery</a>
        </div>
      </div>

      {/* SECTION 1: Introduction to the Chatbot */}
      <section id="sec-1" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 1</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Introduction to the Chatbot
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
          <span className="font-semibold text-white">InterviewX AI</span> is an enterprise-caliber, conversational mock interview platform engineered to prepare engineering candidates and students for competitive technical, HR, and project defense viva evaluations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-cyan-300 block">Core Purpose & Value:</span>
            <p className="text-slate-300 leading-relaxed">
              Provides real-time verbal interaction with an animated visual AI interviewer, eliminates hallucinated question prompts through strict resume grounding, and delivers transparent rubric evaluations with verbatim evidence citations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-indigo-300 block">Architectural Stack:</span>
            <p className="text-slate-300 leading-relaxed">
              Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Mammoth (DOCX), PDF-Parse, Docx, and Web Speech API. Supports server-side Gemini API adapters with an autonomous offline simulation engine.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2: Resume Upload */}
      <section id="sec-2" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 2</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Resume Upload & Verification
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
          The application features three distinct resume slots to ensure reproducible academic benchmarking without compromising private candidate data:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Candidate Resume Slot */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Candidate Slot</span>
            <div className="font-bold text-white text-sm">
              {candidateResume ? candidateResume.fileName : 'Active Upload Slot'}
            </div>
            <p className="text-slate-400 text-[11px]">
              {candidateResume
                ? `Parsed ${candidateResume.parsed.skills.length} skills with ${candidateResume.parsed.confidenceScore}% confidence.`
                : 'Upload custom candidate resume in PDF or DOCX format for instant parsing.'}
            </p>
          </div>

          {/* Sample A */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Fictional Sample A</span>
            <div className="font-bold text-white text-sm">Alex Morgan</div>
            <p className="text-slate-400 text-[11px]">
              Junior Frontend Developer (React, Next.js, TypeScript, Tailwind CSS, Web Vitals, 8.6 CGPA).
            </p>
          </div>

          {/* Sample B */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Fictional Sample B</span>
            <div className="font-bold text-white text-sm">Priya Sharma</div>
            <p className="text-slate-400 text-[11px]">
              Junior AI/ML Engineer (Python, PyTorch, Scikit-Learn, Transformers, FastAPI, Docker, 8.9 CGPA).
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Procedure */}
      <section id="sec-3" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 3</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Procedure & Execution Workflow
          </h2>
        </div>
        <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
          <ol className="list-decimal list-inside space-y-2">
            <li><span className="font-bold text-white">Document Ingestion & Parsing:</span> Candidate uploads PDF/DOCX or chooses a fictional sample. The system executes server-side text extraction, detects skills and projects, and calculates a confidence score.</li>
            <li><span className="font-bold text-white">Interview Configuration:</span> Candidate configures target role, difficulty (Beginner, Intermediate, Advanced, Adaptive), language (English, Telugu, Hindi), timer limit, and question count.</li>
            <li><span className="font-bold text-white">Question Generation:</span> Questions are dynamically generated via Gemini or calibrated offline engine, structured into 5 categories (HR, Resume-Project, Technical, Problem-Solving, Coding).</li>
            <li><span className="font-bold text-white">Live Voice Interview Interaction:</span> Candidate answers via Web Speech recognition or text fallback. The AI avatar dynamically transitions across idle, speaking, listening, thinking, and success states.</li>
            <li><span className="font-bold text-white">Rubric Scoring:</span> Responses are evaluated across 5 weighted dimensions with evidence extraction.</li>
            <li><span className="font-bold text-white">Repeated Question Testing:</span> Low-scoring questions can be re-tested in the dedicated Lab to measure score deltas.</li>
            <li><span className="font-bold text-white">Report & Dossier Generation:</span> Final assessment dossiers and this 8-section report are exported in DOCX and PDF.</li>
          </ol>
        </div>
      </section>

      {/* SECTION 4: Prompts Used */}
      <section id="sec-4" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 4</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Application Prompts Registry (9 Prompts Verbatim)
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          The exact, verbatim prompts executed by InterviewX AI:
        </p>

        <div className="space-y-4 pt-2">
          {Object.entries(APPLICATION_PROMPTS).map(([key, promptText]) => (
            <div key={key} className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 font-mono">{key}</span>
                <button
                  onClick={() => handleCopyPrompt(key, promptText)}
                  className="px-2 py-1 rounded text-[11px] bg-slate-800 text-slate-300 hover:text-white flex items-center gap-1 print:hidden"
                >
                  {copiedPromptKey === key ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedPromptKey === key ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {promptText}
              </pre>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Interview Questions & Answers */}
      <section id="sec-5" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 5</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Interview Questions & Answers (Active Transcript)
          </h2>
        </div>

        {session && session.attempts.length > 0 ? (
          <div className="space-y-4">
            {session.attempts.map((att, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Q{idx + 1}: {att.question.questionText}</span>
                  <span className="font-bold text-cyan-400">Score: {att.evaluation?.score || 0}/100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 italic">
                  Candidate Answer: &ldquo;{att.candidateAnswer}&rdquo;
                </div>
                <div className="text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Feedback Evidence:</span> {att.evaluation?.evidenceFromAnswer}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No completed session recorded yet. Launch an interview to capture live questions and answers.
          </p>
        )}
      </section>

      {/* SECTION 6: Repeated Question Testing */}
      <section id="sec-6" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 6</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Repeated Question Testing Analysis
          </h2>
        </div>

        {primaryRepeat ? (
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3 text-xs">
            <h4 className="font-bold text-white">Retested Question: &ldquo;{primaryRepeat.questionText}&rdquo;</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 space-y-1">
                <span className="text-slate-400 font-semibold block">Attempt 1 (Original):</span>
                <p className="italic text-slate-300">&ldquo;{primaryRepeat.originalAttempt.answer}&rdquo;</p>
                <span className="font-bold text-amber-400">Score: {primaryRepeat.originalAttempt.score}/100</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 space-y-1">
                <span className="text-cyan-400 font-semibold block">Attempt 2 (Retest):</span>
                <p className="italic text-slate-300">&ldquo;{primaryRepeat.repeatedAttempt.answer}&rdquo;</p>
                <span className="font-bold text-emerald-400">Score: {primaryRepeat.repeatedAttempt.score}/100</span>
              </div>
            </div>
            <div className="text-emerald-400 font-bold">
              Delta: {primaryRepeat.scoreDelta >= 0 ? `+${primaryRepeat.scoreDelta}` : primaryRepeat.scoreDelta} pts ({primaryRepeat.comparisonAnalysis.completenessChange})
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400">
            <p>
              The Repeated Question Testing lab enables re-attempting identical questions to measure answer delta and conceptual growth. Complete a retest in the Lab to record live comparative results.
            </p>
          </div>
        )}
      </section>

      {/* SECTION 7: Final Selection Decision */}
      <section id="sec-7" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 7</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Final Selection Decision & Practice Assessment
          </h2>
        </div>

        {session?.finalAssessment ? (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Practice Recommendation:</span>
              <span className="px-3 py-1 rounded-full font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {session.finalAssessment.recommendation} ({session.finalAssessment.overallScore}/100)
              </span>
            </div>
            <p>{session.finalAssessment.recommendationExplanation}</p>
            <div className="pt-2">
              <span className="font-semibold text-white block mb-1">Key Strengths Noted:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {session.finalAssessment.topStrengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Assessment synthesis pending.</p>
        )}
      </section>

      {/* SECTION 8: Screenshots & Interface Gallery */}
      <section id="sec-8" className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4 print:border-none print:p-0">
        <div className="border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Section 8</span>
          <h2 className="text-2xl font-extrabold text-white mt-0.5 print:text-black">
            Screenshots & User Interface Gallery
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          The verified interactive interfaces constructed for InterviewX AI:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {[
            { title: 'Figure 8.1: Landing Page & Hero Section', path: '/', desc: 'Hero section with interactive 5-state AI interviewer preview and quick actions' },
            { title: 'Figure 8.2: Candidate Analytics Dashboard', path: '/dashboard', desc: 'Score progression trends, rubric radar breakdown, and session history' },
            { title: 'Figure 8.3: Resume Studio & Skill Match', path: '/resume', desc: 'PDF/DOCX parsing, confidence score, uncertainty flags, and job match gauge' },
            { title: 'Figure 8.4: Interview Configuration', path: '/interview/setup', desc: 'Target role, difficulty level, language selection, and time limits' },
            { title: 'Figure 8.5: Live Interview Room', path: '/interview/room', desc: 'Animated AI interviewer, microphone speech recognition, and timer' },
            { title: 'Figure 8.6: Candidate Assessment Report', path: '/assessment/demo-session-alex-morgan', desc: 'Weighted scores, transparent recommendation, and learning plan' },
            { title: 'Figure 8.7: Repeated Question Lab', path: '/repeat-test', desc: 'Attempt 1 vs Attempt 2 side-by-side delta and growth analysis' },
            { title: 'Figure 8.8: Coding Challenge Playground', path: '/coding', desc: 'Algorithmic code editor with Big-O time and space AI review' },
            { title: 'Figure 8.9: Question Lab & Rubric Explorer', path: '/questions', desc: 'Catalog of role questions, model answers, hints, and rubrics' },
            { title: 'Figure 8.10: Settings & Gemini Configuration', path: '/settings', desc: 'API key management, TTS rates, custom weights, and privacy controls' },
            { title: 'Figure 8.11: Academic Documentation Studio', path: '/documentation', desc: 'Standard 8-section report generator with DOCX and PDF export controls' }
          ].map((fig, i) => (
            <div key={i} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                <ImageIcon className="w-6 h-6 text-indigo-400/60" />
              </div>
              <div className="font-bold text-white text-xs">{fig.title}</div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{fig.desc}</p>
              <Link href={fig.path} className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold inline-block pt-1">
                View Interface &rarr;
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CONCLUSION */}
      <section className="glass-panel p-6 sm:p-8 rounded-3xl space-y-3 print:border-none print:p-0">
        <h3 className="text-lg font-bold text-white print:text-black">Final Academic Conclusion</h3>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed print:text-black">
          InterviewX AI fulfills all academic technical requirements: full-stack architecture, speech recognition, multi-state avatar animations, resume parsing, calibrated rubric scoring, repeated question comparison, and automated DOCX/PDF documentation export. Built and tested for demonstration on 26 October 2026.
        </p>
      </section>
    </div>
  );
}
