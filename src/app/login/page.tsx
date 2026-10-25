'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  User,
  Briefcase,
  Bot,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  Building,
  CheckCircle2,
  GraduationCap,
  Hash,
  BadgeCheck
} from 'lucide-react';
import { UserRole, UserAuth } from '@/types';
import {
  setCurrentUser,
  getCurrentUser,
  DEFAULT_INTERVIEWER_USER,
  DEFAULT_CANDIDATE_USER
} from '@/lib/storage';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading access portal...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedRole, setSelectedRole] = useState<UserRole>('candidate');
  const [name, setName] = useState('Alex Morgan');
  const [rollNo, setRollNo] = useState('2023-CS-101');
  const [recruiterId, setRecruiterId] = useState('REC-2026-904');
  const [email, setEmail] = useState('alex.morgan.demo@interviewx.ai');
  const [organization, setOrganization] = useState('Apex Institute of Technology');

  useEffect(() => {
    const portalParam = searchParams.get('portal');
    if (portalParam === 'interviewer' || portalParam === 'recruiter') {
      applyRole('interviewer');
    } else if (portalParam === 'student' || portalParam === 'candidate') {
      applyRole('candidate');
    } else {
      const current = getCurrentUser();
      if (current && current.role === 'interviewer') {
        applyRole('interviewer');
      } else {
        applyRole('candidate');
      }
    }
  }, [searchParams]);

  const applyRole = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'interviewer') {
      setName(DEFAULT_INTERVIEWER_USER.name);
      setRecruiterId(DEFAULT_INTERVIEWER_USER.recruiterId || 'REC-2026-904');
      setEmail(DEFAULT_INTERVIEWER_USER.email);
      setOrganization(DEFAULT_INTERVIEWER_USER.organization || 'TechVision Enterprise Talent');
    } else {
      setName(DEFAULT_CANDIDATE_USER.name);
      setRollNo(DEFAULT_CANDIDATE_USER.rollNo || '2023-CS-101');
      setEmail(DEFAULT_CANDIDATE_USER.email);
      setOrganization(DEFAULT_CANDIDATE_USER.organization || 'Apex Institute of Technology');
    }
  };

  const handleRoleTabChange = (role: UserRole) => {
    applyRole(role);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserAuth = {
      role: selectedRole,
      name: name.trim() || (selectedRole === 'interviewer' ? 'Recruiter' : 'Candidate'),
      email: email.trim() || `${selectedRole}@interviewx.ai`,
      organization: organization.trim(),
      rollNo: selectedRole === 'candidate' ? (rollNo.trim() || '2023-CS-101') : undefined,
      recruiterId: selectedRole === 'interviewer' ? (recruiterId.trim() || 'REC-2026-904') : undefined
    };

    setCurrentUser(user);

    if (selectedRole === 'interviewer') {
      router.push('/interviewer');
    } else {
      router.push('/candidate');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const user = role === 'interviewer' ? DEFAULT_INTERVIEWER_USER : DEFAULT_CANDIDATE_USER;
    setCurrentUser(user);
    if (role === 'interviewer') {
      router.push('/interviewer');
    } else {
      router.push('/candidate');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-indigo-500/30 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 p-[1.5px] mx-auto shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full rounded-[14px] bg-slate-950 flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            InterviewX Access Portal
          </h1>
          <p className="text-xs text-slate-400">
            {selectedRole === 'candidate'
              ? 'Enter your Student Roll Number to begin your proctored interview.'
              : 'Enter your Registered Recruiter ID to manage campaigns and view submissions.'}
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleTabChange('candidate')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'candidate'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('interviewer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'interviewer'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Interviewer Portal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Conditional ID field right at the top */}
          {selectedRole === 'candidate' ? (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Student Roll No. / Hall Ticket ID <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <Hash className="w-3.5 h-3.5 text-cyan-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. 2023-CS-101 or 22B81A0512"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-slate-900 border border-cyan-500/50 focus:border-cyan-400 rounded-xl pl-9 p-2.5 text-xs text-cyan-300 font-mono font-bold placeholder-slate-600"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Your interview answers, proctoring score, and video recording will be indexed under this Roll Number.
              </p>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Registered Recruiter ID / Employee ID <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. REC-2026-904 or EMP-1082"
                  value={recruiterId}
                  onChange={(e) => setRecruiterId(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/50 focus:border-indigo-400 rounded-xl pl-9 p-2.5 text-xs text-indigo-300 font-mono font-bold placeholder-slate-600"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Enter your authorized interviewer credentials to view all candidate video recordings & scoring rubrics.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {selectedRole === 'interviewer' ? 'Interviewer Full Name' : 'Student Full Name'} <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {selectedRole === 'interviewer' ? 'Official Work Email' : 'Student Email Address'} <span className="text-cyan-400">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {selectedRole === 'interviewer' ? 'Company / Organization' : 'College / University'}
            </label>
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className={`w-full mt-2 py-3 rounded-xl font-bold text-xs text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'candidate'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-cyan-500/25'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/30'
            }`}
          >
            <span>
              {selectedRole === 'candidate'
                ? `Enter Student Portal (${rollNo || 'Roll No'})`
                : `Enter Recruiter Hub (${recruiterId || 'ID'})`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Demonstration Login */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Instant 1-Click Test Access (Academic Review):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('candidate')}
              className="p-2.5 rounded-xl text-[11px] font-semibold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-center flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Student Test Login</span>
              <span className="text-[10px] text-slate-400 font-mono">Roll: 2023-CS-101</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('interviewer')}
              className="p-2.5 rounded-xl text-[11px] font-semibold bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-center flex flex-col items-center gap-0.5"
            >
              <span className="font-bold">Recruiter Test Login</span>
              <span className="text-[10px] text-slate-400 font-mono">ID: REC-2026-904</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
