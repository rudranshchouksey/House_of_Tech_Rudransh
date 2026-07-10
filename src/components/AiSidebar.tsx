'use client';

import { useState, useEffect } from 'react';
import * as Y from 'yjs';
import { Bot, Sparkles, Loader2, GitCommitHorizontal, MessageSquare, PenTool, Languages, Send, Plus } from 'lucide-react';
import { DefaultChatTransport } from 'ai';
import { useCompletion, useChat } from '@ai-sdk/react';

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

  const { completion, complete, isLoading: isAutocompleteLoading, error } = useCompletion({
    api: '/api/ai/autocomplete',
  });

  const [input, setInput] = useState('');
  
  const [transport] = useState(() => new DefaultChatTransport({ api: '/api/chat' }));
  const { messages, sendMessage, status } = useChat({
    transport
  });
  
  const isChatLoading = status === 'streaming' || status === 'submitted';

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', content: input });
    setInput('');
  };

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

  const insertIntoEditor = (text: string) => {
    // Basic way to insert at end if we don't have direct editor access, 
    // but a better way is to pass a callback or just use a custom event.
    // For now, let's use window.dispatchEvent
    window.dispatchEvent(new CustomEvent('ai-insert-text', { detail: text }));
  };

  return (
    <div className="flex flex-col h-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-l border-gray-200/60 dark:border-gray-800/60 text-sm overflow-hidden shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-gray-200/60 dark:border-gray-800/60 flex items-center justify-between font-medium bg-white dark:bg-gray-950">
        <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
            <Bot size={18} />
          </div>
          <span className="font-semibold text-[15px] text-gray-900 dark:text-gray-100">AI Assistant</span>
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
                disabled={isAutocompleteLoading || !currentText}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg py-2.5 font-medium transition-all shadow-sm hover:shadow active:scale-[0.98]"
              >
                {isAutocompleteLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
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
          <div className="flex flex-col h-full space-y-4">
             <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/50 flex-shrink-0">
              <h3 className="font-medium text-indigo-800 dark:text-indigo-300 mb-1 flex items-center gap-1.5"><MessageSquare size={14} /> AI Chat</h3>
              <p className="text-indigo-600/80 dark:text-indigo-400/80 text-xs leading-relaxed">
                Ask questions about your document or request new content to be generated.
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar p-1 pb-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-xs my-8">
                  No messages yet. Ask me anything!
                </div>
              )}
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-sm'}`}>
                    <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
                  </div>
                  {m.role === 'assistant' && (
                    <button 
                      onClick={() => insertIntoEditor(m.content)}
                      className="mt-1 text-[10px] flex items-center gap-1 text-gray-500 hover:text-indigo-600 transition-colors bg-transparent border-none cursor-pointer px-1 py-0.5"
                    >
                      <Plus size={10} /> Insert into document
                    </button>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-xl rounded-tl-sm flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-gray-500" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSubmit} className="flex gap-2 flex-shrink-0 bg-white dark:bg-gray-950 p-1 border-t border-gray-200 dark:border-gray-800 -mx-4 -mb-4 px-4 py-3">
              <input
                className="flex-1 bg-gray-100 dark:bg-gray-900 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-800 rounded-xl px-4 py-2 text-sm outline-none transition-all dark:text-gray-200"
                value={input}
                placeholder="Ask AI..."
                onChange={(e) => setInput(e.target.value)}
                disabled={isChatLoading}
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-10 flex items-center justify-center transition-all disabled:opacity-50 disabled:active:scale-100 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
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
      className={`flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium whitespace-nowrap rounded-xl transition-all duration-200
        ${active ? 'text-indigo-700 bg-white dark:bg-gray-800 dark:text-indigo-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5'}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
