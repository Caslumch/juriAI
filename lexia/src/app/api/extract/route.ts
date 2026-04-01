import { extractStructuredData } from "@/lib/ai/extract";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return Response.json(
        { error: "Texto OCR é obrigatório" },
        { status: 400 },
      );
    }

    if (text.length < 10) {
      return Response.json(
        { error: "Texto muito curto para extração" },
        { status: 400 },
      );
    }

    const result = await extractStructuredData(text);

    return Response.json(result);
  } catch (error) {
    console.error("[Extract] Error:", error);
    return Response.json(
      { error: "Erro ao extrair dados. Tente novamente." },
      { status: 500 },
    );
  }
}
