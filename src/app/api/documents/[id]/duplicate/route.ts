import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';
import { Role } from '@prisma/client';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const newDoc = await prisma.document.create({
      data: {
        title: `${document.title} (Copy)`,
        content: document.content,
        ownerId: session.user.id!,
        collaborators: {
          create: {
            userId: session.user.id!,
            role: Role.OWNER
          }
        }
      }
    });

    return NextResponse.json(newDoc);
  } catch (error) {
    console.error('Failed to duplicate document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
