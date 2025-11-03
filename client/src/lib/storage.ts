import { Conversation, Message } from "@shared/schema";
import { nanoid } from "nanoid";

const STORAGE_KEY = "puter-chat-conversations";
const SETTINGS_KEY = "puter-chat-settings";

export interface ChatSettings {
  selectedModel: string;
  temperature: number;
  systemPrompt?: string;
  presetId?: string;
}

export function saveConversation(conversation: Conversation): void {
  try {
    const conversations = getConversations();
    const existingIndex = conversations.findIndex((c) => c.id === conversation.id);

    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.push(conversation);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error("Error saving conversation:", error);
  }
}

export function getConversations(): Conversation[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading conversations:", error);
    return [];
  }
}

export function getConversation(id: string): Conversation | undefined {
  const conversations = getConversations();
  return conversations.find((c) => c.id === id);
}

export function deleteConversation(id: string): void {
  try {
    const conversations = getConversations();
    const filtered = conversations.filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting conversation:", error);
  }
}

export function createConversation(
  model: string,
  temperature: number,
  systemPrompt?: string,
  presetId?: string,
  initialMessage?: Message
): Conversation {
  const conversation: Conversation = {
    id: nanoid(),
    title: initialMessage
      ? initialMessage.content.substring(0, 50) + (initialMessage.content.length > 50 ? "..." : "")
      : "Ny konversation",
    messages: initialMessage ? [initialMessage] : [],
    model,
    temperature,
    systemPrompt,
    presetId,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return conversation;
}

export function saveSettings(settings: ChatSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

export function getSettings(): ChatSettings | null {
  try {
    const data = localStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Error loading settings:", error);
    return null;
  }
}

export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}
