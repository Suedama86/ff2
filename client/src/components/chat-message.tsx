import { Message } from "@shared/schema";
import { UserCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

// Funktion för att formatera text med grundläggande markdown-stöd
function formatMessageContent(content: string): JSX.Element {
  // Dela upp i stycken först
  const paragraphs = content.split(/\n\s*\n/);
  
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        // Hantera listor
        if (paragraph.includes('\n- ') || paragraph.includes('\n* ') || paragraph.includes('\n• ')) {
          const lines = paragraph.split('\n');
          const listItems: string[] = [];
          const nonListLines: string[] = [];
          
          lines.forEach(line => {
            if (line.trim().match(/^[-*•]\s/)) {
              listItems.push(line.trim().replace(/^[-*•]\s/, ''));
            } else if (line.trim()) {
              nonListLines.push(line.trim());
            }
          });
          
          return (
            <div key={index} className="space-y-2">
              {nonListLines.length > 0 && (
                <p className="leading-relaxed">
                  {formatInlineText(nonListLines.join(' '))}
                </p>
              )}
              {listItems.length > 0 && (
                <ul className="space-y-1 ml-4">
                  {listItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-primary mt-1.5 text-xs">•</span>
                      <span className="leading-relaxed">{formatInlineText(item)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        }
        
        // Hantera numrerade listor
        if (paragraph.match(/\n\d+\./)) {
          const lines = paragraph.split('\n');
          const listItems: string[] = [];
          const nonListLines: string[] = [];
          
          lines.forEach(line => {
            if (line.trim().match(/^\d+\.\s/)) {
              listItems.push(line.trim().replace(/^\d+\.\s/, ''));
            } else if (line.trim()) {
              nonListLines.push(line.trim());
            }
          });
          
          return (
            <div key={index} className="space-y-2">
              {nonListLines.length > 0 && (
                <p className="leading-relaxed">
                  {formatInlineText(nonListLines.join(' '))}
                </p>
              )}
              {listItems.length > 0 && (
                <ol className="space-y-1 ml-4">
                  {listItems.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2">
                      <span className="text-primary mt-0.5 text-sm font-medium min-w-[1.5rem]">
                        {itemIndex + 1}.
                      </span>
                      <span className="leading-relaxed">{formatInlineText(item)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          );
        }
        
        // Hantera kodblock
        if (paragraph.includes('```')) {
          const parts = paragraph.split('```');
          return (
            <div key={index} className="space-y-2">
              {parts.map((part, partIndex) => {
                if (partIndex % 2 === 1) {
                  // Detta är ett kodblock
                  const lines = part.split('\n');
                  const language = lines[0]?.trim() || '';
                  const code = lines.slice(language ? 1 : 0).join('\n');
                  
                  return (
                    <div key={partIndex} className="bg-muted rounded-lg p-3 my-2">
                      {language && (
                        <div className="text-xs text-muted-foreground mb-2 font-mono">
                          {language}
                        </div>
                      )}
                      <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                        <code>{code}</code>
                      </pre>
                    </div>
                  );
                } else if (part.trim()) {
                  // Vanlig text
                  return (
                    <p key={partIndex} className="leading-relaxed">
                      {formatInlineText(part.trim())}
                    </p>
                  );
                }
                return null;
              })}
            </div>
          );
        }
        
        // Vanligt stycke
        if (paragraph.trim()) {
          return (
            <p key={index} className="leading-relaxed">
              {formatInlineText(paragraph.trim())}
            </p>
          );
        }
        
        return null;
      })}
    </div>
  );
}

// Funktion för att hantera inline-formatering
function formatInlineText(text: string): JSX.Element {
  // Hantera fet text (**text**)
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Hantera kursiv text (*text*)
  formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Hantera inline kod (`code`)
  formattedText = formattedText.replace(/`([^`]+)`/g, '<code class="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">$1</code>');
  
  // Hantera länkar [text](url)
  formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener noreferrer">$1</a>');
  
  return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === "user";
  const timestamp = new Date(message.timestamp).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "flex gap-4 items-start",
        isUser ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${message.role}-${message.id}`}
    >
      {!isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex flex-col gap-1",
          isUser ? "items-end max-w-2xl" : "items-start max-w-3xl"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-base",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-card border border-card-border"
          )}
        >
          {isUser ? (
            <div className="leading-relaxed">{message.content}</div>
          ) : (
            formatMessageContent(message.content)
          )}
          {isStreaming && (
            <span className="inline-block ml-1 animate-pulse">▊</span>
          )}
        </div>
        <span className="text-xs text-muted-foreground px-1" data-testid={`text-timestamp-${message.id}`}>
          {timestamp}
          {message.model && !isUser && ` · ${message.model}`}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-secondary">
            <UserCircle className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
