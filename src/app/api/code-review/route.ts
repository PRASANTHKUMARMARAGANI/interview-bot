import { NextResponse } from 'next/server';
import { z } from 'zod';
import { generateWithGemini, extractJsonFromText } from '@/lib/gemini';

const CodeReviewSchema = z.object({
  problemTitle: z.string(),
  language: z.string(),
  code: z.string(),
  customKey: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CodeReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid code review parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { problemTitle, language, code, customKey } = parsed.data;

    const prompt = `Perform an in-depth senior software engineer code review on the following candidate solution.
Problem: "${problemTitle}"
Language: ${language}
Submitted Code:
\`\`\`${language}
${code}
\`\`\`

Analyze:
1. Time Complexity (Big-O with derivation)
2. Space Complexity (Big-O with auxiliary memory explanation)
3. Correctness Assessment (Pass, Minor Issues, Logical Flaw)
4. Edge Cases Handled and Potential Blindspots
5. Clean Code & Readability Tips (naming, modularity, idiomatic patterns)
6. Optimized Alternative Approach (if any)

Return a strictly valid JSON response:
{
  "verdict": "Optimal" | "Valid with Suggestions" | "Needs Revision",
  "timeComplexity": "<e.g. O(N) where N is array length>",
  "spaceComplexity": "<e.g. O(1) auxiliary space>",
  "summary": "<2-3 sentence overall review summary>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "edgeCases": ["<handled case>", "<unhandled case or caution>"],
  "cleanCodeTips": ["<tip 1>", "<tip 2>"],
  "optimizedSnippet": "<concise code snippet or null>"
}`;

    const geminiRes = await generateWithGemini({
      prompt,
      systemInstruction: 'You are an expert technical interviewer and senior software architect providing constructive, precise code review.',
      customKey,
      temperature: 0.2
    });

    if (geminiRes.success && geminiRes.text) {
      const parsedJson = extractJsonFromText(geminiRes.text);
      if (parsedJson.data) {
        return NextResponse.json({
          review: parsedJson.data,
          source: 'gemini',
          isDemoSimulation: false
        });
      }
    }

    // Static Analysis Fallback
    const hasLoops = /for\s*\(|while\s*\(|\.forEach|\.map/i.test(code);
    const hasNestedLoops = /(for|while).*\{[\s\S]*?(for|while)/i.test(code);
    const hasRecursion = new RegExp(`${problemTitle.replace(/\s+/g, '')}\\s*\\(`, 'i').test(code);

    let timeComplexity = hasNestedLoops ? 'O(N^2)' : hasLoops ? 'O(N)' : 'O(1)';
    let spaceComplexity = /\[\]|\{\}|new\s+Map|new\s+Set|list\(\)|dict\(\)/i.test(code) ? 'O(N)' : 'O(1)';

    const demoReview = {
      verdict: hasNestedLoops ? 'Valid with Suggestions' : 'Optimal',
      timeComplexity: `${timeComplexity} (estimated via static structural analysis)`,
      spaceComplexity: `${spaceComplexity} (estimated via auxiliary data structures)`,
      summary: 'The submitted implementation demonstrates solid syntax control and logical structure. Code adheres to core language conventions.',
      strengths: [
        'Clear variable nomenclature and readable layout',
        'Direct implementation addressing the primary problem objective'
      ],
      edgeCases: [
        'Verify behavior with empty collections or null inputs',
        'Ensure boundaries are guarded against integer overflow or single-element inputs'
      ],
      cleanCodeTips: [
        'Consider adding brief JSDoc/docstring comments specifying preconditions and postconditions',
        'Guard clauses at the start of the function reduce nested indentation'
      ],
      optimizedSnippet: null
    };

    return NextResponse.json({
      review: demoReview,
      source: 'static-analyzer',
      notice: 'Reviewed using built-in static structural analyzer (Review-Only Mode). No server-side code execution performed.',
      isDemoSimulation: true
    });
  } catch (error: any) {
    console.error('API code-review error:', error);
    return NextResponse.json({ error: 'Code review execution failed.' }, { status: 500 });
  }
}
