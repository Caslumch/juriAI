import sharp from "sharp";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";

// Resolve o worker via require.resolve nativo (fora do bundler)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsPath = eval("require").resolve("pdfjs-dist/legacy/build/pdf.mjs");
GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(path.dirname(pdfjsPath), "pdf.worker.mjs"),
).href;

/**
 * Pré-processa imagem para melhorar qualidade do OCR:
 * - Converte para escala de cinza
 * - Normaliza contraste
 * - Remove ruído com mediana
 * - Aumenta nitidez
 * - Corrige rotação via metadados EXIF
 */
export async function preprocessImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate() // auto-rotação via EXIF
    .grayscale()
    .normalize()
    .median(3) // reduz ruído
    .sharpen()
    .png()
    .toBuffer();
}

/**
 * Extrai texto embutido de um PDF usando pdfjs-dist.
 * Retorna o texto direto do PDF (para PDFs com texto digital).
 */
export async function extractTextFromPdf(
  buffer: Buffer,
): Promise<{ text: string; pages: number }> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;

  const textParts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item) => "str" in item && typeof item.str === "string")
      .map((item) => (item as { str: string }).str)
      .join(" ");
    textParts.push(pageText);
    page.cleanup();
  }

  const totalPages = doc.numPages;
  await doc.destroy();

  return {
    text: textParts.join("\n").trim(),
    pages: totalPages,
  };
}

/**
 * Converte uma única página de PDF em imagem PNG para OCR.
 * Usa sharp para converter a página específica.
 */
export async function pdfPageToImage(
  buffer: Buffer,
  pageIndex: number = 0,
): Promise<Buffer> {
  return sharp(buffer, { page: pageIndex, density: 300 })
    .png()
    .toBuffer();
}

/**
 * Retorna o número de páginas em um PDF.
 */
export async function getPdfPageCount(buffer: Buffer): Promise<number> {
  const data = new Uint8Array(buffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const count = doc.numPages;
  await doc.destroy();
  return count;
}
