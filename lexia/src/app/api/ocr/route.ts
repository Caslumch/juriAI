import { runOcrPipeline } from "@/lib/ocr";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return Response.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { error: "Formato não suportado. Use PDF, JPEG, PNG ou WebP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "Arquivo muito grande. Máximo: 10MB." },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await runOcrPipeline(buffer, file.type);

    return Response.json(result);
  } catch (error) {
    console.error("[OCR] Pipeline error:", error);
    return Response.json(
      { error: "Erro ao processar OCR. Tente novamente." },
      { status: 500 },
    );
  }
}
