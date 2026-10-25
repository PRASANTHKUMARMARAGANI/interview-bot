import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini, extractJsonFromText } from '@/lib/gemini';
import { APPLICATION_PROMPTS } from '@/lib/prompts';
import { evaluateDemoAnswer } from '@/lib/demo-engine';
import { QuestionEvaluation } from '@/types';

const EvaluateAnswerSchema = z.object({
  question: z.object({
    id: z.string(),
    questionNumber: z.number().optional().default(1),
    category: z.string(),
    difficulty: z.string().optional().default('Intermediate'),
    questionText: z.string(),
    expectedConcepts: z.array(z.string()).default([]),
    rubric: z.object({
      technicalCorrectness: z.string().optional().default(''),
      relevance: z.string().optional().default(''),
      reasoning: z.string().optional().default(''),
      communication: z.string().optional().default('')
    }).optional().default({
      technicalCorrectness: '',
      relevance: '',
      reasoning: '',
      communication: ''
    }),
    modelAnswerHint: z.string().optional(),
    followUpQuestion: z.string().optional()
  }),
  candidateAnswer: z.string().default(''),
  targetRole: z.string().default('Software Engineer'),
  customKey: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = EvaluateAnswerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid evaluation payload', details: parsed.error.format() }, { status: 400 });
    }

    const { question, candidateAnswer, targetRole, customKey } = parsed.data;

    // Check if empty or minimal
    if (!candidateAnswer || candidateAnswer.trim().length < 5) {
      const emptyEval: QuestionEvaluation = {
        score: 20,
        technicalCorrectness: 15,
        relevance: 20,
        reasoning: 15,
        communication: 25,
        completeness: 15,
        strengths: ['Question acknowledged'],
        missingConcepts: question.expectedConcepts,
        evidenceFromAnswer: candidateAnswer.trim() ? `"${candidateAnswer.trim()}"` : 'No verbal or typed answer recorded.',
        suggestedImprovement: question.modelAnswerHint || 'Provide an articulated technical response referencing key principles.',
        feedbackText: 'The submitted answer was too short to evaluate. Please provide a more complete explanation.',
        isDemoSimulation: true
      };
      return NextResponse.json({ evaluation: emptyEval, source: 'demo-engine', isDemoSimulation: true });
    }

    // Try Gemini evaluation
    const prompt = APPLICATION_PROMPTS.answerEvaluationPrompt
      .replace('{TARGET_ROLE}', targetRole)
      .replace('{QUESTION_TEXT}', question.questionText)
      .replace('{CATEGORY}', question.category)
      .replace('{EXPECTED_CONCEPTS}', (question.expectedConcepts || []).join(', '))
      .replace('{RUBRIC_TECHNICAL}', question.rubric?.technicalCorrectness || 'Factual and technical precision')
      .replace('{RUBRIC_RELEVANCE}', question.rubric?.relevance || 'Direct relevance to the prompt')
      .replace('{RUBRIC_REASONING}', question.rubric?.reasoning || 'Logical deductions and trade-off considerations')
      .replace('{RUBRIC_COMMUNICATION}', question.rubric?.communication || 'Clarity, conciseness, and tone')
      .replace('{CANDIDATE_ANSWER}', candidateAnswer);

    const geminiRes = await generateWithGemini({
      prompt,
      systemInstruction: APPLICATION_PROMPTS.buildPrompt,
      customKey,
      temperature: 0.3
    });

    if (geminiRes.success && geminiRes.text) {
      const parsedJson = extractJsonFromText<QuestionEvaluation>(geminiRes.text);
      if (parsedJson.data && typeof parsedJson.data.score === 'number') {
        const d = parsedJson.data;
        const clamp = (val: any, def: number) => {
          const num = Number(val);
          return isNaN(num) ? def : Math.min(100, Math.max(0, Math.round(num)));
        };

        const validatedEvaluation: QuestionEvaluation = {
          score: clamp(d.score, 75),
          technicalCorrectness: clamp(d.technicalCorrectness, 75),
          relevance: clamp(d.relevance, 75),
          reasoning: clamp(d.reasoning, 70),
          communication: clamp(d.communication, 80),
          completeness: clamp(d.completeness, 70),
          strengths: Array.isArray(d.strengths) && d.strengths.length > 0 ? d.strengths : ['Clear and relevant response'],
          missingConcepts: Array.isArray(d.missingConcepts) ? d.missingConcepts : [],
          evidenceFromAnswer: d.evidenceFromAnswer || `Candidate discussed relevant concepts.`,
          suggestedImprovement: d.suggestedImprovement || question.modelAnswerHint || 'Continue expanding architectural considerations.',
          feedbackText: d.feedbackText || 'Well-articulated response with solid technical rationale.',
          isDemoSimulation: false
        };

        return NextResponse.json({
          evaluation: validatedEvaluation,
          source: 'gemini',
          modelUsed: geminiRes.modelUsed,
          isDemoSimulation: false
        });
      }
    }

    // Calibrated Demo Fallback
    const demoEval = evaluateDemoAnswer(question as any, candidateAnswer);
    return NextResponse.json({
      evaluation: demoEval,
      source: 'demo-engine',
      notice: geminiRes.error || 'Gemini API unavailable. Calibrated demo evaluation engine applied.',
      isDemoSimulation: true
    });
  } catch (error: any) {
    console.error('API evaluate-answer error:', error);
    const fallback = evaluateDemoAnswer(
      {
        id: 'error-q',
        questionNumber: 1,
        category: 'Technical',
        difficulty: 'Intermediate',
        questionText: 'Technical answer evaluation',
        expectedConcepts: ['Technical concepts', 'Best practices'],
        rubric: { technicalCorrectness: '', relevance: '', reasoning: '', communication: '' }
      },
      'Candidate answer provided'
    );
    return NextResponse.json({ evaluation: fallback, source: 'demo-engine', isDemoSimulation: true });
  }
}
