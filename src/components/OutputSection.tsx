'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDocStore } from '@/lib/store';
import { 
  copyToClipboard, 
  downloadMarkdown, 
  downloadHtml, 
  downloadPdf 
} from '@/lib/exporters';
import { 
  Clipboard, 
  Check, 
  FileCode, 
  Printer, 
  RefreshCw, 
  FileText, 
  AlertTriangle
} from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { toast } from 'sonner';

export default function OutputSection() {
  const { 
    documentation, 
    isLoading, 
    error, 
    input,
    inputType,
    documentationType,
    tone,
    setDocumentation,
    setLoading,
    setError
  } = useDocStore();

  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Create an instance of markdown-it
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
  });

  // Auto-scroll to bottom of output container during active streaming
  useEffect(() => {
    if (isLoading && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [documentation, isLoading]);

  // Copy action handler
  const handleCopy = async () => {
    if (!documentation) return;
    const success = await copyToClipboard(documentation);
    if (success) {
      setCopied(true);
      toast.success('✅ Documentation copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('❌ Failed to copy to clipboard.');
    }
  };

  // Download raw markdown action handler
  const handleDownloadMd = () => {
    if (!documentation) return;
    downloadMarkdown(documentation);
    toast.success('Downloaded Markdown file (.md)');
  };

  // Download styled HTML action handler
  const handleDownloadHtml = () => {
    if (!documentation) return;
    downloadHtml(documentation);
    toast.success('Downloaded styled HTML file (.html)');
  };

  // Download formatted PDF action handler
  const handleDownloadPdf = async () => {
    if (!documentation) return;
    setDownloadingPdf(true);
    toast.info('Generating A4 formatted PDF document...');
    
    const success = await downloadPdf(documentation);
    setDownloadingPdf(false);
    
    if (success) {
      toast.success('Downloaded premium PDF document (.pdf)');
    } else {
      toast.error('❌ Failed to generate PDF. Make sure your browser supports downloads.');
    }
  };

  // Retry the exact last generation
  const handleRetry = async () => {
    if (!input) return;
    setLoading(true);
    setError(null);
    setDocumentation('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input,
          inputType,
          documentationType,
          tone,
          language: 'auto'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server returned an error.');
      }

      if (!response.body) {
        throw new Error('Response stream is empty.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedDoc = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim().startsWith('data: ')) {
            try {
              const data = JSON.parse(line.trim().slice(6));
              if (data.status === 'generating' && data.content) {
                streamedDoc += data.content;
                setDocumentation(streamedDoc);
              } else if (data.status === 'error') {
                throw new Error(data.message || 'Streaming failed.');
              }
            } catch {
              // Ignore parser errors
            }
          }
        }
      }

      setLoading(false);
      toast.success('Documentation regenerated successfully!');
    } catch (err) {
      setError((err as Error).message || 'Failed to generate documentation.');
      setLoading(false);
      toast.error(`❌ Retry failed: ${(err as Error).message}`);
    }
  };

  const renderedHtml = md.render(documentation || '');

  // 1. Loading Skeleton Animation
  const renderLoadingState = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6 animate-pulse">
        {/* H1 Placeholder */}
        <div className="h-7 bg-slate-200 rounded w-2/3 mb-4"></div>
        {/* Paragraph 1 */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-11/12"></div>
          <div className="h-4 bg-slate-200 rounded w-4/5"></div>
        </div>
        {/* Table/List Skeleton */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-3 mt-6 bg-slate-50/50">
          <div className="h-5 bg-slate-200 rounded w-1/3 mb-2"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          </div>
          <hr className="border-slate-100" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
            <div className="h-4 bg-slate-200 rounded col-span-1"></div>
          </div>
        </div>
        {/* Paragraph 2 */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-5/6"></div>
        </div>
      </div>

      {/* Floating status loader */}
      <div className="flex items-center justify-center gap-3 bg-blue-50 border border-blue-100 px-4 py-3 rounded-lg mt-6">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
        <span className="text-xs font-semibold text-blue-800 animate-pulse">
          Generating documentation...
        </span>
      </div>
    </div>
  );

  // 2. Initial Empty State
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center h-full max-w-sm mx-auto">
      <div className="bg-slate-50 text-slate-400 p-4.5 rounded-2xl mb-5 border border-slate-200 shadow-inner flex items-center justify-center">
        <FileText size={40} className="stroke-[1.5]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-1.5 uppercase tracking-wider">
        Documentation Preview
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-6 font-medium">
        Your professionally styled technical guide will compile here in real-time as the AI streams.
      </p>
      
      <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-5 w-full font-semibold">
        Pro tip: Use the <strong className="text-blue-500">Sample Templates</strong> button on the left panel to test immediately!
      </div>
    </div>
  );

  // 3. Error Banner
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full max-w-md mx-auto shake-animation">
      <div className="bg-red-50 text-red-500 p-4.5 rounded-2xl mb-4 border border-red-200 flex items-center justify-center">
        <AlertTriangle size={36} className="stroke-[2]" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 mb-2 uppercase tracking-wider">
        Generation Failed
      </h3>
      <p className="text-xs text-slate-500 leading-relaxed mb-6 font-semibold">
        {error || 'An unexpected error occurred while communicating with the Google Gemini AI interface.'}
      </p>
      <button
        onClick={handleRetry}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 text-xs font-bold transition-all shadow-md"
      >
        <RefreshCw size={13} />
        <span>Try Again</span>
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
      {/* Panel Headers */}
      <div className="px-5 h-12 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0 select-none">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Documentation Output
        </span>
        {documentation && !isLoading && !error && (
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            Completed
          </span>
        )}
        {isLoading && (
          <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full animate-pulse">
            Streaming
          </span>
        )}
      </div>

      {/* Main Content Area */}
      <div 
        ref={containerRef}
        className="flex-grow p-6 overflow-y-auto max-h-[calc(100vh-64px-130px)] min-h-[300px]"
      >
        {error ? (
          renderErrorState()
        ) : isLoading && !documentation ? (
          renderLoadingState()
        ) : !documentation ? (
          renderEmptyState()
        ) : (
          <div 
            className="markdown-preview select-text" 
            dangerouslySetInnerHTML={{ __html: renderedHtml }} 
          />
        )}
      </div>

      {/* Action Footer Bar */}
      {documentation && !error && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick Clipboard Action */}
          <button
            onClick={handleCopy}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm shadow-blue-500/10 disabled:opacity-50"
            aria-label="Copy to Clipboard"
          >
            {copied ? <Check size={14} /> : <Clipboard size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Export Downloads */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMd}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg text-xs font-bold transition-all border border-slate-200 disabled:opacity-50"
              title="Download as Markdown"
            >
              <FileText size={14} className="text-slate-400" />
              <span className="hidden sm:inline">Markdown</span>
            </button>

            <button
              onClick={handleDownloadHtml}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg text-xs font-bold transition-all border border-slate-200 disabled:opacity-50"
              title="Download as HTML"
            >
              <FileCode size={14} className="text-slate-400" />
              <span className="hidden sm:inline">HTML</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isLoading || downloadingPdf}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-700 hover:text-blue-600 hover:bg-white rounded-lg text-xs font-bold transition-all border border-slate-200 disabled:opacity-50"
              title="Download as PDF"
            >
              {downloadingPdf ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-slate-700"></div>
              ) : (
                <Printer size={14} className="text-slate-400" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>

            {/* Quick Regenerate */}
            {!isLoading && (
              <button
                onClick={handleRetry}
                className="flex items-center justify-center p-2 text-slate-600 hover:text-blue-600 hover:bg-white border border-slate-200 rounded-lg transition-all"
                title="Regenerate documentation"
              >
                <RefreshCw size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
