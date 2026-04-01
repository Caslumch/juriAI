import type { OcrResponse } from "@/shared/schemas/extraction";

const GOOGLE_VISION_ENDPOINT =
  "https://vision.googleapis.com/v1/images:annotate";

interface GoogleVisionResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
    };
    error?: {
      message: string;
    };
  }>;
}

export async function recognizeWithGoogleVision(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<OcrResponse> {
  const apiKey = process.env.GOOGLE_CLOUD_VISION_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_CLOUD_VISION_API_KEY not configured");
  }

  const base64 = imageBuffer.toString("base64");

  const body = {
    requests: [
      {
        image: { content: base64 },
        features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
        imageContext: {
          languageHints: ["pt"],
        },
      },
    ],
  };

  const res = await fetch(`${GOOGLE_VISION_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google Vision API error: ${res.status} — ${error}`);
  }

  const data: GoogleVisionResponse = await res.json();
  const result = data.responses[0];

  if (result.error) {
    throw new Error(`Google Vision error: ${result.error.message}`);
  }

  const text = result.fullTextAnnotation?.text ?? "";

  return {
    text,
    confidence: text.length > 0 ? 0.95 : 0,
    provider: "google-vision",
  };
}
