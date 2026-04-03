import { createLogger } from "@/lib/logger";
import { OcrError } from "@/lib/errors";
import { preprocessImage, extractTextFromPdf } from "@/lib/ocr/preprocess";
import { extractImagesFromPdf } from "@/lib/ocr/pdf-images";
import { recognizeWithGoogleVision } from "@/lib/ocr/providers/google-vision";
import { recognizeWithTesseract } from "@/lib/ocr/providers/tesseract";
import { config } from "@/config";
import type { OcrResponse } from "@/shared/schemas/extraction";

const log = createLogger("ocr");

const GOOGLE_VISION_COOLDOWN_MS = 5 * 60 * 1000;
let googleVisionDisabledUntil = 0;

interface OcrOptions {
  preferredProvider?: "google-vision" | "tesseract";
}

export const ocrService = {
  async processFile(
    fileBuffer: Buffer,
    mimeType: string,
    options: OcrOptions = {},
  ): Promise<OcrResponse> {
    const startTime = Date.now();
    const isPdf = mimeType === "application/pdf";

    log.info(
      { mimeType, fileSize: fileBuffer.length, isPdf },
      "OCR pipeline started",
    );

    try {
      const result = isPdf
        ? await this.processPdf(fileBuffer, options)
        : await this.processImage(fileBuffer, mimeType, options);

      const durationMs = Date.now() - startTime;
      log.info(
        {
          durationMs,
          textLength: result.text.length,
          provider: result.provider,
          confidence: result.confidence,
        },
        "OCR pipeline completed",
      );

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      log.error({ err: error, durationMs }, "OCR pipeline failed");
      throw new OcrError("Falha no processamento OCR", { cause: error });
    }
  },

  async processPdf(
    pdfBuffer: Buffer,
    options: OcrOptions,
  ): Promise<OcrResponse> {
    log.debug("Extracting native text from PDF");
    const { text: nativeText, pages } = await extractTextFromPdf(pdfBuffer);
    log.debug(
      { nativeTextLength: nativeText.length, pages },
      "Native text extracted",
    );

    log.debug("Extracting embedded images from PDF");
    let imageTexts: string[] = [];
    try {
      const images = await extractImagesFromPdf(pdfBuffer);
      log.debug({ imageCount: images.length }, "Images extracted from PDF");

      if (images.length > 0) {
        const ocrResults = await Promise.all(
          images.map(async (img, i) => {
            try {
              log.debug(
                { imageIndex: i + 1, page: img.page, size: img.buffer.length },
                "Running OCR on embedded image",
              );
              const result = await this.processImage(
                img.buffer,
                "image/png",
                options,
              );
              return result.text;
            } catch (err) {
              log.warn(
                { err, imageIndex: i + 1 },
                "OCR failed for embedded image",
              );
              return "";
            }
          }),
        );
        imageTexts = ocrResults.filter((t) => t.length > 10);
      }
    } catch (err) {
      log.warn({ err }, "Failed to extract images from PDF");
    }

    const parts: string[] = [];
    if (nativeText.length > 0) parts.push(nativeText);
    if (imageTexts.length > 0) {
      parts.push(
        "\n--- Texto extraído de imagens do documento ---\n" +
          imageTexts.join("\n\n"),
      );
    }

    const fullText = parts.join("\n\n").trim();
    const provider =
      imageTexts.length > 0
        ? "pdf-native+ocr"
        : nativeText.length > 0
          ? "pdf-native"
          : "tesseract";

    log.debug(
      {
        totalLength: fullText.length,
        nativeLength: nativeText.length,
        imageBlocks: imageTexts.length,
        provider,
      },
      "PDF processing completed",
    );

    return {
      text: fullText,
      confidence: nativeText.length > 0 ? 0.95 : 0.8,
      provider: provider as OcrResponse["provider"],
      pages,
    };
  },

  async processImage(
    imageBuffer: Buffer,
    mimeType: string,
    options: OcrOptions,
  ): Promise<OcrResponse> {
    const processed = await preprocessImage(imageBuffer);

    if (this.shouldUseGoogleVision(options)) {
      try {
        log.debug("Attempting Google Cloud Vision");
        const result = await recognizeWithGoogleVision(processed, mimeType);
        log.debug(
          { textLength: result.text.length, confidence: result.confidence },
          "Google Vision succeeded",
        );
        return result;
      } catch (err) {
        this.handleGoogleVisionError(err);
      }
    }

    log.debug("Using Tesseract fallback");
    return recognizeWithTesseract(processed);
  },

  shouldUseGoogleVision(options: OcrOptions): boolean {
    return (
      options.preferredProvider !== "tesseract" &&
      !!config.GOOGLE_CLOUD_VISION_API_KEY &&
      Date.now() > googleVisionDisabledUntil
    );
  },

  handleGoogleVisionError(err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    const isBillingError =
      message.includes("403") ||
      message.includes("BILLING") ||
      message.includes("PERMISSION");

    if (isBillingError) {
      googleVisionDisabledUntil = Date.now() + GOOGLE_VISION_COOLDOWN_MS;
      log.warn(
        "Google Vision unavailable (billing/permission). Falling back to Tesseract for 5min",
      );
    } else {
      log.warn({ err }, "Google Vision failed, falling back to Tesseract");
    }
  },
};
