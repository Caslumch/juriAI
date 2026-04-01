/**
 * Mascaramento de dados sensíveis (CPF/CNPJ).
 * Design System §15: CPF exibido como 032.xxx.xxx-41
 */

/** Verifica se o campo é de CPF pelo nome da chave */
export function isCpfField(fieldKey: string): boolean {
  return /^cpf/i.test(fieldKey);
}

/** Verifica se o campo é de CNPJ pelo nome da chave */
export function isCnpjField(fieldKey: string): boolean {
  return /^cnpj/i.test(fieldKey);
}

/**
 * Mascara CPF: 032.xxx.xxx-41
 * Mantém os 3 primeiros e os 2 últimos dígitos visíveis.
 */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 11) return value; // não mascara se formato inválido
  return `${digits.slice(0, 3)}.xxx.xxx-${digits.slice(9)}`;
}

/**
 * Mascara CNPJ: 12.xxx.xxx/xxxx-00
 * Mantém os 2 primeiros e os 2 últimos dígitos visíveis.
 */
export function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length !== 14) return value;
  return `${digits.slice(0, 2)}.xxx.xxx/xxxx-${digits.slice(12)}`;
}
