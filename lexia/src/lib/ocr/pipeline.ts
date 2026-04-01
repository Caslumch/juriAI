import type { OcrResponse } from "@/shared/schemas/extraction";
import { recognizeWithGoogleVision } from "./providers/google-vision";
import { recognizeWithTesseract } from "./providers/tesseract";
import { preprocessImage, extractTextFromPdf } from "./preprocess";
import { extractImagesFromPdf } from "./pdf-images";

interface OcrOptions {
  preferredProvider?: "google-vision" | "tesseract";
}

// Cache Google Vision availability — retry after 5 min
let googleVisionDisabledUntil = 0;

/**
 * Pipeline OCR principal — extração completa de PDFs e imagens.
 *
 * Para PDFs:
 * 1. Extrai texto nativo (digital) de todas as páginas
 * 2. Extrai imagens embutidas no PDF (fotos, prints, comprovantes)
 * 3. Faz OCR em cada imagem extraída
 * 4. Combina texto nativo + texto das imagens
 *
 * Para imagens: pré-processa e faz OCR diretamente.
 */
export async function runOcrPipeline(
  fileBuffer: Buffer,
  mimeType: string,
  options: OcrOptions = {},
): Promise<OcrResponse> {
  const isPdf = mimeType === "application/pdf";

  console.log(
    `[OCR] Iniciando pipeline — tipo: ${mimeType}, tamanho: ${fileBuffer.length} bytes`,
  );

  if (isPdf) {
    return runOcrOnPdf(fileBuffer, options);
  }

  return runOcrOnImage(fileBuffer, mimeType, options);
}

/**
 * OCR completo de PDF:
 * 1. Extrai texto nativo
 * 2. Extrai imagens embutidas e faz OCR nelas
 * 3. Combina tudo
 */
async function runOcrOnPdf(
  pdfBuffer: Buffer,
  options: OcrOptions,
): Promise<OcrResponse> {
  // Step 1: Extract native text
  console.log("[OCR] Extraindo texto nativo do PDF...");
  const { text: nativeText, pages } = await extractTextFromPdf(pdfBuffer);
  console.log(
    `[OCR] Texto nativo: ${nativeText.length} chars, ${pages} páginas`,
  );

  // Step 2: Extract embedded images and OCR them
  console.log("[OCR] Extraindo imagens embutidas do PDF...");
  let imageTexts: string[] = [];
  try {
    const images = await extractImagesFromPdf(pdfBuffer);
    console.log(`[OCR] ${images.length} imagens encontradas no PDF`);

    if (images.length > 0) {
      const ocrResults = await Promise.all(
        images.map(async (img, i) => {
          try {
            console.log(
              `[OCR] OCR na imagem ${i + 1}/${images.length} (página ${img.page}, ${img.buffer.length} bytes)...`,
            );
            const result = await runOcrOnImage(
              img.buffer,
              "image/png",
              options,
            );
            return result.text;
          } catch (err) {
            console.warn(
              `[OCR] ⚠ Erro no OCR da imagem ${i + 1}:`,
              err instanceof Error ? err.message : err,
            );
            return "";
          }
        }),
      );
      imageTexts = ocrResults.filter((t) => t.length > 10);
    }
  } catch (err) {
    console.warn(
      "[OCR] ⚠ Erro ao extrair imagens do PDF:",
      err instanceof Error ? err.message : err,
    );
  }

  // Step 3: Combine
  const parts: string[] = [];

  if (nativeText.length > 0) {
    parts.push(nativeText);
  }

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

  console.log(
    `[OCR] ✅ PDF completo — ${fullText.length} chars (nativo: ${nativeText.length}, imagens OCR: ${imageTexts.length} blocos), provider: ${provider}`,
  );

  return {
    text: fullText,
    confidence: nativeText.length > 0 ? 0.95 : 0.8,
    provider: provider as "google-vision" | "tesseract" | "pdf-native",
    pages,
  };
}

async function runOcrOnImage(
  imageBuffer: Buffer,
  mimeType: string,
  options: OcrOptions,
): Promise<OcrResponse> {
  const processed = await preprocessImage(imageBuffer);

  const preferGoogle =
    options.preferredProvider !== "tesseract" &&
    !!process.env.GOOGLE_CLOUD_VISION_API_KEY &&
    Date.now() > googleVisionDisabledUntil;

  if (preferGoogle) {
    console.log("[OCR] 🔵 Tentando Google Cloud Vision...");
    try {
      const result = await recognizeWithGoogleVision(processed, mimeType);
      console.log(
        `[OCR] ✅ Google Vision — ${result.text.length} chars, confiança: ${result.confidence}`,
      );
      return result;
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("403") || errMsg.includes("BILLING") || errMsg.includes("PERMISSION")) {
        console.warn("[OCR] ❌ Google Vision indisponível (billing/permissão). Usando Tesseract por 5 min.");
        googleVisionDisabledUntil = Date.now() + 5 * 60 * 1000;
      } else {
        console.warn("[OCR] ❌ Google Vision falhou:", errMsg);
      }
    }
  }

  const result = await recognizeWithTesseract(processed);
  return result;
}
