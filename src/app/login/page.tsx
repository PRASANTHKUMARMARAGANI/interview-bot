'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  CheckCircle2
} from 'lucide-react';
import { UserRole, UserAuth } from '@/types';
import { setCurrentUser, DEFAULT_INTERVIEWER_USER, DEFAULT_CANDIDATE_USER } from '@/lib/storage';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('interviewer');
  const [name, setName] = useState('Sarah Jenkins');
  const [rollNo, setRollNo] = useState('2023-CS-101');
  const [email, setEmail] = useState('sarah.recruiter@interviewx.ai');
  const [organization, setOrganization] = useState('TechVision Enterprise Talent');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'interviewer') {
      setName(DEFAULT_INTERVIEWER_USER.name);
      setEmail(DEFAULT_INTERVIEWER_USER.email);
      setOrganization(DEFAULT_INTERVIEWER_USER.organization || 'TechVision Enterprise');
    } else {
      setName(DEFAULT_CANDIDATE_USER.name);
      setEmail(DEFAULT_CANDIDATE_USER.email);
      setOrganization(DEFAULT_CANDIDATE_USER.organization || 'Apex Institute of Technology');
      if (DEFAULT_CANDIDATE_USER.rollNo) setRollNo(DEFAULT_CANDIDATE_USER.rollNo);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user: UserAuth = {
      role: selectedRole,
      name: name.trim() || (selectedRole === 'interviewer' ? 'Recruiter' : 'Candidate'),
      email: email.trim() || `${selectedRole}@interviewx.ai`,
      organization: organization.trim(),
      rollNo: selectedRole === 'candidate' ? (rollNo.trim() || '2023-CS-101') : undefined
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

        {/* Brand header */}
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
            Select your portal role to access recruiter campaigns or take proctored candidate interviews.
          </p>
        </div>

        {/* Dual Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => handleRoleTabChange('interviewer')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'interviewer'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Interviewer Portal</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleTabChange('candidate')}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
              selectedRole === 'candidate'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Candidate Portal</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              {selectedRole === 'interviewer' ? 'Recruiter / Interviewer Name' : 'Candidate / Student Name'}
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

          {selectedRole === 'candidate' && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Student Roll No. / Hall Ticket ID <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023-CS-101 or 22B81A0512"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full bg-slate-900 border border-indigo-500/50 rounded-xl p-2.5 text-xs text-cyan-300 font-mono font-semibold"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
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
              {selectedRole === 'interviewer' ? 'Organization / Company' : 'College / University'}
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
            className="w-full mt-2 py-3 rounded-xl font-bold text-xs bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 hover:shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Sign In to {selectedRole === 'interviewer' ? 'Recruiter Hub' : 'Candidate Session'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Click Fast Demonstration Login */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block text-center">
            Instant 1-Click Demo Accounts (Academic Review):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('interviewer')}
              className="p-2 rounded-xl text-[11px] font-semibold bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 text-center"
            >
              Demo Recruiter Login
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('candidate')}
              className="p-2 rounded-xl text-[11px] font-semibold bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-center"
            >
              Demo Candidate Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
