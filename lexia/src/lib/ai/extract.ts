import { generateObject } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import type { ExtractionResult, ExtractionResponse } from "@/shared/schemas/extraction";
import { validateExtraction } from "@/lib/validation";

const extractionSchema = z.object({
  processo: z.object({
    tipoProcesso: z.object({ value: z.string(), confidence: z.number() }).optional(),
    numeroProcesso: z.object({ value: z.string(), confidence: z.number() }).optional(),
    dataDistribuicao: z.object({ value: z.string(), confidence: z.number() }).optional(),
    vara: z.object({ value: z.string(), confidence: z.number() }).optional(),
    comarca: z.object({ value: z.string(), confidence: z.number() }).optional(),
    foro: z.object({ value: z.string(), confidence: z.number() }).optional(),
    valorCausa: z.object({ value: z.string(), confidence: z.number() }).optional(),
    resumoFatos: z.object({ value: z.string(), confidence: z.number() }).optional(),
  }),
  partes: z.object({
    autor: z.object({ value: z.string(), confidence: z.number() }).optional(),
    reu: z.object({ value: z.string(), confidence: z.number() }).optional(),
    cpfAutor: z.object({ value: z.string(), confidence: z.number() }).optional(),
    cnpjAutor: z.object({ value: z.string(), confidence: z.number() }).optional(),
    cpfReu: z.object({ value: z.string(), confidence: z.number() }).optional(),
    cnpjReu: z.object({ value: z.string(), confidence: z.number() }).optional(),
    advogadoAutor: z.object({ value: z.string(), confidence: z.number() }).optional(),
    advogadoReu: z.object({ value: z.string(), confidence: z.number() }).optional(),
  }),
  vooEvento: z.object({
    numeroVoo: z.object({
      value: z.string().describe("Código do voo, ex: AD4532, LA3456, G31234"),
      confidence: z.number(),
    }).optional(),
    codigoIATA: z.object({
      value: z.string().describe("Código IATA da companhia aérea: AD, LA, G3, TP, AA, etc."),
      confidence: z.number(),
    }).optional(),
    origem: z.object({
      value: z.string().describe("Cidade ou aeroporto de origem, ex: São Paulo (GRU)"),
      confidence: z.number(),
    }).optional(),
    destino: z.object({
      value: z.string().describe("Cidade ou aeroporto de destino, ex: Recife (REC)"),
      confidence: z.number(),
    }).optional(),
    dataOcorrencia: z.object({
      value: z.string().describe("Data do evento no formato DD/MM/AAAA"),
      confidence: z.number(),
    }).optional(),
    tipoOcorrencia: z.object({
      value: z.string().describe("Atraso de voo | Cancelamento de voo | Extravio de bagagem | Dano à bagagem | Overbooking | Outro"),
      confidence: z.number(),
    }).optional(),
    tipoDano: z.object({
      value: z.string().describe("Moral | Material | Moral e Material"),
      confidence: z.number(),
    }).optional(),
  }),
});

const EXTRACTION_PROMPT = `Você é um especialista sênior em análise de documentos jurídicos brasileiros, com profundo conhecimento em direito processual civil, trabalhista, consumidor e aéreo.

Analise o texto extraído via OCR de um documento jurídico e extraia TODAS as informações estruturadas disponíveis.

## INSTRUÇÕES POR GRUPO

### PROCESSO
- **tipoProcesso**: Classificação exata — use um destes: "Cível", "Trabalhista", "Consumidor", "Criminal", "Previdenciário", "Tributário". Infira pelo conteúdo se não estiver explícito.
- **numeroProcesso**: Formato CNJ obrigatório: NNNNNNN-NN.NNNN.N.NN.NNNN (ex: 1234567-89.2024.8.26.0100). Se o OCR trouxer parcial, reconstrua o formato correto.
- **dataDistribuicao**: Formato DD/MM/AAAA. Procure por "distribuído em", "data de distribuição", "autuado em".
- **vara**: Nome completo (ex: "2ª Vara Cível", "1ª Vara do Trabalho").
- **comarca**: Nome da cidade/comarca.
- **foro**: Nome do foro (ex: "Foro Central Cível", "Foro Regional de Santo Amaro").
- **valorCausa**: Formato "R$ 10.000,00". Procure por "valor da causa", "dá-se à causa o valor de".
- **resumoFatos**: Síntese objetiva em 2-3 frases do que o documento trata. Inclua o objeto da ação e os fatos principais.

### PARTES
- **autor/reu**: Nome completo. Procure por "autor", "requerente", "reclamante" (autor) e "réu", "requerido", "reclamado" (réu).
- **cpfAutor/cpfReu**: Formato XXX.XXX.XXX-XX (11 dígitos). Procure próximo ao nome da parte.
- **cnpjAutor/cnpjReu**: Formato XX.XXX.XXX/XXXX-XX (14 dígitos). Comum para empresas.
- **advogadoAutor/advogadoReu**: Nome completo + OAB se disponível.

### VOO/EVENTO (para casos de direito aéreo/consumidor)
- **numeroVoo**: Código alfanumérico (ex: "AD4532", "LA3456", "G31234").
- **codigoIATA**: Código de 2 letras da companhia aérea (ex: "AD" para Azul, "LA" para LATAM, "G3" para GOL).
- **origem/destino**: Cidade ou código IATA do aeroporto (ex: "São Paulo (GRU)", "Recife (REC)").
- **dataOcorrencia**: Data do evento/incidente no formato DD/MM/AAAA.
- **tipoOcorrencia**: Classifique como: "Atraso de voo", "Cancelamento de voo", "Extravio de bagagem", "Dano à bagagem", "Overbooking" ou "Outro".
- **tipoDano**: Classifique como: "Moral", "Material", "Moral e Material".

## REGRAS DE CONFIANÇA
Atribua confidence com base na legibilidade e certeza:
- **0.90–1.00**: Texto perfeitamente legível, campo explícito no documento, sem ambiguidade.
- **0.75–0.89**: Texto legível mas com pequenos artefatos de OCR, ou campo inferido com alta certeza.
- **0.60–0.74**: Texto parcialmente legível, campo inferido com certeza moderada, ou formato parcialmente reconstruído.
- **0.40–0.59**: Texto com muitos artefatos, campo com ambiguidade significativa.
- **< 0.40**: Texto quase ilegível, campo altamente incerto — inclua apenas se houver alguma evidência.

## REGRAS GERAIS
- Se um campo NÃO possui nenhuma evidência no texto, NÃO inclua (omita completamente).
- Normalize espaços e caracteres estranhos introduzidos pelo OCR.
- Para documentos que mencionam companhias aéreas, voos ou bagagens, SEMPRE preencha os campos de vooEvento.
- Prefira precisão sobre recall — é melhor omitir do que inventar.`;

export async function extractStructuredData(
  ocrText: string,
): Promise<ExtractionResponse> {
  const { object } = await generateObject({
    model: anthropic("claude-sonnet-4-20250514"),
    schema: extractionSchema,
    system: EXTRACTION_PROMPT,
    prompt: `Texto extraído do documento:\n\n${ocrText}`,
  });

  const rawExtraction = object as ExtractionResult;

  // Validação pós-extração: formatos, dígitos verificadores, normalização
  const { validated: extraction, issues } = validateExtraction(rawExtraction);

  if (issues.length > 0) {
    console.warn("[Extract] Validation issues:", issues);
  }

  // Calcular métricas
  const allFields = collectFields(extraction);
  const totalFields = allFields.length;
  const avgConfidence =
    totalFields > 0
      ? allFields.reduce((sum, f) => sum + f.confidence, 0) / totalFields
      : 0;
  const fieldsForReview = allFields.filter((f) => f.confidence < 0.85).length;

  return {
    extraction,
    averageConfidence: Math.round(avgConfidence * 100) / 100,
    totalFields,
    fieldsForReview,
  };
}

function collectFields(
  extraction: ExtractionResult,
): Array<{ value: string; confidence: number }> {
  const fields: Array<{ value: string; confidence: number }> = [];

  for (const group of Object.values(extraction)) {
    for (const field of Object.values(group)) {
      if (field && typeof field === "object" && "value" in field) {
        fields.push(field as { value: string; confidence: number });
      }
    }
  }

  return fields;
}
