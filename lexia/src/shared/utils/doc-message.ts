const DOC_MARKER = "[[DOC:";
const DOC_MARKER_END = "]]";

export function formatDocMessage(
  fileName: string,
  provider: string,
  confidence: number,
  ocrText: string,
  userMessage?: string,
): string {
  const meta = `${DOC_MARKER}${fileName}|${provider}|${confidence}${DOC_MARKER_END}`;
  const parts = [meta];
  if (userMessage) parts.push(userMessage);
  parts.push(`\nTranscrição do documento:\n---\n${ocrText}\n---`);
  if (!userMessage) {
    parts.push(
      "\nAnalise este documento jurídico. Identifique e resuma as informações principais.",
    );
  }
  return parts.join("\n");
}

export function parseDocMessage(text: string): {
  isDoc: boolean;
  fileName?: string;
  provider?: string;
  confidence?: number;
  userText?: string;
} {
  if (!text.startsWith(DOC_MARKER)) return { isDoc: false };

  const endIdx = text.indexOf(DOC_MARKER_END);
  if (endIdx === -1) return { isDoc: false };

  const meta = text.slice(DOC_MARKER.length, endIdx);
  const [fileName, provider, confidenceStr] = meta.split("|");

  const afterMarker = text.slice(endIdx + DOC_MARKER_END.length);
  const transcriptionIdx = afterMarker.indexOf("\nTranscrição do documento:");
  const userText =
    transcriptionIdx > 0
      ? afterMarker.slice(0, transcriptionIdx).trim()
      : undefined;

  return {
    isDoc: true,
    fileName,
    provider,
    confidence: parseFloat(confidenceStr),
    userText: userText || undefined,
  };
}
