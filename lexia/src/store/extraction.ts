import { atom } from "jotai";
import type { ExtractionResponse } from "@/shared/schemas/extraction";

export type OcrStatus =
  | "idle"
  | "uploading"
  | "preprocessing"
  | "ocr"
  | "extracting"
  | "done"
  | "error";

export interface OcrProgress {
  status: OcrStatus;
  progress: number; // 0-100
  message: string;
}

export const ocrProgressAtom = atom<OcrProgress>({
  status: "idle",
  progress: 0,
  message: "",
});

export const extractionResultAtom = atom<ExtractionResponse | null>(null);

/** Set de campos que foram editados manualmente pelo usuário (group.field) */
export const editedFieldsAtom = atom<Set<string>>(new Set<string>());
