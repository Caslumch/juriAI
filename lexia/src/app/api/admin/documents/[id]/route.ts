import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { existsSync } from "fs";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    select: { fileUrl: true, fileType: true, fileName: true },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 },
    );
  }

  // If fileUrl is a local file path
  if (existsSync(document.fileUrl)) {
    const buffer = await readFile(document.fileUrl);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": document.fileType,
        "Content-Disposition": `inline; filename="${document.fileName}"`,
      },
    });
  }

  // If fileUrl is a remote URL, redirect to it
  return NextResponse.redirect(document.fileUrl);
}
