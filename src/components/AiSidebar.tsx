'use client';

import { useState } from 'react';
import * as Y from 'yjs';
import { Bot, Sparkles, Loader2, GitCommitHorizontal } from 'lucide-react';
import { useCompletion } from '@ai-sdk/react';

interface AiSidebarProps {
  doc: Y.Doc | null;
  documentId: string;
}

export function AiSidebar({ doc, documentId }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<'autocomplete' | 'summarize'>('autocomplete');
  const [versionId, setVersionId] = useState('');
  const [summary, setSummary] = useState('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  const { completion, complete, isLoading, error } = useCompletion({
    api: '/api/ai/autocomplete',
  });

  const handleSummarize = async () => {
    if (!versionId) return;
    setLoadingSummary(true);
    setSummary('');
    try {
      const res = await fetch(`/api/documents/${documentId}/versions/${versionId}/summarize`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
      } else {
        setSummary(data.error || 'Error summarizing version.');
      }
    } catch (err) {
      setSummary('Failed to fetch summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  const currentText = doc?.getXmlFragment('content').toString() || '';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 text-sm">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400">
        <Bot size={18} />
        <span>AI Assistant</span>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button 
          onClick={() => setActiveTab('autocomplete')}
          className={`flex-1 py-2 text-center font-medium ${activeTab === 'autocomplete' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Autocomplete
        </button>
        <button 
          onClick={() => setActiveTab('summarize')}
          className={`flex-1 py-2 text-center font-medium ${activeTab === 'summarize' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
        >
          Summarize
        </button>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'autocomplete' ? (
          <div className="space-y-4">
            <p className="text-gray-500 text-xs">
              Context is sent to the AI to predict the next few sentences.
            </p>
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded text-xs text-gray-500 max-h-32 overflow-hidden truncate whitespace-pre-wrap">
              {currentText.slice(-200) || "Start typing in the document to generate context..."}
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); complete(currentText.slice(-500)); }}>
               <button 
                type="submit"
                disabled={isLoading || !currentText}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded py-2 font-medium transition-colors"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Continuation
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 rounded-lg text-red-800 dark:text-red-200 text-xs">
                <p className="font-semibold mb-1">Error:</p>
                {error.message || 'Failed to generate continuation.'}
              </div>
            )}
            {completion && !error && (
              <div className="mt-4 p-3 border border-indigo-100 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-800/50 rounded-lg text-gray-800 dark:text-gray-200">
                <p className="font-semibold text-xs mb-1 text-indigo-600 dark:text-indigo-400">AI Suggestion:</p>
                {completion}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-500 text-xs">
              Select a version ID to compare against the current document state and generate a smart summary.
            </p>
            
            <input 
              type="text" 
              placeholder="Paste Version ID..." 
              value={versionId}
              onChange={(e) => setVersionId(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button 
              onClick={handleSummarize}
              disabled={loadingSummary || !versionId}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded py-2 font-medium transition-colors"
            >
              {loadingSummary ? <Loader2 size={16} className="animate-spin" /> : <GitCommitHorizontal size={16} />}
              Generate Diff Summary
            </button>

            {summary && (
              <div className="mt-4 p-3 border border-green-100 bg-green-50 dark:bg-green-900/20 dark:border-green-800/50 rounded-lg text-gray-800 dark:text-gray-200">
                <p className="font-semibold text-xs mb-1 text-green-600 dark:text-green-400">AI Summary:</p>
                {summary}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
