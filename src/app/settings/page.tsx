'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Volume2,
  Sliders,
  Shield,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Bot,
  Globe
} from 'lucide-react';
import { AppSettings, InterviewLanguage, InterviewDifficulty } from '@/types';
import {
  getStoredSettings,
  saveSettings,
  getStoredSessions,
  seedSampleCompletedSession
} from '@/lib/storage';
import { getAvailableVoices, isSpeechSynthesisSupported } from '@/lib/audio';
import { validateWeights } from '@/lib/scoring';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings());
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [weightError, setWeightError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(getStoredSettings());
    if (isSpeechSynthesisSupported()) {
      const v = getAvailableVoices();
      setVoices(v);
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(getAvailableVoices());
      };
    }
  }, []);

  const handleSave = (updated: Partial<AppSettings>) => {
    const next = saveSettings(updated);
    setSettings(next);
    setSaveStatus('Settings successfully saved.');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  const handleWeightChange = (key: keyof AppSettings['rubricWeights'], val: number) => {
    const updatedWeights = {
      ...settings.rubricWeights,
      [key]: val
    };

    const validation = validateWeights(updatedWeights);
    if (!validation.isValid) {
      setWeightError(`Weights currently sum to ${validation.sum}%. Must total exactly 100%.`);
    } else {
      setWeightError(null);
    }

    handleSave({ rubricWeights: updatedWeights });
  };

  const handleExportData = () => {
    const data = {
      settings: getStoredSettings(),
      sessions: getStoredSessions(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InterviewX_AI_Backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local session history? This action cannot be undone.')) {
      localStorage.removeItem('interviewx_sessions_v1');
      localStorage.removeItem('interviewx_repeat_tests_v1');
      seedSampleCompletedSession();
      setSaveStatus('Local history reset with verified demonstration session.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 mb-2">
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>Application Preferences</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Settings & AI Configuration
          </h1>
          <p className="text-sm text-slate-400">
            Configure your Gemini API key, speech synthesis speed, practice rubric weights, and local data.
          </p>
        </div>
      </div>

      {saveStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* AI PROVIDER & GEMINI API KEY */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5 border border-indigo-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">AI Engine & Provider Status</h3>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              settings.apiKey
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-950/60 text-amber-300 border-amber-500/30'
            }`}
          >
            {settings.apiKey ? 'Gemini Live Active' : 'Autonomous Demo Engine Active'}
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          InterviewX AI operates autonomously with full feature support in demo mode. If you provide a Google Gemini API key below, the server will execute live question generation and evaluations. Your key is stored in your private browser localStorage and never logged.
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Google Gemini API Key (Optional)
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={settings.apiKey}
              onChange={(e) => handleSave({ apiKey: e.target.value.trim() })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-600 font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Gemini Model</label>
              <select
                value={settings.geminiModel}
                onChange={(e) => handleSave({ geminiModel: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fast & Accurate)</option>
                <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Architectural Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Preferred Mode</label>
              <select
                value={settings.provider}
                onChange={(e) => handleSave({ provider: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
              >
                <option value="demo">Autonomous Demo Engine (No API Quota Used)</option>
                <option value="gemini">Gemini API (Live Generation)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* AUDIO & VOICE PREFERENCES */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-white text-base">Interviewer Speech & Voice</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Speech Rate (Speed)</span>
              <span className="font-mono text-cyan-400">{settings.speechRate}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.speechRate}
              onChange={(e) => handleSave({ speechRate: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Pitch */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Speech Pitch</span>
              <span className="font-mono text-cyan-400">{settings.speechPitch}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={settings.speechPitch}
              onChange={(e) => handleSave({ speechPitch: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Voice Selection */}
        {voices.length > 0 && (
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Synthesized Voice:
            </label>
            <select
              value={settings.selectedVoiceURI}
              onChange={(e) => handleSave({ selectedVoiceURI: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white"
            >
              <option value="">Default System Voice</option>
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* RUBRIC WEIGHT CONFIGURATION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Custom Scoring Rubric Weights</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Must Total Exactly 100%</span>
        </div>

        {weightError && (
          <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-300 text-xs">
            {weightError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { key: 'technical', label: 'Technical Accuracy', desc: 'Syntax & foundations' },
            { key: 'relevance', label: 'Relevance', desc: 'Direct prompt answer' },
            { key: 'reasoning', label: 'Reasoning', desc: 'Decomposition & logic' },
            { key: 'communication', label: 'Communication', desc: 'Clarity & structure' },
            { key: 'application', label: 'Application', desc: 'Real-world impact' }
          ].map((item) => (
            <div key={item.key} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">{item.label}</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={settings.rubricWeights[item.key as keyof AppSettings['rubricWeights']]}
                  onChange={(e) =>
                    handleWeightChange(
                      item.key as keyof AppSettings['rubricWeights'],
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-1.5 text-xs text-white text-center font-bold"
                />
                <span className="text-xs text-slate-400">%</span>
              </div>
              <span className="text-[10px] text-slate-500 block">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DATA MANAGEMENT & PRIVACY CONTROLS */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Data Management & Ethical Guarantee</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          All your uploaded resumes, transcripts, and evaluation scores remain in your browser storage. You can backup your entire session history as a JSON file or reset it anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Session Data (JSON)</span>
          </button>

          <button
            onClick={handleClearHistory}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Local Session Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
