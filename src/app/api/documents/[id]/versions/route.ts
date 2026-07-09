import { NextResponse } from 'next/server';
import { withDocumentAuth } from '@/lib/document-middleware';
import prisma from '@/lib/db';
import { Role } from '@prisma/client';

// GET: Retrieve the version history or a specific version snapshot
export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const versionId = url.searchParams.get('versionId');

  return withDocumentAuth(req, id, Role.VIEWER, async (req, userId) => {
    try {
      if (versionId) {
        // Fetch specific binary snapshot
        const version = await prisma.documentVersion.findUnique({
          where: { id: versionId },
        });

        if (!version || version.documentId !== id) {
          return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        return new NextResponse(version.snapshotBlob as any, {
          headers: {
            'Content-Type': 'application/octet-stream',
          },
        });
      }

      // Fetch list of versions
      const versions = await prisma.documentVersion.findMany({
        where: { documentId: id },
        orderBy: { versionNumber: 'desc' },
        select: {
          id: true,
          versionNumber: true,
          commitMessage: true,
          timestamp: true,
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
      });

      return NextResponse.json(versions);
    } catch (error) {
      console.error('[VERSIONS_GET_ERROR]', error);
      return NextResponse.json({ error: 'Failed to fetch versions' }, { status: 500 });
    }
  });
}

// POST: Create a new version snapshot
export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return withDocumentAuth(req, id, Role.EDITOR, async (req, userId) => {
    try {
      const body = await req.json();
      const { commitMessage } = body;

      const document = await prisma.document.findUnique({
        where: { id },
        include: {
          _count: {
            select: { versions: true }
          }
        }
      });

      if (!document || !document.content) {
        return NextResponse.json({ error: 'Document not found or is empty' }, { status: 404 });
      }

      const versionNumber = document._count.versions + 1;

      const newVersion = await prisma.documentVersion.create({
        data: {
          documentId: id,
          versionNumber,
          commitMessage: commitMessage || `Version ${versionNumber}`,
          snapshotBlob: document.content,
          createdById: userId,
        },
        select: {
          id: true,
          versionNumber: true,
          commitMessage: true,
          timestamp: true,
        }
      });

      return NextResponse.json(newVersion, { status: 201 });
    } catch (error) {
      console.error('[VERSIONS_POST_ERROR]', error);
      return NextResponse.json({ error: 'Failed to create version snapshot' }, { status: 500 });
    }
  });
}
