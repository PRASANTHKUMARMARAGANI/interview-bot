'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Award,
  Download,
  Share2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  FileText,
  BarChart2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InterviewSession } from '@/types';
import { getSessionById, seedSampleCompletedSession } from '@/lib/storage';
import { createAssessmentDocxBlob } from '@/lib/docx-generator';

export default function AssessmentReportPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading assessment dossier...</div>}>
      <AssessmentContent />
    </Suspense>
  );
}

function AssessmentContent() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [isExportingDocx, setIsExportingDocx] = useState(false);

  useEffect(() => {
    let sess = getSessionById(id);
    if (!sess) {
      sess = seedSampleCompletedSession();
    }
    setSession(sess);

    // Fire celebration confetti if score is high
    if (sess.finalAssessment && sess.finalAssessment.overallScore >= 80) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }
    }
  }, [id]);

  const handleDownloadDocx = async () => {
    if (!session) return;
    setIsExportingDocx(true);
    try {
      const blob = await createAssessmentDocxBlob(session);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `InterviewX_Assessment_${session.candidateName.replace(/\s+/g, '_')}_${Date.now()}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Docx download error:', err);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (!session || !session.finalAssessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-slate-400 text-center">
        <p>Loading assessment dossier...</p>
      </div>
    );
  }

  const assessment = session.finalAssessment;
  const overallScore = assessment.overallScore;

  const getRecommendationBadge = () => {
    switch (assessment.recommendation) {
      case 'Strong Match':
        return {
          color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
          desc: 'Exemplary command of core architectural and technical principles.'
        };
      case 'Consider Further':
        return {
          color: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
          desc: 'Solid foundations with target areas for deeper trade-off mastery.'
        };
      default:
        return {
          color: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
          desc: 'Enthusiastic intent; needs focused conceptual revision before interviews.'
        };
    }
  };

  const recBadge = getRecommendationBadge();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:max-w-none">
      {/* Action Header Banner (Hidden during browser print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-cyan-400 text-xs font-medium border border-indigo-500/20 mb-1">
            <Award className="w-3.5 h-3.5" />
            <span>Practice Performance Dossier</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Interview Assessment Report
          </h1>
          <p className="text-xs text-slate-400">
            Candidate: <span className="font-semibold text-white">{session.candidateName}</span>
            {(session.candidateRollNo || session.candidateVerification?.declaredRollNo) && (
              <span className="font-mono text-cyan-300 font-bold ml-1.5 px-2 py-0.5 rounded bg-indigo-950/60 border border-indigo-500/30">
                Roll No: {session.candidateRollNo || session.candidateVerification?.declaredRollNo}
              </span>
            )}
            <span className="mx-2 text-slate-600">•</span>
            Target Role: <span className="font-semibold text-cyan-400">{session.targetRole}</span>
          </p>
        </div>

        {/* Export & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isExportingDocx ? 'Generating Word (.docx)...' : 'Export DOCX'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download PDF / Print</span>
          </button>

          <Link
            href="/interview/setup"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <span>New Session</span>
          </Link>
        </div>
      </div>

      {/* MANDATORY EDUCATIONAL PRACTICE DISCLAIMER */}
      <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
            Educational Practice Assessment Notice
          </span>
          <p className="leading-relaxed text-xs">
            {assessment.disclaimer}
          </p>
        </div>
      </div>

      {/* OVERALL SCORE & RECOMMENDATION CARD */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center border border-indigo-500/30">
        <div className="md:col-span-5 text-center md:text-left space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Overall Benchmarked Score
          </span>
          <div className="text-6xl font-black text-white tracking-tight flex items-baseline justify-center md:justify-start gap-1">
            <span>{overallScore}</span>
            <span className="text-xl font-normal text-slate-400">/ 100</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mt-2">
            <span>Recommendation:</span>
            <span className={`px-2 py-0.5 rounded ${recBadge.color}`}>
              {assessment.recommendation}
            </span>
          </div>
        </div>

        <div className="md:col-span-7 space-y-3 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-8">
          <h4 className="text-sm font-bold text-slate-200">Recommendation Rationale</h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {assessment.recommendationExplanation}
          </p>

          {/* Key Evidence Quotes */}
          <div className="pt-2 space-y-1 text-xs text-slate-400">
            <span className="font-semibold text-slate-300 block text-[11px]">Demonstrated Evidence:</span>
            <ul className="space-y-1 list-disc list-inside">
              {assessment.keyEvidence.slice(0, 3).map((ev, i) => (
                <li key={i} className="line-clamp-2 italic">{ev}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN TABLE */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Weighted Rubric Evaluation Breakdown</h3>
          <span className="text-xs text-slate-400">Total Weight: 100%</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            {
              label: 'Technical Precision',
              weight: assessment.rubricWeights.technical,
              score: assessment.categoryScores.technicalCorrectness
            },
            {
              label: 'Relevance & Depth',
              weight: assessment.rubricWeights.relevance,
              score: assessment.categoryScores.relevanceAndCompleteness
            },
            {
              label: 'Reasoning & Logic',
              weight: assessment.rubricWeights.reasoning,
              score: assessment.categoryScores.problemSolvingReasoning
            },
            {
              label: 'Communication',
              weight: assessment.rubricWeights.communication,
              score: assessment.categoryScores.communicationClarity
            },
            {
              label: 'Practical Application',
              weight: assessment.rubricWeights.application,
              score: assessment.categoryScores.practicalApplication
            }
          ].map((cat, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1 text-center">
              <span className="text-[11px] text-slate-400 block line-clamp-1">{cat.label}</span>
              <div className="text-2xl font-black text-cyan-400">{cat.score}</div>
              <span className="text-[10px] text-slate-500 font-medium">Weight: {cat.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTION-BY-QUESTION SCORECARD */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">Question-by-Question Deep Dive</h3>
          <span className="text-xs text-slate-400">
            {session.attempts.length} Questions Evaluated
          </span>
        </div>

        <div className="space-y-3">
          {session.attempts.map((attempt, idx) => {
            const isExpanded = expandedQuestion === idx;
            const evalData = attempt.evaluation;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-600/20 text-cyan-400 font-bold text-xs flex items-center justify-center">
                      Q{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white line-clamp-1">
                        {attempt.question.questionText}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {attempt.question.category} • Score: {evalData?.score || 0}/100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm font-black ${
                        (evalData?.score || 0) >= 80
                          ? 'text-emerald-400'
                          : (evalData?.score || 0) >= 60
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {evalData?.score || 0} pts
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-slate-800/80 space-y-4 text-xs">
                    {/* Candidate Answer */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                      <span className="font-semibold text-slate-300 block">Candidate Submitted Answer:</span>
                      <p className="text-slate-300 italic leading-relaxed">
                        &ldquo;{attempt.candidateAnswer || 'No response recorded'}&rdquo;
                      </p>
                    </div>

                    {/* Evaluated Evidence & Strengths */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                        <span className="font-semibold text-emerald-400">Demonstrated Strengths:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {(evalData?.strengths || ['Direct answer to question']).map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                        <span className="font-semibold text-amber-400">Omitted Expected Concepts:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                          {(evalData?.missingConcepts || ['None']).map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Improvement Suggestion & Model Answer */}
                    <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1">
                      <span className="font-semibold text-cyan-300">Targeted Improvement Guidance:</span>
                      <p className="text-slate-300 leading-relaxed">
                        {evalData?.suggestedImprovement || attempt.question.modelAnswerHint}
                      </p>
                    </div>

                    {/* Direct Retest Action */}
                    <div className="pt-2 flex justify-end">
                      <Link
                        href={`/repeat-test?sessionId=${session.id}&questionId=${attempt.question.id}`}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retest This Question in Repeat Lab</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTIONABLE STUDY PLAN & CURATED RESOURCES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Actionable Plan */}
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Targeted 4-Step Improvement Plan</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-300">
            {assessment.actionablePlan.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Curated Learning Resources */}
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Recommended Learning Resources</span>
          </h3>
          <div className="space-y-2 text-xs">
            {assessment.recommendedResources.map((res, idx) => (
              <a
                key={idx}
                href={res.link}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between text-slate-200 transition-colors group"
              >
                <div>
                  <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {res.title}
                  </div>
                  <span className="text-[10px] text-cyan-400 font-medium">Type: {res.type}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
