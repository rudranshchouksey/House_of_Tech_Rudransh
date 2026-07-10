'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Save, CloudOff, CheckCircle2, MoreHorizontal, User, Share } from 'lucide-react';
import { useTheme } from 'next-themes';

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

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="flex items-center space-x-4">
        {/* Document Icon / Logo */}
        <div className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center font-bold text-xl">
          <span className="sr-only">Document</span>
          📄
        </div>

        <div className="flex flex-col">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1 text-xs text-gray-500 mb-1 px-1">
             <span>Workspace</span>
             <span>/</span>
             <span>Documents</span>
             <span>/</span>
             <span className="text-gray-900 dark:text-gray-300 font-medium truncate max-w-[150px]">{title || 'Untitled'}</span>
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
                className="text-lg font-medium bg-transparent border-b-2 border-blue-500 focus:outline-none px-1 min-w-[200px]"
              />
            ) : (
              <h1 
                onClick={() => setIsEditing(true)}
                className="text-lg font-medium px-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-text min-w-[100px] border border-transparent hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                title="Rename"
              >
                {title || 'Untitled Document'}
              </h1>
            )}
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500 px-1 mt-0.5">
            <span className="flex items-center space-x-1">
              {syncStatus === 'SYNCED' && <><CheckCircle2 size={12} className="text-green-500" /> <span>Saved</span></>}
              {syncStatus === 'SYNCING' && <><Save size={12} className="animate-pulse text-blue-500" /> <span>Saving...</span></>}
              {syncStatus === 'OFFLINE' && <><CloudOff size={12} className="text-orange-500" /> <span>Offline mode</span></>}
              {syncStatus === 'SAVED_LOCALLY' && <><CheckCircle2 size={12} className="text-blue-500" /> <span>Saved locally</span></>}
              {syncStatus === 'ERROR' && <><CloudOff size={12} className="text-red-500" /> <span>Error saving</span></>}
            </span>
            <span>Edited {lastEdited.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          title="Toggle Theme"
        >
          {theme === 'dark' ? '🌞' : '🌙'}
        </button>

        {/* Share Button */}
        <button className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-4 py-2 rounded-full font-medium text-sm transition-colors">
          <Share size={16} />
          <span>Share</span>
        </button>

        {/* User Avatar */}
        <div className="relative">
          {currentUser?.image ? (
            <img 
              src={currentUser.image} 
              alt={currentUser.name || 'User'} 
              className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              {currentUser?.name?.charAt(0) || <User size={16} />}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
