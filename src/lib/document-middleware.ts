import { auth } from "@/auth"
import prisma from "@/lib/db"
import { NextResponse } from "next/server"
import { Role } from "@prisma/client"

const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB

export async function withDocumentAuth(
  req: Request,
  documentId: string,
  requiredRole: Role,
  handler: (req: Request, userId: string) => Promise<NextResponse>
) {
  // 1. Payload Size Validation (for write operations like POST, PUT, PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentLength = req.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json({ error: "Payload too large. Maximum size is 5MB." }, { status: 413 });
    }
  }

  // 2. Authentication Check
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // 3. Tenant Isolation & Role-Based Scoping
  // Check if the user is the owner OR a collaborator with sufficient role
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      collaborators: {
        where: { userId }
      }
    }
  });

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const isOwner = document.ownerId === userId;
  const collaborator = document.collaborators[0];
  const userRole = isOwner ? Role.OWNER : collaborator?.role;

  if (!userRole) {
    return NextResponse.json({ error: "Forbidden: You do not have access to this document." }, { status: 403 });
  }

  // Enforce role hierarchy: OWNER > EDITOR > VIEWER
  const roleHierarchy = {
    [Role.OWNER]: 3,
    [Role.EDITOR]: 2,
    [Role.VIEWER]: 1,
  };

  if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
    return NextResponse.json({ error: `Forbidden: Requires ${requiredRole} access.` }, { status: 403 });
  }

  // User is authenticated and authorized, proceed with handler
  return handler(req, userId);
}
