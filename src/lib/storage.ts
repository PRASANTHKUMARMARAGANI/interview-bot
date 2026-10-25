import {
  InterviewSession,
  ResumeData,
  AppSettings,
  RepeatTestRecord,
  UserAuth,
  InterviewCampaign
} from '@/types';
import { SAMPLE_RESUME_A, SAMPLE_RESUME_B } from './samples';
import { DEFAULT_RUBRIC_WEIGHTS, DEFAULT_THRESHOLDS } from './scoring';

const SETTINGS_KEY = 'interviewx_settings_v1';
const SESSIONS_KEY = 'interviewx_sessions_v1';
const RESUMES_KEY = 'interviewx_resumes_v1';
const REPEAT_TESTS_KEY = 'interviewx_repeat_tests_v1';
const AUTH_KEY = 'interviewx_auth_v1';
const CAMPAIGNS_KEY = 'interviewx_campaigns_v1';

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  provider: 'demo',
  geminiModel: 'gemini-2.5-flash',
  ttsEnabled: true,
  speechRate: 1.0,
  speechPitch: 1.0,
  selectedVoiceURI: '',
  preferredLanguage: 'en-US',
  defaultDifficulty: 'Intermediate',
  rubricWeights: DEFAULT_RUBRIC_WEIGHTS,
  thresholds: DEFAULT_THRESHOLDS,
  theme: 'dark'
};

export const DEFAULT_INTERVIEWER_USER: UserAuth = {
  role: 'interviewer',
  name: 'Sarah Jenkins',
  email: 'sarah.recruiter@interviewx.ai',
  organization: 'TechVision Enterprise Talent',
  recruiterId: 'REC-2026-904'
};

export const DEFAULT_CANDIDATE_USER: UserAuth = {
  role: 'candidate',
  name: 'Alex Morgan',
  email: 'alex.morgan.demo@interviewx.ai',
  organization: 'Apex Institute of Technology',
  rollNo: '2023-CS-101'
};

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

// ==========================================
// AUTHENTICATION & ROLE MANAGEMENT
// ==========================================
export function getCurrentUser(): UserAuth {
  if (!isBrowser) return DEFAULT_INTERVIEWER_USER;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(DEFAULT_INTERVIEWER_USER));
      return DEFAULT_INTERVIEWER_USER;
    }
    return JSON.parse(raw) as UserAuth;
  } catch (e) {
    return DEFAULT_INTERVIEWER_USER;
  }
}

export function setCurrentUser(user: UserAuth): void {
  if (!isBrowser) return;
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

export function switchRole(role: 'interviewer' | 'candidate'): UserAuth {
  const newUser = role === 'interviewer' ? DEFAULT_INTERVIEWER_USER : DEFAULT_CANDIDATE_USER;
  setCurrentUser(newUser);
  return newUser;
}

// ==========================================
// SETTINGS
// ==========================================
export function getStoredSettings(): AppSettings {
  if (!isBrowser) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  if (!isBrowser) return DEFAULT_SETTINGS;
  try {
    const current = getStoredSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

// ==========================================
// RESUMES
// ==========================================
export function getStoredResumes(): ResumeData[] {
  if (!isBrowser) return [SAMPLE_RESUME_A, SAMPLE_RESUME_B];
  try {
    const raw = localStorage.getItem(RESUMES_KEY);
    if (!raw) {
      const initial = [SAMPLE_RESUME_A, SAMPLE_RESUME_B];
      localStorage.setItem(RESUMES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as ResumeData[];
    const hasSampleA = parsed.some((r) => r.id === SAMPLE_RESUME_A.id);
    const hasSampleB = parsed.some((r) => r.id === SAMPLE_RESUME_B.id);
    if (!hasSampleA || !hasSampleB) {
      const merged = [
        ...parsed,
        ...(!hasSampleA ? [SAMPLE_RESUME_A] : []),
        ...(!hasSampleB ? [SAMPLE_RESUME_B] : [])
      ];
      localStorage.setItem(RESUMES_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (e) {
    return [SAMPLE_RESUME_A, SAMPLE_RESUME_B];
  }
}

export function saveResume(resume: ResumeData): ResumeData[] {
  if (!isBrowser) return [];
  const current = getStoredResumes();
  const existingIdx = current.findIndex((r) => r.id === resume.id);
  let updated: ResumeData[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = resume;
  } else {
    updated = [resume, ...current];
  }
  localStorage.setItem(RESUMES_KEY, JSON.stringify(updated));
  return updated;
}

// ==========================================
// RECRUITER INTERVIEW CAMPAIGNS
// ==========================================
export const DEFAULT_CAMPAIGNS: InterviewCampaign[] = [
  {
    id: 'campaign-frontend-2026',
    title: 'Senior Frontend Engineer Recruitment Drive',
    targetRole: 'Frontend Developer',
    jobDescription:
      'Seeking a skilled frontend engineer proficient in Next.js, React 19, TypeScript, and Core Web Vitals optimization to architect user-facing enterprise platforms.',
    department: 'Core Web Platform Engineering',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: 20,
    status: 'active',
    questionSource: 'hybrid',
    createdBy: 'sarah.recruiter@interviewx.ai',
    createdAt: '2026-10-24T10:00:00.000Z',
    totalSubmissionsCount: 1,
    questions: [
      {
        id: 'cq-1',
        questionNumber: 1,
        category: 'Resume-Project',
        difficulty: 'Intermediate',
        questionText: 'Can you walk us through the most technically demanding web application you have architected, highlighting the performance metrics achieved?',
        expectedConcepts: ['Component Architecture', 'Core Web Vitals', 'State Management', 'Latency Reduction'],
        rubric: {
          technicalCorrectness: 'Technical precision of frameworks used',
          relevance: 'Directly addresses real-world project outcomes',
          reasoning: 'Explains architectural trade-offs',
          communication: 'Clear and structured presentation'
        },
        modelAnswerHint: 'Detail project stack, performance auditing, and quantitative user impact.'
      },
      {
        id: 'cq-2',
        questionNumber: 2,
        category: 'Technical',
        difficulty: 'Intermediate',
        questionText: 'Explain how you approach optimizing Next.js bundle sizes and preventing layout shift (CLS) in high-traffic applications.',
        expectedConcepts: ['Dynamic Imports', 'Code Splitting', 'next/image aspect ratio', 'Font optimization'],
        rubric: {
          technicalCorrectness: 'Deep understanding of Web Vitals and bundler internals',
          relevance: 'Concrete optimization methodologies',
          reasoning: 'Prioritizes user experience metrics',
          communication: 'Concise technical vocabulary'
        },
        modelAnswerHint: 'Discuss @next/bundle-analyzer, dynamic imports, explicit image dimensions, and font swapping.'
      }
    ]
  },
  {
    id: 'campaign-aiml-2026',
    title: 'AI & Machine Learning Research Engineering Drive',
    targetRole: 'AI / ML Engineer',
    jobDescription:
      'Seeking an AI/ML specialist with experience in Large Language Models, PyTorch, LoRA/PEFT fine-tuning, vector databases, and production RAG pipeline architecture.',
    department: 'Applied Generative AI Labs',
    startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: 25,
    status: 'active',
    questionSource: 'hybrid',
    createdBy: 'sarah.recruiter@interviewx.ai',
    createdAt: '2026-10-25T09:00:00.000Z',
    totalSubmissionsCount: 1,
    questions: [
      {
        id: 'cq-ai-1',
        questionNumber: 1,
        category: 'Technical',
        difficulty: 'Intermediate',
        questionText: 'Describe how you design a multi-stage RAG pipeline that mitigates hallucinations while maintaining sub-second query latency.',
        expectedConcepts: ['Hybrid Search', 'Cross-Encoder Reranking', 'Vector Chunking', 'Metadata Filtering'],
        rubric: {
          technicalCorrectness: 'Understanding of dense vs sparse embeddings and reranker models',
          relevance: 'Practical latency reduction and accuracy trade-offs',
          reasoning: 'System design structure',
          communication: 'Crisp technical delivery'
        },
        modelAnswerHint: 'Discuss BM25 + dense vector embeddings, reciprocal rank fusion, and quantized cross-encoders.'
      },
      {
        id: 'cq-ai-2',
        questionNumber: 2,
        category: 'Resume-Project',
        difficulty: 'Intermediate',
        questionText: 'Walk us through a machine learning model you fine-tuned and deployed to production. How did you evaluate output quality?',
        expectedConcepts: ['LoRA', 'PEFT', 'Quantization', 'Evaluation Benchmarks'],
        rubric: {
          technicalCorrectness: 'Rigorous fine-tuning and evaluation mechanics',
          relevance: 'Clear real-world business outcomes',
          reasoning: 'Model parameter trade-offs',
          communication: 'Well-structured explanation'
        },
        modelAnswerHint: 'Highlight dataset curation, LoRA rank hyperparameters, and Ragas or BLEU/ROUGE metrics.'
      }
    ]
  },
  {
    id: 'campaign-fullstack-2026',
    title: 'Full-Stack Software Engineer Campus Drive 2026',
    targetRole: 'Full-Stack Developer',
    jobDescription:
      'Campus recruitment drive for graduates and upcoming engineers skilled in TypeScript, Node.js/Next.js, SQL/PostgreSQL databases, and RESTful API architecture.',
    department: 'Enterprise Application Engineering',
    startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    timeLimitMinutes: 20,
    status: 'active',
    questionSource: 'hybrid',
    createdBy: 'sarah.recruiter@interviewx.ai',
    createdAt: '2026-10-23T11:00:00.000Z',
    totalSubmissionsCount: 0,
    questions: [
      {
        id: 'cq-fs-1',
        questionNumber: 1,
        category: 'Technical',
        difficulty: 'Intermediate',
        questionText: 'Explain how you design a resilient relational database schema with ACID guarantees and indexed queries for high-throughput transactions.',
        expectedConcepts: ['B-Tree Indexing', 'Foreign Keys', 'Transaction Isolation Levels', 'Query Optimization'],
        rubric: {
          technicalCorrectness: 'Relational algebra and indexing precision',
          relevance: 'High concurrency transaction strategies',
          reasoning: 'Explains normalization vs denormalization trade-offs',
          communication: 'Clear and methodical explanation'
        },
        modelAnswerHint: 'Explain composite indexes, EXPLAIN ANALYZE query planning, and connection pooling.'
      }
    ]
  }
];

export function getStoredCampaigns(): InterviewCampaign[] {
  if (!isBrowser) return DEFAULT_CAMPAIGNS;
  try {
    const raw = localStorage.getItem(CAMPAIGNS_KEY);
    if (!raw) {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(DEFAULT_CAMPAIGNS));
      return DEFAULT_CAMPAIGNS;
    }
    const parsed = JSON.parse(raw) as InterviewCampaign[];
    if (parsed.length < 2) {
      localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(DEFAULT_CAMPAIGNS));
      return DEFAULT_CAMPAIGNS;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_CAMPAIGNS;
  }
}

export function getCampaignById(id: string): InterviewCampaign | null {
  const campaigns = getStoredCampaigns();
  return campaigns.find((c) => c.id === id) || null;
}

export function saveCampaign(campaign: InterviewCampaign): InterviewCampaign[] {
  if (!isBrowser) return [];
  const current = getStoredCampaigns();
  const existingIdx = current.findIndex((c) => c.id === campaign.id);
  let updated: InterviewCampaign[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = campaign;
  } else {
    updated = [campaign, ...current];
  }
  localStorage.setItem(CAMPAIGNS_KEY, JSON.stringify(updated));
  return updated;
}

export function isCampaignOpen(campaign: InterviewCampaign): { isOpen: boolean; reason?: string } {
  const now = new Date().getTime();
  const start = new Date(campaign.startDate).getTime();
  const end = new Date(campaign.endDate).getTime();

  if (now < start) {
    return { isOpen: false, reason: `Interview is scheduled to start on ${new Date(campaign.startDate).toLocaleString()}.` };
  }
  if (now > end) {
    return { isOpen: false, reason: `Interview submission window ended on ${new Date(campaign.endDate).toLocaleString()}. Submissions are now closed.` };
  }
  if (campaign.status === 'closed') {
    return { isOpen: false, reason: 'This interview campaign was closed by the recruiter.' };
  }
  return { isOpen: true };
}

// ==========================================
// INTERVIEW SESSIONS & PROCTORING DOSSIERS
// ==========================================
export function getStoredSessions(): InterviewSession[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as InterviewSession[];
  } catch (e) {
    return [];
  }
}

export function getSessionById(id: string): InterviewSession | null {
  const sessions = getStoredSessions();
  return sessions.find((s) => s.id === id) || null;
}

export function saveSession(session: InterviewSession): InterviewSession {
  if (!isBrowser) return session;
  const sessions = getStoredSessions();
  const existingIndex = sessions.findIndex((s) => s.id === session.id);
  let updated: InterviewSession[];
  if (existingIndex >= 0) {
    updated = [...sessions];
    updated[existingIndex] = session;
  } else {
    updated = [session, ...sessions];
  }
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  return session;
}

export function updateSessionDecision(
  sessionId: string,
  decision: 'Shortlisted' | 'Under Review' | 'Rejected' | 'Pending',
  notes?: string
): InterviewSession | null {
  const sess = getSessionById(sessionId);
  if (!sess) return null;
  const updated: InterviewSession = {
    ...sess,
    interviewerDecision: decision,
    ...(notes !== undefined ? { interviewerNotes: notes } : {})
  };
  saveSession(updated);
  return updated;
}

// ==========================================
// REPEAT TESTS
// ==========================================
export function getStoredRepeatTests(): RepeatTestRecord[] {
  if (!isBrowser) return [];
  try {
    const raw = localStorage.getItem(REPEAT_TESTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as RepeatTestRecord[];
  } catch (e) {
    return [];
  }
}

export function saveRepeatTest(test: RepeatTestRecord): RepeatTestRecord[] {
  if (!isBrowser) return [];
  const tests = getStoredRepeatTests();
  const existingIndex = tests.findIndex((t) => t.id === test.id);
  let updated: RepeatTestRecord[];
  if (existingIndex >= 0) {
    updated = [...tests];
    updated[existingIndex] = test;
  } else {
    updated = [test, ...tests];
  }
  localStorage.setItem(REPEAT_TESTS_KEY, JSON.stringify(updated));
  return updated;
}

// ==========================================
// SEED REALISTIC COMPLETED SESSION FOR DEMO
// ==========================================
export function seedSampleCompletedSession(): InterviewSession {
  const existing = getStoredSessions();
  const demoFound = existing.find((s) => s.id === 'demo-session-alex-morgan');
  if (demoFound) return demoFound;

  const demoSession: InterviewSession = {
    id: 'demo-session-alex-morgan',
    campaignId: 'campaign-frontend-2026',
    candidateName: 'Alex Morgan',
    candidateRollNo: '2023-CS-101',
    targetRole: 'Frontend Developer',
    jobDescription: 'Senior Frontend Engineer focusing on Next.js, React 19, TypeScript, and performance optimization.',
    resumeId: SAMPLE_RESUME_A.id,
    resumeFileName: SAMPLE_RESUME_A.fileName,
    mode: 'Technical & System Design',
    language: 'en-US',
    difficulty: 'Intermediate',
    questionCount: 3,
    timeLimitSeconds: 120,
    startedAt: '2026-10-24T14:00:00.000Z',
    completedAt: '2026-10-24T14:18:30.000Z',
    status: 'completed',
    isDemoSession: true,
    candidateVerification: {
      declaredRollNo: '2023-CS-101',
      declaredName: 'Alex Morgan',
      declaredEmail: 'alex.morgan.demo@interviewx.ai',
      declaredPhone: '+91 98765 43210',
      resumeName: 'Alex Morgan (Fictional Sample)',
      resumeEmail: 'alex.morgan.demo@interviewx.ai',
      resumePhone: '+91 98765 43210',
      nameMatch: true,
      contactMatch: true,
      verificationScore: 98,
      discrepancies: []
    },
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
      durationSeconds: 1110,
      recordedAt: '2026-10-24T14:18:30.000Z',
      storageKey: 'indexeddb://demo-session-alex-morgan'
    },
    interviewerDecision: 'Shortlisted',
    interviewerNotes: 'Candidate demonstrated exceptional clarity across Core Web Vitals, modern React/Next.js component models, and 100% integrity score.',
    questions: [
      {
        id: 'demo-q1',
        questionNumber: 1,
        category: 'HR',
        difficulty: 'Beginner',
        questionText: 'Can you introduce yourself and describe what sparked your interest in frontend engineering?',
        expectedConcepts: ['Passion for UI/UX', 'Component-driven development', 'Continuous learning'],
        rubric: {
          technicalCorrectness: 'Foundation of modern web concepts',
          relevance: 'Directly addresses motivations and background',
          reasoning: 'Logical career and technical progression',
          communication: 'Clear, engaging presentation'
        },
        modelAnswerHint: 'Highlight experience with React, component design, and focus on web accessibility.'
      },
      {
        id: 'demo-q2',
        questionNumber: 2,
        category: 'Resume-Project',
        difficulty: 'Intermediate',
        questionText: 'In your resume, you highlighted optimizing web application performance. What specific metrics did you target and how did you reduce bundle size by 28%?',
        sourceResumeEvidence: 'Resume: "Reduced initial page bundle size by 28% through dynamic imports"',
        expectedConcepts: ['Core Web Vitals', 'LCP', 'Code Splitting', 'Dynamic Imports', 'Image Optimization'],
        rubric: {
          technicalCorrectness: 'Accurate understanding of Core Web Vitals and bundler mechanics',
          relevance: 'Concrete discussion of optimization tools',
          reasoning: 'Explains measurement before optimization',
          communication: 'Crisp articulation of quantitative impact'
        },
        modelAnswerHint: 'Detail using webpack-bundle-analyzer or Next.js analyzer, lazy loading heavy components, and optimizing images.'
      },
      {
        id: 'demo-q3',
        questionNumber: 3,
        category: 'Technical',
        difficulty: 'Intermediate',
        questionText: 'Explain the difference between React Server Components (RSC) and Client Components. When should you choose one over the other?',
        expectedConcepts: ['Server-side execution', 'Zero bundle impact', 'Data fetching without useEffect', '"use client" directive'],
        rubric: {
          technicalCorrectness: 'Accurate differentiation of execution environments',
          relevance: 'Clear architectural guidelines on when to use each',
          reasoning: 'Understands security, latency, and client payload trade-offs',
          communication: 'Precise technical vocabulary'
        },
        modelAnswerHint: 'Server components execute on server with zero bundle impact; client components handle user events and state.'
      }
    ],
    attempts: [
      {
        question: {
          id: 'demo-q1',
          questionNumber: 1,
          category: 'HR',
          difficulty: 'Beginner',
          questionText: 'Can you introduce yourself and describe what sparked your interest in frontend engineering?',
          expectedConcepts: ['Passion for UI/UX', 'Component-driven development', 'Continuous learning'],
          rubric: {
            technicalCorrectness: 'Foundation of modern web concepts',
            relevance: 'Directly addresses motivations and background',
            reasoning: 'Logical career and technical progression',
            communication: 'Clear, engaging presentation'
          }
        },
        candidateAnswer: 'I have been developing web applications for over a year and a half, specializing in React, Next.js, and TypeScript. What sparked my passion was seeing how intuitive design and clean frontend architecture directly empower users. I love building responsive, accessible components with Tailwind CSS and managing complex state gracefully.',
        timeSpentSeconds: 45,
        submittedAt: '2026-10-24T14:03:00.000Z',
        evaluation: {
          score: 88,
          technicalCorrectness: 86,
          relevance: 92,
          reasoning: 84,
          communication: 90,
          completeness: 88,
          strengths: ['Direct, engaging introduction', 'Clear alignment with modern React and Next.js stack'],
          missingConcepts: ['Specific long-term engineering vision'],
          evidenceFromAnswer: 'Candidate stated: "specializing in React, Next.js, and TypeScript... intuitive design and clean frontend architecture directly empower users."',
          suggestedImprovement: 'Include a mention of how you collaborate cross-functionally with backend and design peers.',
          feedbackText: 'Strong introduction that clearly establishes your technical identity and enthusiasm.',
          isDemoSimulation: true
        }
      },
      {
        question: {
          id: 'demo-q2',
          questionNumber: 2,
          category: 'Resume-Project',
          difficulty: 'Intermediate',
          questionText: 'In your resume, you highlighted optimizing web application performance. What specific metrics did you target and how did you reduce bundle size by 28%?',
          expectedConcepts: ['Core Web Vitals', 'LCP', 'Code Splitting', 'Dynamic Imports', 'Image Optimization'],
          rubric: {
            technicalCorrectness: 'Accurate understanding of Core Web Vitals and bundler mechanics',
            relevance: 'Concrete discussion of optimization tools',
            reasoning: 'Explains measurement before optimization',
            communication: 'Crisp articulation of quantitative impact'
          }
        },
        candidateAnswer: 'We targeted Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS). I analyzed our production bundle using @next/bundle-analyzer and found heavy charting libraries loaded on the landing page. By converting those to dynamic imports with next/dynamic (ssr: false), modularizing icon imports, and leveraging next/image WebP conversion, we shaved 28% off the initial JS bundle.',
        timeSpentSeconds: 70,
        submittedAt: '2026-10-24T14:09:00.000Z',
        evaluation: {
          score: 93,
          technicalCorrectness: 95,
          relevance: 95,
          reasoning: 92,
          communication: 92,
          completeness: 91,
          strengths: ['Excellent technical specificity citing @next/bundle-analyzer and dynamic imports', 'Clear linkage between bundle reduction and LCP metrics'],
          missingConcepts: ['HTTP caching headers / CDN edge distribution considerations'],
          evidenceFromAnswer: 'Candidate stated: "converted heavy charting libraries to dynamic imports with next/dynamic (ssr: false)... shaved 28% off initial JS bundle."',
          suggestedImprovement: 'Mention how bundle size regressions are monitored in your automated CI/CD pipeline.',
          feedbackText: 'Outstanding response with high-signal engineering details and proven metrics.',
          isDemoSimulation: true
        }
      },
      {
        question: {
          id: 'demo-q3',
          questionNumber: 3,
          category: 'Technical',
          difficulty: 'Intermediate',
          questionText: 'Explain the difference between React Server Components (RSC) and Client Components. When should you choose one over the other?',
          expectedConcepts: ['Server-side execution', 'Zero bundle impact', 'Data fetching without useEffect', '"use client" directive'],
          rubric: {
            technicalCorrectness: 'Accurate differentiation of execution environments',
            relevance: 'Clear architectural guidelines on when to use each',
            reasoning: 'Understands security, latency, and client payload trade-offs',
            communication: 'Precise technical vocabulary'
          }
        },
        candidateAnswer: 'React Server Components execute strictly on the server and stream serialized virtual DOM representations to the client without adding JavaScript bytes to the browser bundle. They can securely access databases and APIs directly. In contrast, Client Components are designated with the "use client" directive and run in the browser to handle user interactivity, event listeners, and useState/useEffect hooks.',
        timeSpentSeconds: 62,
        submittedAt: '2026-10-24T14:15:00.000Z',
        evaluation: {
          score: 91,
          technicalCorrectness: 94,
          relevance: 90,
          reasoning: 88,
          communication: 92,
          completeness: 90,
          strengths: ['Clear explanation of zero-bundle-size benefit of RSC', 'Accurate identification of "use client" boundary constraints'],
          missingConcepts: ['Serialization boundary constraints (passing functions/non-serializable props)'],
          evidenceFromAnswer: 'Candidate stated: "RSC execute strictly on the server and stream serialized virtual DOM... without adding JavaScript bytes to the browser bundle."',
          suggestedImprovement: 'Explain what happens when Server Components pass non-serializable props to Client Components.',
          feedbackText: 'Crisp, accurate explanation that reflects strong familiarity with modern Next.js App Router paradigms.',
          isDemoSimulation: true
        }
      }
    ],
    finalAssessment: {
      overallScore: 90.7,
      recommendation: 'Strong Match',
      recommendationExplanation: 'Candidate demonstrated exceptional clarity across Core Web Vitals, modern React/Next.js component models, and quantitative performance optimization with 100% proctoring integrity.',
      categoryScores: {
        technicalCorrectness: 92,
        relevanceAndCompleteness: 91,
        problemSolvingReasoning: 88,
        communicationClarity: 91,
        practicalApplication: 91
      },
      rubricWeights: DEFAULT_RUBRIC_WEIGHTS,
      topStrengths: [
        'Precise understanding of Next.js App Router and React Server Components',
        'Quantitative focus on Core Web Vitals and bundle optimization',
        'Structured, articulate communication with relevant technical terminology'
      ],
      criticalWeaknesses: [
        'CI/CD automated regression testing for bundle size',
        'Serialization boundary constraints across RSC and Client boundaries'
      ],
      keyEvidence: [
        'Q1: Stated 1.5 years experience in React/Next.js/TypeScript with user-centric UI focus',
        'Q2: Detailed bundle analyzer audits and dynamic imports saving 28% JS weight',
        'Q3: Articulated zero-bundle impact of RSC and "use client" interactivity boundaries'
      ],
      actionablePlan: [
        'Explore bundle size budget enforcement using size-limit or bundlesize in GitHub Actions.',
        'Review deep serialization boundaries in React 19 (Server Actions & optimistic transitions).',
        'Practice system design for frontend micro-architectures.'
      ],
      recommendedResources: [
        {
          title: 'React Official Documentation on Server Components',
          type: 'Documentation',
          link: 'https://react.dev/reference/rsc/server-components'
        },
        {
          title: 'Next.js App Router Performance Guide',
          type: 'Documentation',
          link: 'https://nextjs.org/docs/app/building-your-application/optimizing'
        },
        {
          title: 'Frontend Masters — Advanced Next.js Patterns',
          type: 'Course',
          link: 'https://frontendmasters.com'
        }
      ],
      disclaimer: 'IMPORTANT NOTICE: This assessment report is an automated AI-driven practice evaluation designed exclusively for skill development and interview preparation. It does not constitute a real hiring decision, corporate offer, or official rejection by any employer. Scores reflect simulated rubric benchmarking.',
      assessedAt: '2026-10-24T14:18:30.000Z'
    }
  };

  saveSession(demoSession);

  // Also seed Priya Sharma if missing
  const priyaFound = existing.find((s) => s.id === 'demo-session-priya-sharma');
  if (!priyaFound) {
    const priyaSession: InterviewSession = {
      id: 'demo-session-priya-sharma',
      campaignId: 'campaign-frontend-2026',
      candidateName: 'Priya Sharma',
      candidateRollNo: '2023-AI-204',
      targetRole: 'AI / ML Engineer',
      jobDescription: 'Machine Learning Engineer specializing in NLP, LLM fine-tuning, PyTorch, and retrieval augmented generation.',
      resumeId: SAMPLE_RESUME_B.id,
      resumeFileName: SAMPLE_RESUME_B.fileName,
      mode: 'Proctored Video & Voice Interview',
      language: 'en-US',
      difficulty: 'Intermediate',
      questionCount: 3,
      timeLimitSeconds: 120,
      startedAt: '2026-10-25T11:00:00.000Z',
      completedAt: '2026-10-25T11:21:15.000Z',
      status: 'completed',
      isDemoSession: true,
      candidateVerification: {
        declaredRollNo: '2023-AI-204',
        declaredName: 'Priya Sharma',
        declaredEmail: 'priya.sharma.demo@interviewx.ai',
        declaredPhone: '+91 91234 56789',
        resumeName: 'Priya Sharma (Fictional Sample)',
        resumeEmail: 'priya.sharma.demo@interviewx.ai',
        resumePhone: '+91 91234 56789',
        nameMatch: true,
        contactMatch: true,
        verificationScore: 96,
        discrepancies: []
      },
      proctoringReport: {
        faceNotVisibleCount: 1,
        tabSwitchCount: 1,
        copyPasteCount: 0,
        totalViolations: 2,
        trustScore: 92,
        incidents: [
          {
            id: 'proc-inc-1',
            type: 'tab_switch',
            timestamp: '2026-10-25T11:08:22.000Z',
            detail: 'Candidate switched tabs or blurred the interview window for 4 seconds.'
          },
          {
            id: 'proc-inc-2',
            type: 'face_out_of_frame',
            timestamp: '2026-10-25T11:15:40.000Z',
            detail: 'Face was out of frame or obscured for 6 consecutive video frames.'
          }
        ]
      },
      videoRecording: {
        hasVideoRecording: true,
        durationSeconds: 1275,
        recordedAt: '2026-10-25T11:21:15.000Z',
        storageKey: 'indexeddb://demo-session-priya-sharma'
      },
      interviewerDecision: 'Under Review',
      interviewerNotes: 'Solid understanding of RAG architectures and vector embeddings. Minor tab switch logged during Question 2.',
      questions: [
        {
          id: 'priya-q1',
          questionNumber: 1,
          category: 'HR',
          difficulty: 'Beginner',
          questionText: 'Can you introduce yourself and explain your background in AI and Machine Learning?',
          expectedConcepts: ['PyTorch', 'Transformers', 'NLP', 'Problem Solving'],
          rubric: {
            technicalCorrectness: 'Solid grounding in ML fundamentals',
            relevance: 'Clear focus on NLP and model deployment',
            reasoning: 'Explains technical journey',
            communication: 'Articulate delivery'
          }
        },
        {
          id: 'priya-q2',
          questionNumber: 2,
          category: 'Technical',
          difficulty: 'Intermediate',
          questionText: 'How do you optimize retrieval in RAG systems when vector search returns irrelevant context chunks?',
          expectedConcepts: ['Reranking', 'Hybrid Search (BM25 + Dense)', 'Chunking Strategies', 'Metadata Filtering'],
          rubric: {
            technicalCorrectness: 'Cross-encoder reranking and reciprocal rank fusion',
            relevance: 'Practical solutions to hallucinations',
            reasoning: 'Balances latency vs precision',
            communication: 'Clear technical explanation'
          }
        }
      ],
      attempts: [
        {
          question: {
            id: 'priya-q1',
            questionNumber: 1,
            category: 'HR',
            difficulty: 'Beginner',
            questionText: 'Can you introduce yourself and explain your background in AI and Machine Learning?',
            expectedConcepts: ['PyTorch', 'Transformers', 'NLP', 'Problem Solving'],
            rubric: {
              technicalCorrectness: 'Solid grounding in ML fundamentals',
              relevance: 'Clear focus on NLP and model deployment',
              reasoning: 'Explains technical journey',
              communication: 'Articulate delivery'
            }
          },
          candidateAnswer: 'I am an AI/ML engineer passionate about NLP and Generative AI. Over the past two years, I have built semantic search pipelines, fine-tuned transformer models using LoRA/PEFT, and deployed enterprise RAG assistants with LangChain and FAISS.',
          timeSpentSeconds: 52,
          submittedAt: '2026-10-25T11:04:00.000Z',
          evaluation: {
            score: 87,
            technicalCorrectness: 89,
            relevance: 90,
            reasoning: 85,
            communication: 86,
            completeness: 85,
            strengths: ['Clear explanation of Generative AI and PEFT tooling', 'Confident and focused self-introduction'],
            missingConcepts: ['Production latency constraints and quantization'],
            evidenceFromAnswer: 'Candidate stated: "fine-tuned transformer models using LoRA/PEFT, and deployed enterprise RAG assistants with LangChain and FAISS."',
            suggestedImprovement: 'Mention inference optimization like vLLM or llama.cpp.',
            feedbackText: 'Strong introduction with relevant practical experience in NLP.',
            isDemoSimulation: true
          }
        },
        {
          question: {
            id: 'priya-q2',
            questionNumber: 2,
            category: 'Technical',
            difficulty: 'Intermediate',
            questionText: 'How do you optimize retrieval in RAG systems when vector search returns irrelevant context chunks?',
            expectedConcepts: ['Reranking', 'Hybrid Search (BM25 + Dense)', 'Chunking Strategies', 'Metadata Filtering'],
            rubric: {
              technicalCorrectness: 'Cross-encoder reranking and reciprocal rank fusion',
              relevance: 'Practical solutions to hallucinations',
              reasoning: 'Balances latency vs precision',
              communication: 'Clear technical explanation'
            }
          },
          candidateAnswer: 'To tackle noisy vector retrieval, I implement a two-stage retrieval pipeline: first stage uses hybrid search combining dense embeddings with BM25 keyword matching via Reciprocal Rank Fusion. Second stage runs a cross-encoder reranker like Cohere or BGE-Reranker to re-score top 20 candidates. We also adjust semantic chunking with overlapping tokens.',
          timeSpentSeconds: 68,
          submittedAt: '2026-10-25T11:12:00.000Z',
          evaluation: {
            score: 92,
            technicalCorrectness: 94,
            relevance: 93,
            reasoning: 90,
            communication: 91,
            completeness: 90,
            strengths: ['Excellent citation of hybrid search (BM25 + dense) and cross-encoder reranking', 'Understands precision improvement in RAG'],
            missingConcepts: ['Evaluation benchmarks like RAGAS or TruLens'],
            evidenceFromAnswer: 'Candidate stated: "hybrid search combining dense embeddings with BM25 keyword matching... cross-encoder reranker like Cohere or BGE-Reranker."',
            suggestedImprovement: 'Discuss automated RAG evaluation metrics (faithfulness, answer relevancy).',
            feedbackText: 'Top-tier technical answer demonstrating modern state-of-the-art RAG architecture.',
            isDemoSimulation: true
          }
        }
      ],
      finalAssessment: {
        overallScore: 89.5,
        recommendation: 'Strong Match',
        recommendationExplanation: 'Candidate demonstrated deep mastery in modern Generative AI, RAG optimization, and hybrid retrieval systems.',
        categoryScores: {
          technicalCorrectness: 91,
          relevanceAndCompleteness: 91,
          problemSolvingReasoning: 88,
          communicationClarity: 89,
          practicalApplication: 89
        },
        rubricWeights: DEFAULT_RUBRIC_WEIGHTS,
        topStrengths: ['Deep knowledge of RAG two-stage reranking and hybrid retrieval', 'Clear, precise articulation'],
        criticalWeaknesses: ['1 brief tab switch detected during interview', 'Evaluation frameworks for LLM outputs'],
        keyEvidence: ['Q1: Fine-tuned transformers with LoRA/PEFT', 'Q2: Implemented hybrid BM25 + dense search with BGE-Reranker'],
        actionablePlan: ['Investigate automated evaluation using Ragas framework', 'Ensure full compliance with proctoring environment'],
        recommendedResources: [
          { title: 'Advanced RAG Techniques (LlamaIndex Guide)', type: 'Documentation', link: 'https://docs.llamaindex.ai' },
          { title: 'DeepLearning.AI — Advanced Retrieval for AI with Chroma', type: 'Course', link: 'https://deeplearning.ai' }
        ],
        disclaimer: 'IMPORTANT NOTICE: Practice evaluation mock report.',
        assessedAt: '2026-10-25T11:21:15.000Z'
      }
    };
    saveSession(priyaSession);
  }

  return demoSession;
}
