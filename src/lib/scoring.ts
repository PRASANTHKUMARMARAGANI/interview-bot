import { QuestionAttempt, FinalAssessment, AppSettings } from '@/types';

export const DEFAULT_RUBRIC_WEIGHTS = {
  technical: 35,
  relevance: 25,
  reasoning: 20,
  communication: 10,
  application: 10
};

export const DEFAULT_THRESHOLDS = {
  strongMatch: 85,
  considerFurther: 65
};

export const MANDATORY_PRACTICE_DISCLAIMER =
  'IMPORTANT NOTICE: This assessment report is an automated AI-driven practice evaluation designed exclusively for skill development and interview preparation. It does not constitute a real hiring decision, corporate offer, or official rejection by any employer. Scores reflect simulated rubric benchmarking.';

/**
 * Validates that weights add up to 100
 */
export function validateWeights(weights: {
  technical: number;
  relevance: number;
  reasoning: number;
  communication: number;
  application: number;
}): { isValid: boolean; sum: number } {
  const sum =
    Number(weights.technical || 0) +
    Number(weights.relevance || 0) +
    Number(weights.reasoning || 0) +
    Number(weights.communication || 0) +
    Number(weights.application || 0);
  return {
    isValid: Math.round(sum) === 100,
    sum: Math.round(sum)
  };
}

/**
 * Normalizes scores and computes weighted final score
 */
export function calculateWeightedOverallScore(
  categoryScores: {
    technicalCorrectness: number;
    relevanceAndCompleteness: number;
    problemSolvingReasoning: number;
    communicationClarity: number;
    practicalApplication: number;
  },
  weights = DEFAULT_RUBRIC_WEIGHTS
): number {
  const normWeights = {
    technical: weights.technical / 100,
    relevance: weights.relevance / 100,
    reasoning: weights.reasoning / 100,
    communication: weights.communication / 100,
    application: weights.application / 100
  };

  const rawScore =
    categoryScores.technicalCorrectness * normWeights.technical +
    categoryScores.relevanceAndCompleteness * normWeights.relevance +
    categoryScores.problemSolvingReasoning * normWeights.reasoning +
    categoryScores.communicationClarity * normWeights.communication +
    categoryScores.practicalApplication * normWeights.application;

  return Math.min(100, Math.max(0, Math.round(rawScore * 10) / 10));
}

/**
 * Derives practice recommendation from overall score and thresholds
 */
export function getRecommendation(
  overallScore: number,
  thresholds = DEFAULT_THRESHOLDS
): {
  recommendation: 'Strong Match' | 'Consider Further' | 'Needs Improvement';
  explanation: string;
} {
  if (overallScore >= thresholds.strongMatch) {
    return {
      recommendation: 'Strong Match',
      explanation:
        'The candidate exhibited exceptional command of core concepts, structured reasoning, and articulate technical communication with minimal conceptual gaps.'
    };
  } else if (overallScore >= thresholds.considerFurther) {
    return {
      recommendation: 'Consider Further',
      explanation:
        'The candidate demonstrated solid foundational competency and relevant project exposure, though certain architectural nuances, edge cases, or deeper trade-offs warrant targeted review.'
    };
  } else {
    return {
      recommendation: 'Needs Improvement',
      explanation:
        'The candidate showed enthusiastic intent but requires concentrated revision in technical syntax, deeper problem decomposition, and structured answer organization before enterprise interviews.'
    };
  }
}

/**
 * Synthesizes final assessment from completed question attempts
 */
export function synthesizeFinalAssessment(
  attempts: QuestionAttempt[],
  targetRole: string,
  candidateName: string,
  settings?: Partial<AppSettings>
): FinalAssessment {
  const weights = settings?.rubricWeights || DEFAULT_RUBRIC_WEIGHTS;
  const thresholds = settings?.thresholds || DEFAULT_THRESHOLDS;

  const validEvaluations = attempts
    .map((a) => a.evaluation)
    .filter((e): e is NonNullable<typeof e> => !!e);

  if (validEvaluations.length === 0) {
    return {
      overallScore: 0,
      recommendation: 'Needs Improvement',
      recommendationExplanation: 'No completed evaluations were recorded for this session.',
      categoryScores: {
        technicalCorrectness: 0,
        relevanceAndCompleteness: 0,
        problemSolvingReasoning: 0,
        communicationClarity: 0,
        practicalApplication: 0
      },
      rubricWeights: weights,
      topStrengths: ['Completed session setup'],
      criticalWeaknesses: ['Insufficient answers submitted for evaluation'],
      keyEvidence: ['No questions answered'],
      actionablePlan: ['Re-attempt the mock interview and provide detailed spoken or typed answers.'],
      recommendedResources: [
        {
          title: 'InterviewX Preparation Guide',
          type: 'Documentation',
          link: '/questions'
        }
      ],
      disclaimer: MANDATORY_PRACTICE_DISCLAIMER,
      assessedAt: new Date().toISOString()
    };
  }

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const categoryScores = {
    technicalCorrectness: avg(validEvaluations.map((e) => e.technicalCorrectness)),
    relevanceAndCompleteness: avg(validEvaluations.map((e) => Math.round((e.relevance + e.completeness) / 2))),
    problemSolvingReasoning: avg(validEvaluations.map((e) => e.reasoning)),
    communicationClarity: avg(validEvaluations.map((e) => e.communication)),
    practicalApplication: avg(validEvaluations.map((e) => Math.round((e.technicalCorrectness + e.completeness) / 2)))
  };

  const overallScore = calculateWeightedOverallScore(categoryScores, weights);
  const { recommendation, explanation } = getRecommendation(overallScore, thresholds);

  // Aggregate strengths and gaps
  const allStrengths = Array.from(new Set(validEvaluations.flatMap((e) => e.strengths))).slice(0, 4);
  const allWeaknesses = Array.from(new Set(validEvaluations.flatMap((e) => e.missingConcepts))).slice(0, 4);
  const allEvidence = validEvaluations
    .map((e, idx) => `Q${idx + 1}: ${e.evidenceFromAnswer || 'Answer covered prompt adequately'}`)
    .slice(0, 4);

  const actionablePlan = [
    `Deepen knowledge in identified missing concepts: ${allWeaknesses.slice(0, 2).join(', ') || 'System trade-offs'}.`,
    'Practice vocalizing reasoning steps before jumping directly to technical solutions.',
    'Formulate answers using the STAR format (Situation, Task, Action, Result) for project-related prompts.',
    'Use the Repeated Question Testing Lab to re-attempt low-scoring questions until confidence is achieved.'
  ];

  const recommendedResources = getCuratedResourcesForRole(targetRole);

  return {
    overallScore,
    recommendation,
    recommendationExplanation: explanation,
    categoryScores,
    rubricWeights: weights,
    topStrengths: allStrengths.length > 0 ? allStrengths : ['Clear articulation of project experiences', 'Good enthusiasm for engineering challenges'],
    criticalWeaknesses: allWeaknesses.length > 0 ? allWeaknesses : ['Edge case handling', 'Deeper quantitative performance metrics'],
    keyEvidence: allEvidence,
    actionablePlan,
    recommendedResources,
    disclaimer: MANDATORY_PRACTICE_DISCLAIMER,
    assessedAt: new Date().toISOString()
  };
}

export function getCuratedResourcesForRole(role: string): Array<{
  title: string;
  type: 'Book' | 'Course' | 'Documentation' | 'Practice';
  link: string;
}> {
  if (role.toLowerCase().includes('frontend')) {
    return [
      { title: 'MDN Web Docs — Modern JavaScript & Web APIs', type: 'Documentation', link: 'https://developer.mozilla.org' },
      { title: 'React Official Documentation & Patterns', type: 'Documentation', link: 'https://react.dev' },
      { title: 'Frontend Masters — Advanced Web Performance', type: 'Course', link: 'https://frontendmasters.com' },
      { title: 'GreatFrontEnd Interview Practice Challenges', type: 'Practice', link: 'https://greatfrontend.com' }
    ];
  } else if (role.toLowerCase().includes('ai') || role.toLowerCase().includes('ml')) {
    return [
      { title: 'DeepLearning.AI — Deep Learning Specialization', type: 'Course', link: 'https://deeplearning.ai' },
      { title: 'Hugging Face NLP Course & Transformers Docs', type: 'Documentation', link: 'https://huggingface.co/course' },
      { title: 'Designing Machine Learning Systems by Chip Huyen', type: 'Book', link: 'https://chiphuyen.com' },
      { title: 'Kaggle Competitions & Community Datasets', type: 'Practice', link: 'https://kaggle.com' }
    ];
  } else {
    return [
      { title: 'System Design Interview by Alex Xu', type: 'Book', link: 'https://bytebytego.com' },
      { title: 'NeetCode Algorithms & Data Structures Roadmap', type: 'Practice', link: 'https://neetcode.io' },
      { title: 'Web.dev Engineering Best Practices', type: 'Documentation', link: 'https://web.dev' },
      { title: 'The Pragmatic Programmer', type: 'Book', link: 'https://pragprog.com' }
    ];
  }
}
