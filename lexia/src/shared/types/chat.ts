export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  file?: ChatFile;
}

export interface ChatFile {
  name: string;
  size: number;
  type: string;
  url?: string;
  previewUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  processType?: ProcessType;
}

export type ProcessType =
  | "civel"
  | "trabalhista"
  | "consumidor"
  | "criminal"
  | "previdenciario"
  | "tributario";
