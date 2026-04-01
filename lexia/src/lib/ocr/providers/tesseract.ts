import Tesseract from "tesseract.js";
import type { OcrResponse } from "@/shared/schemas/extraction";

export async function recognizeWithTesseract(
  imageBuffer: Buffer,
): Promise<OcrResponse> {
  const {
    data: { text, confidence },
  } = await Tesseract.recognize(imageBuffer, "por", {
    logger: () => {},
  });

  return {
    text: text.trim(),
    confidence: confidence / 100,
    provider: "tesseract",
  };
}
