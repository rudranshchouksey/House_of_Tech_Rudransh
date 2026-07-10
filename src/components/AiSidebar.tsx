'use client';

import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { Bot, Sparkles, Loader2, GitCommitHorizontal, MessageSquare, PenTool, Languages } from 'lucide-react';
import { useCompletion } from '@ai-sdk/react';

interface AiSidebarProps {
  doc: Y.Doc | null;
  documentId: string;
}

type Tab = 'autocomplete' | 'summarize' | 'grammar' | 'ask';

export function AiSidebar({ doc, documentId }: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('autocomplete');
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

  const [currentText, setCurrentText] = useState(() => doc?.getXmlFragment('content').toString() || '');

  useEffect(() => {
    if (!doc) return;

    let timeout: ReturnType<typeof setTimeout>;
    const handleUpdate = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setCurrentText(doc.getXmlFragment('content').toString());
      }, 500);
    };

    doc.on('update', handleUpdate);
    setCurrentText(doc.getXmlFragment('content').toString());

    return () => {
      clearTimeout(timeout);
      doc.off('update', handleUpdate);
    };
  }, [doc]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 border-l border-gray-200 dark:border-gray-800 text-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Bot size={18} />
          <span>AI Assistant</span>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto custom-scrollbar bg-gray-50 dark:bg-gray-900/50 p-1 space-x-1">
        <TabButton id="autocomplete" icon={<PenTool size={14} />} label="Continue" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="summarize" icon={<GitCommitHorizontal size={14} />} label="Summarize" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="grammar" icon={<Sparkles size={14} />} label="Grammar" activeTab={activeTab} setActiveTab={setActiveTab} />
        <TabButton id="ask" icon={<MessageSquare size={14} />} label="Ask AI" activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {activeTab === 'autocomplete' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-1">Smart Continuation</h3>
              <p className="text-indigo-600/80 dark:text-indigo-400/80 text-xs leading-relaxed">
                Let AI continue your thoughts. We analyze your recent context to generate the next logical sentences.
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 text-xs text-gray-500 max-h-32 overflow-hidden truncate whitespace-pre-wrap relative shadow-inner">
              <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-gray-50 dark:from-gray-900 to-transparent"></div>
              {currentText.slice(-200) || "Start typing in the document to generate context..."}
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-gray-50 dark:from-gray-900 to-transparent"></div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); complete(currentText.slice(-500)); }}>
               <button 
                type="submit"
                disabled={isLoading || !currentText}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                Generate Continuation
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-800 dark:text-red-200 text-xs shadow-sm">
                <p className="font-semibold mb-1 flex items-center gap-1"><span className="text-red-500">⚠</span> Error</p>
                {error.message || 'Failed to generate continuation.'}
              </div>
            )}
            
            {completion && !error && (
              <div className="mt-4 p-4 border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="font-semibold text-xs mb-2 text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                  <Sparkles size={12} /> Suggestion:
                </p>
                <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                  {completion}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'summarize' && (
          <div className="space-y-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-1">Version Diff Summary</h3>
              <p className="text-indigo-600/80 dark:text-indigo-400/80 text-xs leading-relaxed">
                Compare the current document against a historical snapshot to see what changed.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Version ID</label>
              <input 
                type="text" 
                placeholder="Paste Version ID..." 
                value={versionId}
                onChange={(e) => setVersionId(e.target.value)}
                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
              />
            </div>

            <button 
              onClick={handleSummarize}
              disabled={loadingSummary || !versionId}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
            >
              {loadingSummary ? <Loader2 size={16} className="animate-spin" /> : <GitCommitHorizontal size={16} />}
              Generate Diff Summary
            </button>

            {summary && (
              <div className="mt-4 p-4 border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
                <p className="font-semibold text-xs mb-2 text-green-600 dark:text-green-400 flex items-center gap-1">
                  <GitCommitHorizontal size={12} /> AI Summary:
                </p>
                <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                  {summary}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="space-y-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-sm">
              <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-2">
                <Sparkles size={16} /> Grammar & Style
              </h3>
              <p className="text-indigo-600/80 dark:text-indigo-400/80 text-xs leading-relaxed">
                Highlight text in the editor and select "Improve Writing" from the floating menu to fix grammar and improve clarity.
              </p>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 space-y-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
               <Languages size={24} className="text-gray-400 dark:text-gray-600" />
               <p className="text-center text-xs">Awaiting text selection...</p>
            </div>
          </div>
        )}

        {activeTab === 'ask' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-3">
             <MessageSquare size={32} className="text-gray-300 dark:text-gray-700" />
             <p className="text-center text-xs">Chat functionality is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ id, icon, label, activeTab, setActiveTab }: { id: Tab, icon: React.ReactNode, label: string, activeTab: Tab, setActiveTab: (t: Tab) => void }) {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap rounded-lg transition-colors
        ${active ? 'text-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 shadow-sm' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
