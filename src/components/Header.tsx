'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Save, CloudOff, CheckCircle2, MoreHorizontal, User, Share, Download, ChevronRight, FileText, FileDown, FileJson, Printer } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';

interface HeaderProps {
  documentId: string;
  initialTitle?: string;
  syncStatus: 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'ERROR' | 'SAVED_LOCALLY';
  currentUser: { id: string; name?: string | null; image?: string | null } | null;
}

export function Header({ documentId, initialTitle = 'Untitled Document', syncStatus, currentUser }: HeaderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [isEditing, setIsEditing] = useState(false);
  const [lastEdited, setLastEdited] = useState<Date>(new Date());
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  // Use a debounced value for the title to save automatically
  const [debouncedTitle] = useDebounce(title, 1000);
  const { theme, setTheme } = useTheme();

  // Fetch initial title
  useEffect(() => {
    fetch(`/api/documents/${documentId}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.title) {
          setTitle(data.title);
          if (data.updatedAt) {
            setLastEdited(new Date(data.updatedAt));
          }
        }
      })
      .catch(console.error);
  }, [documentId]);

  // Save title when debounced value changes
  useEffect(() => {
    if (!documentId) return;
    
    // Don't save if it's identical to what was just fetched or if empty
    if (!debouncedTitle.trim()) return;

    fetch(`/api/documents/${documentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: debouncedTitle }),
    }).catch(console.error);
  }, [debouncedTitle, documentId]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const exportDocument = (format: 'html' | 'txt' | 'md') => {
    const editorEl = document.querySelector('.ProseMirror');
    if (!editorEl) return;
    
    let content = '';
    let mimeType = '';
    
    if (format === 'html') {
      content = editorEl.innerHTML;
      mimeType = 'text/html';
    } else if (format === 'txt') {
      content = (editorEl as HTMLElement).innerText;
      mimeType = 'text/plain';
    } else if (format === 'md') {
      // Basic markdown conversion, normally you'd use turndown
      content = (editorEl as HTMLElement).innerText; 
      mimeType = 'text/markdown';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'document'}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800/60 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 transition-all">
      <div className="flex items-center space-x-6">
        {/* Document Icon / Logo */}
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white flex items-center justify-center font-bold shadow-sm ring-1 ring-black/5">
          <FileText size={20} className="text-white" />
        </div>

        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-[13px] font-medium text-gray-500 dark:text-gray-400 mb-0.5 px-1">
             <span className="hover:text-gray-900 dark:hover:text-gray-200 cursor-pointer transition-colors">Workspace</span>
             <ChevronRight size={14} className="text-gray-400" />
             <span className="text-gray-900 dark:text-gray-200 truncate max-w-[200px]">{title || 'Untitled'}</span>
          </div>

          <div className="flex items-center">
            {isEditing ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditing(false)}
                onKeyDown={handleKeyDown}
                autoFocus
                className="text-xl font-bold bg-transparent focus:outline-none px-1 min-w-[250px] text-gray-900 dark:text-white border-b-2 border-indigo-500 placeholder-gray-400"
                placeholder="Untitled Document"
              />
            ) : (
              <h1 
                onClick={() => setIsEditing(true)}
                className="text-xl font-bold px-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/60 cursor-text min-w-[150px] border border-transparent transition-all text-gray-900 dark:text-white truncate max-w-[400px]"
                title="Rename Document"
              >
                {title || 'Untitled Document'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-medium text-gray-500 px-1 mt-1">
            <span className="flex items-center space-x-1.5">
              {syncStatus === 'SYNCED' && <><CheckCircle2 size={12} className="text-emerald-500" /> <span>Saved to cloud</span></>}
              {syncStatus === 'SYNCING' && <><Save size={12} className="animate-pulse text-indigo-500" /> <span>Saving changes...</span></>}
              {syncStatus === 'OFFLINE' && <><CloudOff size={12} className="text-amber-500" /> <span>Offline mode</span></>}
              {syncStatus === 'SAVED_LOCALLY' && <><CheckCircle2 size={12} className="text-indigo-500" /> <span>Saved locally</span></>}
              {syncStatus === 'ERROR' && <><CloudOff size={12} className="text-red-500" /> <span>Error saving</span></>}
            </span>
            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
            <span>Edited {lastEdited.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Export Button */}
        <div className="relative">
          <button 
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors flex items-center gap-1"
            title="Export"
          >
            <Download size={18} />
          </button>
          
          {isExportMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden z-50">
              <button onClick={() => { window.print(); setIsExportMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                <Printer size={16} className="text-gray-400" /> Print / PDF
              </button>
              <button onClick={() => exportDocument('html')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                <FileJson size={16} className="text-gray-400" /> Export HTML
              </button>
              <button onClick={() => exportDocument('md')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                <FileDown size={16} className="text-gray-400" /> Export Markdown
              </button>
              <button onClick={() => exportDocument('txt')} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> Export Plain Text
              </button>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>

        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1"></div>

        {/* Share Button */}
        <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm hover:shadow-md active:scale-95">
          <Share size={16} />
          <span>Share</span>
        </button>

        {/* User Avatar */}
        <div className="relative ml-2">
          {currentUser?.image ? (
            <img 
              src={currentUser.image} 
              alt={currentUser.name || 'User'} 
              className="w-9 h-9 rounded-full border-2 border-white dark:border-gray-900 shadow-sm object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-purple-100 dark:from-indigo-900/60 dark:to-purple-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold border-2 border-white dark:border-gray-900 shadow-sm">
              {currentUser?.name?.charAt(0)?.toUpperCase() || <User size={16} />}
            </div>
          )}
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-gray-950 rounded-full"></div>
        </div>
      </div>
    </header>
  );
}
