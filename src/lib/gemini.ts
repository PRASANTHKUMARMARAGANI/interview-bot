import { GoogleGenAI } from '@google/genai';

export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

export function getGeminiApiKey(customKey?: string): string | null {
  if (customKey && customKey.trim().length > 0) {
    return customKey.trim();
  }
  return process.env.GEMINI_API_KEY || null;
}

export function isGeminiConfigured(customKey?: string): boolean {
  return !!getGeminiApiKey(customKey);
}

export interface GeminiCallParams {
  prompt: string;
  systemInstruction?: string;
  customKey?: string;
  model?: string;
  temperature?: number;
}

export interface GeminiCallResult {
  text: string;
  success: boolean;
  modelUsed: string;
  error?: string;
  isDemoFallback: boolean;
}

/**
 * Robust server-side adapter for Gemini models with error handling
 */
export async function generateWithGemini(params: GeminiCallParams): Promise<GeminiCallResult> {
  const apiKey = getGeminiApiKey(params.customKey);
  const model = params.model || DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    return {
      text: '',
      success: false,
      modelUsed: model,
      error: 'GEMINI_API_KEY is not configured on the server or provided in request settings.',
      isDemoFallback: true
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model,
      contents: params.prompt,
      config: params.systemInstruction
        ? {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.7
          }
        : {
            temperature: params.temperature ?? 0.7
          }
    });

    const text = response.text || '';
    return {
      text,
      success: true,
      modelUsed: model,
      isDemoFallback: false
    };
  } catch (err: any) {
    console.error('Gemini API execution error:', err);
    return {
      text: '',
      success: false,
      modelUsed: model,
      error: err?.message || 'Failed to communicate with Gemini API',
      isDemoFallback: true
    };
  }
}

/**
 * Extracts and parses JSON from model output safely, stripping markdown fences
 */
export function extractJsonFromText<T = any>(text: string): { data: T | null; error?: string } {
  try {
    let clean = text.trim();
    // Strip markdown code fences if present
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    const parsed = JSON.parse(clean);
    return { data: parsed };
  } catch (err: any) {
    return { data: null, error: `JSON parse error: ${err?.message}` };
  }
}
