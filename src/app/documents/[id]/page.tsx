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


      {/* Workspace Area */}
      <WorkspaceClient documentId={document.id} initialTitle={document.title || 'Untitled Document'} currentUser={currentUser} />
    </div>
  );
}
