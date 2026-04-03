import { ocrService } from "@/services/ocr.service";
import { createLogger, generateRequestId } from "@/lib/logger";
import { handleApiError, ValidationError } from "@/lib/errors";

const log = createLogger("api.ocr");

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const reqLog = log.child({ requestId });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      throw new ValidationError("Nenhum arquivo enviado");
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new ValidationError(
        "Formato não suportado. Use PDF, JPEG, PNG ou WebP.",
      );
    }

    if (file.size > MAX_SIZE) {
      throw new ValidationError("Arquivo muito grande. Máximo: 10MB.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await ocrService.processFile(buffer, file.type);

    return Response.json(result);
  } catch (error) {
    return handleApiError(error, reqLog);
  }
}
