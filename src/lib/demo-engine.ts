import { InterviewQuestion, QuestionEvaluation, InterviewRole, InterviewDifficulty } from '@/types';

interface RoleQuestionTemplate {
  category: InterviewQuestion['category'];
  difficulty: InterviewQuestion['difficulty'];
  questionText: string;
  expectedConcepts: string[];
  rubric: InterviewQuestion['rubric'];
  modelAnswerHint: string;
  sourceResumeEvidence: string;
  followUpQuestion: string;
}

const QUESTION_BANK: Record<string, RoleQuestionTemplate[]> = {
  'Frontend Developer': [
    {
      category: 'HR',
      difficulty: 'Beginner',
      questionText: 'Can you introduce yourself and describe what sparked your interest in frontend engineering and modern web development?',
      expectedConcepts: ['Passion for UI/UX', 'Component-driven development', 'Continuous learning', 'Problem solving'],
      rubric: {
        technicalCorrectness: 'Clarity of engineering foundation and web concepts',
        relevance: 'Directly addresses motivations and background',
        reasoning: 'Logical career and technical progression',
        communication: 'Clear, engaging, and professional communication'
      },
      modelAnswerHint: 'Highlight your journey into web technologies, experience with React or modern JavaScript, and passion for creating accessible, user-friendly experiences.',
      sourceResumeEvidence: 'Professional Summary & Web Development Projects',
      followUpQuestion: 'How do you stay updated with rapidly evolving frontend ecosystems like React 19 and Next.js?'
    },
    {
      category: 'Resume-Project',
      difficulty: 'Intermediate',
      questionText: 'In your resume, you highlighted optimizing web application performance. What specific metrics did you target, and how did you diagnose and eliminate bundle bottlenecks?',
      expectedConcepts: ['Core Web Vitals', 'LCP', 'Bundle Analyzer', 'Code Splitting', 'Dynamic Imports', 'Image Optimization'],
      rubric: {
        technicalCorrectness: 'Accurate understanding of Core Web Vitals and bundler mechanics',
        relevance: 'Concrete discussion of optimization tools and techniques',
        reasoning: 'Explains measurement before optimization principles',
        communication: 'Crisp articulation of quantitative impact'
      },
      modelAnswerHint: 'Discuss auditing with Lighthouse/Web Vitals, using webpack-bundle-analyzer or Next.js analyzer, lazy loading heavy libraries, and optimizing assets.',
      sourceResumeEvidence: 'Resume: "Reduced initial page bundle size by 28% through dynamic imports"',
      followUpQuestion: 'How would you prevent regression in bundle size within a CI/CD pipeline?'
    },
    {
      category: 'Technical',
      difficulty: 'Intermediate',
      questionText: 'Explain the fundamental difference between React Server Components (RSC) and Client Components. When should you choose one over the other?',
      expectedConcepts: ['Server-side execution', 'Zero bundle impact', 'Data fetching without useEffect', 'Interactivity & hooks on client', '"use client" directive'],
      rubric: {
        technicalCorrectness: 'Accurate differentiation of execution environments and serialization boundaries',
        relevance: 'Clear architectural guidelines on when to use each component type',
        reasoning: 'Understands security, latency, and client payload trade-offs',
        communication: 'Concise and precise technical vocabulary'
      },
      modelAnswerHint: 'Explain that RSC execute solely on the server, streaming HTML and serialized data without increasing client JS bundle. Client components are required for state, effects, and event listeners.',
      sourceResumeEvidence: 'Next.js App Router & React 18/19 experience',
      followUpQuestion: 'What happens when you pass non-serializable props from a Server Component to a Client Component?'
    },
    {
      category: 'Problem-Solving',
      difficulty: 'Advanced',
      questionText: 'How would you architect a high-frequency search input with auto-complete in React to prevent UI jank, unnecessary network spam, and race conditions?',
      expectedConcepts: ['Debouncing / Throttling', 'AbortController', 'Stale response cancellation', 'Virtualization for large lists', 'Accessibility ARIA live regions'],
      rubric: {
        technicalCorrectness: 'Correct usage of debouncing, cancellation tokens, and memory hygiene',
        relevance: 'Addresses both network pressure and rendering smoothness',
        reasoning: 'Considers race conditions where old requests resolve after newer ones',
        communication: 'Methodical step-by-step architectural breakdown'
      },
      modelAnswerHint: 'Implement debouncing with custom hooks, cancel outstanding in-flight fetch requests via AbortController signal, and virtualize large dropdown lists.',
      sourceResumeEvidence: 'Resume: "Implemented search autocomplete with debounced filtering"',
      followUpQuestion: 'How would you implement caching for previously searched query terms on the client side?'
    },
    {
      category: 'Coding-Aptitude',
      difficulty: 'Intermediate',
      questionText: 'Explain how you would implement a custom `useDebounce` hook in React using TypeScript. What cleanup considerations must be handled?',
      expectedConcepts: ['setTimeout & clearTimeout', 'useEffect cleanup function', 'Generic typing <T>', 'Dependency array'],
      rubric: {
        technicalCorrectness: 'Proper timer cleanup to prevent memory leaks and state updates on unmounted components',
        relevance: 'Directly addresses TypeScript generics and React hook rules',
        reasoning: 'Explains the lifecycle of effects during rapid value changes',
        communication: 'Clear code walkthrough with edge case handling'
      },
      modelAnswerHint: 'Set a timeout inside useEffect to update debounced state after delay, returning a cleanup function that invokes clearTimeout when the input value or delay changes.',
      sourceResumeEvidence: 'Technical Skills: React, TypeScript, Custom Hooks',
      followUpQuestion: 'What is the difference between debouncing and throttling in user interaction handlers?'
    }
  ],

  'AI / ML Engineer': [
    {
      category: 'HR',
      difficulty: 'Beginner',
      questionText: 'What inspired your focus on Machine Learning and Artificial Intelligence, and what types of machine learning problems excite you most?',
      expectedConcepts: ['Mathematical curiosity', 'Real-world data impact', 'NLP/Computer Vision interest', 'Scalable systems'],
      rubric: {
        technicalCorrectness: 'Sound foundational awareness of modern AI paradigms',
        relevance: 'Authentic narrative connecting study to practical problems',
        reasoning: 'Grounded rationale for pursuing applied ML',
        communication: 'Articulate and enthusiastic delivery'
      },
      modelAnswerHint: 'Discuss your passion for leveraging predictive modeling and neural architectures to solve high-impact real-world data problems.',
      sourceResumeEvidence: 'Professional Summary: Foundational expertise in Machine Learning & NLP',
      followUpQuestion: 'How do you keep abreast of rapidly advancing foundation models and research papers?'
    },
    {
      category: 'Resume-Project',
      difficulty: 'Intermediate',
      questionText: 'In your resume, you described building a RAG-powered document QA system. How did you handle document chunking, embeddings generation, and vector retrieval accuracy?',
      expectedConcepts: ['Recursive chunking', 'Overlap strategies', 'Embedding models', 'Cosine similarity / Vector index', 'Reranking / BM25 hybrid search'],
      rubric: {
        technicalCorrectness: 'Accurate technical knowledge of RAG architecture pipeline',
        relevance: 'Reflects real project engineering decisions and trade-offs',
        reasoning: 'Justifies chunk size vs. context window trade-offs',
        communication: 'Structured and detailed explanation of system components'
      },
      modelAnswerHint: 'Detail your chunking strategy (e.g. 500 tokens with 50 token overlap), embedding choice, vector database indexing (FAISS/Chroma), and hybrid retrieval or reranking to curb hallucinations.',
      sourceResumeEvidence: 'Project: "DocuQuery: RAG-Powered PDF Question-Answering"',
      followUpQuestion: 'What strategies did you use to evaluate retrieval precision and minimize hallucinated responses?'
    },
    {
      category: 'Technical',
      difficulty: 'Intermediate',
      questionText: 'Explain the mechanism of Self-Attention in Transformer models. What do the Query, Key, and Value vectors represent mathematically and intuitively?',
      expectedConcepts: ['Scaled dot-product attention', 'Softmax normalization', 'Q, K, V linear projections', 'Attention matrix weights', 'Contextual representations'],
      rubric: {
        technicalCorrectness: 'Mathematically sound definition of Attention(Q,K,V) = softmax(QK^T / sqrt(d_k))V',
        relevance: 'Clear intuitive mapping to information retrieval (search query vs database keys)',
        reasoning: 'Understands why scaling factor sqrt(d_k) prevents vanishing gradients',
        communication: 'Crystal-clear explanation of complex mathematical concept'
      },
      modelAnswerHint: 'Explain how Queries match Keys via dot products to create attention distribution weights, which weight the Values to output dynamically contextualized token representations.',
      sourceResumeEvidence: 'Technical Skills: PyTorch, Hugging Face Transformers, BERT',
      followUpQuestion: 'Why does Multi-Head Attention provide advantages over a single large attention head?'
    },
    {
      category: 'Problem-Solving',
      difficulty: 'Advanced',
      questionText: 'Suppose your trained classification model shows 97% training accuracy but drops to 71% on out-of-sample validation data. Walk me through your diagnostic and remediation protocol.',
      expectedConcepts: ['Overfitting diagnosis', 'Data leakage inspection', 'Cross-validation', 'Regularization (L1/L2, Dropout)', 'Data augmentation', 'Feature selection'],
      rubric: {
        technicalCorrectness: 'Comprehensive understanding of variance vs bias and overfitting mitigations',
        relevance: 'Systematic debugging process rather than random trial and error',
        reasoning: 'Prioritizes root cause analysis (data distribution shifts, leakage) before complex fixes',
        communication: 'Methodical and structured engineering troubleshooting plan'
      },
      modelAnswerHint: 'First check for data leakage between train/test splits. Then evaluate learning curves, apply regularization techniques (Dropout, weight decay), gather or augment training data, and consider model complexity pruning.',
      sourceResumeEvidence: 'Skills: Model Evaluation, ROC-AUC, Feature Engineering',
      followUpQuestion: 'How would you differentiate between covariate shift and concept drift in production?'
    },
    {
      category: 'Coding-Aptitude',
      difficulty: 'Intermediate',
      questionText: 'How would you structure a low-latency, containerized model inference service using FastAPI and Docker? What concurrency and batching optimizations would you apply?',
      expectedConcepts: ['Async endpoints vs thread pool', 'Dynamic request batching', 'Worker processes (Uvicorn/Gunicorn)', 'Model warm-up on startup', 'Health check endpoints'],
      rubric: {
        technicalCorrectness: 'Proper utilization of FastAPI lifecycle events and asynchronous GPU/CPU worker offloading',
        relevance: 'Production-ready MLOps deployment practices',
        reasoning: 'Balances latency per request against throughput via dynamic batching',
        communication: 'Clear architectural description of container pipeline'
      },
      modelAnswerHint: 'Load weights into memory once during FastAPI lifespan startup, run blocking PyTorch inference inside background worker pools or dynamic batching queues, and expose lightweight REST endpoints.',
      sourceResumeEvidence: 'Work Experience: "Containerized model inference using FastAPI and Docker"',
      followUpQuestion: 'How do you monitor model latency and memory leaks in production containers?'
    }
  ],

  'Backend Developer': [
    {
      category: 'HR',
      difficulty: 'Beginner',
      questionText: 'Can you describe your background in backend engineering and your approach to building reliable, scalable server-side systems?',
      expectedConcepts: ['API design', 'Data consistency', 'Scalability', 'System resilience'],
      rubric: {
        technicalCorrectness: 'Sound grasp of backend architecture principles',
        relevance: 'Addresses career goals and engineering philosophy',
        reasoning: 'Grounded understanding of backend reliability',
        communication: 'Professional and structured presentation'
      },
      modelAnswerHint: 'Discuss your experience building REST/gRPC APIs, working with SQL/NoSQL databases, and prioritizing correctness, observability, and test-driven development.',
      sourceResumeEvidence: 'Backend Experience & System Engineering',
      followUpQuestion: 'What is your preferred database technology and why?'
    },
    {
      category: 'Technical',
      difficulty: 'Intermediate',
      questionText: 'Explain the difference between optimistic locking and pessimistic locking in database transactions. When would you choose each approach?',
      expectedConcepts: ['Version columns / timestamps', 'Row-level database locks (SELECT FOR UPDATE)', 'High vs low concurrency scenarios', 'Deadlock risks'],
      rubric: {
        technicalCorrectness: 'Accurate explanation of lock acquisition vs version verification',
        relevance: 'Clear guidelines on conflict probability trade-offs',
        reasoning: 'Explains throughput and rollback overheads',
        communication: 'Crisp technical differentiation'
      },
      modelAnswerHint: 'Pessimistic locking locks records directly at query time, suitable for high-conflict financial updates. Optimistic locking verifies version counters on commit, ideal for high-throughput reads with infrequent write conflicts.',
      sourceResumeEvidence: 'Database Management & Transaction Handling',
      followUpQuestion: 'How do you prevent distributed deadlocks across microservice boundaries?'
    },
    {
      category: 'Problem-Solving',
      difficulty: 'Advanced',
      questionText: 'How would you design a distributed rate limiter that restricts API requests per client to 100 requests per minute across a cluster of 10 backend servers?',
      expectedConcepts: ['Token Bucket / Sliding Window', 'Redis in-memory store', 'Atomic Redis operations (Lua scripts)', 'Handling clock skew / race conditions', 'Graceful 429 response'],
      rubric: {
        technicalCorrectness: 'Proper choice of algorithm (Sliding Window Log or Sliding Window Counter) and Redis Lua script atomicity',
        relevance: 'Fully addresses multi-node cluster synchronization',
        reasoning: 'Considers network latency to Redis and fail-open vs fail-closed strategies',
        communication: 'Clear architectural diagram description'
      },
      modelAnswerHint: 'Use a Sliding Window Counter algorithm backed by Redis, executing atomic increment and expiration checks via a Lua script to prevent race conditions across multiple server instances.',
      sourceResumeEvidence: 'API Scalability & Microservices Architecture',
      followUpQuestion: 'What happens to your API traffic if the central Redis cache becomes unreachable?'
    }
  ]
};

// Default fallback question pool for general and custom roles
const GENERAL_QUESTION_POOL: RoleQuestionTemplate[] = [
  {
    category: 'HR',
    difficulty: 'Beginner',
    questionText: 'Please introduce yourself, summarize your core technical capabilities, and explain what makes you well-suited for this position.',
    expectedConcepts: ['Clear introduction', 'Relevant technical skills', 'Enthusiasm', 'Problem solving'],
    rubric: {
      technicalCorrectness: 'Accurate self-assessment and technical terminology',
      relevance: 'Addresses role requirements directly',
      reasoning: 'Logical career progression and alignment',
      communication: 'Confident, concise, and structured delivery'
    },
    modelAnswerHint: 'Share your academic and project background, key technical strengths, and enthusiasm for building impactful solutions.',
    sourceResumeEvidence: 'Candidate Profile & Summary',
    followUpQuestion: 'What has been your most challenging technical obstacle so far, and how did you resolve it?'
  },
  {
    category: 'Resume-Project',
    difficulty: 'Intermediate',
    questionText: 'Walk me through the most technically demanding project listed on your resume. What was your specific architectural contribution, and what trade-offs did you evaluate?',
    expectedConcepts: ['Project architecture', 'Specific individual role', 'Trade-offs evaluated', 'Measurable outcome'],
    rubric: {
      technicalCorrectness: 'Depth of technical details regarding technologies used',
      relevance: 'Directly relates to claimed resume experience',
      reasoning: 'Critical analysis of decisions made vs alternatives rejected',
      communication: 'STAR format (Situation, Task, Action, Result)'
    },
    modelAnswerHint: 'Structure with STAR format: describe the problem, the tech stack chosen, why alternatives were discarded, and the concrete outcome or metrics achieved.',
    sourceResumeEvidence: 'Academic / Personal Projects Section',
    followUpQuestion: 'If you had another month to work on that project, what would you re-architect?'
  },
  {
    category: 'Technical',
    difficulty: 'Intermediate',
    questionText: 'How do you approach debugging complex, intermittent issues in software systems where error logs provide incomplete clues?',
    expectedConcepts: ['Reproducibility', 'Systematic isolation', 'Logging / Telemetry', 'Binary search / Git bisect', 'Unit testing edge cases'],
    rubric: {
      technicalCorrectness: 'Sound engineering methodology for root-cause diagnosis',
      relevance: 'Focuses on methodical isolation rather than guessing',
      reasoning: 'Understands observability and reproducibility principles',
      communication: 'Clear, systematic communication'
    },
    modelAnswerHint: 'Explain isolating variables to create a minimal reproducible example, adding structured distributed logs or metrics, inspecting network/system boundaries, and writing regression tests.',
    sourceResumeEvidence: 'Software Engineering Competency',
    followUpQuestion: 'How do you safeguard against similar issues recurring in production?'
  },
  {
    category: 'Problem-Solving',
    difficulty: 'Advanced',
    questionText: 'Explain how you analyze the time and space complexity of an algorithm. How do you decide when to trade memory space for runtime execution speed?',
    expectedConcepts: ['Big-O notation', 'Worst vs Average case', 'Time-space trade-offs', 'Caching / Hash maps vs In-place algorithms'],
    rubric: {
      technicalCorrectness: 'Rigorous Big-O definitions and complexity analysis',
      relevance: 'Practical examples of caching or memory optimization',
      reasoning: 'Balances hardware constraints with business responsiveness',
      communication: 'Precise and analytical explanation'
    },
    modelAnswerHint: 'Explain Big-O as an asymptotic upper bound on growth. Give concrete trade-off examples like memoization (O(1) lookup via O(N) memory) versus recalculation.',
    sourceResumeEvidence: 'Data Structures & Algorithms Knowledge',
    followUpQuestion: 'Can you give an example where minimizing space complexity is strictly more critical than minimizing time?'
  },
  {
    category: 'Coding-Aptitude',
    difficulty: 'Intermediate',
    questionText: 'What principles guide you when writing clean, maintainable, and thoroughly tested code in a collaborative team repository?',
    expectedConcepts: ['DRY and SOLID principles', 'Descriptive naming', 'Modular architecture', 'Automated unit tests', 'Code reviews & git hygiene'],
    rubric: {
      technicalCorrectness: 'Clear understanding of software engineering craft',
      relevance: 'Directly applicable to team collaboration',
      reasoning: 'Focuses on long-term maintainability over quick hacks',
      communication: 'Articulate engineering principles'
    },
    modelAnswerHint: 'Discuss self-documenting code, single-responsibility functions, comprehensive unit and integration testing, and constructive peer code reviews.',
    sourceResumeEvidence: 'Software Development Best Practices',
    followUpQuestion: 'How do you balance writing ideal clean code against tight project deadlines?'
  }
];

export function getDemoQuestionsForRole(
  role: string,
  count: number = 5,
  difficulty: InterviewDifficulty = 'Intermediate'
): InterviewQuestion[] {
  const matchingKey = Object.keys(QUESTION_BANK).find((key) =>
    role.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(role.toLowerCase())
  );

  const bank = matchingKey ? QUESTION_BANK[matchingKey] : GENERAL_QUESTION_POOL;

  const result: InterviewQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const template = bank[i % bank.length];
    result.push({
      id: `demo-q-${i + 1}-${Date.now()}`,
      questionNumber: i + 1,
      category: template.category,
      difficulty: difficulty === 'Adaptive' ? template.difficulty : (difficulty as any),
      questionText: template.questionText,
      expectedConcepts: template.expectedConcepts,
      rubric: template.rubric,
      modelAnswerHint: template.modelAnswerHint,
      sourceResumeEvidence: template.sourceResumeEvidence,
      followUpQuestion: template.followUpQuestion
    });
  }

  return result;
}

/**
 * Contextual simulated evaluation that checks real answer content,
 * word count, keyword matches, and provides honest, high-signal feedback.
 */
export function evaluateDemoAnswer(
  question: InterviewQuestion,
  answer: string
): QuestionEvaluation {
  const cleanAnswer = (answer || '').trim();
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

  if (wordCount < 5) {
    return {
      score: 25,
      technicalCorrectness: 20,
      relevance: 30,
      reasoning: 20,
      communication: 35,
      completeness: 20,
      strengths: ['Attempted to submit a response'],
      missingConcepts: question.expectedConcepts,
      evidenceFromAnswer: cleanAnswer ? `"${cleanAnswer}"` : 'Minimal or empty answer provided.',
      suggestedImprovement: `Provide a substantive explanation covering core concepts such as ${question.expectedConcepts.slice(0, 3).join(', ')}.`,
      feedbackText: 'The response was too brief to demonstrate full competency. Expand your thought process with concrete examples.',
      isDemoSimulation: true
    };
  }

  const lowerAnswer = cleanAnswer.toLowerCase();
  const matchedConcepts = question.expectedConcepts.filter((c) =>
    lowerAnswer.includes(c.toLowerCase()) ||
    c.toLowerCase().split(/\s+/).some((part) => part.length > 3 && lowerAnswer.includes(part))
  );

  const missingConcepts = question.expectedConcepts.filter((c) => !matchedConcepts.includes(c));

  // Score calibration based on depth, word count, and concept matches
  const conceptRatio = matchedConcepts.length / Math.max(1, question.expectedConcepts.length);
  const lengthBonus = Math.min(25, Math.floor(wordCount / 4)); // max 25 pts for 100 words
  const baseTechnical = Math.min(100, Math.round(40 + conceptRatio * 40 + (wordCount > 30 ? 10 : 0)));
  const baseRelevance = Math.min(100, Math.round(50 + conceptRatio * 35 + Math.min(15, wordCount / 5)));
  const baseReasoning = Math.min(100, Math.round(45 + conceptRatio * 35 + (cleanAnswer.includes('because') || cleanAnswer.includes('therefore') || cleanAnswer.includes('trade-off') ? 15 : 5)));
  const baseCommunication = Math.min(100, Math.round(60 + Math.min(30, wordCount / 3)));
  const baseCompleteness = Math.min(100, Math.round(35 + conceptRatio * 45 + Math.min(20, wordCount / 6)));

  const overallScore = Math.round(
    baseTechnical * 0.35 +
    baseRelevance * 0.25 +
    baseReasoning * 0.2 +
    baseCommunication * 0.1 +
    baseCompleteness * 0.1
  );

  const quoteSnippet =
    cleanAnswer.length > 120 ? cleanAnswer.slice(0, 115) + '...' : cleanAnswer;

  const strengths: string[] = [];
  if (matchedConcepts.length > 0) {
    strengths.push(`Addressed key concepts: ${matchedConcepts.slice(0, 2).join(', ')}`);
  }
  if (wordCount >= 40) {
    strengths.push('Provided adequate structural depth and detailed narrative');
  } else {
    strengths.push('Clear and direct conversational tone');
  }

  return {
    score: overallScore,
    technicalCorrectness: baseTechnical,
    relevance: baseRelevance,
    reasoning: baseReasoning,
    communication: baseCommunication,
    completeness: baseCompleteness,
    strengths,
    missingConcepts: missingConcepts.length > 0 ? missingConcepts : ['Edge-case fault tolerance considerations'],
    evidenceFromAnswer: `Candidate stated: "${quoteSnippet}"`,
    suggestedImprovement: question.modelAnswerHint || 'Review core technical concepts and architectural trade-offs.',
    feedbackText:
      overallScore >= 80
        ? `Strong, comprehensive response highlighting ${matchedConcepts.join(', ') || 'solid domain knowledge'}.`
        : `Good effort with valid foundational points. To excel, integrate ${missingConcepts.slice(0, 2).join(' and ') || 'deeper architectural trade-offs'}.`,
    isDemoSimulation: true
  };
}
