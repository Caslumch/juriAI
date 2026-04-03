import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { config } from "@/config";
import type { LanguageModel } from "ai";

const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const OPENAI_MODEL = "gpt-4o";

export function getPrimaryModel(): LanguageModel {
  return anthropic(ANTHROPIC_MODEL);
}

export function getFallbackModel(): LanguageModel | null {
  if (!config.OPENAI_API_KEY) return null;
  return openai(OPENAI_MODEL);
}
