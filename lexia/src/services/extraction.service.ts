import { generateObject } from "ai";
import { createLogger } from "@/lib/logger";
import { ExtractionError } from "@/lib/errors";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai/models";
import { extractionSchema } from "@/lib/ai/schemas/extraction-ai";
import { EXTRACTION_PROMPT } from "@/lib/ai/prompts/extraction";
import { validateExtraction } from "@/lib/validation";
import type {
  ExtractionResult,
  ExtractionResponse,
} from "@/shared/schemas/extraction";

const log = createLogger("extraction");

function collectFields(
  extraction: ExtractionResult,
): Array<{ value: string; confidence: number }> {
  const fields: Array<{ value: string; confidence: number }> = [];
  for (const group of Object.values(extraction)) {
    for (const field of Object.values(group)) {
      if (field && typeof field === "object" && "value" in field) {
        fields.push(field as { value: string; confidence: number });
      }
    }
  }
  return fields;
}

export const extractionService = {
  async extractFromText(ocrText: string): Promise<ExtractionResponse> {
    const startTime = Date.now();
    log.info({ textLength: ocrText.length }, "Extraction started");

    const extractionParams = {
      schema: extractionSchema,
      system: EXTRACTION_PROMPT,
      prompt: `Texto extraído do documento:\n\n${ocrText}`,
    };

    try {
      const object = await this.generateWithFallback(extractionParams);

      const rawExtraction = object as ExtractionResult;
      const { validated: extraction, issues } =
        validateExtraction(rawExtraction);

      if (issues.length > 0) {
        log.warn({ issues }, "Post-extraction validation issues");
      }

      const allFields = collectFields(extraction);
      const totalFields = allFields.length;
      const avgConfidence =
        totalFields > 0
          ? allFields.reduce((sum, f) => sum + f.confidence, 0) / totalFields
          : 0;
      const fieldsForReview = allFields.filter(
        (f) => f.confidence < 0.85,
      ).length;

      const durationMs = Date.now() - startTime;
      log.info(
        { durationMs, totalFields, avgConfidence, fieldsForReview },
        "Extraction completed",
      );

      return {
        extraction,
        averageConfidence: Math.round(avgConfidence * 100) / 100,
        totalFields,
        fieldsForReview,
      };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      log.error({ err: error, durationMs }, "Extraction failed");
      throw new ExtractionError("Falha na extração de dados", {
        cause: error,
      });
    }
  },

  async generateWithFallback(params: {
    schema: typeof extractionSchema;
    system: string;
    prompt: string;
  }) {
    try {
      const { object } = await generateObject({
        model: getPrimaryModel(),
        ...params,
      });
      return object;
    } catch (primaryError) {
      const fallbackModel = getFallbackModel();
      if (!fallbackModel) throw primaryError;

      log.warn(
        { err: primaryError },
        "Primary AI model failed, trying fallback (OpenAI)",
      );

      const { object } = await generateObject({
        model: fallbackModel,
        ...params,
      });

      log.info("Extraction completed via fallback model (OpenAI)");
      return object;
    }
  },
};
