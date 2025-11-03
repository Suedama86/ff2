import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ChatPage from "@/pages/chat";
import { useState, useEffect, useRef } from "react";
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE, getModelById } from "@/lib/models";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { getSettings, saveSettings } from "@/lib/storage";
import { Conversation } from "@shared/schema";

function Router({
  selectedModel,
  temperature,
  systemPrompt,
  presetId,
  chatKey,
  loadedConversation,
  onConversationUpdate,
}: {
  selectedModel: string;
  temperature: number;
  systemPrompt: string;
  presetId: string;
  chatKey: number;
  loadedConversation: Conversation | null;
  onConversationUpdate: () => void;
}) {
  return (
    <Switch>
      <Route path="/">
        <ChatPage 
          selectedModel={selectedModel} 
          temperature={temperature}
          systemPrompt={systemPrompt}
          presetId={presetId}
          key={chatKey} 
          loadedConversation={loadedConversation}
          onConversationUpdate={onConversationUpdate}
        />
      </Route>
    </Switch>
  );
}

function App() {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [temperature, setTemperature] = useState(DEFAULT_TEMPERATURE);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [presetId, setPresetId] = useState<string>("");
  const [chatKey, setChatKey] = useState(0);
  const [loadedConversation, setLoadedConversation] = useState<Conversation | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState(0);

  useEffect(() => {
    const settings = getSettings();
    if (settings) {
      setSelectedModel(settings.selectedModel);
      setTemperature(settings.temperature);
      setSystemPrompt(settings.systemPrompt || "");
      setPresetId(settings.presetId || "");
    }
  }, []);

  useEffect(() => {
    saveSettings({ selectedModel, temperature, systemPrompt, presetId });
  }, [selectedModel, temperature, systemPrompt, presetId]);

  const handleNewChat = () => {
    setLoadedConversation(null);
    setChatKey((prev) => prev + 1);
  };

  const handleLoadConversation = (conversation: Conversation) => {
    setLoadedConversation(conversation);
    setSelectedModel(conversation.model);
    setTemperature(conversation.temperature);
    setSystemPrompt(conversation.systemPrompt || "");
    setPresetId(conversation.presetId || "");
    setChatKey((prev) => prev + 1);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleConversationUpdate = () => {
    setRefreshSidebar((prev) => prev + 1);
  };

  const currentModel = getModelById(selectedModel);

  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar
              selectedModel={selectedModel}
              onModelSelect={handleModelSelect}
              temperature={temperature}
              onTemperatureChange={setTemperature}
              systemPrompt={systemPrompt}
              onSystemPromptChange={setSystemPrompt}
              presetId={presetId}
              onPresetChange={setPresetId}
              onNewChat={handleNewChat}
              onLoadConversation={handleLoadConversation}
              refreshTrigger={refreshSidebar}
            />
            <div className="flex flex-col flex-1">
              <header className="flex items-center justify-between gap-4 px-6 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="text-xl font-semibold">Puter Chat</h1>
                  </div>
                </div>
                <Badge variant="secondary" className="px-3 py-1" data-testid="badge-current-model">
                  {currentModel?.name || selectedModel}
                </Badge>
              </header>
              <main className="flex-1 overflow-hidden">
                <Router
                  selectedModel={selectedModel}
                  temperature={temperature}
                  systemPrompt={systemPrompt}
                  presetId={presetId}
                  chatKey={chatKey}
                  loadedConversation={loadedConversation}
                  onConversationUpdate={handleConversationUpdate}
                />
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
