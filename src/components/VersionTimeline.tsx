'use client';

import { useState, useEffect } from 'react';
import { restoreDocumentState } from '@/lib/sync/restorer';
import { useSyncEngine } from '@/hooks/useSyncEngine';
import { Clock, History, Save, RotateCcw, X, User } from 'lucide-react';

interface Version {
  id: string;
  versionNumber: number;
  commitMessage: string | null;
  timestamp: string;
  createdBy: { id: string; name: string | null; email: string | null; image: string | null };
}

export default function VersionTimeline({ documentId }: { documentId: string }) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  
  const { doc } = useSyncEngine(documentId);

  const fetchVersions = () => {
    fetch(`/api/documents/${documentId}/versions`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setVersions(data);
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const handlePreview = async (versionId: string) => {
    setPreviewVersionId(versionId);
    setPreviewContent('');
    try {
      const res = await fetch(`/api/documents/${documentId}/versions?versionId=${versionId}`);
      if (!res.ok) throw new Error('Failed to fetch snapshot');
      
      const buffer = await res.arrayBuffer();
      const snapshotBlob = new Uint8Array(buffer);
      
      const { Doc, applyUpdate } = await import('yjs');
      const tempDoc = new Doc();
      applyUpdate(tempDoc, snapshotBlob);
      
      setPreviewContent(tempDoc.getXmlFragment('content').toString());
      tempDoc.destroy();
    } catch (error) {
      console.error(error);
      setPreviewContent('Failed to load preview.');
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!doc) return alert('Document sync engine not initialized');
    
    try {
      const res = await fetch(`/api/documents/${documentId}/versions?versionId=${versionId}`);
      if (!res.ok) throw new Error('Failed to fetch snapshot');
      
      const buffer = await res.arrayBuffer();
      const snapshotBlob = new Uint8Array(buffer);
      
      // Perform CRDT Diff Restoration
      restoreDocumentState(doc, snapshotBlob);
      alert('Version restored successfully!');
      setPreviewVersionId(null);
    } catch (error) {
      console.error(error);
      alert('Failed to restore version');
    }
  };

  const handleSaveVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commitMessage })
      });
      if (res.ok) {
        setCommitMessage('');
        setShowSaveForm(false);
        fetchVersions();
      } else {
        alert('Failed to save version.');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving version.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-full bg-gray-50/50 dark:bg-gray-950/50 text-sm overflow-hidden">
      <div className="flex-1 overflow-y-auto p-5 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-gray-50/90 dark:bg-gray-950/90 backdrop-blur-md z-10 pb-3 pt-1 border-b border-gray-200/50 dark:border-gray-800/50">
          <div className="flex items-center gap-2.5 font-semibold text-gray-900 dark:text-white">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
              <History size={18} />
            </div>
            <h2 className="text-[15px]">Version History</h2>
          </div>
          <button 
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2 bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-all font-medium shadow-sm hover:shadow active:scale-95"
          >
            <Save size={14} />
            Capture Snapshot
          </button>
        </div>

        {showSaveForm && (
          <form onSubmit={handleSaveVersion} className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            <input 
              type="text"
              placeholder="What changed? e.g. 'Added introduction'"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full text-sm p-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-950 text-gray-900 dark:text-white mb-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              required
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-indigo-600 text-white text-xs font-medium py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Snapshot'}
              </button>
              <button 
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        {versions.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-400 space-y-3">
             <Clock size={32} className="text-gray-200 dark:text-gray-800" />
             <p className="text-center text-xs">No version history yet.<br/>Save a snapshot to start tracking.</p>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            {versions.map((v) => (
              <div key={v.id} className="relative pl-6 pb-2 border-l-2 border-indigo-100 dark:border-indigo-900/30 last:border-transparent group">
                <div className="absolute w-3 h-3 bg-white dark:bg-gray-950 border-[2.5px] border-indigo-500 rounded-full -left-[7.5px] top-1.5 group-hover:scale-125 transition-transform duration-300 ring-4 ring-white dark:ring-gray-950"></div>
                
                <div className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-800/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800/50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2.5">
                      <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider shadow-sm">v{v.versionNumber}</span>
                      <span className="text-[12px] font-medium text-gray-500 dark:text-gray-400">
                        {new Date(v.timestamp).toLocaleDateString()} at {new Date(v.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-gray-700 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                    {v.commitMessage}
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60">
                    <div className="flex items-center gap-2 text-[11px] font-medium text-gray-500">
                      {v.createdBy.image ? (
                        <img src={v.createdBy.image} alt="" className="w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700 object-cover" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"><User size={12} /></div>
                      )}
                      <span className="truncate max-w-[120px]">{v.createdBy.name || v.createdBy.email?.split('@')[0]}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePreview(v.id)}
                        className="text-[11px] font-medium px-3 py-1.5 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-sm active:scale-95"
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => handleRestore(v.id)}
                        title="Restore this version"
                        className="text-[11px] font-medium p-1.5 text-white bg-indigo-600 dark:bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                      >
                        <RotateCcw size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewVersionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-4xl h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center gap-2">
                <History className="text-indigo-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Snapshot Preview
                </h3>
              </div>
              <button 
                onClick={() => setPreviewVersionId(null)}
                className="p-1.5 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto bg-gray-100 dark:bg-black/50">
               <div className="bg-white dark:bg-gray-900 max-w-[850px] mx-auto shadow-sm border border-gray-200 dark:border-gray-800 min-h-full rounded p-10 lg:p-16">
                  {/* Rendering raw AST JSON string as text for now, but a real preview would load the Tiptap editor in readOnly mode */}
                  <div className="font-mono text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                    {previewContent || <span className="animate-pulse flex items-center gap-2"><div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div> Loading preview...</span>}
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
