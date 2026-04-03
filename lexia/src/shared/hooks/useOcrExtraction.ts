"use client";

import { useCallback } from "react";
import { useSetAtom } from "jotai";
import { ocrProgressAtom, extractionResultAtom } from "@/store/extraction";
import type { OcrResponse, ExtractionResponse } from "@/shared/schemas/extraction";

export interface OcrResult {
  text: string;
  confidence: number;
  provider: string;
}

export function useOcrExtraction() {
  const setProgress = useSetAtom(ocrProgressAtom);
  const setResult = useSetAtom(extractionResultAtom);

  const runOcr = useCallback(
    async (file: File): Promise<OcrResult | null> => {
      try {
        setResult(null);
        setProgress({ status: "uploading", progress: 10, message: "Enviando arquivo..." });

        setProgress({ status: "ocr", progress: 30, message: "Extraindo texto via OCR..." });

        const formData = new FormData();
        formData.append("file", file);

        const ocrRes = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        });

        if (!ocrRes.ok) {
          const err = await ocrRes.json();
          throw new Error(err.error || "Erro no OCR");
        }

        const ocrData: OcrResponse = await ocrRes.json();

        if (!ocrData.text || ocrData.text.length < 10) {
          setProgress({
            status: "error",
            progress: 0,
            message: "Não foi possível extrair texto do documento.",
          });
          return null;
        }

        setProgress({
          status: "extracting",
          progress: 50,
          message: `OCR concluído (${ocrData.provider}). Extraindo dados estruturados...`,
        });

        return {
          text: ocrData.text,
          confidence: ocrData.confidence,
          provider: ocrData.provider,
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro inesperado";
        setProgress({ status: "error", progress: 0, message });
        return null;
      }
    },
    [setProgress, setResult],
  );

  const runExtraction = useCallback(
    async (ocrText: string): Promise<ExtractionResponse | null> => {
      try {
        setProgress({
          status: "extracting",
          progress: 65,
          message: "Analisando dados jurídicos com IA...",
        });

        const extractRes = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: ocrText }),
        });

        if (!extractRes.ok) {
          const err = await extractRes.json();
          throw new Error(err.error || "Erro na extração");
        }

        const extractionData: ExtractionResponse = await extractRes.json();

        setProgress({ status: "done", progress: 100, message: "Extração concluída!" });
        setResult(extractionData);

        return extractionData;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro inesperado";
        setProgress({ status: "error", progress: 0, message });
        return null;
      }
    },
    [setProgress, setResult],
  );

  const reset = useCallback(() => {
    setProgress({ status: "idle", progress: 0, message: "" });
    setResult(null);
  }, [setProgress, setResult]);

  return { runOcr, runExtraction, reset };
}
