import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import chatbotAvatar from "@assets/image_1771096260727.png";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Como agrego trabajadores?",
  "¿Como hago una evaluacion SST?",
  "¿Donde registro un accidente?",
  "¿Que es el ciclo PHVA?",
];

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
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

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
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
        body: JSON.stringify({ question: trimmed, conversationHistory }),
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
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.done) break;
            if (data.error) throw new Error(data.error);
            if (data.content) {
              assistantContent += data.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (error: any) {
      if (error.name === "AbortError") return;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: error.message || "Lo siento, ocurrio un error. Intenta de nuevo." },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const showEmptyState = messages.length === 0;

  return (
    <>
      {!isOpen && (
        <div
          className="fixed z-50 flex flex-col items-center gap-1.5"
          style={{ bottom: "24px", right: "24px" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <span
            className="text-xs font-semibold px-3 py-1 rounded-full shadow-md bg-white text-[#357947] border border-[#357947]/20 transition-opacity duration-200"
            style={{ opacity: isHovered ? 1 : 0, pointerEvents: "none" }}
          >
            Preguntame
          </span>
          <button
            data-testid="button-chatbot-open"
            className="relative w-14 h-14 rounded-full shadow-lg bg-[#357947] cursor-pointer transition-all duration-200 hover:shadow-xl"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir asistente virtual"
            style={{ overflow: "hidden" }}
          >
            <MessageCircle
              className="absolute inset-0 m-auto h-6 w-6 text-white transition-opacity duration-200"
              style={{ opacity: isHovered ? 0 : 1 }}
            />
            <img
              src={chatbotAvatar}
              alt="Asistente SST Colombia"
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-200"
              style={{ opacity: isHovered ? 1 : 0 }}
            />
          </button>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed z-50 flex flex-col"
          style={{
            bottom: "24px",
            right: "24px",
            width: "min(380px, calc(100vw - 2rem))",
            height: "500px",
            animation: "chatbot-slide-up 200ms ease-out",
          }}
        >
          <style>{`
            @keyframes chatbot-slide-up {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          <div className="flex flex-col h-full rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between gap-2 px-4 py-2.5 bg-[#357947]">
              <div className="flex items-center gap-2.5">
                <img
                  src={chatbotAvatar}
                  alt="Asistente"
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-white leading-tight">Asistente SST-Colombia</span>
                  <span className="text-[11px] text-green-100 leading-tight">Experto en SG-SST</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
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

            <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50 dark:bg-slate-800/50" data-testid="chatbot-messages">
              {showEmptyState && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                  <img
                    src={chatbotAvatar}
                    alt="Asistente SST Colombia"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="text-center px-4">
                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Hola, soy tu asistente SST</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Puedo ayudarte con normativa colombiana, uso de la plataforma y mucho mas.
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 px-3 mt-1">
                    {SUGGESTIONS.map((s, i) => (
                      <button
                        key={i}
                        data-testid={`button-suggestion-${i}`}
                        className="text-xs px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors duration-150 hover:border-[#357947] hover:text-[#357947] dark:hover:text-green-400"
                        onClick={() => sendMessage(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                    className={`px-3 py-2 text-sm max-w-[80%] whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-[#357947] text-white rounded-2xl rounded-br-sm"
                        : "bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-600 rounded-2xl rounded-bl-sm"
                    }`}
                    data-testid={`chatbot-message-${msg.role}-${i}`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-slate-500 dark:text-slate-300" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-2 items-center text-slate-500 text-sm pl-9">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Pensando...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
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
                  className="flex-1 resize-none rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#357947]/50 disabled:opacity-50"
                  style={{ maxHeight: "96px" }}
                />
                <button
                  data-testid="button-chatbot-send"
                  onClick={() => sendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-[#357947] text-white flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-[#2d6a3e]"
                  aria-label="Enviar mensaje"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
