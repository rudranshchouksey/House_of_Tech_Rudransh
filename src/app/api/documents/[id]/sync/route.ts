import { NextResponse } from 'next/server';
import { withDocumentAuth } from '@/lib/document-middleware';
import prisma from '@/lib/db';
import * as Y from 'yjs';
import { Role } from '@prisma/client';

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  return withDocumentAuth(req, id, Role.EDITOR, async (req, userId) => {
    try {
      const body = await req.arrayBuffer();
      const payload = new Uint8Array(body);
      
      const document = await prisma.document.findUnique({
        where: { id },
      });

      if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      }

      // Initialize server Y.Doc with current document content
      const serverDoc = new Y.Doc();
      if (document.content) {
        Y.applyUpdate(serverDoc, new Uint8Array(document.content));
      }

      // Read the client's state vector from a custom header (base64 encoded)
      const stateVectorBase64 = req.headers.get('x-yjs-state-vector');
      let clientStateVector: Uint8Array | undefined;
      
      if (stateVectorBase64) {
        const buffer = Buffer.from(stateVectorBase64, 'base64');
        clientStateVector = new Uint8Array(buffer);
      }

      // 1. Apply client's updates if the payload is not empty
      if (payload.length > 0) {
        Y.applyUpdate(serverDoc, payload);
        
        // Save the merged state back to DB
        const newBinaryState = Y.encodeStateAsUpdate(serverDoc);
        await prisma.document.update({
          where: { id },
          data: { content: Buffer.from(newBinaryState) },
        });
      }

      // 2. Compute missing updates for the client
      let serverDelta: Uint8Array;
      if (clientStateVector) {
        serverDelta = Y.encodeStateAsUpdate(serverDoc, clientStateVector);
      } else {
        // If no state vector provided, return the whole document state
        serverDelta = Y.encodeStateAsUpdate(serverDoc);
      }

      return new NextResponse(serverDelta as any, {
        headers: {
          'Content-Type': 'application/octet-stream',
        },
      });

    } catch (error) {
      console.error('[SYNC_ERROR]', error);
      return NextResponse.json({ error: 'Failed to synchronize document' }, { status: 500 });
    }
  });
}
