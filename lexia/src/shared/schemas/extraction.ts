import { z } from "zod";

// ---------- Campo extraído com confiança ----------

export const extractedFieldSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(1),
});

export type ExtractedField = z.infer<typeof extractedFieldSchema>;

// ---------- Dados do Processo ----------

export const processoSchema = z.object({
  tipoProcesso: extractedFieldSchema.optional(),
  numeroProcesso: extractedFieldSchema.optional(),
  dataDistribuicao: extractedFieldSchema.optional(),
  vara: extractedFieldSchema.optional(),
  comarca: extractedFieldSchema.optional(),
  foro: extractedFieldSchema.optional(),
  valorCausa: extractedFieldSchema.optional(),
  resumoFatos: extractedFieldSchema.optional(),
});

export type ProcessoData = z.infer<typeof processoSchema>;

// ---------- Dados das Partes ----------

export const partesSchema = z.object({
  autor: extractedFieldSchema.optional(),
  reu: extractedFieldSchema.optional(),
  cpfAutor: extractedFieldSchema.optional(),
  cnpjAutor: extractedFieldSchema.optional(),
  cpfReu: extractedFieldSchema.optional(),
  cnpjReu: extractedFieldSchema.optional(),
  advogadoAutor: extractedFieldSchema.optional(),
  advogadoReu: extractedFieldSchema.optional(),
});

export type PartesData = z.infer<typeof partesSchema>;

// ---------- Dados de Voo / Evento ----------

export const vooEventoSchema = z.object({
  numeroVoo: extractedFieldSchema.optional(),
  codigoIATA: extractedFieldSchema.optional(),
  origem: extractedFieldSchema.optional(),
  destino: extractedFieldSchema.optional(),
  dataOcorrencia: extractedFieldSchema.optional(),
  tipoOcorrencia: extractedFieldSchema.optional(),
  tipoDano: extractedFieldSchema.optional(),
});

export type VooEventoData = z.infer<typeof vooEventoSchema>;

// ---------- Resultado completo da extração ----------

export const extractionResultSchema = z.object({
  processo: processoSchema,
  partes: partesSchema,
  vooEvento: vooEventoSchema,
});

export type ExtractionResult = z.infer<typeof extractionResultSchema>;

// ---------- Resposta da API de OCR ----------

export const ocrResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1),
  provider: z.enum(["google-vision", "tesseract", "pdf-native", "pdf-native+ocr"]),
  pages: z.number().optional(),
});

export type OcrResponse = z.infer<typeof ocrResponseSchema>;

// ---------- Resposta da API de extração ----------

export const extractionResponseSchema = z.object({
  extraction: extractionResultSchema,
  averageConfidence: z.number().min(0).max(1),
  totalFields: z.number(),
  fieldsForReview: z.number(),
});

export type ExtractionResponse = z.infer<typeof extractionResponseSchema>;
