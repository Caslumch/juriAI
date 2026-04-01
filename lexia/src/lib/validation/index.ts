/**
 * Validação pós-extração — regras de negócio para campos jurídicos.
 * Valida formatos e ajusta confidence quando o formato é inválido.
 */

import type { ExtractionResult } from "@/shared/schemas/extraction";

// ---------- Validadores de formato ----------

/** Remove tudo que não é dígito */
function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/** Valida CPF (11 dígitos + dígitos verificadores) */
export function isValidCpf(raw: string): boolean {
  const digits = digitsOnly(raw);
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false; // todos iguais

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(digits[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== Number(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(digits[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === Number(digits[10]);
}

/** Valida CNPJ (14 dígitos + dígitos verificadores) */
export function isValidCnpj(raw: string): boolean {
  const digits = digitsOnly(raw);
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) sum += Number(digits[i]) * weights1[i];
  let rest = sum % 11;
  const d1 = rest < 2 ? 0 : 11 - rest;
  if (d1 !== Number(digits[12])) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) sum += Number(digits[i]) * weights2[i];
  rest = sum % 11;
  const d2 = rest < 2 ? 0 : 11 - rest;
  return d2 === Number(digits[13]);
}

/** Valida número de processo no formato CNJ: NNNNNNN-NN.NNNN.N.NN.NNNN */
export function isValidCnj(raw: string): boolean {
  const cleaned = raw.replace(/\s/g, "");
  return /^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/.test(cleaned);
}

/** Formata CPF: 123.456.789-00 */
export function formatCpf(raw: string): string {
  const d = digitsOnly(raw);
  if (d.length !== 11) return raw;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

/** Formata CNPJ: 12.345.678/0001-00 */
export function formatCnpj(raw: string): string {
  const d = digitsOnly(raw);
  if (d.length !== 14) return raw;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

/** Formata número de processo CNJ */
export function formatCnj(raw: string): string {
  const d = digitsOnly(raw);
  if (d.length !== 20) return raw;
  return `${d.slice(0, 7)}-${d.slice(7, 9)}.${d.slice(9, 13)}.${d.slice(13, 14)}.${d.slice(14, 16)}.${d.slice(16)}`;
}

// ---------- Validação pós-extração ----------

interface ValidationIssue {
  field: string;
  group: string;
  issue: string;
  originalValue: string;
}

/**
 * Valida os campos extraídos, corrige formatos e reduz confidence
 * quando o valor não passa nas regras de negócio.
 */
export function validateExtraction(extraction: ExtractionResult): {
  validated: ExtractionResult;
  issues: ValidationIssue[];
} {
  const issues: ValidationIssue[] = [];
  const validated = structuredClone(extraction);

  // Validar número de processo CNJ
  const numProc = validated.processo.numeroProcesso;
  if (numProc) {
    const digits = digitsOnly(numProc.value);
    if (digits.length === 20) {
      // Tem 20 dígitos — formatar corretamente
      numProc.value = formatCnj(numProc.value);
      if (!isValidCnj(numProc.value)) {
        numProc.confidence = Math.min(numProc.confidence, 0.5);
        issues.push({
          field: "numeroProcesso",
          group: "processo",
          issue: "Formato CNJ inválido",
          originalValue: numProc.value,
        });
      }
    } else if (digits.length > 0) {
      // Quantidade errada de dígitos
      numProc.confidence = Math.min(numProc.confidence, 0.4);
      issues.push({
        field: "numeroProcesso",
        group: "processo",
        issue: `Esperado 20 dígitos, encontrado ${digits.length}`,
        originalValue: numProc.value,
      });
    }
  }

  // Validar CPFs
  const cpfFields = [
    { field: validated.partes.cpfAutor, name: "cpfAutor" },
    { field: validated.partes.cpfReu, name: "cpfReu" },
  ];

  for (const { field, name } of cpfFields) {
    if (!field) continue;
    const digits = digitsOnly(field.value);
    if (digits.length === 11) {
      field.value = formatCpf(field.value);
      if (!isValidCpf(field.value)) {
        field.confidence = Math.min(field.confidence, 0.45);
        issues.push({
          field: name,
          group: "partes",
          issue: "CPF com dígito verificador inválido",
          originalValue: field.value,
        });
      }
    } else if (digits.length > 0) {
      field.confidence = Math.min(field.confidence, 0.35);
      issues.push({
        field: name,
        group: "partes",
        issue: `CPF deve ter 11 dígitos, encontrado ${digits.length}`,
        originalValue: field.value,
      });
    }
  }

  // Validar CNPJs
  const cnpjFields = [
    { field: validated.partes.cnpjAutor, name: "cnpjAutor" },
    { field: validated.partes.cnpjReu, name: "cnpjReu" },
  ];

  for (const { field, name } of cnpjFields) {
    if (!field) continue;
    const digits = digitsOnly(field.value);
    if (digits.length === 14) {
      field.value = formatCnpj(field.value);
      if (!isValidCnpj(field.value)) {
        field.confidence = Math.min(field.confidence, 0.45);
        issues.push({
          field: name,
          group: "partes",
          issue: "CNPJ com dígito verificador inválido",
          originalValue: field.value,
        });
      }
    } else if (digits.length > 0) {
      field.confidence = Math.min(field.confidence, 0.35);
      issues.push({
        field: name,
        group: "partes",
        issue: `CNPJ deve ter 14 dígitos, encontrado ${digits.length}`,
        originalValue: field.value,
      });
    }
  }

  // Validar valor da causa (deve começar com R$)
  const valorCausa = validated.processo.valorCausa;
  if (valorCausa && !valorCausa.value.includes("R$")) {
    // Tentar prefixar R$ se parece ser um valor monetário
    if (/[\d.,]+/.test(valorCausa.value)) {
      valorCausa.value = `R$ ${valorCausa.value}`;
    }
  }

  return { validated, issues };
}
