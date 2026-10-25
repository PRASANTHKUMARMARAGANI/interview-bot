import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini, extractJsonFromText } from '@/lib/gemini';
import { APPLICATION_PROMPTS } from '@/lib/prompts';
import { getDemoQuestionsForRole } from '@/lib/demo-engine';
import { InterviewQuestion } from '@/types';

const GenerateQuestionsSchema = z.object({
  candidateName: z.string().default('Candidate'),
  targetRole: z.string().default('Frontend Developer'),
  jobDescription: z.string().optional().default(''),
  resumeSummary: z.string().optional().default(''),
  count: z.number().min(1).max(10).default(5),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Adaptive']).default('Intermediate'),
  language: z.enum(['en-US', 'te-IN', 'hi-IN']).default('en-US'),
  customKey: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = GenerateQuestionsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { candidateName, targetRole, jobDescription, resumeSummary, count, difficulty, language, customKey } = parsed.data;

    const prompt = APPLICATION_PROMPTS.questionGenerationPrompt
      .replace('{CANDIDATE_NAME}', candidateName)
      .replace('{TARGET_ROLE}', targetRole)
      .replace('{DIFFICULTY}', difficulty)
      .replace('{QUESTION_COUNT}', count.toString())
      .replace('{LANGUAGE}', language)
      .replace('{RESUME_SUMMARY}', resumeSummary || jobDescription || 'Standard software engineering profile');

    const geminiRes = await generateWithGemini({
      prompt,
      systemInstruction: APPLICATION_PROMPTS.buildPrompt,
      customKey,
      temperature: 0.6
    });

    if (geminiRes.success && geminiRes.text) {
      const parsedJson = extractJsonFromText<{ questions: InterviewQuestion[] } | InterviewQuestion[]>(geminiRes.text);
      if (parsedJson.data) {
        const rawList = Array.isArray(parsedJson.data)
          ? parsedJson.data
          : (parsedJson.data as any).questions || [];

        if (rawList.length > 0) {
          const validatedList: InterviewQuestion[] = rawList.map((q: any, idx: number) => ({
            id: q.id || `live-q-${idx + 1}-${Date.now()}`,
            questionNumber: idx + 1,
            category: q.category || 'Technical',
            difficulty: q.difficulty || (difficulty === 'Adaptive' ? 'Intermediate' : difficulty),
            questionText: q.questionText || 'Explain your technical approach.',
            sourceResumeEvidence: q.sourceResumeEvidence || 'Target role and resume background',
            expectedConcepts: Array.isArray(q.expectedConcepts) ? q.expectedConcepts : ['Core principles', 'Best practices'],
            rubric: {
              technicalCorrectness: q.rubric?.technicalCorrectness || 'Technical accuracy of the response',
              relevance: q.rubric?.relevance || 'Direct relevance to the question',
              reasoning: q.rubric?.reasoning || 'Logical reasoning and trade-off considerations',
              communication: q.rubric?.communication || 'Clarity and articulation'
            },
            modelAnswerHint: q.modelAnswerHint,
            followUpQuestion: q.followUpQuestion
          }));

          return NextResponse.json({
            questions: validatedList,
            source: 'gemini',
            modelUsed: geminiRes.modelUsed,
            isDemoFallback: false
          });
        }
      }
    }

    // Fallback to Demo Engine questions
    const demoQuestions = getDemoQuestionsForRole(targetRole, count, difficulty);
    return NextResponse.json({
      questions: demoQuestions,
      source: 'demo-engine',
      notice: geminiRes.error || 'Gemini API not configured. Utilizing role-calibrated autonomous questions bank.',
      isDemoFallback: true
    });
  } catch (error: any) {
    console.error('API generate-questions error:', error);
    const demoQuestions = getDemoQuestionsForRole('Software Engineer', 5, 'Intermediate');
    return NextResponse.json({
      questions: demoQuestions,
      source: 'demo-engine',
      notice: 'Fallback triggered due to request processing issue.',
      isDemoFallback: true
    });
  }
}
