'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
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
  Bot
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
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading Candidate Portal...</div>}>
      <CandidatePortalContent />
    </Suspense>
  );
}

function CandidatePortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [campaigns, setCampaigns] = useState<InterviewCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<InterviewCampaign | null>(null);

  // Verification Form State
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

    const campaignId = searchParams.get('campaignId');
    if (campaignId) {
      const match = cList.find((c) => c.id === campaignId);
      if (match) setSelectedCampaign(match);
    } else if (cList.length > 0) {
      setSelectedCampaign(cList[0]);
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
    if (!selectedCampaign) return;

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

  const openStatus = selectedCampaign ? isCampaignOpen(selectedCampaign) : { isOpen: false };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-medium border border-cyan-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AI Proctored Candidate Portal</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Candidate Onboarding & Identity Verification
        </h1>
        <p className="text-sm text-slate-400">
          Complete device permissions, cross-verify your details with your resume, and begin your video-recorded mock interview.
        </p>
      </div>

      {/* STEP 1: CAMPAIGN SELECTION & SCHEDULE CHECK */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Select Interview Campaign & Review Deadlines</span>
          </h3>
          {selectedCampaign && (
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                openStatus.isOpen
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
              }`}
            >
              {openStatus.isOpen ? 'Window Active' : 'Submissions Closed'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Active Job Campaign:
            </label>
            <select
              value={selectedCampaign?.id || ''}
              onChange={(e) => {
                const found = campaigns.find((c) => c.id === e.target.value);
                if (found) setSelectedCampaign(found);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.targetRole})
                </option>
              ))}
            </select>
          </div>

          {selectedCampaign && (
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Submission Window:</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  Until {new Date(selectedCampaign.endDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Time Limit:</span>
                <span className="text-cyan-400 font-bold">{selectedCampaign.timeLimitMinutes} Minutes</span>
              </div>
            </div>
          )}
        </div>

        {!openStatus.isOpen && (
          <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{openStatus.reason}</span>
          </div>
        )}
      </div>

      {/* STEP 2: CAMERA & MICROPHONE PERMISSIONS */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Device Permissions & Video Recording Check</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The bot records your video and vocal responses. During the interview, live proctoring monitors if your face moves out of camera frame, if your face is obscured, or if tabs are switched.
        </p>

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

      {/* STEP 3: CANDIDATE IDENTITY & RESUME CROSS-MATCH */}
      <div className="glass-panel p-6 rounded-3xl space-y-5 border border-indigo-500/30">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-cyan-400" />
          <span>Candidate Information & Resume Cross-Verification</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Provide your declared details and resume. The system will cross-verify your identity against extracted resume credentials before proceeding.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              Roll No. / Student ID <span className="text-cyan-400">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 2023-CS-101"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-semibold"
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
          <label className="text-xs font-semibold text-slate-300 block mb-1">Selected Resume</label>
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
                {r.fileName} — {r.parsed.fullName}
              </option>
            ))}
          </select>
        </div>

        {/* Live Matching Results Box */}
        {verificationResult && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white">Cross-Matching Result:</span>
              <span className="font-bold text-cyan-400">
                Verification Score: {verificationResult.verificationScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                Name Check:{' '}
                <span className={verificationResult.nameMatch ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {verificationResult.nameMatch ? '✓ Matches Resume' : '⚠ Discrepancy'}
                </span>
              </div>
              <div>
                Contact Check:{' '}
                <span className={verificationResult.contactMatch ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {verificationResult.contactMatch ? '✓ Verified' : '⚠ Differing Contacts'}
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

      {/* LAUNCH BUTTON */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLaunchInterview}
          disabled={!openStatus.isOpen || !hasCameraPerm || !hasMicPerm}
          className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Launch Proctored Video Interview Now</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
