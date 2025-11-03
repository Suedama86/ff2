import { z } from "zod";

// Chat message types
export const messageSchema = z.object({
  id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.number(),
  model: z.string().optional(),
});

export type Message = z.infer<typeof messageSchema>;

// Conversation types
export const conversationSchema = z.object({
  id: z.string(),
  title: z.string(),
  messages: z.array(messageSchema),
  model: z.string(),
  temperature: z.number(),
  systemPrompt: z.string().optional(),
  presetId: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type Conversation = z.infer<typeof conversationSchema>;

// Model category types
export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: string;
  supportsVision?: boolean;
}

// AI Profile/Preset types
export interface AIPreset {
  id: string;
  name: string;
  description: string;
  modelId: string;
  temperature?: number;
  systemPrompt: string;
}

// Settings types
export const settingsSchema = z.object({
  temperature: z.number().min(0).max(2),
  stream: z.boolean(),
  testMode: z.boolean(),
});

export type Settings = z.infer<typeof settingsSchema>;
