import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Hash,
  Send,
  Users,
  Headset,
  CreditCard,
  Lightbulb,
  Bug,
  GraduationCap,
  MessageSquare,
  Circle,
} from "lucide-react";

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  channel: string;
  replyToId: string | null;
  ticketRef: string | null;
  createdAt: string;
}

interface OnlineAgent {
  id: string;
  name: string;
  role: string;
}

const CHANNELS = [
  { id: "general", label: "General", icon: MessageSquare },
  { id: "soporte_tecnico", label: "Soporte Técnico", icon: Headset },
  { id: "facturacion", label: "Facturación", icon: CreditCard },
  { id: "nueva_funcionalidad", label: "Nueva Funcionalidad", icon: Lightbulb },
  { id: "error_bug", label: "Error / Bug", icon: Bug },
  { id: "capacitacion", label: "Capacitación", icon: GraduationCap },
];

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Hoy";
  if (d.toDateString() === yesterday.toDateString()) return "Ayer";
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function groupMessagesByDate(messages: ChatMessage[]) {
  const groups: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = "";

  for (const msg of messages) {
    const date = formatDate(msg.createdAt);
    if (date !== currentDate) {
      currentDate = date;
      groups.push({ date, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

function renderContentWithTicketRefs(content: string) {
  const parts = content.split(/(#SST-\d{4}-\d{4,})/g);
  return parts.map((part, i) => {
    if (/^#SST-\d{4}-\d{4,}$/.test(part)) {
      return (
        <Badge key={i} variant="secondary" className="font-mono text-xs mx-0.5 cursor-default">
          {part}
        </Badge>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatSoporte() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const { data: messages = [], isLoading } = useQuery<ChatMessage[]>({
    queryKey: ["/api/support-chat/messages", activeChannel],
    queryFn: async () => {
      const res = await fetch(`/api/support-chat/messages?channel=${activeChannel}&limit=100`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Error loading messages");
      return res.json();
    },
    refetchInterval: 10000,
  });

  const { data: onlineAgents = [] } = useQuery<OnlineAgent[]>({
    queryKey: ["/api/support-chat/online"],
    refetchInterval: 15000,
  });

  const sendMutation = useMutation({
    mutationFn: async (data: { content: string; channel: string }) => {
      const res = await apiRequest("POST", "/api/support-chat/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-chat/messages", activeChannel] });
      setMessageText("");
      setShouldAutoScroll(true);
    },
  });

  const handleSend = useCallback(() => {
    if (!messageText.trim() || sendMutation.isPending) return;
    sendMutation.mutate({ content: messageText, channel: activeChannel });
  }, [messageText, activeChannel, sendMutation]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "support_chat_message" && data.message?.channel === activeChannel) {
          queryClient.invalidateQueries({ queryKey: ["/api/support-chat/messages", activeChannel] });
          setShouldAutoScroll(true);
        }
      } catch {
        // ignore
      }
    };

    const ws = (window as any).__wsConnection;
    if (ws) {
      ws.addEventListener("message", handleWsMessage);
      return () => ws.removeEventListener("message", handleWsMessage);
    }
  }, [activeChannel]);

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  const activeChannelInfo = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-3 p-4" data-testid="chat-soporte-container">
      <Card className="w-64 flex-shrink-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b">
          <h3 className="font-semibold text-sm" data-testid="text-chat-channels-title">Canales</h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-0.5">
            {CHANNELS.map((ch) => {
              const Icon = ch.icon;
              const isActive = activeChannel === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setActiveChannel(ch.id);
                    setShouldAutoScroll(true);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover-elevate"
                  }`}
                  data-testid={`button-channel-${ch.id}`}
                >
                  <Hash className="h-4 w-4 flex-shrink-0 opacity-60" />
                  <span className="truncate">{ch.label}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        <Separator />
        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 opacity-60" />
            <span className="text-xs font-medium" data-testid="text-online-agents-title">
              En línea ({onlineAgents.length})
            </span>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {onlineAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2 text-xs"
                data-testid={`agent-online-${agent.id}`}
              >
                <Circle className="h-2 w-2 fill-green-500 text-green-500" />
                <span className="truncate">{agent.name}</span>
              </div>
            ))}
            {onlineAgents.length === 0 && (
              <p className="text-xs text-muted-foreground">Nadie conectado</p>
            )}
          </div>
        </div>
      </Card>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 p-3 border-b">
          <Hash className="h-5 w-5 opacity-60" />
          <div>
            <h2 className="font-semibold text-sm" data-testid="text-active-channel-name">
              {activeChannelInfo.label}
            </h2>
            <p className="text-xs text-muted-foreground">
              Chat interno del equipo de soporte
            </p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-muted-foreground">Cargando mensajes...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <MessageSquare className="h-10 w-10 opacity-20" />
              <p className="text-sm text-muted-foreground">
                No hay mensajes en este canal. Sé el primero en escribir.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupMessagesByDate(messages).map((group) => (
                <div key={group.date}>
                  <div className="flex items-center gap-3 my-3">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                      {group.date}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  {group.messages.map((msg, idx) => {
                    const isOwn = msg.senderId === user?.id;
                    const prevMsg = idx > 0 ? group.messages[idx - 1] : null;
                    const isConsecutive = prevMsg?.senderId === msg.senderId;

                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-3 px-2 py-1 rounded-md group ${
                          isOwn ? "bg-primary/5" : ""
                        }`}
                        data-testid={`chat-message-${msg.id}`}
                      >
                        <div className="flex-shrink-0 w-8">
                          {!isConsecutive && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xs font-semibold">
                                {msg.senderName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {!isConsecutive && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold" data-testid={`text-sender-${msg.id}`}>
                                {msg.senderName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words" data-testid={`text-content-${msg.id}`}>
                            {renderContentWithTicketRefs(msg.content)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="flex items-end gap-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Mensaje en #${activeChannelInfo.label}...`}
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSend}
              disabled={!messageText.trim() || sendMutation.isPending}
              size="icon"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
