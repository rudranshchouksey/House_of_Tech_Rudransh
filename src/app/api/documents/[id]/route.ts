import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const document = await prisma.document.findUnique({
      where: { id },
      include: { owner: { select: { id: true, name: true, image: true } } },
    });

    if (!document) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, isFavorite, isArchived } = body;

    const dataToUpdate: any = {};
    if (title !== undefined && typeof title === 'string') dataToUpdate.title = title;
    if (isFavorite !== undefined && typeof isFavorite === 'boolean') dataToUpdate.isFavorite = isFavorite;
    if (isArchived !== undefined && typeof isArchived === 'boolean') dataToUpdate.isArchived = isArchived;

    const document = await prisma.document.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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
    
    // Check if owner
    if (document.ownerId !== session.user.id) {
       return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.document.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
