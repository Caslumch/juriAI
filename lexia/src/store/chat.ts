import { atom } from "jotai";
import type { Conversation } from "@/shared/types";

export const currentConversationAtom = atom<Conversation | null>(null);
