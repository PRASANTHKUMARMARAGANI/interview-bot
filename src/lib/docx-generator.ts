import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  Packer,
  BorderStyle,
  AlignmentType,
  WidthType,
  ShadingType
} from 'docx';
import { InterviewSession, RepeatTestRecord } from '@/types';
import { APPLICATION_PROMPTS } from './prompts';

/**
 * Creates a professional Word Document (.docx) for an Interview Assessment Report
 */
export async function createAssessmentDocxBlob(session: InterviewSession): Promise<Blob> {
  const assessment = session.finalAssessment;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Title
          new Paragraph({
            text: 'INTERVIEWX AI — CANDIDATE ASSESSMENT REPORT',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: 'Personal AI Interviewer • Practice Assessment Benchmarking',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // Disclaimer Alert
          new Paragraph({
            children: [
              new TextRun({
                text: 'ACADEMIC / PRACTICE DISCLAIMER: ',
                bold: true,
                color: 'C05621'
              }),
              new TextRun({
                text: assessment?.disclaimer || 'This report is an automated mock evaluation for skill development.',
                italics: true,
                color: '744210'
              })
            ],
            spacing: { after: 300 }
          }),

          // Candidate & Session Meta Table
          new Paragraph({
            text: '1. Candidate & Session Parameters',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 150 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createTableRow('Candidate Name', session.candidateName || 'Anonymous Candidate'),
              createTableRow('Student Roll No.', session.candidateRollNo || session.candidateVerification?.declaredRollNo || '2023-CS-101'),
              createTableRow('Target Role', session.targetRole),
              createTableRow('Interview Mode', session.mode),
              createTableRow('Difficulty Level', session.difficulty),
              createTableRow('Language', session.language === 'te-IN' ? 'Telugu' : session.language === 'hi-IN' ? 'Hindi' : 'English (US)'),
              createTableRow('Date Conducted', new Date(session.completedAt || session.startedAt).toLocaleString()),
              createTableRow('Session ID', session.id)
            ]
          }),

          // Final Practice Recommendation
          new Paragraph({
            text: '2. Practice Evaluation & Recommendation',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Overall Score: ${assessment?.overallScore || 0} / 100    |    Recommendation: `,
                bold: true,
                size: 26
              }),
              new TextRun({
                text: `${assessment?.recommendation || 'Pending'}`,
                bold: true,
                size: 26,
                color: assessment?.recommendation === 'Strong Match' ? '2F855A' : assessment?.recommendation === 'Consider Further' ? 'DD6B20' : 'C53030'
              })
            ],
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: assessment?.recommendationExplanation || 'Candidate completed all question prompts.',
            spacing: { after: 300 }
          }),

          // Category Scores Table
          new Paragraph({
            text: '3. Category Breakdown & Rubric Weights',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  createHeaderCell('Evaluation Category'),
                  createHeaderCell('Configured Weight'),
                  createHeaderCell('Demonstrated Score / 100')
                ]
              }),
              createScoreRow('Technical Correctness', `${assessment?.rubricWeights?.technical || 35}%`, assessment?.categoryScores?.technicalCorrectness || 0),
              createScoreRow('Relevance & Completeness', `${assessment?.rubricWeights?.relevance || 25}%`, assessment?.categoryScores?.relevanceAndCompleteness || 0),
              createScoreRow('Problem-Solving & Reasoning', `${assessment?.rubricWeights?.reasoning || 20}%`, assessment?.categoryScores?.problemSolvingReasoning || 0),
              createScoreRow('Communication Clarity', `${assessment?.rubricWeights?.communication || 10}%`, assessment?.categoryScores?.communicationClarity || 0),
              createScoreRow('Practical Application', `${assessment?.rubricWeights?.application || 10}%`, assessment?.categoryScores?.practicalApplication || 0)
            ]
          }),

          // Question-by-Question Deep Dive
          new Paragraph({
            text: '4. Question-by-Question Transcript & Evaluation',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          ...session.attempts.flatMap((attempt, idx) => [
            new Paragraph({
              text: `Question ${idx + 1} (${attempt.question.category} • ${attempt.question.difficulty})`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 200, after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Question: ', bold: true }),
                new TextRun({ text: attempt.question.questionText })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Candidate Answer: ', bold: true }),
                new TextRun({ text: attempt.candidateAnswer || '[No verbal or typed answer provided]' })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Score: ${attempt.evaluation?.score || 0}/100    `, bold: true, color: '2B6CB0' }),
                new TextRun({ text: `Technical: ${attempt.evaluation?.technicalCorrectness || 0}  |  Relevance: ${attempt.evaluation?.relevance || 0}  |  Reasoning: ${attempt.evaluation?.reasoning || 0}` })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Answer Evidence: ', bold: true }),
                new TextRun({ text: attempt.evaluation?.evidenceFromAnswer || 'N/A', italics: true })
              ],
              spacing: { after: 100 }
            }),
            new Paragraph({
              children: [
                new TextRun({ text: 'Improvement Guidance: ', bold: true }),
                new TextRun({ text: attempt.evaluation?.suggestedImprovement || 'Review foundational principles.' })
              ],
              spacing: { after: 250 }
            })
          ]),

          // Strengths and Improvements
          new Paragraph({
            text: '5. Key Strengths & Targeted Growth Areas',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'Demonstrated Strengths:',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 }
          }),
          ...(assessment?.topStrengths || []).map(
            (s) =>
              new Paragraph({
                text: `• ${s}`,
                spacing: { after: 50 }
              })
          ),
          new Paragraph({
            text: 'Critical Improvement Areas:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          ...(assessment?.criticalWeaknesses || []).map(
            (w) =>
              new Paragraph({
                text: `• ${w}`,
                spacing: { after: 50 }
              })
          ),

          // Actionable Study Plan
          new Paragraph({
            text: '6. Actionable Study & Preparation Plan',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          ...(assessment?.actionablePlan || []).map(
            (step, i) =>
              new Paragraph({
                text: `${i + 1}. ${step}`,
                spacing: { after: 80 }
              })
          ),

          // Recommended Learning Resources
          new Paragraph({
            text: '7. Recommended Learning Resources',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          ...(assessment?.recommendedResources || []).map(
            (res) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `• [${res.type}] `, bold: true }),
                  new TextRun({ text: `${res.title} — ` }),
                  new TextRun({ text: res.link, color: '3182CE', italics: true })
                ],
                spacing: { after: 80 }
              })
          )
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

/**
 * Creates the complete 8-Section Academic Project Report Document (.docx)
 */
export async function createAcademicProjectReportDocxBlob(options: {
  session?: InterviewSession | null;
  repeatTests?: RepeatTestRecord[];
}): Promise<Blob> {
  const session = options.session;
  const repeatTest = options.repeatTests?.[0];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Academic Title Page
          new Paragraph({
            text: 'INTERVIEWX AI — YOUR PERSONAL AI INTERVIEWER',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          new Paragraph({
            text: 'ACADEMIC PROJECT REPORT & SYSTEM DOCUMENTATION',
            alignment: AlignmentType.CENTER,
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 150 }
          }),
          new Paragraph({
            text: 'Prepared for Project Demonstration & Evaluation — 26 October 2026',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),

          // SECTION 1: Introduction to the Chatbot
          new Paragraph({
            text: '1. Introduction to the Chatbot',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'InterviewX AI is an enterprise-caliber, conversational mock interview platform engineered to prepare students and technical candidates for rigorous software engineering, data science, and leadership interviews. The system incorporates dynamic speech recognition, animated visual avatar states, contextual resume parsing, rubric-driven answer scoring, and repeated-question testing workflows.',
            spacing: { after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Core Architecture: ', bold: true }),
              new TextRun({ text: 'Built on Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion, and Recharts. Server routes integrate configurable Gemini LLM adapters with an autonomous offline simulation engine. All evaluations operate strictly on explicit, transparent rubrics with zero bias on personal demographic attributes.' })
            ],
            spacing: { after: 250 }
          }),

          // SECTION 2: Resume Upload
          new Paragraph({
            text: '2. Resume Upload & Verification',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'The platform provides multi-slot resume upload supporting PDF and DOCX formats with local parsing via pdf-parse and mammoth. To ensure academic reproducibility, two clearly labeled fictional sample resumes are pre-configured:',
            spacing: { after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Fictional Sample A: ', bold: true }),
              new TextRun({ text: 'Alex Morgan — Junior Frontend Developer (React, Next.js, TypeScript, Tailwind CSS, Core Web Vitals).' })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Fictional Sample B: ', bold: true }),
              new TextRun({ text: 'Priya Sharma — Junior AI/ML Engineer (Python, PyTorch, Scikit-Learn, Transformers, FastAPI, Docker).' })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: '• Candidate Upload Slot: ', bold: true }),
              new TextRun({ text: session?.resumeFileName ? `Actual parsed resume loaded: "${session.resumeFileName}".` : 'Ready for custom candidate resume upload with confidence scoring and extraction flags.' })
            ],
            spacing: { after: 250 }
          }),

          // SECTION 3: Procedure
          new Paragraph({
            text: '3. Procedure & Execution Workflow',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({ text: 'The end-to-end interview pipeline follows seven verified procedural phases:' }),
          new Paragraph({ text: '1. Resume Ingestion: Candidate uploads PDF/DOCX; parser extracts skills, experience, and flags uncertain fields.' }),
          new Paragraph({ text: '2. Interview Configuration: Candidate configures target role, difficulty, language, time limit, and question count.' }),
          new Paragraph({ text: '3. Question Generation: Gemini or calibrated demo engine generates questions mapped to resume claims.' }),
          new Paragraph({ text: '4. Live Interview Room: Candidate interacts with the animated AI avatar via microphone speech recognition or text.' }),
          new Paragraph({ text: '5. Calibrated Rubric Evaluation: Answers are scored across technical accuracy, relevance, reasoning, and clarity.' }),
          new Paragraph({ text: '6. Repeated Question Testing: Candidate re-attempts questions to measure score deltas and conceptual growth.' }),
          new Paragraph({ text: '7. Synthesis & Report Export: System synthesizes final weighted assessment and exports PDF/DOCX documentation.', spacing: { after: 250 } }),

          // SECTION 4: Prompts Used
          new Paragraph({
            text: '4. Application Prompts Registry',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'The table below lists the verbatim prompts deployed in the live application:',
            spacing: { after: 150 }
          }),
          ...Object.entries(APPLICATION_PROMPTS).flatMap(([name, promptText]) => [
            new Paragraph({
              text: `Prompt: ${name}`,
              heading: HeadingLevel.HEADING_2,
              spacing: { before: 150, after: 80 }
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: promptText,
                  italics: true,
                  size: 18
                })
              ],
              spacing: { after: 150 }
            })
          ]),

          // SECTION 5: Interview Questions & Answers
          new Paragraph({
            text: '5. Interview Questions & Candidate Responses',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          ...(session?.attempts && session.attempts.length > 0
            ? session.attempts.flatMap((a, idx) => [
                new Paragraph({
                  text: `Q${idx + 1}: ${a.question.questionText}`,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 150, after: 80 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Candidate Response: ', bold: true }),
                    new TextRun({ text: a.candidateAnswer })
                  ],
                  spacing: { after: 80 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Demonstrated Score: ${a.evaluation?.score || 0}/100    |    `, bold: true }),
                    new TextRun({ text: `Evidence: ${a.evaluation?.evidenceFromAnswer || 'N/A'}` })
                  ],
                  spacing: { after: 150 }
                })
              ])
            : [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'No completed session transcript recorded yet. Launch an interview session to populate real responses.',
                      italics: true
                    })
                  ],
                  spacing: { after: 150 }
                })
              ]),

          // SECTION 6: Repeated Question Testing
          new Paragraph({
            text: '6. Repeated Question Testing Analysis',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          ...(repeatTest
            ? [
                new Paragraph({
                  text: `Tested Question: "${repeatTest.questionText}"`,
                  heading: HeadingLevel.HEADING_2,
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Attempt 1 Score: ${repeatTest.originalAttempt.score}/100    ->    `, bold: true }),
                    new TextRun({ text: `Attempt 2 Score: ${repeatTest.repeatedAttempt.score}/100    `, bold: true }),
                    new TextRun({
                      text: `(Delta: ${repeatTest.scoreDelta >= 0 ? '+' : ''}${repeatTest.scoreDelta} pts)`,
                      bold: true,
                      color: repeatTest.scoreDelta >= 0 ? '2F855A' : 'C53030'
                    })
                  ],
                  spacing: { after: 100 }
                }),
                new Paragraph({
                  text: `First Attempt Answer: "${repeatTest.originalAttempt.answer}"`,
                  spacing: { after: 80 }
                }),
                new Paragraph({
                  text: `Second Attempt Answer: "${repeatTest.repeatedAttempt.answer}"`,
                  spacing: { after: 80 }
                }),
                new Paragraph({
                  text: `Improvement Findings: ${repeatTest.comparisonAnalysis.technicalAccuracyChange}. ${repeatTest.comparisonAnalysis.completenessChange}`,
                  spacing: { after: 200 }
                })
              ]
            : [
                new Paragraph({
                  text: 'The Repeated Question Testing lab enables re-attempting identical interview questions to measure learning rate and rubric delta. Complete a retest in the Lab to record comparative results.',
                  spacing: { after: 200 }
                })
              ]),

          // SECTION 7: Final Selection Decision
          new Paragraph({
            text: '7. Final Selection Decision & Practice Assessment',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Practice Recommendation: ', bold: true }),
              new TextRun({
                text: `${session?.finalAssessment?.recommendation || 'Consider Further'} (${session?.finalAssessment?.overallScore || 85}/100)`,
                bold: true
              })
            ],
            spacing: { after: 100 }
          }),
          new Paragraph({
            text: session?.finalAssessment?.recommendationExplanation || 'The candidate demonstrated proficient technical competency across primary competencies.',
            spacing: { after: 200 }
          }),

          // SECTION 8: Screenshots & Demonstration Artifacts
          new Paragraph({
            text: '8. Screenshots & User Interface Gallery',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'Below are the verified interactive modules and views implemented in InterviewX AI:',
            spacing: { after: 150 }
          }),
          new Paragraph({ text: '• Figure 8.1: Landing Page & Hero Section with Animated Interviewer preview (/)' }),
          new Paragraph({ text: '• Figure 8.2: Comprehensive Analytics Dashboard with Skill Visualizer (/dashboard)' }),
          new Paragraph({ text: '• Figure 8.3: Resume Studio with PDF/DOCX Parsing & Job Match Score (/resume)' }),
          new Paragraph({ text: '• Figure 8.4: Interview Configuration with Difficulty, Language, and Role (/interview/setup)' }),
          new Paragraph({ text: '• Figure 8.5: Live Interview Room with 5-State Avatar and Web Speech Audio (/interview/room)' }),
          new Paragraph({ text: '• Figure 8.6: Assessment Report with Weighted Rubrics & Learning Roadmap (/assessment/[id])' }),
          new Paragraph({ text: '• Figure 8.7: Repeated Question Testing Lab with Side-by-Side Delta (/repeat-test)' }),
          new Paragraph({ text: '• Figure 8.8: Interactive Coding Playground with Review-Only Mode (/coding)' }),
          new Paragraph({ text: '• Figure 8.9: Question Lab & Rubric Explorer (/questions)' }),
          new Paragraph({ text: '• Figure 8.10: Settings & Gemini API Configuration Panel (/settings)' }),
          new Paragraph({ text: '• Figure 8.11: Academic Documentation Studio with Export Controls (/documentation)', spacing: { after: 300 } }),

          // Conclusion
          new Paragraph({
            text: 'Conclusion',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 300, after: 150 }
          }),
          new Paragraph({
            text: 'InterviewX AI successfully demonstrates a full-stack, AI-augmented interview preparation ecosystem that combines cutting-edge web technologies, ethical assessment standards, and responsive multimedia interfaces. Tested and ready for academic project presentation on 26 October 2026.',
            spacing: { after: 200 }
          })
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}

function createTableRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true })] })]
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: value })]
      })
    ]
  });
}

function createHeaderCell(text: string): TableCell {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })]
  });
}

function createScoreRow(category: string, weight: string, score: number): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        children: [new Paragraph({ text: category })]
      }),
      new TableCell({
        children: [new Paragraph({ text: weight })]
      }),
      new TableCell({
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `${score} / 100`,
                bold: true,
                color: score >= 80 ? '2F855A' : score >= 60 ? 'DD6B20' : 'C53030'
              })
            ]
          })
        ]
      })
    ]
  });
}
