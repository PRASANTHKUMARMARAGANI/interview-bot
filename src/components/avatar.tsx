'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarState } from '@/types';
import { Sparkles, Mic, Brain, Volume2, Bot } from 'lucide-react';

interface AvatarProps {
  state: AvatarState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatusLabel?: boolean;
  className?: string;
}

export function AIAvatar({
  state = 'idle',
  size = 'lg',
  showStatusLabel = true,
  className = ''
}: AvatarProps) {
  const [blink, setBlink] = useState(false);

  // Natural blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 160);
    }, 3800);
    return () => clearInterval(blinkInterval);
  }, []);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-36 h-36',
    lg: 'w-52 h-52',
    xl: 'w-64 h-64'
  };

  const getStatusDetails = () => {
    switch (state) {
      case 'speaking':
        return {
          label: 'Speaking Question',
          color: 'text-cyan-400 bg-cyan-950/70 border-cyan-500/40',
          icon: Volume2
        };
      case 'listening':
        return {
          label: 'Listening to Answer...',
          color: 'text-violet-400 bg-violet-950/70 border-violet-500/40',
          icon: Mic
        };
      case 'thinking':
        return {
          label: 'Analyzing Evaluation...',
          color: 'text-amber-400 bg-amber-950/70 border-amber-500/40',
          icon: Brain
        };
      case 'success':
        return {
          label: 'Session Complete!',
          color: 'text-emerald-400 bg-emerald-950/70 border-emerald-500/40',
          icon: Sparkles
        };
      default:
        return {
          label: 'Interviewer Ready',
          color: 'text-blue-400 bg-blue-950/70 border-blue-500/40',
          icon: Bot
        };
    }
  };

  const status = getStatusDetails();
  const StatusIcon = status.icon;

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Halo Glow */}
      <div className="relative flex items-center justify-center">
        {/* State-dependent radiating aura rings */}
        {state === 'listening' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.4 }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full bg-violet-500/20 blur-xl pointer-events-none"
          />
        )}

        {state === 'speaking' && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0.3 }}
            animate={{ scale: [1, 1.25, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full bg-cyan-500/20 blur-xl pointer-events-none"
          />
        )}

        {state === 'thinking' && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
            className="absolute -inset-3 rounded-full border border-dashed border-amber-500/40 pointer-events-none"
          />
        )}

        {/* Main Avatar Container */}
        <motion.div
          animate={
            state === 'idle'
              ? { y: [0, -6, 0] }
              : state === 'speaking'
              ? { y: [0, -3, 0], scale: [1, 1.02, 1] }
              : state === 'listening'
              ? { scale: [1, 1.04, 1] }
              : state === 'success'
              ? { y: [0, -8, 0], rotate: [0, -1, 1, 0] }
              : {}
          }
          transition={{
            repeat: Infinity,
            duration: state === 'speaking' ? 1.6 : state === 'listening' ? 1.8 : 4,
            ease: 'easeInOut'
          }}
          className={`${sizeClasses[size]} relative rounded-full p-1 bg-gradient-to-tr from-indigo-900 via-blue-900 to-cyan-500 shadow-2xl flex items-center justify-center border border-indigo-400/30 overflow-hidden`}
        >
          {/* Inner Avatar Graphic */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full rounded-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="headGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="50%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#0B132B" />
              </linearGradient>

              <linearGradient id="visorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="50%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>

              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#67E8F9" />
                <stop offset="100%" stopColor="#0284C7" />
              </radialGradient>
            </defs>

            {/* Background circular field */}
            <circle cx="100" cy="100" r="96" fill="url(#headGrad)" />

            {/* Neural Matrix lines in background */}
            <path
              d="M30 100 Q 100 40 170 100"
              stroke="#38BDF8"
              strokeWidth="0.8"
              strokeOpacity="0.25"
            />
            <path
              d="M40 130 Q 100 80 160 130"
              stroke="#818CF8"
              strokeWidth="0.8"
              strokeOpacity="0.2"
            />

            {/* Shoulders / Torso */}
            <path
              d="M45 180 C 60 150, 140 150, 155 180 Z"
              fill="#1E293B"
              stroke="#475569"
              strokeWidth="1.5"
            />
            <path
              d="M80 160 L 100 180 L 120 160"
              stroke="#06B6D4"
              strokeWidth="1.5"
              strokeOpacity="0.6"
            />

            {/* Head Silhouette */}
            <rect
              x="62"
              y="50"
              width="76"
              height="94"
              rx="38"
              fill="#111827"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeOpacity="0.8"
            />

            {/* Futuristic Headset / Audio Earplates */}
            <rect x="52" y="85" width="10" height="26" rx="4" fill="#3B82F6" opacity="0.9" />
            <rect x="138" y="85" width="10" height="26" rx="4" fill="#3B82F6" opacity="0.9" />
            <path d="M57 85 C 57 48, 143 48, 143 85" stroke="#38BDF8" strokeWidth="2.5" fill="none" opacity="0.5" />

            {/* Eyeline / Cyber Visor */}
            <rect
              x="70"
              y="78"
              width="60"
              height="20"
              rx="10"
              fill="#0F172A"
              stroke="#06B6D4"
              strokeWidth="1"
            />

            {/* Left Eye */}
            <ellipse
              cx="86"
              cy="88"
              rx={blink ? '4' : '4'}
              ry={blink ? '0.6' : '4.5'}
              fill="url(#eyeGlow)"
            />

            {/* Right Eye */}
            <ellipse
              cx="114"
              cy="88"
              rx={blink ? '4' : '4'}
              ry={blink ? '0.6' : '4.5'}
              fill="url(#eyeGlow)"
            />

            {/* Mouth / Audio Waveform State */}
            {state === 'speaking' ? (
              <g transform="translate(85, 118)">
                <motion.line
                  x1="0"
                  y1="5"
                  x2="0"
                  y2="15"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ y1: [4, 1, 4], y2: [16, 19, 16] }}
                  transition={{ repeat: Infinity, duration: 0.25 }}
                />
                <motion.line
                  x1="7"
                  y1="2"
                  x2="7"
                  y2="18"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ y1: [2, 0, 2], y2: [18, 22, 18] }}
                  transition={{ repeat: Infinity, duration: 0.2 }}
                />
                <motion.line
                  x1="15"
                  y1="0"
                  x2="15"
                  y2="20"
                  stroke="#818CF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ y1: [0, 3, 0], y2: [20, 17, 20] }}
                  transition={{ repeat: Infinity, duration: 0.22 }}
                />
                <motion.line
                  x1="23"
                  y1="2"
                  x2="23"
                  y2="18"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ y1: [3, 1, 3], y2: [17, 20, 17] }}
                  transition={{ repeat: Infinity, duration: 0.28 }}
                />
                <motion.line
                  x1="30"
                  y1="5"
                  x2="30"
                  y2="15"
                  stroke="#06B6D4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ y1: [5, 2, 5], y2: [15, 18, 15] }}
                  transition={{ repeat: Infinity, duration: 0.24 }}
                />
              </g>
            ) : state === 'listening' ? (
              /* Listening Microphone indicator wave */
              <g transform="translate(82, 122)">
                <motion.path
                  d="M5 4 Q 18 12 31 4"
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                />
                <circle cx="18" cy="6" r="2.5" fill="#C084FC" />
              </g>
            ) : state === 'thinking' ? (
              /* Thinking dot sequence */
              <g transform="translate(86, 124)">
                <circle cx="6" cy="3" r="2" fill="#FBBF24" opacity="0.8" />
                <circle cx="14" cy="3" r="2" fill="#FBBF24" opacity="0.6" />
                <circle cx="22" cy="3" r="2" fill="#FBBF24" opacity="0.4" />
              </g>
            ) : state === 'success' ? (
              /* Friendly smile curve */
              <path
                d="M84 122 Q 100 134 116 122"
                fill="none"
                stroke="#34D399"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            ) : (
              /* Idle subtle calm line */
              <path
                d="M88 124 Q 100 127 112 124"
                fill="none"
                stroke="#64748B"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </motion.div>
      </div>

      {/* Status Label Pill */}
      {showStatusLabel && (
        <motion.div
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 px-3.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 shadow-sm transition-all duration-300 ${status.color}`}
        >
          <StatusIcon className={`w-3.5 h-3.5 ${state === 'speaking' || state === 'listening' ? 'animate-pulse' : ''}`} />
          <span>{status.label}</span>
        </motion.div>
      )}
    </div>
  );
}
