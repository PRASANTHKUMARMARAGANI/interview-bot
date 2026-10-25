/**
 * Centralized Prompt Registry for InterviewX AI
 * Contains all official system and task prompts used across:
 * - Resume Parsing & Extraction
 * - Dynamic Question Generation
 * - Answer Evaluation & Rubric Scoring
 * - Follow-up Inquiries
 * - Multilingual Translation
 * - Final Comprehensive Assessment
 * - Repeated Question Comparative Analysis
 * - Automated QA & Regression Testing
 */

export const APPLICATION_PROMPTS = {
  buildPrompt: `SYSTEM DIRECTIVE — INTERVIEWX AI ENGINE:
You are InterviewX AI, an enterprise-grade AI technical interviewer and talent assessor.
Your objective is to conduct objective, constructive, and rigorous mock interviews that help candidates prepare for real-world engineering, analytical, and leadership roles.
Core principles:
1. Maintain a professional, encouraging, yet thorough interviewer persona.
2. Ground all technical questions in the candidate's actual submitted resume, stated projects, and target job description.
3. Evaluate responses strictly against explicit rubrics (technical correctness, relevance, reasoning, communication, completeness).
4. Never discriminate or penalize based on accent, cultural linguistic patterns, disability, or protected attributes.
5. Provide actionable, high-signal feedback with exact citations from the candidate's response.
6. Clearly denote all evaluations as educational practice assessments, not actual corporate hiring decisions.`,

  resumeAnalysisPrompt: `Analyze the following candidate resume text for a target role of "{TARGET_ROLE}".
Input Resume:
"""
{RESUME_TEXT}
"""

Instructions:
1. Extract structured profile data: Full Name, Contact Email, Phone, Professional Summary, Skills, Work Experience, Education, Projects, and Certifications.
2. Compute an extraction confidence score (0-100) and list any uncertain extraction flags where text was ambiguous or OCR quality was poor. Never hallucinate details.
3. Compare extracted skills against typical requirements for "{TARGET_ROLE}".
4. Return a JSON object matching the ResumeData schema.`,

  questionGenerationPrompt: `You are generating an interview question set for candidate "{CANDIDATE_NAME}" interviewing for "{TARGET_ROLE}".
Difficulty Level: {DIFFICULTY}
Total Questions Required: {QUESTION_COUNT}
Language: {LANGUAGE}
Candidate Resume Context:
"""
{RESUME_SUMMARY}
"""

Required Question Distribution:
1. Warm-up / Introduction & Role Alignment (Category: HR)
2. Resume & Real-World Project Deep Dive (Category: Resume-Project)
3. Core Technical Fundamentals (Category: Technical)
4. Scenario / System Design or Architecture (Category: Problem-Solving)
5. Practical Problem-Solving / Code Logic (Category: Coding-Aptitude)

For EACH question, provide:
- id: unique string
- questionNumber: 1 to N
- category: one of the 5 categories above
- difficulty: Beginner | Intermediate | Advanced
- questionText: clear, natural conversational question
- sourceResumeEvidence: specific project, skill, or experience in resume that prompted this question
- expectedConcepts: 3-5 core technical or behavioral keywords expected in answer
- rubric: explicit criteria for technicalCorrectness, relevance, reasoning, and communication
- modelAnswerHint: concise summary of what a standout answer would cover
- followUpQuestion: one adaptive follow-up to test deeper understanding`,

  answerEvaluationPrompt: `Evaluate the candidate's answer against the specific interview question and rubric.
Target Role: {TARGET_ROLE}
Question: "{QUESTION_TEXT}"
Category: {CATEGORY}
Expected Concepts: {EXPECTED_CONCEPTS}
Rubric:
- Technical Correctness: {RUBRIC_TECHNICAL}
- Relevance & Completeness: {RUBRIC_RELEVANCE}
- Reasoning & Problem Solving: {RUBRIC_REASONING}
- Communication Clarity: {RUBRIC_COMMUNICATION}

Candidate's Answer:
"""
{CANDIDATE_ANSWER}
"""

Provide a fair, calibrated evaluation in JSON:
{
  "score": <0 to 100 overall score for this answer>,
  "technicalCorrectness": <0 to 100>,
  "relevance": <0 to 100>,
  "reasoning": <0 to 100>,
  "communication": <0 to 100>,
  "completeness": <0 to 100>,
  "strengths": [<2-3 specific positives demonstrated in response>],
  "missingConcepts": [<specific expected technical keywords or design considerations omitted>],
  "evidenceFromAnswer": "<exact quote or paraphrase from candidate answer substantiating the score>",
  "suggestedImprovement": "<concrete, polished version of how candidate can elevate this response>",
  "feedbackText": "<2-3 sentence encouraging, constructive feedback summary>"
}`,

  followUpQuestionPrompt: `The candidate just answered the previous interview question with score {SCORE}/100.
Previous Question: "{QUESTION_TEXT}"
Candidate Answer: "{CANDIDATE_ANSWER}"
Demonstrated Gaps: {GAPS}

Generate an adaptive follow-up question that either:
(a) if score >= 80: challenges the candidate with higher-level edge cases, scale considerations, or failure modes.
(b) if score < 80: guides the candidate to clarify their thought process or address an omitted foundational concept.
Keep the question concise and conversational.`,

  translationPrompt: `You are a professional multilingual technical localization assistant.
Translate the following interview question into {TARGET_LANGUAGE} (Telugu: te-IN, Hindi: hi-IN, or English: en-US).
RULES:
1. Retain technical terminology, programming keywords, framework names, and acronyms in their standard English or widely accepted industry forms (e.g., "Virtual DOM", "Promise", "Backpropagation", "Docker", "REST API", "Database Index").
2. Translate conversational framing, instructions, and questions naturally and respectfully.
3. Ensure the tone is professional, warm, and clear.
Input text:
"{TEXT_TO_TRANSLATE}"`,

  finalAssessmentPrompt: `Synthesize the complete interview session performance for candidate "{CANDIDATE_NAME}" ({TARGET_ROLE}).
All Question Attempts & Scores:
{ATTEMPTS_SUMMARY}

Rubric Weights Applied:
- Technical Correctness: {WEIGHT_TECHNICAL}%
- Relevance & Completeness: {WEIGHT_RELEVANCE}%
- Problem-Solving & Reasoning: {WEIGHT_REASONING}%
- Communication Clarity: {WEIGHT_COMMUNICATION}%
- Practical Application: {WEIGHT_APPLICATION}%

Generate:
1. Overall Weighted Score (0-100)
2. Practice Recommendation: 'Strong Match' (>=85), 'Consider Further' (65-84), or 'Needs Improvement' (<65)
3. Recommendation rationale citing specific question evidence
4. Top 3 Strengths
5. Top 3 Critical Areas for Improvement
6. 4-step Actionable Study Plan
7. Curated list of high-quality learning resources (Books, Official Docs, Practice Platforms)
8. Mandatory educational disclaimer explicitly noting this is a practice evaluation, not a hiring decision.`,

  repeatedQuestionPrompt: `Perform a side-by-side comparative analysis between two attempts at the EXACT SAME interview question.
Question: "{QUESTION_TEXT}"
Rubric Expectations: {EXPECTED_CONCEPTS}

FIRST ATTEMPT:
Answer: "{FIRST_ANSWER}"
Score: {FIRST_SCORE}

SECOND ATTEMPT (RETEST):
Answer: "{SECOND_ANSWER}"
Score: {SECOND_SCORE}

Analyze the delta:
1. Did the candidate address previously missing concepts?
2. Did technical depth, reasoning, or structure improve?
3. Calculate score delta and provide specific qualitative evidence of growth or remaining shortcomings.`,

  testingDebuggingPrompt: `VALIDATION & REGRESSION TESTING SUITE:
Verify that:
1. JSON output from LLM parses cleanly without truncation.
2. Scores fall strictly within 0-100 bounds.
3. Weighted sum math strictly totals overallScore using configured weights.
4. Multilingual outputs retain technical keywords without erroneous transliteration.
5. Voice transcripts gracefully handle silence, background noise, and quick utterances.`
};
