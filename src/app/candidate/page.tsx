'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Camera,
  Mic,
  Video,
  ShieldCheck,
  User,
  Mail,
  Phone,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Bot,
  Briefcase,
  Check,
  Hash,
  Award
} from 'lucide-react';
import {
  InterviewCampaign,
  ResumeData,
  CandidateVerification,
  InterviewSession,
  InterviewQuestion
} from '@/types';
import {
  getStoredCampaigns,
  getCampaignById,
  isCampaignOpen,
  getStoredResumes,
  saveResume,
  saveSession,
  getCurrentUser
} from '@/lib/storage';
import { matchCandidateWithResume, buildStructuredQuestionPipeline } from '@/lib/verification';
import { SAMPLE_RESUME_A, SAMPLE_RESUME_B } from '@/lib/samples';

export default function CandidatePortalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Student Portal...</div>}>
      <CandidatePortalContent />
    </Suspense>
  );
}

function CandidatePortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<InterviewCampaign[]>([]);
  // DO NOT auto-select by default: student must select one among available!
  const [selectedCampaign, setSelectedCampaign] = useState<InterviewCampaign | null>(null);

  // Student Identity Form State
  const [name, setName] = useState('Alex Morgan');
  const [rollNo, setRollNo] = useState('2023-CS-101');
  const [email, setEmail] = useState('alex.morgan.demo@interviewx.ai');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeData | null>(null);
  const [verificationResult, setVerificationResult] = useState<CandidateVerification | null>(null);

  // Camera & Mic Permissions State
  const [hasCameraPerm, setHasCameraPerm] = useState(false);
  const [hasMicPerm, setHasMicPerm] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [permError, setPermError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const cList = getStoredCampaigns();
    setCampaigns(cList);

    const rList = getStoredResumes();
    setResumes(rList);
    if (rList.length > 0) {
      setSelectedResume(rList[0]);
    }

    // Only auto-select if a specific campaignId was passed in the URL
    const campaignId = searchParams.get('campaignId');
    if (campaignId) {
      const match = cList.find((c) => c.id === campaignId);
      if (match) setSelectedCampaign(match);
    }

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.role === 'candidate') {
      setName(currentUser.name.replace(/\(.*\)/, '').trim());
      setEmail(currentUser.email);
      if (currentUser.rollNo) setRollNo(currentUser.rollNo);
    }
  }, [searchParams]);

  // Request Camera & Mic
  const handleRequestPermissions = async () => {
    setPermError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Webcam media devices are not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: true
      });

      setMediaStream(stream);
      setHasCameraPerm(true);
      setHasMicPerm(true);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera/Mic permission error:', err);
      setPermError(
        err.message || 'Microphone and Camera permissions are required to start the proctored interview.'
      );
      setHasCameraPerm(false);
      setHasMicPerm(false);
    }
  };

  // Re-run matching whenever name, rollNo, email, phone, or resume changes
  useEffect(() => {
    if (selectedResume) {
      const result = matchCandidateWithResume({ name, rollNo, email, phone }, selectedResume);
      setVerificationResult(result);
    }
  }, [name, rollNo, email, phone, selectedResume]);

  const handleLaunchInterview = () => {
    if (!selectedCampaign) {
      alert('Please select an interview campaign among the available drives first.');
      return;
    }

    const openStatus = isCampaignOpen(selectedCampaign);
    if (!openStatus.isOpen) {
      alert(`Cannot start interview: ${openStatus.reason}`);
      return;
    }

    if (!hasCameraPerm || !hasMicPerm) {
      alert('Camera and microphone permissions must be granted before entering the interview.');
      return;
    }

    // Build the 3-stage question pipeline: Intro -> Resume (Projects/Skills/Certs) -> JD questions
    const structuredQuestions = buildStructuredQuestionPipeline({
      candidateName: name,
      targetRole: selectedCampaign.targetRole,
      resume: selectedResume,
      campaignQuestions: selectedCampaign.questions
    });

    const verification = matchCandidateWithResume({ name, rollNo, email, phone }, selectedResume);

    const newSession: InterviewSession = {
      id: `proctored-sess-${Date.now()}`,
      campaignId: selectedCampaign.id,
      candidateName: name.trim() || 'Candidate',
      candidateRollNo: rollNo.trim() || '2023-CS-101',
      targetRole: selectedCampaign.targetRole,
      jobDescription: selectedCampaign.jobDescription,
      resumeId: selectedResume?.id,
      resumeFileName: selectedResume?.fileName,
      mode: 'Proctored Video & Voice Interview',
      language: 'en-US',
      difficulty: 'Intermediate',
      questionCount: structuredQuestions.length,
      timeLimitSeconds: (selectedCampaign.timeLimitMinutes || 20) * 60,
      startedAt: new Date().toISOString(),
      status: 'in_progress',
      questions: structuredQuestions,
      attempts: [],
      candidateVerification: verification,
      proctoringReport: {
        faceNotVisibleCount: 0,
        tabSwitchCount: 0,
        copyPasteCount: 0,
        totalViolations: 0,
        trustScore: 100,
        incidents: []
      },
      videoRecording: {
        hasVideoRecording: true,
        durationSeconds: 0,
        recordedAt: new Date().toISOString()
      }
    };

    saveSession(newSession);

    // Stop preview stream before moving to live room so live room can acquire stream
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    router.push(`/interview/room?id=${newSession.id}&proctored=true`);
  };

  const openStatus = selectedCampaign ? isCampaignOpen(selectedCampaign) : { isOpen: false, reason: 'Please select an interview drive first.' };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Banner Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-semibold border border-cyan-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>AI Proctored Student Examination Portal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Student Assessment Lobby
          </h1>
          <p className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
            <span>Student: <span className="text-white font-semibold">{name}</span></span>
            <span>•</span>
            <span className="font-mono text-cyan-300 font-bold px-2 py-0.5 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              Roll No: {rollNo}
            </span>
            <span>•</span>
            <span>{email}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login?portal=student"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-slate-300 hover:text-white border border-slate-700 transition-colors"
          >
            Change Roll No
          </Link>
          <Link
            href="/login?portal=interviewer"
            className="px-4 py-2 rounded-xl text-xs font-semibold glass-panel text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors"
          >
            Interviewer Portal
          </Link>
        </div>
      </div>

      {/* STEP 1: SELECT ONE INTERVIEW AMONG AVAILABLE DRIVES */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border border-indigo-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-black">
                1
              </span>
              <span>Step 1: Choose Your Interview Drive</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Select One Interview Among Available Positions
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the role you are applying for. The AI Interviewer will evaluate your introduction, resume, and role-specific concepts.
            </p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 font-medium self-start sm:self-center">
            {campaigns.length} Active Drives Available
          </span>
        </div>

        {/* Available Campaigns Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((camp) => {
            const isSelected = selectedCampaign?.id === camp.id;
            const campStatus = isCampaignOpen(camp);

            return (
              <div
                key={camp.id}
                onClick={() => {
                  if (campStatus.isOpen) {
                    setSelectedCampaign(camp);
                  }
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 relative ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20'
                    : campStatus.isOpen
                    ? 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-850 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      {camp.targetRole}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        campStatus.isOpen
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {campStatus.isOpen ? 'Accepting Responses' : 'Closed'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{camp.title}</h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {camp.jobDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duration:</span>
                    </div>
                    <span className="font-bold text-white">{camp.timeLimitMinutes} Minutes</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Deadline:</span>
                    </div>
                    <span className="font-mono text-slate-300">
                      {new Date(camp.endDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {/* Selection Button */}
                  <div className="pt-1">
                    {isSelected ? (
                      <div className="w-full py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Selected for Interview</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={!campStatus.isOpen}
                        className="w-full py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors border border-slate-700"
                      >
                        {campStatus.isOpen ? 'Select This Interview' : 'Deadline Passed'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Campaign Confirmation Alert */}
        {selectedCampaign ? (
          <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
              <div>
                <span className="font-bold text-white">Active Selection: </span>
                <span>{selectedCampaign.title} • Role: <strong className="text-cyan-300">{selectedCampaign.targetRole}</strong> ({selectedCampaign.timeLimitMinutes} min limit).</span>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Ready for verification below ↓
            </span>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Please click on an interview drive card above to select which position you wish to take.</span>
          </div>
        )}
      </div>

      {/* STEP 2: STUDENT DETAILS & RESUME VERIFICATION */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border transition-all ${selectedCampaign ? 'border-indigo-500/30 opacity-100' : 'border-slate-800 opacity-60 pointer-events-none'}`}>
        <div className="pb-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-black">
              2
            </span>
            <span>Step 2: Student Details & Resume Verification</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Candidate Profile & Identity Cross-Verification
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Your details are cross-matched against your uploaded resume to ensure authenticity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Roll No. / Student ID <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2023-CS-101"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-bold"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Student Full Name <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Email Address <span className="text-cyan-400">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="e.g. alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Contact Phone</label>
            <input
              type="text"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Resume Selector */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">Select Candidate Resume for AI Extraction</label>
          <select
            value={selectedResume?.id || ''}
            onChange={(e) => {
              const match = resumes.find((r) => r.id === e.target.value);
              if (match) setSelectedResume(match);
            }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.fileName} — {r.parsed.fullName} ({r.parsed.skills.slice(0, 3).join(', ')})
              </option>
            ))}
          </select>
        </div>

        {/* Live Matching Results Box */}
        {verificationResult && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Resume Matching Verification:</span>
              <span className="font-bold text-cyan-400">
                Match Score: {verificationResult.verificationScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                Name Check:{' '}
                <span className={verificationResult.nameMatch ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {verificationResult.nameMatch ? '✓ Verified with Resume' : '⚠ Discrepancy'}
                </span>
              </div>
              <div>
                Contact Check:{' '}
                <span className={verificationResult.contactMatch ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {verificationResult.contactMatch ? '✓ Verified' : '⚠ Alternate Contacts'}
                </span>
              </div>
            </div>

            {verificationResult.discrepancies.length > 0 && (
              <ul className="text-[11px] text-amber-300 list-disc list-inside space-y-0.5 pt-1">
                {verificationResult.discrepancies.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* STEP 3: CAMERA & MICROPHONE PERMISSIONS */}
      <div className={`glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border transition-all ${selectedCampaign ? 'border-indigo-500/30 opacity-100' : 'border-slate-800 opacity-60 pointer-events-none'}`}>
        <div className="pb-2 border-b border-slate-800">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-[11px] font-black">
              3
            </span>
            <span>Step 3: Device Permissions & Video Recording Check</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Camera & Microphone Proctoring Test
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            The bot records candidate video and monitors facial presence, tab switches, and vocal answer transcripts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Live Preview Box */}
          <div className="md:col-span-6 flex flex-col items-center">
            <div className="w-full aspect-video rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden relative flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${hasCameraPerm ? 'block' : 'hidden'}`}
              />
              {!hasCameraPerm && (
                <div className="text-center p-4 space-y-2 text-slate-500">
                  <Video className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Camera preview will appear here once permissions are enabled.</p>
                </div>
              )}
            </div>
          </div>

          {/* Permission Buttons & Indicators */}
          <div className="md:col-span-6 space-y-4">
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-white">Camera Access:</span>
                </div>
                <span className={`font-bold ${hasCameraPerm ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasCameraPerm ? '✓ Enabled' : 'Pending Permission'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-400" />
                  <span className="font-semibold text-white">Microphone Access:</span>
                </div>
                <span className={`font-bold ${hasMicPerm ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {hasMicPerm ? '✓ Enabled' : 'Pending Permission'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestPermissions}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                hasCameraPerm && hasMicPerm
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
            >
              {hasCameraPerm && hasMicPerm ? '✓ Device Permissions Verified' : 'Grant Camera & Microphone Access'}
            </button>

            {permError && (
              <p className="text-xs text-rose-400">{permError}</p>
            )}
          </div>
        </div>
      </div>

      {/* STEP 4: LAUNCH BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLaunchInterview}
          disabled={!selectedCampaign || !openStatus.isOpen || !hasCameraPerm || !hasMicPerm}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>
            {!selectedCampaign
              ? '1. Please Select an Interview Drive Above to Continue'
              : !hasCameraPerm || !hasMicPerm
              ? '2. Please Grant Camera & Microphone Access Above to Continue'
              : `Begin Proctored Video Interview for ${selectedCampaign.targetRole} (${selectedCampaign.timeLimitMinutes} Mins)`}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
