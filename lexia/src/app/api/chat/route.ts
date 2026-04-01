import { streamText, convertToModelMessages } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  const { messages, conversationId } = await req.json();

  // Save the user message to the database
  if (conversationId && userId) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === "user") {
      const content =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : lastMessage.content
              ?.filter((p: { type: string }) => p.type === "text")
              .map((p: { text: string }) => p.text)
              .join("\n") ?? "";

      if (content) {
        await prisma.message.create({
          data: {
            conversationId,
            role: "USER",
            content,
          },
        });

        // Update title from second user message (first is usually OCR/greeting)
        const userMsgCount = await prisma.message.count({
          where: { conversationId, role: "USER" },
        });
        if (userMsgCount === 2) {
          const title =
            content.length > 50 ? content.slice(0, 50) + "…" : content;
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { title },
          });
        }

        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      }
    }
  }

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: `Você é a Lexia, uma assistente jurídica especializada em análise de documentos.

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
Seja direto e objetivo nas respostas.`,
    messages: await convertToModelMessages(messages),
    async onFinish({ text }) {
      // Save the assistant response to the database
      if (conversationId && text) {
        await prisma.message.create({
          data: {
            conversationId,
            role: "ASSISTANT",
            content: text,
          },
        });
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
