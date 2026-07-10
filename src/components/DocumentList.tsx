'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Search, Grid, List, MoreVertical, Star, Copy, Trash2, Archive, Edit2, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  title: string;
  updatedAt: Date;
  createdAt: Date;
  isFavorite: boolean;
  isArchived: boolean;
  ownerId: string;
}

interface DocumentListProps {
  initialDocuments: Document[];
  currentUserId: string;
}

export function DocumentList({ initialDocuments, currentUserId }: DocumentListProps) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az' | 'recently_edited'>('newest');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: JSON.stringify({ title: formData.get('title') || 'Untitled Document' })
      });
      // The current page creates via server action, let's keep that or adjust it.
      // Wait, in page.tsx there is a server action `createDocument`. We can pass it as a prop or use a form action.
    } catch (err) {
      toast.error('Failed to create document');
    }
  };

  const handleDuplicate = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.promise(
      fetch(`/api/documents/${id}/duplicate`, { method: 'POST' }).then(res => res.json()),
      {
        loading: 'Duplicating...',
        success: (newDoc) => {
          setDocuments(prev => [newDoc, ...prev]);
          return 'Document duplicated';
        },
        error: 'Failed to duplicate'
      }
    );
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      setDocuments(prev => prev.filter(d => d.id !== id));
      toast.success('Document deleted');
    } catch (error) {
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleFavorite = async (doc: Document, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isFavorite: !d.isFavorite } : d));
    
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !doc.isFavorite })
      });
    } catch (error) {
      // Revert on error
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isFavorite: doc.isFavorite } : d));
      toast.error('Failed to update favorite status');
    }
  };

  const toggleArchive = async (doc: Document, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Optimistic update
    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isArchived: !d.isArchived } : d));
    
    try {
      await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived: !doc.isArchived })
      });
      toast.success(doc.isArchived ? 'Document unarchived' : 'Document archived');
    } catch (error) {
      // Revert on error
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, isArchived: doc.isArchived } : d));
      toast.error('Failed to update archive status');
    }
  };

  const filteredAndSortedDocuments = useMemo(() => {
    let result = documents.filter(doc => !doc.isArchived);
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(doc => doc.title.toLowerCase().includes(lowerQuery));
    }
    
    return result.sort((a, b) => {
      // Favorites always first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'recently_edited':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        default:
          return 0;
      }
    });
  }, [documents, searchQuery, sortBy]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="recently_edited">Recently Edited</option>
            <option value="az">A-Z</option>
          </select>

          <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {filteredAndSortedDocuments.length === 0 ? (
        <div className="text-center py-24 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText size={32} />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            {searchQuery ? "We couldn't find anything matching your search." : "Create your first document to start collaborating."}
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
          {filteredAndSortedDocuments.map((doc) => (
            <Link 
              key={doc.id} 
              href={`/documents/${doc.id}`}
              className={`group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700/50 transition-all duration-300 ${isDeleting === doc.id ? 'opacity-50 pointer-events-none' : ''} ${viewMode === 'list' ? 'flex-row items-center p-4' : 'p-6 h-48'}`}
            >
              <div className={`flex items-start justify-between ${viewMode === 'list' ? 'w-full' : 'mb-4'}`}>
                <div className={`flex items-center gap-4 ${viewMode === 'list' ? 'w-full' : ''}`}>
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300">
                    <FileText size={24} />
                  </div>
                  <div className={viewMode === 'grid' ? 'hidden' : 'flex-1'}>
                     <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-md">{doc.title}</h3>
                     <p className="text-sm text-gray-500 dark:text-gray-400">Edited {new Date(doc.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => toggleFavorite(doc, e)}
                    className={`p-2 rounded-lg transition-colors ${doc.isFavorite ? 'text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                  >
                    <Star size={18} className={doc.isFavorite ? "fill-amber-400" : ""} />
                  </button>
                  
                  <div className="relative dropdown-container">
                    <button 
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); const el = e.currentTarget.nextElementSibling; if(el) el.classList.toggle('hidden'); }}
                      className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={18} />
                    </button>
                    <div className="hidden absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="py-1">
                        <button onClick={(e) => { e.preventDefault(); router.push(`/documents/${doc.id}`); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                          <Edit2 size={14} /> Open
                        </button>
                        <button onClick={(e) => handleDuplicate(doc.id, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                          <Copy size={14} /> Duplicate
                        </button>
                        <button onClick={(e) => toggleArchive(doc, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2">
                          <Archive size={14} /> Archive
                        </button>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>
                        <button onClick={(e) => handleDelete(doc.id, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {viewMode === 'grid' && (
                <div className="mt-auto">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 truncate text-lg">{doc.title}</h3>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                    {doc.ownerId === currentUserId ? <span>Owner</span> : <span>Shared</span>}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
