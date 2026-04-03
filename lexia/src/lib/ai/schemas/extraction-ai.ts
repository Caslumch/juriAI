import { z } from "zod";

export const extractionSchema = z.object({
  processo: z.object({
    tipoProcesso: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    numeroProcesso: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    dataDistribuicao: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    vara: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    comarca: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    foro: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    valorCausa: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    resumoFatos: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
  }),
  partes: z.object({
    autor: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    reu: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    cpfAutor: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    cnpjAutor: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    cpfReu: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    cnpjReu: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    advogadoAutor: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
    advogadoReu: z
      .object({ value: z.string(), confidence: z.number() })
      .optional(),
  }),
  vooEvento: z.object({
    numeroVoo: z
      .object({
        value: z
          .string()
          .describe("Código do voo, ex: AD4532, LA3456, G31234"),
        confidence: z.number(),
      })
      .optional(),
    codigoIATA: z
      .object({
        value: z
          .string()
          .describe(
            "Código IATA da companhia aérea: AD, LA, G3, TP, AA, etc.",
          ),
        confidence: z.number(),
      })
      .optional(),
    origem: z
      .object({
        value: z
          .string()
          .describe(
            "Cidade ou aeroporto de origem, ex: São Paulo (GRU)",
          ),
        confidence: z.number(),
      })
      .optional(),
    destino: z
      .object({
        value: z
          .string()
          .describe(
            "Cidade ou aeroporto de destino, ex: Recife (REC)",
          ),
        confidence: z.number(),
      })
      .optional(),
    dataOcorrencia: z
      .object({
        value: z
          .string()
          .describe("Data do evento no formato DD/MM/AAAA"),
        confidence: z.number(),
      })
      .optional(),
    tipoOcorrencia: z
      .object({
        value: z
          .string()
          .describe(
            "Atraso de voo | Cancelamento de voo | Extravio de bagagem | Dano à bagagem | Overbooking | Outro",
          ),
        confidence: z.number(),
      })
      .optional(),
    tipoDano: z
      .object({
        value: z
          .string()
          .describe("Moral | Material | Moral e Material"),
        confidence: z.number(),
      })
      .optional(),
  }),
});
