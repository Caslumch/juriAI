import { streamText, convertToModelMessages } from "ai";
import { auth } from "@/lib/auth";
import { chatService } from "@/services/chat.service";
import { getPrimaryModel, getFallbackModel } from "@/lib/ai/models";
import { createLogger, generateRequestId } from "@/lib/logger";
import { handleApiError } from "@/lib/errors";

const log = createLogger("api.chat");

export async function POST(req: Request) {
  const requestId = generateRequestId();
  const reqLog = log.child({ requestId });

  try {
    const session = await auth();
    const userId = session?.user?.id;
    const { messages, conversationId } = await req.json();

    if (conversationId && userId) {
      await chatService.saveUserMessage(conversationId, messages);
    }

    const systemPrompt = chatService.getSystemPrompt();
    const convertedMessages = await convertToModelMessages(messages);

    const onFinish = async ({ text }: { text: string }) => {
      if (conversationId && text) {
        await chatService.saveAssistantMessage(conversationId, text);
      }
    };

    try {
      const result = streamText({
        model: getPrimaryModel(),
        system: systemPrompt,
        messages: convertedMessages,
        onFinish,
      });
      return result.toUIMessageStreamResponse();
    } catch (primaryError) {
      const fallbackModel = getFallbackModel();
      if (!fallbackModel) throw primaryError;

      reqLog.warn(
        { err: primaryError },
        "Primary AI model failed, trying fallback (OpenAI)",
      );

      const result = streamText({
        model: fallbackModel,
        system: systemPrompt,
        messages: convertedMessages,
        onFinish,
      });
      return result.toUIMessageStreamResponse();
    }
  } catch (error) {
    return handleApiError(error, reqLog);
  }
}
