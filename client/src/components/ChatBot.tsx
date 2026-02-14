import { useState, useRef, useEffect, useCallback } from "react";
import { X, Send, Loader2, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import chatbotAvatar from "@assets/image_1771096045630.png";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hola, soy el asistente virtual de SST Colombia. Puedo ayudarte con preguntas sobre la plataforma, normativa SST colombiana, el ciclo PHVA y mucho mas. ¿En que puedo ayudarte?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const conversationHistory = messages.slice(-6);

    abortRef.current = new AbortController();

    try {
      const response = await fetch("/api/chatbot/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          conversationHistory,
        }),
        signal: abortRef.current.signal,
        credentials: "include",
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Error del servidor");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.error) throw new Error(data.error);
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantContent,
                };
                return updated;
              });
            }
          } catch (parseErr) {
          }
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "Lo siento, ocurrio un error. Intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content: "Conversacion reiniciada. ¿En que puedo ayudarte?",
      },
    ]);
  };

  return (
    <>
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-1"
        style={{ visibility: isOpen ? "hidden" : "visible" }}
      >
        <span className="bg-background text-foreground text-xs font-semibold px-3 py-1 rounded-md shadow-md border">
          Preguntame
        </span>
        <button
          data-testid="button-chatbot-open"
          className="w-16 h-16 rounded-full shadow-lg overflow-visible border-2 border-white dark:border-gray-700 bg-white dark:bg-gray-800 p-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir asistente virtual"
        >
          <img
            src={chatbotAvatar}
            alt="Asistente SST Colombia"
            className="w-full h-full rounded-full object-cover"
          />
        </button>
      </div>

      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col"
        style={{
          visibility: isOpen ? "visible" : "hidden",
          width: "min(380px, calc(100vw - 2rem))",
          height: "min(560px, calc(100vh - 6rem))",
        }}
      >
        <Card className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-2 border-b bg-[#2d7a3a] text-white rounded-t-md">
            <div className="flex items-center gap-2">
              <img
                src={chatbotAvatar}
                alt="Asistente"
                className="h-8 w-8 rounded-full border border-white/30 object-cover shrink-0"
              />
              <span className="font-semibold text-sm">Asistente SST Colombia</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-chatbot-clear"
                className="text-white/80 no-default-hover-elevate"
                onClick={handleClear}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                data-testid="button-chatbot-close"
                className="text-white/80 no-default-hover-elevate"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3" data-testid="chatbot-messages">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <img
                    src={chatbotAvatar}
                    alt="Asistente"
                    className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5"
                  />
                )}
                <div
                  className={`rounded-lg px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#2d7a3a] text-white"
                      : "bg-muted text-foreground"
                  }`}
                  data-testid={`chatbot-message-${msg.role}-${i}`}
                >
                  {msg.content}
                </div>
                {msg.role === "user" && (
                  <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-2 items-center text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Pensando...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t p-3">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu pregunta..."
                disabled={isLoading}
                rows={1}
                data-testid="input-chatbot-message"
                className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
                style={{ maxHeight: "80px" }}
              />
              <Button
                size="icon"
                data-testid="button-chatbot-send"
                className="bg-[#2d7a3a] text-white border-[#256b30]"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
