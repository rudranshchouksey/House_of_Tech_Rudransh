import { auth } from "@/auth";
import prisma from "@/lib/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Plus, LogIn } from "lucide-react";
import { Role } from "@prisma/client";
import { DocumentList } from "@/components/DocumentList";

async function createDocument(formData: FormData) {
  'use server';
  const session = await auth();
  if (!session || !session.user) return;

  const title = formData.get('title') as string || 'Untitled Document';
  
  const doc = await prisma.document.create({
    data: {
      title,
      ownerId: session.user.id!,
      collaborators: {
        create: {
          userId: session.user.id!,
          role: Role.OWNER
        }
      }
    }
  });

  redirect(`/documents/${doc.id}`);
}

export default async function Home() {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-black font-sans text-gray-900 dark:text-gray-100">
        <main className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-3xl mb-8 shadow-lg">
            D
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            Collaborative Document Editor
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12">
            A local-first, blazing fast text editor powered by CRDTs, Yjs, TipTap, and AI. Work offline seamlessly and sync instantly when reconnected.
          </p>
          <Link 
            href="/login" 
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-medium transition-colors text-lg"
          >
            <LogIn size={20} />
            Sign In to Get Started
          </Link>
        </main>
      </div>
    );
  }

  // Dashboard for authenticated users
  const documents = await prisma.document.findMany({
    where: {
      OR: [
        { ownerId: session.user.id },
        { collaborators: { some: { userId: session.user.id } } }
      ]
    },
    orderBy: { updatedAt: 'desc' }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <header className="h-16 flex items-center justify-between px-8 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">
            D
          </div>
          <h1 className="text-xl font-bold dark:text-white">Workspace</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {session.user.name || session.user.email}
          </span>
          <Link href="/api/auth/signout" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white">
            Sign Out
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Your Documents</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and collaborate on your files.</p>
          </div>
          <form action={createDocument}>
            <button 
              type="submit" 
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm hover:shadow-indigo-500/20 hover:shadow-lg active:scale-95"
            >
              <Plus size={18} />
              New Document
            </button>
          </form>
        </div>

        <DocumentList initialDocuments={documents} currentUserId={session.user.id!} />
      </main>
    </div>
  );
}
