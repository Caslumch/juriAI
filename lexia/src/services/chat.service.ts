import { createLogger } from "@/lib/logger";
import { conversationService } from "./conversation.service";

const log = createLogger("chat");

const SYSTEM_PROMPT = `Você é a Lexia, uma assistente jurídica especializada em análise de documentos.

Seu papel é:
- Analisar transcrições de documentos jurídicos enviados pelo usuário via OCR
- Responder perguntas sobre o conteúdo dos documentos e processos jurídicos
- Ajudar na organização e classificação de dados extraídos

IMPORTANTE:
- O usuário envia documentos (PDFs, imagens) que são transcritos automaticamente via OCR.
- A transcrição do documento aparece nas mensagens entre marcadores "---".
- Use o conteúdo da transcrição para responder perguntas do usuário sobre o documento.
- Considere que a transcrição pode conter erros de OCR (caracteres trocados, espaços extras).
- Mantenha o contexto de documentos anteriores na conversa — o usuário pode fazer várias perguntas sobre o mesmo documento.

Quando receber uma transcrição, analise e apresente:
1. Tipo de processo e número (formato CNJ se possível)
2. Partes envolvidas (autor, réu, advogados)
3. CPF/CNPJ das partes (se disponível)
4. Vara, comarca e foro
5. Valor da causa
6. Datas relevantes
7. Resumo dos fatos principais

Responda sempre em português brasileiro, de forma clara e profissional.
Seja direto e objetivo nas respostas.`;

export const chatService = {
  getSystemPrompt(): string {
    return SYSTEM_PROMPT;
  },

  async saveUserMessage(
    conversationId: string,
    messages: Array<{
      role: string;
      content?: unknown;
      parts?: Array<{ type: string; text?: string }>;
    }>,
  ) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role !== "user") return;

    const content = this.extractTextFromMessage(lastMessage);
    if (!content) return;

    await conversationService.saveMessage(conversationId, "USER", content);
    log.debug({ conversationId, contentLength: content.length }, "User message saved");
  },

  async saveAssistantMessage(conversationId: string, text: string) {
    if (!text) return;
    await conversationService.saveMessage(conversationId, "ASSISTANT", text);
    log.debug({ conversationId, contentLength: text.length }, "Assistant message saved");
  },

  extractTextFromMessage(message: {
    content?: unknown;
    parts?: Array<{ type: string; text?: string }>;
  }): string {
    // AI SDK v6: mensagens usam `parts`
    if (message.parts && Array.isArray(message.parts)) {
      const text = message.parts
        .filter((p) => p.type === "text" && p.text)
        .map((p) => p.text!)
        .join("\n");
      if (text) return text;
    }

    // Fallback: campo `content` (string ou array de parts)
    if (typeof message.content === "string") return message.content;

    if (Array.isArray(message.content)) {
      return (
        (message.content as Array<{ type: string; text?: string }>)
          .filter((p) => p.type === "text" && p.text)
          .map((p) => p.text!)
          .join("\n") ?? ""
      );
    }

    return "";
  },
};
