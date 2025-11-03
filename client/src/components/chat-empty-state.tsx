import {
  Sparkles,
  Code,
  MessageCircle,
  Lightbulb,
} from "lucide-react";
import { Card } from "@/components/ui/card";

interface ChatEmptyStateProps {
  onSuggestionClick: (suggestion: string) => void;
  modelName: string;
}

const SUGGESTIONS = [
  {
    icon: Lightbulb,
    text: "Förklara kvantdatorer på ett enkelt sätt",
    prompt: "Förklara kvantdatorer på ett enkelt sätt som en 10-åring kan förstå",
  },
  {
    icon: Code,
    text: "Skriv en Python-funktion...",
    prompt: "Skriv en Python-funktion som beräknar Fibonacci-sekvensen",
  },
  {
    icon: MessageCircle,
    text: "Jämför GPT-5 vs Claude 4",
    prompt: "Vad är skillnaderna mellan GPT-5 och Claude 4? Vilken är bäst för olika uppgifter?",
  },
  {
    icon: Sparkles,
    text: "Hjälp mig debugga min kod",
    prompt: "Kan du hjälpa mig att debugga och förklara vad som är fel med min kod?",
  },
];

export function ChatEmptyState({ onSuggestionClick, modelName }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-semibold" data-testid="text-empty-title">
            Välkommen till Puter Chat
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Chatta med 400+ AI-modeller från OpenAI, Anthropic, Google, xAI, Meta och fler.
            <br />
            För närvarande använder du <span className="font-medium text-foreground">{modelName}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SUGGESTIONS.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <Card
                key={index}
                onClick={() => onSuggestionClick(suggestion.prompt)}
                className="p-4 hover-elevate active-elevate-2 cursor-pointer transition-all border border-card-border"
                data-testid={`card-suggestion-${index}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm leading-relaxed flex-1">
                    {suggestion.text}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Inga API-nycklar behövs • Gratis för utvecklare • Powered by Puter.js
          </p>
        </div>
      </div>
    </div>
  );
}
