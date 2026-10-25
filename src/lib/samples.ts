import { ResumeData } from '@/types';

export const SAMPLE_RESUME_A: ResumeData = {
  id: 'sample-resume-frontend',
  fileName: 'Sample_A_Junior_Frontend_Dev.pdf',
  fileSize: 124500,
  uploadedAt: '2026-10-20T10:00:00.000Z',
  isSample: true,
  rawText: `[FICTIONAL SAMPLE RESUME A - Junior Frontend Developer]
Alex Morgan | Bengaluru, India | alex.morgan.demo@interviewx.ai | +91 98765 43210
Portfolio: https://alexmorgan-demo.dev | GitHub: github.com/alexmorgan-demo

PROFESSIONAL SUMMARY
Passionate Junior Frontend Developer with 1.5 years of experience building accessible, responsive web applications using React, Next.js, and TypeScript. Experienced in state management with Redux Toolkit and modern CSS architecture (Tailwind CSS). Eager to contribute to scalable UI engineering and design systems.

TECHNICAL SKILLS
- Languages: JavaScript (ES6+), TypeScript, HTML5, CSS3/SCSS
- Frameworks & Libraries: React 18/19, Next.js (App Router), Redux Toolkit, Tailwind CSS, Framer Motion
- Tools & Testing: Git, GitHub, Vite, Jest, React Testing Library, Postman, Figma
- Concepts: Responsive Web Design, RESTful APIs, Web Performance Optimization, Core Web Vitals, Accessibility (a11y)

WORK EXPERIENCE
Junior Frontend Engineer | NovaCloud Technologies (Intern & Full-Time) | July 2025 – Present
- Developed modular React components for an enterprise analytics dashboard serving 15,000+ monthly active users.
- Reduced initial page bundle size by 28% through dynamic imports, image optimization, and tree-shaking in Next.js.
- Collaborated with UI/UX designers to implement WCAG 2.1 AA compliant interfaces across 12 product modules.
- Integrated RESTful endpoints and optimized data caching using React Query.

ACADEMIC PROJECTS
1. E-Commerce Modern Storefront (React, TypeScript, Tailwind CSS, Stripe Mock)
- Architected a client-side shopping cart with optimistic UI updates and local persistence.
- Implemented search autocomplete, debounced product filtering, and mobile-first responsive drawer navigation.

2. DevPulse - Developer Community Platform (Next.js, Tailwind, MongoDB)
- Built server-rendered feed pages and dynamic metadata generation for SEO performance.
- Integrated markdown rendering with live preview and code snippet syntax highlighting.

EDUCATION
Bachelor of Technology in Computer Science and Engineering | Apex Institute of Technology | 2021 – 2025
- CGPA: 8.6 / 10.0
- Relevant Coursework: Data Structures & Algorithms, Web Technologies, Database Systems, Software Engineering

CERTIFICATIONS
- Meta Certified Front-End Developer (Coursera) - 2024
- Responsive Web Design Certification (freeCodeCamp) - 2023`,
  parsed: {
    fullName: 'Alex Morgan (Fictional Sample)',
    email: 'alex.morgan.demo@interviewx.ai',
    phone: '+91 98765 43210',
    summary: 'Junior Frontend Developer with 1.5 years experience in React, Next.js, TypeScript, and modern CSS frameworks.',
    skills: [
      'React',
      'Next.js',
      'TypeScript',
      'JavaScript',
      'Tailwind CSS',
      'Redux Toolkit',
      'HTML5/CSS3',
      'REST APIs',
      'Web Performance',
      'Jest',
      'Git'
    ],
    experience: [
      {
        title: 'Junior Frontend Engineer',
        company: 'NovaCloud Technologies (Fictional)',
        duration: 'July 2025 – Present',
        highlights: [
          'Engineered React components for analytics dashboard serving 15k users',
          'Reduced bundle size by 28% using code splitting and dynamic imports',
          'Built accessible WCAG 2.1 AA compliant UI components'
        ]
      }
    ],
    education: [
      {
        degree: 'B.Tech in Computer Science and Engineering',
        institution: 'Apex Institute of Technology (Fictional)',
        year: '2021 – 2025',
        score: '8.6 CGPA'
      }
    ],
    projects: [
      {
        name: 'E-Commerce Modern Storefront',
        technologies: ['React', 'TypeScript', 'Tailwind CSS'],
        description: 'Client-side shopping cart with optimistic updates and debounced search.'
      },
      {
        name: 'DevPulse Community Platform',
        technologies: ['Next.js', 'Tailwind CSS', 'MongoDB'],
        description: 'Server-rendered developer feed with SEO optimization and markdown editor.'
      }
    ],
    certifications: [
      'Meta Certified Front-End Developer',
      'Responsive Web Design - freeCodeCamp'
    ],
    uncertainExtractionFlags: [],
    confidenceScore: 96
  },
  jobMatch: {
    targetRole: 'Frontend Developer',
    matchScore: 92,
    matchingSkills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'JavaScript', 'HTML5/CSS3', 'REST APIs', 'Git'],
    missingSkills: ['GraphQL', 'End-to-End Testing (Cypress/Playwright)', 'Micro-frontends'],
    recommendations: [
      'Review React Server Components vs. Client Components trade-offs',
      'Prepare to explain Web Vitals (LCP, FID, CLS) optimization strategies',
      'Be ready to live-code a custom hook for debouncing or data fetching'
    ]
  }
};

export const SAMPLE_RESUME_B: ResumeData = {
  id: 'sample-resume-aiml',
  fileName: 'Sample_B_Junior_AIML_Engineer.docx',
  fileSize: 148200,
  uploadedAt: '2026-10-21T14:30:00.000Z',
  isSample: true,
  rawText: `[FICTIONAL SAMPLE RESUME B - Junior AI/ML Engineer]
Priya Sharma | Hyderabad, India | priya.sharma.demo@interviewx.ai | +91 91234 56789
LinkedIn: linkedin.com/in/priyasharma-demo | Kaggle: kaggle.com/priyasharma-demo

PROFESSIONAL SUMMARY
Aspiring AI/ML Engineer with foundational expertise in Machine Learning, Deep Learning, Natural Language Processing, and Computer Vision. Hands-on experience developing predictive models using Python, PyTorch, Scikit-Learn, and deploying lightweight inference pipelines via FastAPI and Docker.

TECHNICAL SKILLS
- Programming: Python, SQL, C++, Bash
- ML/DL Frameworks: PyTorch, TensorFlow, Scikit-Learn, Hugging Face Transformers
- Data & Analytics: Pandas, NumPy, Matplotlib, Seaborn, OpenCV
- Deployment & MLOps: FastAPI, Docker, MLflow, Git, Google Colab, Linux
- Core Competencies: Supervised/Unsupervised Learning, CNNs, Transformers, Model Evaluation (Precision, Recall, ROC-AUC), Feature Engineering

WORK EXPERIENCE & INTERNSHIPS
Machine Learning Intern | DataSphere Intelligence Labs | Jan 2025 – June 2025
- Built and fine-tuned BERT-based sentiment classification models on 80,000+ multilingual customer reviews, achieving an F1-score of 0.89.
- Automated data preprocessing and tokenization pipelines, reducing pipeline execution latency by 35%.
- Containerized model inference using FastAPI and Docker for internal testing and demo APIs.

ACADEMIC PROJECTS
1. MediScan: Automated Chest X-Ray Classification (PyTorch, ResNet-50, OpenCV)
- Trained a transfer-learning CNN model to identify 3 lung conditions from chest radiographs with 91.4% accuracy.
- Implemented Grad-CAM heatmaps to visually interpret model attention regions for clinical explainability.

2. DocuQuery: RAG-Powered PDF Question-Answering (LangChain, Hugging Face, FAISS, Streamlit)
- Developed a local Retrieval-Augmented Generation (RAG) assistant answering queries over 100+ technical documents.
- Evaluated cosine similarity search vs BM25 hybrid ranking to enhance retrieval precision by 22%.

EDUCATION
Bachelor of Engineering in Artificial Intelligence & Data Science | Deccan University of Technology | 2021 – 2025
- CGPA: 8.9 / 10.0
- Honors: Dean's Honor Roll, Winner of University AI Hackathon 2024

PUBLICATIONS & WORKSHOPS
- Co-author: "Comparative Study of Attention Mechanisms in Low-Resource NLP" (Presented at National Student AI Symposium 2025).`,
  parsed: {
    fullName: 'Priya Sharma (Fictional Sample)',
    email: 'priya.sharma.demo@interviewx.ai',
    phone: '+91 91234 56789',
    summary: 'Junior AI/ML Engineer specializing in PyTorch, Scikit-Learn, NLP, Transformers, and FastAPI model deployment.',
    skills: [
      'Python',
      'PyTorch',
      'Scikit-Learn',
      'TensorFlow',
      'Transformers (Hugging Face)',
      'FastAPI',
      'Docker',
      'Pandas/NumPy',
      'OpenCV',
      'SQL',
      'MLflow'
    ],
    experience: [
      {
        title: 'Machine Learning Intern',
        company: 'DataSphere Intelligence Labs (Fictional)',
        duration: 'Jan 2025 – June 2025',
        highlights: [
          'Fine-tuned BERT sentiment classifier on 80k reviews with 0.89 F1-score',
          'Reduced preprocessing latency by 35% with vectorization',
          'Containerized inference API using FastAPI and Docker'
        ]
      }
    ],
    education: [
      {
        degree: 'B.E. in Artificial Intelligence & Data Science',
        institution: 'Deccan University of Technology (Fictional)',
        year: '2021 – 2025',
        score: '8.9 CGPA'
      }
    ],
    projects: [
      {
        name: 'MediScan: Chest X-Ray Classification',
        technologies: ['PyTorch', 'ResNet-50', 'Grad-CAM', 'OpenCV'],
        description: 'Transfer learning vision model with Grad-CAM visual explainability.'
      },
      {
        name: 'DocuQuery: RAG-Powered Document Q&A',
        technologies: ['LangChain', 'FAISS', 'FastAPI', 'Hugging Face'],
        description: 'Retrieval-Augmented Generation assistant with hybrid search.'
      }
    ],
    certifications: [
      'DeepLearning.AI Deep Learning Specialization',
      'AWS Certified Cloud Practitioner (Foundational)'
    ],
    uncertainExtractionFlags: [],
    confidenceScore: 97
  },
  jobMatch: {
    targetRole: 'AI / ML Engineer',
    matchScore: 94,
    matchingSkills: ['Python', 'PyTorch', 'Scikit-Learn', 'Transformers', 'FastAPI', 'Docker', 'Pandas/NumPy', 'SQL'],
    missingSkills: ['Kubernetes / Kubeflow', 'Distributed Training (DeepSpeed/Ray)', 'TensorRT / ONNX Optimization'],
    recommendations: [
      'Review mathematical foundations of Backpropagation, Loss Functions, and Overfitting regularization',
      'Be prepared to explain Attention Mechanism (Self-Attention, Query-Key-Value matrices) clearly',
      'Expect deep-dive questions on RAG architecture and hallucination mitigation techniques'
    ]
  }
};
