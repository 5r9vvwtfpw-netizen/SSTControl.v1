import { useState, useRef, useEffect } from "react";
import { X, Send, User } from "lucide-react";
import safetyHelmetAvatar from "@assets/generated_images/safety_helmet_avatar_icon.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
  images?: string[];
}

export interface ChatSearchResult {
  question: string;
  answer: string;
  category: string;
  followUp?: string[];
  images?: string[];
  relatedQuestions: string[];
}

interface ChatSearchResponse {
  success: boolean;
  result: ChatSearchResult | null;
  query: string;
  defaultResponse?: string;
}

interface ChatSuggestion {
  text: string;
  category: string;
}

interface ChatSuggestionsResponse {
  success: boolean;
  suggestions: ChatSuggestion[];
}

export async function searchChatbot(query: string): Promise<ChatSearchResponse> {
  const res = await fetch(`/api/plugins/chatbot/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) {
    return { success: false, result: null, query };
  }
  return res.json();
}

export async function getChatbotSuggestions(): Promise<ChatSuggestion[]> {
  const res = await fetch("/api/plugins/chatbot/suggestions");
  if (!res.ok) {
    return [];
  }
  const data: ChatSuggestionsResponse = await res.json();
  return data.suggestions || [];
}

export function ChatbotWidget() {
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  const formatMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lineIndex) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedLine = parts.map((part, partIndex) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={`${lineIndex}-${partIndex}`} className="font-semibold">{part.slice(2, -2)}</strong>;
        }
        return <span key={`${lineIndex}-${partIndex}`}>{part}</span>;
      });
      
      const isListItem = /^[-•✅❌]\s/.test(line.trim()) || /^\d+\.\s/.test(line.trim());
      
      if (line.trim() === '') {
        return <br key={lineIndex} />;
      }
      
      return (
        <p key={lineIndex} className={cn("leading-relaxed", isListItem && "pl-2")}>
          {formattedLine}
        </p>
      );
    });
  };

  useEffect(() => {
    if (chatbotOpen && chatMessages.length === 0) {
      const welcomeMessage: Message = {
        id: "welcome",
        content: "¡Hola! Soy el asistente virtual de SST Colombia. Estoy aquí para ayudarte a usar el sistema.\n\nEscribe tu pregunta sobre cualquier tema: trabajadores, capacitaciones, accidentes, inspecciones, normativa, IPERC, y más.",
        isBot: true,
        timestamp: new Date(),
      };
      setChatMessages([welcomeMessage]);
    }
  }, [chatbotOpen, chatMessages.length]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (chatbotOpen) {
      setTimeout(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 100);
    }
  }, [chatbotOpen]);

  const handleChatSend = (text?: string) => {
    const messageText = text || chatInput.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageText,
      isBot: false,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput("");
    setIsTyping(true);

    searchChatbot(messageText).then((response) => {
      let botResponse: Message;

      if (response.success && response.result) {
        botResponse = {
          id: `bot-${Date.now()}`,
          content: response.result.answer,
          isBot: true,
          timestamp: new Date(),
          images: response.result.images,
        };
      } else {
        botResponse = {
          id: `bot-${Date.now()}`,
          content: response.defaultResponse || "No encontré una respuesta exacta a tu pregunta. Intenta reformular tu pregunta usando palabras clave más específicas.\n\nPuedes preguntarme sobre: trabajadores, capacitaciones, accidentes, inspecciones, IPERC, COPASST, normativa, EPP, y más.",
          isBot: true,
          timestamp: new Date(),
        };
      }

      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }).catch(() => {
      setChatMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        content: "Hubo un error al buscar la respuesta. Por favor intenta de nuevo.",
        isBot: true,
        timestamp: new Date(),
      }]);
      setIsTyping(false);
    });
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleChatSend();
    }
  };

  return (
    <>
      {/* Botón de Centro de Ayuda - Abre Chatbot con Avatar */}
      <button
        onClick={() => setChatbotOpen(true)}
        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-all rounded-full px-4 py-1.5 border-2 border-white/40 hover:border-white/60 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
        data-testid="button-help"
      >
        <img 
          src={safetyHelmetAvatar} 
          alt="Asistente SST" 
          className="h-8 w-8 rounded-full object-cover flex-shrink-0"
        />
        <span className="text-white font-semibold text-sm">Ayuda</span>
      </button>

      {/* Panel flotante del Chatbot Asistente - No bloquea la pantalla */}
      {chatbotOpen && (
        <div className="fixed bottom-4 right-4 w-[380px] h-[500px] bg-background border rounded-lg shadow-2xl flex flex-col z-50" data-testid="chatbot-panel">
          {/* Header */}
          <div className="p-3 border-b bg-primary text-primary-foreground rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={safetyHelmetAvatar} 
                alt="Asistente SST" 
                className="h-10 w-10 rounded-full object-cover border-2 border-white/30"
              />
              <div>
                <h3 className="text-sm font-semibold">Asistente SST</h3>
                <p className="text-[10px] opacity-80">Centro de Ayuda</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              onClick={() => setChatbotOpen(false)}
              data-testid="button-close-chatbot"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Mensajes */}
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    !message.isBot && "justify-end"
                  )}
                >
                  {message.isBot && (
                    <img 
                      src={safetyHelmetAvatar} 
                      alt="Asistente" 
                      className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-primary/20"
                    />
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg p-2.5",
                      message.isBot
                        ? "bg-muted"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    <div className="text-xs space-y-1">
                      {formatMessage(message.content)}
                    </div>
                    
                    {/* Imágenes adjuntas al mensaje */}
                    {message.images && message.images.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.images.map((imageUrl, idx) => (
                          <a
                            key={idx}
                            href={imageUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <img
                              src={imageUrl}
                              alt={`Imagen ${idx + 1}`}
                              className="rounded-md max-w-full h-auto border border-border cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: '200px' }}
                            />
                          </a>
                        ))}
                      </div>
                    )}
                    
                  </div>
                  {!message.isBot && (
                    <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <User className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex gap-2">
                  <img 
                    src={safetyHelmetAvatar} 
                    alt="Escribiendo..." 
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0 border border-primary/20"
                  />
                  <div className="bg-muted rounded-lg p-2.5">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Campo de entrada */}
          <div className="border-t bg-background p-2 flex gap-2 rounded-b-lg">
            <Input
              ref={chatInputRef}
              placeholder="Escribe tu pregunta..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              className="flex-1 h-9 text-sm"
              data-testid="input-chatbot-message"
            />
            <Button 
              onClick={() => handleChatSend()} 
              size="icon"
              className="h-9 w-9"
              disabled={!chatInput.trim() || isTyping}
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
