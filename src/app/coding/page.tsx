'use client';

import React, { useState } from 'react';
import {
  Code2,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  Layers,
  Clock,
  Cpu,
  BookOpen
} from 'lucide-react';
import { getStoredSettings } from '@/lib/storage';

interface Challenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  constraints: string[];
  examples: Array<{ input: string; output: string; explanation?: string }>;
  templates: Record<string, string>;
}

const CODING_CHALLENGES: Challenge[] = [
  {
    id: 'two-sum',
    title: 'Two Sum — Target Pair Index Lookup',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume each input would have exactly one solution, and you may not use the same element twice.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      'Only one valid answer exists'
    ],
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }
    ],
    templates: {
      typescript: `function twoSum(nums: number[], target: number): number[] {
  const map = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement)!, i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []`,
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}`
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses String Matching',
    difficulty: 'Easy',
    category: 'Stack',
    description:
      'Given a string s containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets in the correct order.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only ()[]{}'],
    examples: [
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' }
    ],
    templates: {
      typescript: `function isValid(s: string): boolean {
  const stack: string[] = [];
  const matching: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.length === 0 || stack.pop() !== matching[char]) {
        return false;
      }
    }
  }
  return stack.length === 0;
}`,
      python: `def is_valid(s: str) -> bool:
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping.values():
            stack.append(char)
        elif char in mapping:
            if not stack or stack.pop() != mapping[char]:
                return False
    return not stack`,
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const c of s) {
    if (c === '(' || c === '{' || c === '[') stack.push(c);
    else if (stack.pop() !== map[c]) return false;
  }
  return stack.length === 0;
}`,
      java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}`
    }
  }
];

export default function CodingPlaygroundPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge>(CODING_CHALLENGES[0]);
  const [language, setLanguage] = useState<string>('typescript');
  const [code, setCode] = useState<string>(CODING_CHALLENGES[0].templates['typescript']);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<any>(null);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleSelectChallenge = (c: Challenge) => {
    setSelectedChallenge(c);
    setCode(c.templates[language] || c.templates['typescript']);
    setReviewResult(null);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    setCode(selectedChallenge.templates[lang] || selectedChallenge.templates['typescript']);
    setReviewResult(null);
  };

  const handleRunReview = async () => {
    setIsReviewing(true);
    setErrorNotice(null);
    setReviewResult(null);

    const appSettings = getStoredSettings();

    try {
      const res = await fetch('/api/code-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemTitle: selectedChallenge.title,
          language,
          code,
          customKey: appSettings.apiKey || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.review) {
        throw new Error(data.error || 'Failed to review code');
      }

      setReviewResult(data);
    } catch (err: any) {
      console.error('Code review error:', err);
      setErrorNotice(err.message || 'Error executing AI code review.');
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 mb-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>Interactive Algorithmic Lab</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Coding Challenge & Complexity Review
          </h1>
          <p className="text-sm text-slate-400">
            Write algorithmic solutions, analyze Big-O complexity, and receive senior AI architectural code reviews.
          </p>
        </div>

        {/* Security Declaration Notice */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>Review-Only Safe Mode (Zero arbitrary server execution)</span>
        </div>
      </div>

      {errorNotice && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* WORKSPACE: LEFT PROBLEM DESCRIPTION, RIGHT EDITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Problem Details & Test Cases */}
        <div className="lg:col-span-5 space-y-4">
          {/* Challenge Selector */}
          <div className="glass-panel p-4 rounded-2xl flex gap-2">
            {CODING_CHALLENGES.map((ch) => (
              <button
                key={ch.id}
                onClick={() => handleSelectChallenge(ch)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-center transition-all ${
                  selectedChallenge.id === ch.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                {ch.title.split('—')[0].trim()}
              </button>
            ))}
          </div>

          <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {selectedChallenge.difficulty}
              </span>
              <span className="text-xs text-slate-400">{selectedChallenge.category}</span>
            </div>

            <h3 className="text-lg font-bold text-white">{selectedChallenge.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedChallenge.description}
            </p>

            {/* Test Cases / Examples */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Sample Test Cases:
              </span>
              {selectedChallenge.examples.map((ex, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1 font-mono">
                  <div className="text-cyan-300">Input: {ex.input}</div>
                  <div className="text-emerald-300">Output: {ex.output}</div>
                  {ex.explanation && <div className="text-[11px] text-slate-400 font-sans">{ex.explanation}</div>}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="pt-2 border-t border-slate-800 space-y-1 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 block">Constraints:</span>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-[11px]">
                {selectedChallenge.constraints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right: Code Editor & AI Review Output */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel p-6 rounded-3xl space-y-4 border border-indigo-500/30">
            {/* Editor Toolbar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Language:</span>
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
                >
                  <option value="typescript">TypeScript</option>
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode(selectedChallenge.templates[language] || '')}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-white bg-slate-800/60"
                  title="Reset starter template"
                >
                  Reset
                </button>
                <button
                  onClick={handleRunReview}
                  disabled={isReviewing}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isReviewing ? 'Analyzing Code...' : 'AI Code Review'}</span>
                </button>
              </div>
            </div>

            {/* Editor Textarea */}
            <textarea
              rows={14}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500 leading-relaxed resize-none"
              spellCheck={false}
            />
          </div>

          {/* AI Code Review Results */}
          {reviewResult && (
            <div className="glass-panel p-6 rounded-3xl space-y-4 border border-cyan-500/40 bg-slate-900/90">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-sm">Senior AI Code Review & Complexity</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20">
                  {reviewResult.review.verdict || 'Optimal'}
                </span>
              </div>

              {/* Time & Space Complexity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Time Complexity:</span>
                    <span className="font-mono font-bold text-white">{reviewResult.review.timeComplexity}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[11px]">Space Complexity:</span>
                    <span className="font-mono font-bold text-white">{reviewResult.review.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              {/* Review Summary */}
              <p className="text-xs text-slate-300 leading-relaxed">
                {reviewResult.review.summary}
              </p>

              {/* Strengths & Edge Cases */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <span className="font-semibold text-emerald-400">Implementation Highlights:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {(reviewResult.review.strengths || []).map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 space-y-1">
                  <span className="font-semibold text-amber-400">Edge Cases & Cautions:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                    {(reviewResult.review.edgeCases || []).map((e: string, i: number) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
