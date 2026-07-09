import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { WorkspaceClient } from './WorkspaceClient';

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session || !session.user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-900">
        <p>Please sign in to view this document.</p>
      </div>
    );
  }

  const document = await prisma.document.findUnique({
    where: { id },
  });

  if (!document) {
    notFound();
  }

  const currentUser = {
    id: session.user.id!,
    name: session.user.name || 'Anonymous',
    color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random cursor color
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-black font-sans overflow-hidden">
      {/* Premium Header */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">
            D
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{document.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium">
            {currentUser.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Workspace Area */}
      <WorkspaceClient documentId={document.id} currentUser={currentUser} />
    </div>
  );
}
