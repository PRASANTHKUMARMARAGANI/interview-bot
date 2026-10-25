'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Briefcase,
  PlusCircle,
  Clock,
  Calendar,
  Users,
  ShieldAlert,
  ShieldCheck,
  Video,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
  Eye,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Hash,
  User,
  Award,
  MessageSquare
} from 'lucide-react';
import {
  InterviewCampaign,
  InterviewSession,
  InterviewQuestion,
  UserAuth
} from '@/types';
import {
  getCurrentUser,
  getStoredCampaigns,
  saveCampaign,
  getStoredSessions,
  updateSessionDecision,
  isCampaignOpen,
  seedSampleCompletedSession
} from '@/lib/storage';
import { getDemoQuestionsForRole } from '@/lib/demo-engine';
import { getSessionVideoBlob } from '@/lib/video-store';

export default function InterviewerPortalPage() {
  const [currentUser, setCurrentUser] = useState<UserAuth | null>(null);
  const [campaigns, setCampaigns] = useState<InterviewCampaign[]>([]);
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReviewSession, setSelectedReviewSession] = useState<InterviewSession | null>(null);
  const [reviewVideoUrl, setReviewVideoUrl] = useState<string | null>(null);
  const [recruiterNotes, setRecruiterNotes] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');

  // New Campaign Form State
  const [newTitle, setNewTitle] = useState('Frontend Engineer Hiring Drive');
  const [newRole, setNewRole] = useState('Frontend Developer');
  const [newJD, setNewJD] = useState(
    'Seeking a skilled frontend engineer proficient in Next.js, React 19, TypeScript, and Core Web Vitals optimization to architect scalable UI modules.'
  );
  const [newDepartment, setNewDepartment] = useState('Web Platforms');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [newEndDate, setNewEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [newDuration, setNewDuration] = useState(20);
  const [campaignQuestions, setCampaignQuestions] = useState<InterviewQuestion[]>([]);
  const [customQuestionText, setCustomQuestionText] = useState('');
  const [customQuestionCat, setCustomQuestionCat] = useState<InterviewQuestion['category']>('Technical');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    setCampaigns(getStoredCampaigns());
    let sList = getStoredSessions();
    if (sList.length === 0) {
      seedSampleCompletedSession();
      sList = getStoredSessions();
    }
    setSessions(sList);

    // Initial default questions for form
    const initialQ = getDemoQuestionsForRole('Frontend Developer', 3, 'Intermediate');
    setCampaignQuestions(initialQ);
  }, []);

  // Video Blob Loader for Review Modal
  useEffect(() => {
    let activeUrl: string | null = null;
    if (selectedReviewSession) {
      setRecruiterNotes(selectedReviewSession.interviewerNotes || '');
      getSessionVideoBlob(selectedReviewSession.id).then((blob) => {
        if (blob) {
          activeUrl = URL.createObjectURL(blob);
          setReviewVideoUrl(activeUrl);
        } else {
          setReviewVideoUrl(null);
        }
      });
    } else {
      if (reviewVideoUrl) {
        URL.revokeObjectURL(reviewVideoUrl);
      }
      setReviewVideoUrl(null);
    }
    return () => {
      if (activeUrl) URL.revokeObjectURL(activeUrl);
    };
  }, [selectedReviewSession]);

  const handleAutoGenerateQuestions = () => {
    const generated = getDemoQuestionsForRole(newRole, 3, 'Intermediate');
    setCampaignQuestions(generated);
  };

  const handleAddCustomQuestion = () => {
    if (!customQuestionText.trim()) return;
    const newQ: InterviewQuestion = {
      id: `custom-q-${Date.now()}`,
      questionNumber: campaignQuestions.length + 1,
      category: customQuestionCat,
      difficulty: 'Intermediate',
      questionText: customQuestionText.trim(),
      expectedConcepts: ['Problem Solving', 'Domain Expertise'],
      rubric: {
        technicalCorrectness: 'Accuracy in technical approach',
        relevance: 'Directly addresses prompt requirements',
        reasoning: 'Logical justifications and trade-off considerations',
        communication: 'Clear and structured explanation'
      },
      modelAnswerHint: 'Candidate should present a clear, structured response with engineering rationale.',
      isCustomQuestion: true
    };
    setCampaignQuestions([...campaignQuestions, newQ]);
    setCustomQuestionText('');
  };

  const handleRemoveQuestion = (idx: number) => {
    setCampaignQuestions(campaignQuestions.filter((_, i) => i !== idx));
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    const campaign: InterviewCampaign = {
      id: `camp-${Date.now()}`,
      title: newTitle.trim() || `${newRole} Campaign`,
      targetRole: newRole,
      jobDescription: newJD.trim(),
      department: newDepartment.trim() || 'Engineering',
      startDate: new Date(newStartDate).toISOString(),
      endDate: new Date(newEndDate).toISOString(),
      timeLimitMinutes: newDuration,
      status: 'active',
      questions: campaignQuestions,
      questionSource: 'hybrid',
      createdBy: currentUser?.email || 'recruiter@interviewx.ai',
      createdAt: new Date().toISOString(),
      totalSubmissionsCount: 0
    };

    const updated = saveCampaign(campaign);
    setCampaigns(updated);
    setShowCreateModal(false);
  };

  const handleUpdateDecision = (
    sessionId: string,
    decision: 'Shortlisted' | 'Under Review' | 'Rejected',
    notesToSave?: string
  ) => {
    const updated = updateSessionDecision(sessionId, decision, notesToSave !== undefined ? notesToSave : recruiterNotes);
    if (updated) {
      setSessions(getStoredSessions());
      if (selectedReviewSession?.id === sessionId) {
        setSelectedReviewSession(updated);
      }
    }
  };

  // Filtered Sessions
  const filteredSessions = sessions.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const roll = (s.candidateRollNo || s.candidateVerification?.declaredRollNo || '').toLowerCase();
    const name = s.candidateName.toLowerCase();
    const email = (s.candidateVerification?.declaredEmail || '').toLowerCase();

    const matchesQuery = !q || roll.includes(q) || name.includes(q) || email.includes(q);
    const matchesRole = roleFilter === 'all' || s.targetRole === roleFilter;
    const matchesDecision = decisionFilter === 'all' || (s.interviewerDecision || 'Under Review') === decisionFilter;

    return matchesQuery && matchesRole && matchesDecision;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Recruiter Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Recruiter & Interviewer Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Interviewer Portal
          </h1>
          <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
            <span>Interviewer: <span className="font-semibold text-white">{currentUser?.name || 'Sarah Jenkins'}</span></span>
            <span>•</span>
            <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded-lg bg-indigo-950/80 border border-indigo-500/30">
              Registered ID: {currentUser?.recruiterId || 'REC-2026-904'}
            </span>
            <span>•</span>
            <span>{currentUser?.organization || 'TechVision Enterprise Talent'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login?portal=student"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-cyan-300 hover:text-white border border-cyan-500/30"
          >
            Switch to Student Portal
          </Link>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Interview Campaign</span>
          </button>
        </div>
      </div>

      {/* ACTIVE CAMPAIGNS OVERVIEW */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Active Interview Campaigns</h2>
            <p className="text-xs text-slate-400">
              Manage interview deadlines, target job roles, and auto-generate or set custom questions.
            </p>
          </div>
          <span className="text-xs text-slate-400">
            {campaigns.length} Campaign{campaigns.length === 1 ? '' : 's'} Configured
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campaigns.map((camp) => {
            const openStatus = isCampaignOpen(camp);
            const submissionCount = sessions.filter((s) => s.campaignId === camp.id).length;

            return (
              <div
                key={camp.id}
                className="glass-panel p-6 rounded-3xl space-y-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-cyan-300 border border-indigo-500/30">
                      {camp.targetRole}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        openStatus.isOpen
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {openStatus.isOpen ? 'Accepting Responses' : 'Submissions Closed'}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-snug">{camp.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {camp.jobDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Closes:</span>
                    </div>
                    <span className="text-slate-200 font-mono text-[11px]">
                      {new Date(camp.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Submissions Received:</span>
                    </div>
                    <span className="text-cyan-400 font-bold">{submissionCount}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Link
                      href={`/candidate?campaignId=${camp.id}`}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      title="Share candidate interview test link"
                    >
                      <span>Candidate Test Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>

                    <span className="text-[10px] text-slate-500 font-medium">
                      {camp.questions.length} Questions Set
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CANDIDATE SUBMISSIONS HUB & SEARCH / FILTER */}
      <div className="glass-panel rounded-3xl overflow-hidden space-y-0 border border-slate-800">
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>Student Submissions & Evaluation Dossiers</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All AI voice responses, question scores, webcam recordings, and proctoring metrics indexed by Student Roll No and Name.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              {filteredSessions.length} / {sessions.length} Student Responses
            </span>
          </div>

          {/* Search by Roll No / Name & Filters Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Student Roll No. (e.g. 2023-CS-101) or Candidate Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                aria-label="Filter by Job Role"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Roles</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full-Stack Developer">Full-Stack Developer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Java / Python Developer">Java / Python Developer</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={decisionFilter}
                onChange={(e) => setDecisionFilter(e.target.value)}
                aria-label="Filter by Hiring Status"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Decision Statuses</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Under Review">Under Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Student Roll No.</th>
                <th className="py-3 px-4 font-semibold">Candidate Profile</th>
                <th className="py-3 px-4 font-semibold">Resume Match</th>
                <th className="py-3 px-4 font-semibold">AI Score / 100</th>
                <th className="py-3 px-4 font-semibold">Proctoring Trust</th>
                <th className="py-3 px-4 font-semibold">Violations</th>
                <th className="py-3 px-4 font-semibold">Video</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No candidate submissions match your search query or filter.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((sess) => {
                  const rollNo = sess.candidateRollNo || sess.candidateVerification?.declaredRollNo || '2023-CS-101';
                  const score = sess.finalAssessment?.overallScore;
                  const proc = sess.proctoringReport || {
                    trustScore: 100,
                    totalViolations: 0,
                    faceNotVisibleCount: 0,
                    tabSwitchCount: 0,
                    copyPasteCount: 0
                  };
                  const verif = sess.candidateVerification;
                  const decision = sess.interviewerDecision || 'Under Review';

                  return (
                    <tr key={sess.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Roll No */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30 text-xs">
                          {rollNo}
                        </span>
                      </td>

                      {/* Candidate Name & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-xs">{sess.candidateName}</div>
                        <div className="text-[11px] text-slate-400">{sess.targetRole}</div>
                        <div className="text-[10px] text-slate-500">{verif?.declaredEmail}</div>
                      </td>

                      {/* Resume Match */}
                      <td className="py-3.5 px-4">
                        {verif ? (
                          <div className="space-y-0.5">
                            <span className="font-bold text-cyan-300">{verif.verificationScore}% Match</span>
                            <div className="text-[10px] text-slate-400">
                              {verif.nameMatch ? '✓ Verified' : '⚠ Discrepancy'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500">Verified</span>
                        )}
                      </td>

                      {/* Overall AI Score */}
                      <td className="py-3.5 px-4">
                        {score !== undefined ? (
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded-lg border ${
                              score >= 85
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                : score >= 65
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                            }`}
                          >
                            {Math.round(score)}
                          </span>
                        ) : (
                          <span className="text-slate-500">In Progress</span>
                        )}
                      </td>

                      {/* Proctoring Trust */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              proc.trustScore >= 90
                                ? 'bg-emerald-400'
                                : proc.trustScore >= 70
                                ? 'bg-amber-400'
                                : 'bg-rose-400'
                            }`}
                          />
                          <span className="font-bold text-white">{proc.trustScore}%</span>
                        </div>
                      </td>

                      {/* Violations detail */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5 text-slate-400">
                          <div>Face Out: <span className="font-semibold text-white">{proc.faceNotVisibleCount}</span></div>
                          <div>Tab Switches: <span className="font-semibold text-white">{proc.tabSwitchCount}</span></div>
                          <div>Copy/Paste: <span className="font-semibold text-white">{proc.copyPasteCount || 0}</span></div>
                        </div>
                      </td>

                      {/* Video Recording */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-300 border border-blue-500/30">
                          <Video className="w-3 h-3 text-cyan-400" />
                          <span>Recorded</span>
                        </span>
                      </td>

                      {/* Decision */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                            decision === 'Shortlisted'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                              : decision === 'Rejected'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                              : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {decision}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedReviewSession(sess)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600/40 to-blue-600/40 text-cyan-300 hover:text-white hover:from-indigo-600 hover:to-blue-600 border border-indigo-500/40 transition-all flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 my-8 border border-slate-700">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <span>Create New Interview Campaign</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCampaign} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Campaign Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Target Job Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  >
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Full-Stack Developer">Full-Stack Developer</option>
                    <option value="AI / ML Engineer">AI / ML Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Java / Python Developer">Java / Python Developer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Job Description (JD)</label>
                <textarea
                  rows={3}
                  required
                  value={newJD}
                  onChange={(e) => setNewJD(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Department</label>
                  <input
                    type="text"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>
              </div>

              {/* Campaign Questions Generator & Custom Questions */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Interview Questions</h4>
                    <p className="text-[11px] text-slate-400">
                      Auto-generate JD-aligned questions or add specific mandatory questions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAutoGenerateQuestions}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 border border-indigo-500/40 flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                {/* Question List */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {campaignQuestions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-cyan-400">Q{idx + 1}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-slate-200">{q.questionText}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Custom Question */}
                <div className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Type required custom question..."
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomQuestion}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                >
                  Save & Publish Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED CANDIDATE SUBMISSION DOSSIER MODAL */}
      {selectedReviewSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-4xl w-full space-y-6 my-8 border border-slate-700 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    Roll No: {selectedReviewSession.candidateRollNo || selectedReviewSession.candidateVerification?.declaredRollNo || '2023-CS-101'}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Candidate Evaluation Dossier
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">
                  {selectedReviewSession.candidateName} — {selectedReviewSession.targetRole}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReviewSession(null)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* CANDIDATE VIDEO RECORDING PLAYBACK */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-cyan-400" />
                  <span>Candidate Webcam Video Recording</span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  Duration: {Math.floor((selectedReviewSession.videoRecording?.durationSeconds || 60) / 60)}m {(selectedReviewSession.videoRecording?.durationSeconds || 60) % 60}s
                </span>
              </div>

              {reviewVideoUrl ? (
                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black aspect-video max-h-72 flex items-center justify-center">
                  <video
                    src={reviewVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Video className="w-6 h-6" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">
                      Proctored Media Captured ({selectedReviewSession.videoRecording?.durationSeconds || 60}s WebM Stream)
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Camera recording synchronized with voice transcription and facial frame presence detector.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Candidate Verification Card */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border border-indigo-500/30">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Identity & Resume Cross-Verification</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Roll Number:</span>
                  <span className="font-bold font-mono text-cyan-300">
                    {selectedReviewSession.candidateRollNo || selectedReviewSession.candidateVerification?.declaredRollNo || '2023-CS-101'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Declared Name:</span>
                  <span className="font-bold text-white">{selectedReviewSession.candidateName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Resume Name:</span>
                  <span className="font-bold text-slate-200">
                    {selectedReviewSession.candidateVerification?.resumeName || selectedReviewSession.candidateName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Verification Score:</span>
                  <span className="font-bold text-emerald-400">
                    {selectedReviewSession.candidateVerification?.verificationScore || 95}% Match
                  </span>
                </div>
              </div>
            </div>

            {/* AI Proctoring Report */}
            <div className="glass-panel p-5 rounded-2xl space-y-3 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Proctoring Integrity Report</span>
                </h4>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  Trust Score: {selectedReviewSession.proctoringReport?.trustScore || 100}%
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Face Out of Frame</span>
                  <span className="text-lg font-black text-white">
                    {selectedReviewSession.proctoringReport?.faceNotVisibleCount || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Tab Switches</span>
                  <span className="text-lg font-black text-white">
                    {selectedReviewSession.proctoringReport?.tabSwitchCount || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[11px] text-slate-400 block">Copy / Paste Events</span>
                  <span className="text-lg font-black text-white">
                    {selectedReviewSession.proctoringReport?.copyPasteCount || 0}
                  </span>
                </div>
              </div>

              {selectedReviewSession.proctoringReport?.incidents && selectedReviewSession.proctoringReport.incidents.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-semibold text-slate-400 block">Incident Log:</span>
                  {selectedReviewSession.proctoringReport.incidents.map((inc, i) => (
                    <div key={i} className="text-[11px] p-2 rounded-lg bg-rose-950/40 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span>{inc.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Questions, Voice Answers & AI Evaluations */}
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Interview Questions & Student Spoken Answers</span>
              </h4>

              {selectedReviewSession.attempts.map((att, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">
                      Q{idx + 1}: {att.question.questionText}
                    </span>
                    <span className="font-bold text-cyan-400 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30">
                      Score: {att.evaluation?.score || 0} / 100
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Student Voice Answer:</span>
                    <p className="p-3.5 rounded-xl bg-slate-950 text-slate-200 italic leading-relaxed border border-slate-800">
                      &ldquo;{att.candidateAnswer}&rdquo;
                    </p>
                  </div>

                  {att.evaluation && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Technical:</span>
                        <span className="font-bold text-white">{att.evaluation.technicalCorrectness}/100</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Relevance:</span>
                        <span className="font-bold text-white">{att.evaluation.relevance}/100</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Reasoning:</span>
                        <span className="font-bold text-white">{att.evaluation.reasoning}/100</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Communication:</span>
                        <span className="font-bold text-white">{att.evaluation.communication}/100</span>
                      </div>
                    </div>
                  )}

                  {att.evaluation?.evidenceFromAnswer && (
                    <div className="text-[11px] text-slate-400">
                      <span className="font-semibold text-slate-300">AI Feedback Evidence:</span> {att.evaluation.evidenceFromAnswer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Recruiter Notes & Hiring Verdict Controls */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Recruiter Feedback & Interviewer Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Add private evaluation notes for this student..."
                  value={recruiterNotes}
                  onChange={(e) => setRecruiterNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Current Status:</span>
                  <span className="text-xs font-bold text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700">
                    {selectedReviewSession.interviewerDecision || 'Under Review'}
                  </span>
                  <Link
                    href={`/assessment/${selectedReviewSession.id}`}
                    target="_blank"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline ml-2 flex items-center gap-1"
                  >
                    <span>Full Scorecard Report</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateDecision(selectedReviewSession.id, 'Shortlisted', recruiterNotes)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                  >
                    Shortlist Student
                  </button>
                  <button
                    onClick={() => handleUpdateDecision(selectedReviewSession.id, 'Under Review', recruiterNotes)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md"
                  >
                    Keep Under Review
                  </button>
                  <button
                    onClick={() => handleUpdateDecision(selectedReviewSession.id, 'Rejected', recruiterNotes)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
