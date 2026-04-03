import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { adminService } from "@/services/admin.service";
import { createLogger, generateRequestId } from "@/lib/logger";
import { handleApiError, NotFoundError, AuthError } from "@/lib/errors";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

const log = createLogger("api.admin.documents");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const requestId = generateRequestId();
  const reqLog = log.child({ requestId });

  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      throw new AuthError("Não autorizado");
    }

    const { id } = await params;
    const document = await adminService.getDocumentDetail(id);

    if (!document) {
      throw new NotFoundError("Documento não encontrado");
    }

    if (existsSync(document.fileUrl)) {
      const buffer = await readFile(document.fileUrl);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": document.fileType,
          "Content-Disposition": `inline; filename="${document.fileName}"`,
        },
      });
    }

    return NextResponse.redirect(document.fileUrl);
  } catch (error) {
    return handleApiError(error, reqLog);
  }
}
