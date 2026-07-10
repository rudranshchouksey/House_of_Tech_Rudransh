'use client';

import { useState, useEffect } from 'react';
import { restoreDocumentState } from '@/lib/sync/restorer';
import { useSyncEngine } from '@/hooks/useSyncEngine';

interface Version {
  id: string;
  versionNumber: number;
  commitMessage: string | null;
  timestamp: string;
  createdBy: { id: string; name: string | null; email: string | null };
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
      
      setPreviewContent(tempDoc.getText('content').toString());
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

  if (loading) return <div className="p-4 text-gray-500">Loading history...</div>;

  return (
    <div className="flex h-full border-l border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
      <div className="w-80 overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version History</h2>
          <button 
            onClick={() => setShowSaveForm(!showSaveForm)}
            className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 rounded hover:bg-indigo-200 dark:hover:bg-indigo-800 transition"
          >
            + Save
          </button>
        </div>

        {showSaveForm && (
          <form onSubmit={handleSaveVersion} className="mb-6 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <input 
              type="text"
              placeholder="Commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className="w-full text-sm p-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white mb-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <div className="flex gap-2">
              <button 
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-indigo-600 text-white text-xs font-medium py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button 
                type="button"
                onClick={() => setShowSaveForm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium py-1.5 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        
        {versions.length === 0 ? (
          <p className="text-sm text-gray-500">No versions captured yet.</p>
        ) : (
          <div className="space-y-6">
            {versions.map((v) => (
              <div key={v.id} className="relative pl-6 border-l-2 border-indigo-500">
                <div className="absolute w-3 h-3 bg-indigo-500 rounded-full -left-[7px] top-1"></div>
                <div className="mb-1 text-sm font-medium text-gray-900 dark:text-white">
                  Version {v.versionNumber}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {new Date(v.timestamp).toLocaleString()}
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                  "{v.commitMessage}"
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  By {v.createdBy.name || v.createdBy.email}
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handlePreview(v.id)}
                    className="text-xs px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => handleRestore(v.id)}
                    className="text-xs px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
                  >
                    Restore
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Pane */}
      {previewVersionId && (
        <div className="flex-1 p-6 flex flex-col bg-white dark:bg-gray-950">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Snapshot Preview
            </h3>
            <button 
              onClick={() => setPreviewVersionId(null)}
              className="text-sm text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="flex-1 border border-gray-200 dark:border-gray-800 rounded p-4 font-mono text-sm whitespace-pre-wrap overflow-y-auto bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            {previewContent || 'Loading preview...'}
          </div>
        </div>
      )}
    </div>
  );
}
