import { extractionService } from "@/services/extraction.service";
import { createLogger, generateRequestId } from "@/lib/logger";
import { handleApiError, ValidationError } from "@/lib/errors";

const log = createLogger("api.extract");

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const reqLog = log.child({ requestId });

  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      throw new ValidationError("Texto OCR é obrigatório");
    }

    if (text.length < 10) {
      throw new ValidationError("Texto muito curto para extração");
    }

    const result = await extractionService.extractFromText(text);

    return Response.json(result);
  } catch (error) {
    return handleApiError(error, reqLog);
  }
}
