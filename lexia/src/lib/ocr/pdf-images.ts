import sharp from "sharp";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import path from "node:path";
import { pathToFileURL } from "node:url";

// Ensure worker is set
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfjsPath = eval("require").resolve("pdfjs-dist/legacy/build/pdf.mjs");
GlobalWorkerOptions.workerSrc = pathToFileURL(
  path.join(path.dirname(pdfjsPath), "pdf.worker.mjs"),
).href;

export interface ExtractedImage {
  page: number;
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Extrai imagens embutidas de um PDF usando pdfjs-dist.
 * Retorna buffers PNG de cada imagem significativa (>100x100 pixels).
 */
export async function extractImagesFromPdf(
  pdfBuffer: Buffer,
): Promise<ExtractedImage[]> {
  const data = new Uint8Array(pdfBuffer);
  const doc = await getDocument({ data, useSystemFonts: true }).promise;
  const images: ExtractedImage[] = [];

  const MAX_IMAGES = 20; // Limit to prevent excessive processing

  for (let pageNum = 1; pageNum <= doc.numPages && images.length < MAX_IMAGES; pageNum++) {
    const page = await doc.getPage(pageNum);

    try {
      const ops = await page.getOperatorList();

      for (let i = 0; i < ops.fnArray.length && images.length < MAX_IMAGES; i++) {
        // OPS.paintImageXObject = 85, OPS.paintJpegXObject = 82
        if (ops.fnArray[i] === 85 || ops.fnArray[i] === 82) {
          const imgName = ops.argsArray[i]?.[0];
          if (!imgName) continue;

          try {
            const imgData = await page.objs.get(imgName);

            if (
              !imgData ||
              typeof imgData !== "object" ||
              !("data" in imgData) ||
              !("width" in imgData) ||
              !("height" in imgData)
            ) {
              continue;
            }

            const { data: rawData, width, height } = imgData as {
              data: Uint8ClampedArray;
              width: number;
              height: number;
            };

            // Skip small images (icons, bullets, decorations)
            if (width < 100 || height < 100) continue;

            // Convert raw RGBA/RGB pixel data to PNG via sharp
            const channels = rawData.length / (width * height);
            const pngBuffer = await sharp(Buffer.from(rawData), {
              raw: {
                width,
                height,
                channels: channels >= 4 ? 4 : channels >= 3 ? 3 : 1,
              },
            })
              .png()
              .toBuffer();

            images.push({ page: pageNum, buffer: pngBuffer, width, height });
          } catch {
            // Skip individual image extraction errors
          }
        }
      }
    } catch {
      // Skip page-level errors
    }

    page.cleanup();
  }

  await doc.destroy();
  return images;
}
