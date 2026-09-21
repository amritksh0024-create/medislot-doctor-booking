import React, { useState } from 'react';
import { Database, AlertTriangle, CheckCircle2, ChevronRight, Copy, Check, Shield, User, HelpCircle, X } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from './Modal';

export const SupabaseNoticeBanner: React.FC = () => {
  const isConnected = isSupabaseConfigured();
  const { role, loginAsDemo, isDemoMode, toggleDemoMode } = useAuth();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('medislot_hide_dev_banner') === 'true';
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem('medislot_hide_dev_banner', 'true');
  };

  const adminSqlSnippet = `-- Run this in Supabase SQL Editor to make your account an Admin:
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR_EMAIL_HERE@example.com'
);`;

  const copySql = () => {
    navigator.clipboard.writeText(adminSqlSnippet);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <div
        id="supabase-status-banner"
        className={`w-full text-xs sm:text-sm py-2 px-4 border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isConnected
            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/90 border-amber-200 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium text-xs ${
              isConnected
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-900'
            }`}
          >
            {isConnected ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Supabase Connected
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Supabase Setup Required (Interactive Demo Active)
              </>
            )}
          </span>

          <span className="hidden md:inline text-xs text-slate-600">
            {isConnected
              ? 'Real-time PostgreSQL database & auth active.'
              : 'Add VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY to .env to connect your live Supabase.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Demo Switcher */}
          <div className="flex items-center bg-white/80 rounded-lg p-0.5 border border-slate-200 text-xs shadow-2xs">
            <button
              onClick={() => loginAsDemo('patient')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                role === 'patient'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Demo Patient account"
            >
              <User className="w-3 h-3" />
              Patient Demo
            </button>
            <button
              onClick={() => loginAsDemo('admin')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium flex items-center gap-1 ${
                role === 'admin'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Demo Admin account"
            >
              <Shield className="w-3 h-3" />
              Admin Demo
            </button>
          </div>

          <button
            onClick={() => setShowSetupModal(true)}
            className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Setup Instructions</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1 text-slate-500 hover:text-slate-800 rounded-md transition-colors ml-1"
            title="Dismiss developer notice"
            aria-label="Dismiss developer notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Supabase Setup Modal */}
      <Modal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="Supabase Integration & Database Guide"
        maxWidth="lg"
      >
        <div className="space-y-4 text-slate-700 text-sm">
          <p className="text-slate-600">
            MediSlot connects directly to your own Supabase project with Row Level Security (RLS) and PostgreSQL atomic RPC functions.
          </p>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              1. Required Environment Variables
            </h4>
            <p className="text-xs text-slate-600">
              Create a <code>.env</code> file in the project root (or set in Hostinger / Replit environment settings):
            </p>
            <pre className="bg-slate-900 text-emerald-400 p-3 rounded-lg text-xs overflow-x-auto font-mono">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...`}
            </pre>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              2. Run Database Migrations
            </h4>
            <ol className="list-decimal list-inside text-xs space-y-1.5 text-slate-600">
              <li>Open your Supabase Dashboard &rarr; <strong>SQL Editor</strong></li>
              <li>Execute all queries from <code>supabase/schema.sql</code> (Creates tables, RLS &amp; RPCs)</li>
              <li>Execute <code>supabase/seed.sql</code> to insert 4 demo doctors &amp; available slots</li>
            </ol>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                3. Create Your First Admin
              </h4>
              <button
                onClick={copySql}
                className="text-xs inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSql ? 'Copied!' : 'Copy SQL'}
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-3 rounded-lg text-xs overflow-x-auto font-mono">
              {adminSqlSnippet}
            </pre>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setShowSetupModal(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
            >
              Got it, thanks
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
