import { useState, useRef, useEffect } from "react";
import { Message, Conversation } from "@shared/schema";
import { ChatMessage } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";
import { ChatEmptyState } from "@/components/chat-empty-state";
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, getModelById } from "@/lib/models";
import { nanoid } from "nanoid";
import { useToast } from "@/hooks/use-toast";
import { saveConversation, createConversation } from "@/lib/storage";

declare global {
  interface Window {
    puter: {
      ai: {
        chat: (
          prompt: string | Array<{ role: string; content: string }>,
          options?: {
            model?: string;
            temperature?: number;
            stream?: boolean;
          }
        ) => Promise<any>;
      };
    };
  }
}

interface ChatPageProps {
  selectedModel: string;
  temperature: number;
  systemPrompt: string;
  presetId: string;
  loadedConversation?: Conversation | null;
  onConversationUpdate?: () => void;
}

export default function ChatPage({ selectedModel, temperature, systemPrompt, presetId, loadedConversation, onConversationUpdate }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (loadedConversation) {
      setCurrentConversation(loadedConversation);
      setMessages(loadedConversation.messages);
    } else {
      const newConversation = createConversation(selectedModel, temperature, systemPrompt, presetId);
      setCurrentConversation(newConversation);
      setMessages([]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (currentConversation && messages.length > 0) {
      const updatedConversation: Conversation = {
        ...currentConversation,
        messages,
        model: selectedModel,
        temperature,
        systemPrompt,
        presetId,
        updatedAt: Date.now(),
        title: messages[0]?.content.substring(0, 50) + (messages[0]?.content.length > 50 ? "..." : "") || "Ny konversation",
      };
      saveConversation(updatedConversation);
      setCurrentConversation(updatedConversation);
      onConversationUpdate?.();
    }
  }, [messages, selectedModel, temperature, systemPrompt, presetId]);

  const handleSend = async (content: string) => {
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      content,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent("");

    const conversationHistory: Array<{ role: string; content: string }> = [];
    
    if (systemPrompt) {
      conversationHistory.push({
        role: "system",
        content: systemPrompt,
      });
    }
    
    conversationHistory.push(
      ...messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content }
    );

    try {
      abortControllerRef.current = new AbortController();

      const chatOptions: {
        model: string;
        temperature?: number;
        stream: boolean;
      } = {
        model: selectedModel,
        stream: true,
      };

      if (temperature !== 1) {
        chatOptions.temperature = temperature;
      }

      let response;
      try {
        response = await window.puter.ai.chat(conversationHistory, chatOptions);
      } catch (err: any) {
        if (err?.error?.message?.includes('temperature')) {
          const fallbackOptions = {
            model: selectedModel,
            stream: true,
          };
          response = await window.puter.ai.chat(conversationHistory, fallbackOptions);
        } else {
          throw err;
        }
      }

      let fullContent = "";

      for await (const part of response) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const text = part?.text || part?.message?.content?.[0]?.text || part?.message?.content || "";
        fullContent += text;
        setStreamingContent(fullContent);
      }

      if (!abortControllerRef.current?.signal.aborted && fullContent) {
        const assistantMessage: Message = {
          id: nanoid(),
          role: "assistant",
          content: fullContent,
          timestamp: Date.now(),
          model: getModelById(selectedModel)?.name || selectedModel,
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setStreamingContent("");
      }
    } catch (error) {
      console.error("Error calling Puter AI:", error);
      toast({
        title: "Fel vid AI-anrop",
        description: error instanceof Error ? error.message : "Något gick fel. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const modelName = getModelById(selectedModel)?.name || selectedModel;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !streamingContent ? (
          <ChatEmptyState
            onSuggestionClick={handleSuggestionClick}
            modelName={modelName}
          />
        ) : (
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {streamingContent && (
              <ChatMessage
                message={{
                  id: "streaming",
                  role: "assistant",
                  content: streamingContent,
                  timestamp: Date.now(),
                  model: modelName,
                }}
                isStreaming={true}
              />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isStreaming={isStreaming}
      />
    </div>
  );
}
