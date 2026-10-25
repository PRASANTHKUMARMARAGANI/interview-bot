export type InterviewRole =
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'Full-Stack Developer'
  | 'AI / ML Engineer'
  | 'Data Analyst'
  | 'Java / Python Developer'
  | 'Project Viva'
  | 'HR & Behavioral'
  | 'Aptitude & Reasoning'
  | 'Custom Role';

export type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Adaptive';

export type InterviewLanguage = 'en-US' | 'te-IN' | 'hi-IN';

export type AvatarState = 'idle' | 'speaking' | 'listening' | 'thinking' | 'success';

export type UserRole = 'interviewer' | 'candidate';

export interface UserAuth {
  role: UserRole;
  name: string;
  email: string;
  organization?: string;
  rollNo?: string;
  recruiterId?: string;
}

export interface ResumeData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  isSample?: boolean;
  rawText: string;
  parsed: {
    fullName: string;
    email: string;
    phone: string;
    summary: string;
    skills: string[];
    experience: Array<{
      title: string;
      company: string;
      duration: string;
      highlights: string[];
    }>;
    education: Array<{
      degree: string;
      institution: string;
      year: string;
      score?: string;
    }>;
    projects: Array<{
      name: string;
      technologies: string[];
      description: string;
    }>;
    certifications: string[];
    uncertainExtractionFlags?: string[];
    confidenceScore: number;
  };
  jobMatch?: {
    targetRole: string;
    matchScore: number;
    matchingSkills: string[];
    missingSkills: string[];
    recommendations: string[];
  };
}

export interface InterviewQuestion {
  id: string;
  questionNumber: number;
  category: 'HR' | 'Technical' | 'Resume-Project' | 'Problem-Solving' | 'Coding-Aptitude';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionText: string;
  sourceResumeEvidence?: string;
  expectedConcepts: string[];
  rubric: {
    technicalCorrectness: string;
    relevance: string;
    reasoning: string;
    communication: string;
  };
  modelAnswerHint?: string;
  followUpQuestion?: string;
  isCustomQuestion?: boolean;
}

export interface QuestionEvaluation {
  score: number; // 0 - 100
  technicalCorrectness: number; // 0 - 100
  relevance: number; // 0 - 100
  reasoning: number; // 0 - 100
  communication: number; // 0 - 100
  completeness: number; // 0 - 100
  strengths: string[];
  missingConcepts: string[];
  evidenceFromAnswer: string;
  suggestedImprovement: string;
  feedbackText: string;
  isDemoSimulation?: boolean;
}

export interface QuestionAttempt {
  question: InterviewQuestion;
  candidateAnswer: string;
  audioDurationSeconds?: number;
  timeSpentSeconds: number;
  submittedAt: string;
  evaluation?: QuestionEvaluation;
  isRepeatedAttempt?: boolean;
  originalAttemptId?: string;
}

export interface ProctoringIncident {
  id: string;
  type: 'face_out_of_frame' | 'face_not_visible' | 'multiple_faces' | 'tab_switch' | 'copy_paste_attempt';
  timestamp: string;
  detail: string;
}

export interface ProctoringReport {
  faceNotVisibleCount: number;
  tabSwitchCount: number;
  copyPasteCount: number;
  totalViolations: number;
  trustScore: number; // 0 - 100 (100 - penalties)
  incidents: ProctoringIncident[];
}

export interface CandidateVerification {
  declaredRollNo?: string;
  declaredName: string;
  declaredEmail: string;
  declaredPhone: string;
  resumeName: string;
  resumeEmail: string;
  resumePhone: string;
  nameMatch: boolean;
  contactMatch: boolean;
  verificationScore: number; // 0 - 100
  discrepancies: string[];
}

export interface VideoRecordingMeta {
  hasVideoRecording: boolean;
  durationSeconds: number;
  recordedAt: string;
  videoDataUrl?: string;
  storageKey?: string;
}

export interface InterviewCampaign {
  id: string;
  title: string;
  targetRole: string;
  jobDescription: string;
  department: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  timeLimitMinutes: number;
  status: 'active' | 'closed' | 'draft';
  questions: InterviewQuestion[];
  questionSource: 'auto' | 'custom' | 'hybrid';
  createdBy: string;
  createdAt: string;
  totalSubmissionsCount?: number;
}

export interface InterviewSession {
  id: string;
  candidateName: string;
  candidateRollNo?: string;
  targetRole: InterviewRole | string;
  jobDescription?: string;
  resumeId?: string;
  resumeFileName?: string;
  mode: string;
  language: InterviewLanguage;
  difficulty: InterviewDifficulty;
  questionCount: number;
  timeLimitSeconds: number;
  startedAt: string;
  completedAt?: string;
  status: 'configured' | 'in_progress' | 'completed' | 'abandoned';
  questions: InterviewQuestion[];
  attempts: QuestionAttempt[];
  finalAssessment?: FinalAssessment;
  isDemoSession?: boolean;
  // Recruiter / Proctoring fields:
  campaignId?: string;
  candidateVerification?: CandidateVerification;
  proctoringReport?: ProctoringReport;
  videoRecording?: VideoRecordingMeta;
  interviewerNotes?: string;
  interviewerDecision?: 'Shortlisted' | 'Under Review' | 'Rejected' | 'Pending';
}

export interface FinalAssessment {
  overallScore: number;
  recommendation: 'Strong Match' | 'Consider Further' | 'Needs Improvement';
  recommendationExplanation: string;
  categoryScores: {
    technicalCorrectness: number;
    relevanceAndCompleteness: number;
    problemSolvingReasoning: number;
    communicationClarity: number;
    practicalApplication: number;
  };
  rubricWeights: {
    technical: number;
    relevance: number;
    reasoning: number;
    communication: number;
    application: number;
  };
  topStrengths: string[];
  criticalWeaknesses: string[];
  keyEvidence: string[];
  actionablePlan: string[];
  recommendedResources: Array<{
    title: string;
    type: 'Book' | 'Course' | 'Documentation' | 'Practice';
    link: string;
  }>;
  disclaimer: string;
  assessedAt: string;
}

export interface RepeatTestRecord {
  id: string;
  originalSessionId: string;
  questionId: string;
  questionText: string;
  category: string;
  originalAttempt: {
    answer: string;
    score: number;
    evaluation: QuestionEvaluation;
    timestamp: string;
  };
  repeatedAttempt: {
    answer: string;
    score: number;
    evaluation: QuestionEvaluation;
    timestamp: string;
  };
  scoreDelta: number;
  comparisonAnalysis: {
    completenessChange: string;
    technicalAccuracyChange: string;
    reasoningChange: string;
    keyImprovementsNoted: string[];
    remainingGaps: string[];
  };
  createdAt: string;
}

export interface AppSettings {
  apiKey: string;
  provider: 'gemini' | 'demo';
  geminiModel: string;
  ttsEnabled: boolean;
  speechRate: number;
  speechPitch: number;
  selectedVoiceURI: string;
  preferredLanguage: InterviewLanguage;
  defaultDifficulty: InterviewDifficulty;
  rubricWeights: {
    technical: number;
    relevance: number;
    reasoning: number;
    communication: number;
    application: number;
  };
  thresholds: {
    strongMatch: number;
    considerFurther: number;
  };
  theme: 'dark' | 'light';
}
