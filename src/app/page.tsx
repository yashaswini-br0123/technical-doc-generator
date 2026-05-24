'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import InputSection from '@/components/InputSection';
import OutputSection from '@/components/OutputSection';
import { useDocStore } from '@/lib/store';
import { Toaster } from 'sonner';
import { FileCode, FileText } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');
  const { documentation, isLoading } = useDocStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 1. Header (Sticky) */}
      <Header />

      {/* 2. Global Alert Notification toaster */}
      <Toaster position="top-right" closeButton richColors />

      {/* 3. Main Body Content Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        
        {/* Mobile & Tablet Tab Selectors (< 1024px) */}
        <div className="flex lg:hidden bg-white border border-slate-200 rounded-lg p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-md text-xs font-bold transition-all ${
              activeTab === 'input'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileCode size={15} />
            <span>Configure Input</span>
          </button>
          
          <button
            onClick={() => setActiveTab('output')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-md text-xs font-bold transition-all relative ${
              activeTab === 'output'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <FileText size={15} />
            <span>Preview Result</span>
            {documentation && (
              <span className={`absolute top-2 right-4 w-2 h-2 rounded-full ${isLoading ? 'bg-blue-400 animate-ping' : 'bg-emerald-500'}`}></span>
            )}
          </button>
        </div>

        {/* Responsive Grid System */}
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          
          {/* Left panel - Input Section (Visible on Desktop OR active on Mobile) */}
          <div className={`${activeTab === 'input' ? 'block' : 'hidden lg:block'} w-full`}>
            <InputSection />
          </div>

          {/* Right panel - Output Section (Visible on Desktop OR active on Mobile) */}
          <div className={`${activeTab === 'output' ? 'block' : 'hidden lg:block'} w-full`}>
            <OutputSection />
          </div>

        </div>
      </main>

      {/* 4. Accessibility/SEO Footer */}
      <footer className="w-full py-5 text-center text-xs text-slate-400 bg-white border-t border-slate-200 select-none">
        <p className="font-medium">
          DocGen Technical Documentation Generator &copy; {new Date().getFullYear()}. All Rights Reserved.
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Complies with WCAG 2.1 AA accessibility guidelines. Driven by Google Gemini AI.
        </p>
      </footer>
    </div>
  );
}
