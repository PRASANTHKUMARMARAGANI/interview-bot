import { ResumeData } from '@/types';

// Common technical skill keywords for detection
const SKILL_KEYWORDS = [
  // Frontend
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3',
  'Tailwind CSS', 'Tailwind', 'SCSS', 'Sass', 'Redux', 'Zustand', 'MobX', 'Vite', 'Webpack',
  'Framer Motion', 'Jest', 'React Testing Library', 'Cypress', 'Playwright', 'Web Vitals',
  // Backend & Languages
  'Node.js', 'Express', 'NestJS', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring Boot',
  'Go', 'Golang', 'Rust', 'C++', 'C#', '.NET', 'PHP', 'Ruby', 'Ruby on Rails',
  // AI & Data
  'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Keras', 'Pandas', 'NumPy', 'OpenCV', 'Hugging Face',
  'Transformers', 'BERT', 'NLP', 'Computer Vision', 'Deep Learning', 'Machine Learning',
  'LangChain', 'LlamaIndex', 'FAISS', 'RAG', 'Vector Databases', 'Prompt Engineering',
  // Databases & Cloud
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'DynamoDB', 'Cassandra', 'Elasticsearch',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Git', 'GitHub', 'Linux', 'Terraform',
  // Concepts
  'REST APIs', 'RESTful APIs', 'GraphQL', 'gRPC', 'Microservices', 'System Design',
  'Agile', 'Scrum', 'Object-Oriented Programming', 'Data Structures & Algorithms'
];

const ROLE_EXPECTED_SKILLS: Record<string, string[]> = {
  'frontend': ['React', 'Next.js', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'REST APIs', 'Git'],
  'backend': ['Node.js', 'Python', 'Java', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'System Design', 'Git'],
  'full-stack': ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs', 'Docker', 'Tailwind CSS', 'Git'],
  'ai': ['Python', 'PyTorch', 'TensorFlow', 'Scikit-Learn', 'Pandas', 'NumPy', 'Docker', 'Transformers', 'FastAPI'],
  'data': ['Python', 'SQL', 'Pandas', 'NumPy', 'PostgreSQL', 'Data Structures & Algorithms', 'Machine Learning'],
  'java': ['Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'REST APIs', 'Docker', 'Microservices', 'Git'],
  'python': ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Docker', 'REST APIs', 'Pandas', 'Git']
};

export async function parseResumeBuffer(
  buffer: Buffer,
  fileName: string,
  fileSize: number,
  targetRole?: string
): Promise<ResumeData> {
  let rawText = '';
  const lowerFileName = fileName.toLowerCase();

  try {
    if (lowerFileName.endsWith('.pdf')) {
      const { PDFParse } = await import('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      rawText = result.text || '';
      await parser.destroy();
    } else if (lowerFileName.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || '';
    } else {
      rawText = buffer.toString('utf-8');
    }
  } catch (err: any) {
    console.error('Document extraction error:', err);
    rawText = buffer.toString('utf-8').replace(/[^\x20-\x7E\n\r\t]/g, ' ');
  }

  return processResumeText(rawText, fileName, fileSize, targetRole);
}

export function processResumeText(
  rawText: string,
  fileName: string,
  fileSize: number,
  targetRole?: string
): ResumeData {
  const cleanText = rawText.trim();
  const lines = cleanText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const uncertainExtractionFlags: string[] = [];

  // 1. Extract Email
  const emailMatch = cleanText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const email = emailMatch ? emailMatch[0] : '';
  if (!email) {
    uncertainExtractionFlags.push('Contact email was not found in document text.');
  }

  // 2. Extract Phone
  const phoneMatch = cleanText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+91[-.\s]?\d{10}/);
  const phone = phoneMatch ? phoneMatch[0] : '';
  if (!phone) {
    uncertainExtractionFlags.push('Phone number was not detected in document.');
  }

  // 3. Extract Name
  let fullName = '';
  for (const line of lines.slice(0, 5)) {
    const isHeading = /resume|curriculum|vitae|page|contact|portfolio/i.test(line);
    const hasEmailOrPhone = line.includes('@') || /\d{5}/.test(line);
    if (!isHeading && !hasEmailOrPhone && line.length >= 2 && line.length <= 40) {
      fullName = line.replace(/[^a-zA-Z\s.]/g, '').trim();
      if (fullName.split(/\s+/).length >= 2) break;
    }
  }
  if (!fullName) {
    fullName = lines[0] ? lines[0].slice(0, 30) : 'Candidate';
    uncertainExtractionFlags.push('Name boundary ambiguous; assigned top line.');
  }

  // 4. Extract Skills
  const detectedSkills = new Set<string>();
  const lowerText = cleanText.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    const escaped = skill.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-zA-Z0-9_#+])${escaped}(?:$|[^a-zA-Z0-9_#+])`, 'i');
    if (regex.test(cleanText)) {
      detectedSkills.add(skill);
    }
  }

  const skillsList = Array.from(detectedSkills);
  if (skillsList.length < 3) {
    uncertainExtractionFlags.push('Fewer than 3 standard technical keywords detected; candidate may need to manually add skills.');
  }

  // 5. Extract Summary
  let summary = '';
  const summaryIdx = lines.findIndex((l) => /summary|profile|about\s+me|objective/i.test(l));
  if (summaryIdx >= 0 && summaryIdx + 1 < lines.length) {
    summary = lines.slice(summaryIdx + 1, summaryIdx + 4).join(' ');
  } else {
    // Pick first descriptive paragraph
    const descriptive = lines.find((l) => l.length > 50 && !l.includes('@'));
    summary = descriptive || 'Candidate profile extracted from submitted resume.';
  }

  // 6. Extract Education
  const education: ResumeData['parsed']['education'] = [];
  const eduIdx = lines.findIndex((l) => /education|academics|qualifications/i.test(l));
  if (eduIdx >= 0) {
    const eduSlice = lines.slice(eduIdx + 1, eduIdx + 6);
    for (const l of eduSlice) {
      if (/bachelor|master|b\.tech|b\.e|bca|mca|degree|university|institute|school|college/i.test(l)) {
        education.push({
          degree: l,
          institution: 'Institution mentioned in resume',
          year: '2021 – 2025'
        });
      }
    }
  }
  if (education.length === 0) {
    education.push({
      degree: 'Undergraduate Engineering / Computer Science',
      institution: 'Academic Institution',
      year: 'Graduated'
    });
  }

  // 7. Extract Experience
  const experience: ResumeData['parsed']['experience'] = [];
  const expIdx = lines.findIndex((l) => /experience|employment|work\s+history|internship/i.test(l));
  if (expIdx >= 0) {
    const expSlice = lines.slice(expIdx + 1, expIdx + 8);
    const expHighlights = expSlice.filter((l) => l.length > 20);
    experience.push({
      title: 'Software Engineering / Technical Experience',
      company: 'Organization / Project Team',
      duration: 'Recent Experience',
      highlights: expHighlights.length > 0 ? expHighlights.slice(0, 3) : ['Contributed to software engineering projects and development lifecycle.']
    });
  }

  // 8. Extract Projects
  const projects: ResumeData['parsed']['projects'] = [];
  const projIdx = lines.findIndex((l) => /projects|technical\s+projects/i.test(l));
  if (projIdx >= 0) {
    const projSlice = lines.slice(projIdx + 1, projIdx + 8);
    for (const l of projSlice) {
      if (l.length > 15 && l.length < 80) {
        projects.push({
          name: l.replace(/^[-•*]\s*/, ''),
          technologies: skillsList.slice(0, 3),
          description: 'Implementation and architecture described in resume.'
        });
        if (projects.length >= 3) break;
      }
    }
  }
  if (projects.length === 0) {
    projects.push({
      name: 'Software Application Development',
      technologies: skillsList.slice(0, 3),
      description: 'Hands-on project implementing modular engineering principles.'
    });
  }

  // 9. Extract Certifications
  const certifications: string[] = [];
  const certIdx = lines.findIndex((l) => /certifications|certificates|licenses|achievements/i.test(l));
  if (certIdx >= 0) {
    const certSlice = lines.slice(certIdx + 1, certIdx + 5);
    for (const l of certSlice) {
      if (l.length > 5 && l.length < 90) {
        certifications.push(l.replace(/^[-•*]\s*/, ''));
      }
    }
  }

  // Calculate extraction confidence score
  let confidence = 50;
  if (fullName && fullName !== 'Candidate') confidence += 10;
  if (email) confidence += 15;
  if (phone) confidence += 10;
  if (skillsList.length >= 5) confidence += 15;
  confidence = Math.max(20, Math.min(98, confidence - uncertainExtractionFlags.length * 5));

  // Compute Job Match
  const roleKey = (targetRole || 'frontend').toLowerCase();
  let expectedRoleSkills: string[] = ROLE_EXPECTED_SKILLS['frontend'];
  for (const [key, list] of Object.entries(ROLE_EXPECTED_SKILLS)) {
    if (roleKey.includes(key)) {
      expectedRoleSkills = list;
      break;
    }
  }

  const matchingSkills = expectedRoleSkills.filter((expected) =>
    skillsList.some((s) => s.toLowerCase() === expected.toLowerCase())
  );
  const missingSkills = expectedRoleSkills.filter(
    (expected) => !matchingSkills.includes(expected)
  );

  const matchScore = Math.min(100, Math.round((matchingSkills.length / expectedRoleSkills.length) * 100));

  const recommendations = [
    `Strengthen familiarity with key role competencies: ${missingSkills.slice(0, 3).join(', ') || 'System trade-offs'}.`,
    'Prepare to elaborate on architectural decisions and metrics from your featured projects.',
    'Review technical fundamentals and practice live answering in Interview Room.'
  ];

  return {
    id: `resume-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    fileName,
    fileSize,
    uploadedAt: new Date().toISOString(),
    rawText: cleanText,
    parsed: {
      fullName,
      email,
      phone,
      summary,
      skills: skillsList.length > 0 ? skillsList : ['Problem Solving', 'Software Engineering'],
      experience,
      education,
      projects,
      certifications,
      uncertainExtractionFlags,
      confidenceScore: confidence
    },
    jobMatch: {
      targetRole: targetRole || 'Software Engineer',
      matchScore: Math.max(30, matchScore),
      matchingSkills,
      missingSkills,
      recommendations
    }
  };
}
