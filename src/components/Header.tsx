'use client';

import React, { useState } from 'react';
import { Settings, HelpCircle, FileText, X, AlertTriangle, Key } from 'lucide-react';

export default function Header() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Custom API key overrides stored in local state/session state
  const [customKey, setCustomKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('CUSTOM_GEMINI_API_KEY') || '';
    }
    return '';
  });

  const saveCustomKey = () => {
    if (typeof window !== 'undefined') {
      if (customKey.trim()) {
        localStorage.setItem('CUSTOM_GEMINI_API_KEY', customKey.trim());
      } else {
        localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
      }
      setIsSettingsOpen(false);
      window.location.reload(); // Reload to apply key in state
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4 md:px-8">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg flex items-center justify-center">
            <FileText size={20} className="stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-extrabold text-slate-900 leading-none tracking-tight">
              DocGen
            </h1>
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline mt-0.5">
              Technical Documentation Generator
            </span>
          </div>
        </div>

        {/* Right Navigation & Tools */}
        <div className="flex items-center gap-2">
          {/* Help Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs border border-transparent hover:border-slate-200"
            aria-label="Help and Documentation Info"
          >
            <HelpCircle size={15} />
            <span className="hidden md:inline">Help</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-all font-semibold text-xs border border-transparent hover:border-slate-200"
            aria-label="Settings configuration"
          >
            <Settings size={15} />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* 1. Help Modal */}
      {isHelpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col scale-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <HelpCircle className="text-blue-600" size={20} />
                <h3 className="text-base font-bold text-slate-900">How to use DocGen</h3>
              </div>
              <button 
                onClick={() => setIsHelpOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600 leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-900 mb-2">🚀 Getting Started in 3 Steps</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <strong>Input Code/Specs</strong>: Paste your raw code, Swagger specification (JSON/YAML), function signatures, or high-level architecture details in the Monaco code editor.
                  </li>
                  <li>
                    <strong>Configure Generation</strong>: Choose your document type (like API References, Setup Guides, or TROUBLESHOOTING tables) and a customized tone suited for your audience.
                  </li>
                  <li>
                    <strong>Generate & Export</strong>: Click <strong className="text-blue-600">Generate Documentation</strong>. Once streamed, you can one-click copy or download as raw Markdown (.md), clean HTML (.html), or formatted A4 PDF.
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">💡 Supported Input Formats</h4>
                <ul className="list-disc pl-5 space-y-2">
                  <li><strong>Raw Code</strong>: Paste JavaScript, TypeScript, Python, Java, Go, C++, etc.</li>
                  <li><strong>OpenAPI/Swagger</strong>: Complete schema specifications. Generates gorgeous table-based endpoint summaries.</li>
                  <li><strong>Function/API Signature</strong>: Paste single declarations or classes with docstrings.</li>
                  <li><strong>README Content</strong>: Upgrade, restructure, or format your existing repositories.</li>
                  <li><strong>Architecture</strong>: Document modular relationships, integrations, databases, and microservices in detail.</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3">
                <AlertTriangle className="text-blue-600 shrink-0" size={18} />
                <div>
                  <h5 className="font-bold text-blue-900 mb-1">Getting your Gemini API Key</h5>
                  <p className="text-xs text-blue-800">
                    DocGen runs on Google&apos;s free Gemini API model. Visit the{' '}
                    <a 
                      href="https://aistudio.google.com/app/apikey" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="underline font-bold hover:text-blue-600"
                    >
                      Google AI Studio Key Page
                    </a>
                    , click &quot;Create API Key&quot;, and paste it securely into the Settings page to configure locally!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsHelpOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden scale-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-slate-800">
                <Settings className="text-blue-600 animate-spin-slow" size={20} />
                <h3 className="text-base font-bold text-slate-900">API Settings</h3>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <Key size={14} className="text-slate-400" />
                  Custom Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="Paste your NEXT_PUBLIC_GEMINI_API_KEY"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-2">
                  Optional. Overrides the system&apos;s default key. Key is stored locally in your browser storage and never sent to external servers.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-500">
                <strong>Model in use</strong>: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">gemini-1.5-flash</code> (Fast, streaming ready, and optimized).
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setCustomKey('');
                  localStorage.removeItem('CUSTOM_GEMINI_API_KEY');
                  setIsSettingsOpen(false);
                  window.location.reload();
                }}
                className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
              >
                Reset Default
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveCustomKey}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
