'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  RotateCcw,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  User,
  LogOut,
  ChevronRight,
  FileText,
  VolumeX,
  Video,
  Camera,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Copy
} from 'lucide-react';
import { AIAvatar } from '@/components/avatar';
import {
  InterviewSession,
  InterviewQuestion,
  QuestionAttempt,
  AvatarState,
  QuestionEvaluation,
  ProctoringIncident,
  ProctoringReport
} from '@/types';
import {
  getSessionById,
  saveSession,
  getStoredSettings,
  seedSampleCompletedSession
} from '@/lib/storage';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  startSpeechRecognition,
  stopSpeechRecognition,
  speakText,
  stopSpeaking
} from '@/lib/audio';
import { synthesizeFinalAssessment } from '@/lib/scoring';
import { analyzeVideoFacePresence, buildProctoringReport } from '@/lib/proctoring';
import { saveSessionVideo } from '@/lib/video-store';

export default function InterviewRoomPage() {
  return (
    <React.Suspense fallback={<div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">Loading interview room...</div>}>
      <InterviewRoomContent />
    </React.Suspense>
  );
}

function InterviewRoomContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [timerRunning, setTimerRunning] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // VIDEO & PROCTORING STATE
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isFaceVisible, setIsFaceVisible] = useState(true);
  const [faceOutCount, setFaceOutCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copyPasteCount, setCopyPasteCount] = useState(0);
  const [proctoringAlert, setProctoringAlert] = useState<string | null>(null);
  const [incidents, setIncidents] = useState<ProctoringIncident[]>([]);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const proctoringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answerStartTimeRef = useRef<number>(Date.now());

  const activeQuestion: InterviewQuestion | undefined = session?.questions[currentIndex];

  // 1. Initialize session and acquire webcam for candidate video recording
  useEffect(() => {
    const sessionId = searchParams.get('id');
    let loaded: InterviewSession | null = null;
    if (sessionId) {
      loaded = getSessionById(sessionId);
    }
    if (!loaded) {
      loaded = seedSampleCompletedSession();
    }
    setSession(loaded);
    setTimeLeft(loaded.timeLimitSeconds > 0 ? loaded.timeLimitSeconds : 0);
    answerStartTimeRef.current = Date.now();

    // Start Webcam & Video Recording
    startCandidateCameraAndRecording(loaded.id);

    return () => {
      cleanupMedia();
    };
  }, [searchParams]);

  const startCandidateCameraAndRecording = async (sessionId: string) => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 } },
          audio: true
        });

        videoStreamRef.current = stream;
        setIsCameraActive(true);

        if (videoElementRef.current) {
          videoElementRef.current.srcObject = stream;
          videoElementRef.current.play();
        }

        // Initialize MediaRecorder for candidate video recording
        try {
          const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
          recorder.ondataavailable = (event) => {
            if (event.data && event.data.size > 0) {
              recordedChunksRef.current.push(event.data);
            }
          };
          recorder.start(1000); // 1-second chunks
          mediaRecorderRef.current = recorder;
        } catch (recErr) {
          console.warn('MediaRecorder with video/webm not supported, fallback default recorder:', recErr);
        }
      }
    } catch (err) {
      console.warn('Webcam acquisition warning:', err);
      setIsCameraActive(false);
    }
  };

  const cleanupMedia = () => {
    stopSpeaking();
    stopSpeechRecognition();
    if (proctoringIntervalRef.current) clearInterval(proctoringIntervalRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (videoStreamRef.current) {
      videoStreamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // 2. AI Proctoring: Face Presence Frame Sampling
  useEffect(() => {
    if (!isCameraActive) return;

    proctoringIntervalRef.current = setInterval(() => {
      if (videoElementRef.current) {
        const result = analyzeVideoFacePresence(videoElementRef.current);
        setIsFaceVisible(result.isFaceVisible);

        if (!result.isFaceVisible) {
          setFaceOutCount((prev) => prev + 1);
          triggerAlert('⚠️ Warning: Face not clearly visible in camera frame. Please stay centered.');
          recordIncident('face_out_of_frame', result.note);
        }
      }
    }, 2000);

    return () => {
      if (proctoringIntervalRef.current) clearInterval(proctoringIntervalRef.current);
    };
  }, [isCameraActive]);

  // 3. AI Proctoring: Tab Switch and Window Blur Listeners
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        triggerAlert('⚠️ Warning: Tab switch detected! Remaining on the interview page is required.');
        recordIncident('tab_switch', 'Candidate navigated away from the interview tab or minimized browser.');
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount((prev) => prev + 1);
      triggerAlert('⚠️ Warning: Window focus lost. Focus must stay within the interview.');
      recordIncident('tab_switch', 'Window lost focus.');
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      setCopyPasteCount((prev) => prev + 1);
      triggerAlert('⚠️ Warning: Clipboard actions are restricted during this proctored interview.');
      recordIncident('copy_paste_attempt', 'Candidate attempted clipboard copy or paste action.');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
    };
  }, []);

  const triggerAlert = (message: string) => {
    setProctoringAlert(message);
    setTimeout(() => setProctoringAlert(null), 4500);
  };

  const recordIncident = (type: ProctoringIncident['type'], detail: string) => {
    setIncidents((prev) => [
      ...prev,
      {
        id: `inc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type,
        timestamp: new Date().toISOString(),
        detail
      }
    ]);
  };

  // 4. TTS Question asking when active question changes
  useEffect(() => {
    if (!activeQuestion) return;
    setTranscriptText('');
    setTypedAnswer('');
    setMicError(null);
    answerStartTimeRef.current = Date.now();

    const appSettings = getStoredSettings();
    if (appSettings.ttsEnabled) {
      playQuestionAudio(activeQuestion.questionText);
    } else {
      setAvatarState('idle');
    }

    if (session?.timeLimitSeconds && session.timeLimitSeconds > 0) {
      setTimeLeft(session.timeLimitSeconds);
      setTimerRunning(true);
    }

    return () => {
      stopSpeaking();
      stopSpeechRecognition();
    };
  }, [currentIndex, activeQuestion]);

  // 5. Timer countdown
  useEffect(() => {
    if (!timerRunning || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerRunning(false);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeLeft]);

  const handleTimeExpired = () => {
    triggerAlert('⏳ Time limit expired for this session. Compiling report...');
    finalizeAndSubmitInterview();
  };

  const playQuestionAudio = (text: string) => {
    if (!isSpeechSynthesisSupported()) return;
    setAvatarState('speaking');
    speakText(text, {
      lang: session?.language || 'en-US',
      rate: audioSpeed,
      onStart: () => setAvatarState('speaking'),
      onEnd: () => setAvatarState('idle'),
      onError: () => setAvatarState('idle')
    });
  };

  const handleToggleVoiceRecording = () => {
    if (isRecordingVoice) {
      stopSpeechRecognition();
      setIsRecordingVoice(false);
      setAvatarState('idle');
    } else {
      setMicError(null);
      const stopFn = startSpeechRecognition({
        lang: session?.language || 'en-US',
        onStart: () => {
          setIsRecordingVoice(true);
          setAvatarState('listening');
        },
        onResult: (text) => {
          setTranscriptText(text);
        },
        onError: (errMsg) => {
          setMicError(errMsg);
          setIsRecordingVoice(false);
          setAvatarState('idle');
        },
        onEnd: () => {
          setIsRecordingVoice(false);
          setAvatarState('idle');
        }
      });

      if (!stopFn) {
        setIsRecordingVoice(false);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!activeQuestion || !session) return;
    stopSpeechRecognition();
    stopSpeaking();
    setIsRecordingVoice(false);

    const finalAnswer = (transcriptText + ' ' + typedAnswer).trim();
    if (!finalAnswer) {
      setMicError('Please speak into the microphone or type an answer before submitting.');
      return;
    }

    setIsEvaluating(true);
    setAvatarState('thinking');

    const timeSpent = Math.max(5, Math.round((Date.now() - answerStartTimeRef.current) / 1000));
    const appSettings = getStoredSettings();

    try {
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: activeQuestion,
          candidateAnswer: finalAnswer,
          targetRole: session.targetRole,
          customKey: appSettings.apiKey || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.evaluation) {
        throw new Error(data.error || 'Evaluation processing failed.');
      }

      const evaluation: QuestionEvaluation = data.evaluation;

      const newAttempt: QuestionAttempt = {
        question: activeQuestion,
        candidateAnswer: finalAnswer,
        timeSpentSeconds: timeSpent,
        submittedAt: new Date().toISOString(),
        evaluation
      };

      const updatedAttempts = [...session.attempts, newAttempt];
      const isLastQuestion = currentIndex >= session.questions.length - 1;

      if (isLastQuestion) {
        await finalizeAndSubmitInterview(updatedAttempts);
      } else {
        setAvatarState('idle');
        const updatedSession: InterviewSession = {
          ...session,
          attempts: updatedAttempts
        };
        saveSession(updatedSession);
        setSession(updatedSession);
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err: any) {
      console.error('Submit answer error:', err);
      setMicError(err.message || 'Error occurred during evaluation.');
      setAvatarState('idle');
    } finally {
      setIsEvaluating(false);
    }
  };

  const finalizeAndSubmitInterview = async (explicitAttempts?: QuestionAttempt[]) => {
    if (!session) return;
    setAvatarState('success');

    const attemptsToUse = explicitAttempts || session.attempts;
    const appSettings = getStoredSettings();

    // 1. Build Proctoring Report
    const proctoringReport: ProctoringReport = buildProctoringReport(
      faceOutCount,
      tabSwitchCount,
      copyPasteCount,
      incidents
    );

    // 2. Stop MediaRecorder and save recorded video Blob to IndexedDB
    let storageKey = '';
    if (recordedChunksRef.current.length > 0) {
      try {
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        storageKey = await saveSessionVideo(session.id, videoBlob);
      } catch (saveErr) {
        console.warn('Video save warning:', saveErr);
      }
    }

    // 3. Finalize assessment
    const finalAssessment = synthesizeFinalAssessment(
      attemptsToUse,
      session.targetRole,
      session.candidateName,
      appSettings
    );

    const completedSession: InterviewSession = {
      ...session,
      status: 'completed',
      completedAt: new Date().toISOString(),
      attempts: attemptsToUse,
      finalAssessment,
      proctoringReport,
      videoRecording: {
        hasVideoRecording: true,
        durationSeconds: Math.round((Date.now() - new Date(session.startedAt).getTime()) / 1000),
        recordedAt: new Date().toISOString(),
        storageKey
      }
    };

    saveSession(completedSession);
    setSession(completedSession);
    cleanupMedia();

    setTimeout(() => {
      startTransition(() => {
        router.push(`/assessment/${completedSession.id}`);
      });
    }, 1500);
  };

  if (!session || !activeQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
        <div className="space-y-3">
          <Bot className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
          <p>Initializing Proctored Interview Room...</p>
        </div>
      </div>
    );
  }

  const currentAnswerCombined = (transcriptText + ' ' + typedAnswer).trim();
  const wordCount = currentAnswerCombined ? currentAnswerCombined.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 flex flex-col justify-between">
      {/* PROCTORING ALERT BANNER */}
      <AnimatePresence>
        {proctoringAlert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{proctoringAlert}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HUD BAR: QUESTION PROGRESS, TIMER, & LIVE PROCTORING COUNTERS */}
      <div className="glass-panel px-5 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Left: Progress */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
            {currentIndex + 1}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              Question {currentIndex + 1} of {session.questions.length}
            </div>
            <div className="text-[11px] text-slate-400">
              <span className="text-white font-medium">{session.candidateName}</span>
              {session.candidateRollNo && (
                <span className="font-mono text-cyan-400 ml-1.5 px-1.5 py-0.2 rounded bg-indigo-950/80 border border-indigo-500/30">
                  {session.candidateRollNo}
                </span>
              )}
              <span className="mx-1.5 text-slate-600">•</span>
              {session.targetRole}
            </div>
          </div>
        </div>

        {/* Center: Live Proctoring Tally HUD */}
        <div className="flex items-center gap-3 text-xs bg-slate-900/90 px-3.5 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isFaceVisible ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-ping'}`} />
            <span className={`text-[11px] font-bold ${isFaceVisible ? 'text-emerald-300' : 'text-rose-400'}`}>
              {isFaceVisible ? 'Face Centered' : 'Face Out of Frame'}
            </span>
          </div>

          <span className="text-slate-600">|</span>

          <span className="text-[11px] text-slate-400">
            Tab Switches: <span className="text-white font-bold">{tabSwitchCount}</span>
          </span>

          <span className="text-slate-600">|</span>

          <span className="text-[11px] text-slate-400">
            Face Lost: <span className="text-white font-bold">{faceOutCount}</span>
          </span>
        </div>

        {/* Right: Timer & Exit */}
        <div className="flex items-center gap-3">
          {session.timeLimitSeconds > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <Clock className={`w-3.5 h-3.5 ${timeLeft <= 20 ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <span className={timeLeft <= 20 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          <button
            onClick={() => setShowEndModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Finish Interview</span>
          </button>
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch flex-1">
        {/* Left: AI Avatar, Live Candidate Webcam Feed, and Question */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Avatar Panel with Candidate Live PIP Corner Webcam */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden border border-indigo-500/30">
            {/* Candidate Live Webcam PIP in Corner */}
            <div className="absolute top-3 right-3 w-28 h-20 rounded-xl overflow-hidden border border-cyan-500/50 shadow-md bg-black z-10">
              <video
                ref={videoElementRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1.5 flex items-center gap-1 text-[9px] bg-black/70 px-1 rounded text-cyan-300 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span>REC</span>
              </div>
            </div>

            <div className="py-2">
              <AIAvatar state={avatarState} size="xl" showStatusLabel={true} />
            </div>

            {/* Replay Question Audio Button */}
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => playQuestionAudio(activeQuestion.questionText)}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Replay Question Audio</span>
              </button>
              <button
                onClick={stopSpeaking}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Stop speaking"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Question Display Card */}
          <div className="glass-panel p-6 rounded-3xl space-y-3 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                  {activeQuestion.category}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Difficulty: <span className="text-white font-medium">{activeQuestion.difficulty}</span>
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {activeQuestion.questionText}
              </h2>

              {activeQuestion.sourceResumeEvidence && (
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Resume Grounding:</span> {activeQuestion.sourceResumeEvidence}
                </div>
              )}
            </div>

            {/* Expected Core Concepts Badge hints */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Evaluated Concept Expectations:
              </span>
              <div className="flex flex-wrap gap-1">
                {activeQuestion.expectedConcepts.map((concept, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Candidate Answer Section (Voice Microphone + Fallback Text) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-bold text-white">Your Spoken or Typed Response</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Word Count: <span className="font-bold text-cyan-300">{wordCount}</span>
                </div>
              </div>

              {micError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Voice Speech Live Transcript Card */}
              {transcriptText && (
                <div className="mt-4 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                    <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    <span>Live Spoken Voice Transcript:</span>
                  </div>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    &ldquo;{transcriptText}&rdquo;
                  </p>
                </div>
              )}

              {/* Text Fallback Editor */}
              <div className="mt-4">
                <label className="text-xs text-slate-400 block mb-1">
                  Type your answer directly or supplement your spoken voice answer:
                </label>
                <textarea
                  rows={8}
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Articulate your approach, cite concrete architecture decisions, metrics, and trade-offs..."
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors leading-relaxed"
                />
              </div>
            </div>

            {/* Answer Control Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Microphone Toggle Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceRecording}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isRecordingVoice
                      ? 'bg-rose-600 text-white animate-pulse shadow-lg shadow-rose-600/30'
                      : 'bg-indigo-600/20 text-cyan-300 hover:bg-indigo-600/40 border border-indigo-500/40'
                  }`}
                >
                  {isRecordingVoice ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Voice Recording</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Answer Through Voice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Submit Answer CTA */}
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isEvaluating || wordCount === 0}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {isEvaluating ? (
                  <span>Evaluating Answer & Rubric...</span>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* End Early Confirmation Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full space-y-4 border border-slate-700">
            <h3 className="text-lg font-bold text-white">Conclude Interview Now?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your recorded video and answers will be finalized, proctoring report compiled, and submitted directly to the interviewer portal.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEndModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800"
              >
                Keep Going
              </button>
              <button
                onClick={() => finalizeAndSubmitInterview()}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                Submit Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
