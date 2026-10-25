'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  Bot,
  FileText,
  BarChart3,
  Play,
  RotateCcw,
  Code2,
  BookOpen,
  Settings,
  Menu,
  X,
  Sun,
  Moon,
  Briefcase,
  UserCheck,
  LogIn,
  GraduationCap,
  ShieldCheck,
  ArrowRightLeft
} from 'lucide-react';
import { getStoredSettings, saveSettings, getCurrentUser, switchRole } from '@/lib/storage';
import { UserAuth } from '@/types';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [user, setUser] = useState<UserAuth | null>(null);

  useEffect(() => {
    const s = getStoredSettings();
    setIsDemoMode(s.provider === 'demo' || !s.apiKey);
    setTheme(s.theme || 'dark');
    setUser(getCurrentUser());
    if (s.theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [pathname]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    saveSettings({ theme: nextTheme });
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  };

  const handleSwitchPortal = (targetRole: 'interviewer' | 'candidate') => {
    if (targetRole === 'interviewer') {
      router.push('/login?portal=interviewer');
    } else {
      router.push('/login?portal=student');
    }
  };

  // Determine portal domain
  const isCandidateSection =
    pathname.startsWith('/candidate') ||
    pathname.startsWith('/interview') ||
    pathname.startsWith('/assessment') ||
    (user?.role === 'candidate' && !pathname.startsWith('/interviewer') && !pathname.startsWith('/repeat-test') && !pathname.startsWith('/documentation') && !pathname.startsWith('/questions'));

  // Separate Navigation Links for Candidate Portal vs. Interviewer Portal
  const candidateNavLinks = [
    { href: '/candidate', label: 'Candidate Lobby & Verify', icon: UserCheck },
    { href: '/dashboard', label: 'My Assessment Reports', icon: BarChart3 },
    { href: '/resume', label: 'Resume Studio', icon: FileText }
  ];

  const interviewerNavLinks = [
    { href: '/interviewer', label: 'Campaigns & Submissions', icon: Briefcase },
    { href: '/questions', label: 'Question Bank Lab', icon: BookOpen },
    { href: '/repeat-test', label: 'Repeat Testing', icon: RotateCcw },
    { href: '/coding', label: 'Coding Lab', icon: Code2 },
    { href: '/documentation', label: 'Academic Docs', icon: Sparkles },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  const activeLinks = isCandidateSection ? candidateNavLinks : interviewerNavLinks;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-indigo-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Portal Identifier */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[1.5px] shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
            <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
              {isCandidateSection ? (
                <GraduationCap className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              ) : (
                <Briefcase className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              )}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                InterviewX
              </span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                  isCandidateSection
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                }`}
              >
                {isCandidateSection ? 'Student Portal' : 'Recruiter Hub'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 hidden sm:inline -mt-0.5">
              {isCandidateSection
                ? 'AI Proctored Video & Voice Interview'
                : 'Enterprise Recruiter & Evaluator Command'}
            </span>
          </div>
        </Link>

        {/* Distinct Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {activeLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/30 to-blue-600/30 text-cyan-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Side: Role Badge, Theme Toggle & Explicit Portal Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Identity Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white font-medium max-w-[130px] truncate">
              {isCandidateSection ? (user?.name || 'Alex Morgan') : (user?.name?.split(' ')[0] || 'Recruiter')}
            </span>
            {isCandidateSection ? (
              <span className="font-mono text-cyan-400 text-[11px] font-bold">
                (Roll: {user?.rollNo || '2023-CS-101'})
              </span>
            ) : (
              <span className="font-mono text-indigo-400 text-[11px] font-bold">
                (ID: {user?.recruiterId || 'REC-2026-904'})
              </span>
            )}
          </div>

          {/* Switch Portal Button */}
          {isCandidateSection ? (
            <button
              onClick={() => handleSwitchPortal('interviewer')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/30 transition-all shadow-sm"
              title="Switch to Interviewer / Recruiter Portal"
            >
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
              <span>Go to Recruiter Hub</span>
            </button>
          ) : (
            <button
              onClick={() => handleSwitchPortal('candidate')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md transition-all"
              title="Open Student Interview Portal"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Open Student Portal</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Dark/Light Mode"
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/50 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/60 border border-slate-700/50"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 pt-3 pb-6 space-y-3 backdrop-blur-2xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <span className="text-xs text-slate-400 font-medium">Active Portal:</span>
            <span className="text-xs font-bold text-cyan-400 uppercase">
              {isCandidateSection ? 'Student Portal' : 'Recruiter Hub'}
            </span>
          </div>

          <div className="space-y-1">
            {activeLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                    isActive
                      ? 'bg-indigo-600/30 text-cyan-300 border border-indigo-500/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSwitchPortal(isCandidateSection ? 'interviewer' : 'candidate');
              }}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white flex items-center justify-center gap-2"
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>Switch to {isCandidateSection ? 'Recruiter Hub' : 'Student Portal'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
