import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { playNotificationSound } from "@/lib/notification-sound";
import { Button } from "@/components/ui/button";
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
  X,
  Minus,
  ChevronLeft,
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

export function FloatingTeamChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showChannels, setShowChannels] = useState(true);
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
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
    refetchInterval: isOpen ? 10000 : false,
    enabled: isOpen,
  });

  const { data: onlineAgents = [] } = useQuery<OnlineAgent[]>({
    queryKey: ["/api/support-chat/online"],
    refetchInterval: isOpen ? 15000 : false,
    enabled: isOpen,
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
        if (data.type === "support_chat_message") {
          const isFromOther = data.message?.senderId !== user?.id;
          if (isFromOther) {
            playNotificationSound("message");
          }
          if (isOpen && data.message?.channel === activeChannel) {
            queryClient.invalidateQueries({ queryKey: ["/api/support-chat/messages", activeChannel] });
            setShouldAutoScroll(true);
          }
        }
      } catch { /* ignore */ }
    };
    const ws = (window as any).__wsConnection;
    if (ws) {
      ws.addEventListener("message", handleWsMessage);
      return () => ws.removeEventListener("message", handleWsMessage);
    }
  }, [activeChannel, isOpen, user?.id]);

  useEffect(() => {
    if (shouldAutoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  if (!user) return null;

  const activeChannelInfo = CHANNELS.find((c) => c.id === activeChannel) || CHANNELS[0];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          size="icon"
          data-testid="button-open-team-chat"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] text-white font-bold" data-testid="badge-online-count">
          {onlineAgents.length}
        </span>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col bg-background border rounded-xl shadow-2xl overflow-hidden"
      style={{ width: showChannels ? "480px" : "360px", height: "520px" }}
      data-testid="floating-team-chat"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-blue-600 text-white flex-shrink-0">
        <div className="flex items-center gap-2">
          {!showChannels && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-white"
              onClick={() => setShowChannels(true)}
              data-testid="button-show-channels"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <MessageSquare className="h-4 w-4" />
          <span className="font-semibold text-sm">Chat Equipo</span>
          <span className="text-xs opacity-80">
            ({onlineAgents.length} en línea)
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-white"
            onClick={() => setIsOpen(false)}
            data-testid="button-minimize-chat"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-white"
            onClick={() => setIsOpen(false)}
            data-testid="button-close-team-chat"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {showChannels && (
          <div className="w-[140px] border-r flex flex-col flex-shrink-0 bg-muted/30">
            <ScrollArea className="flex-1">
              <div className="p-1.5 space-y-0.5">
                {CHANNELS.map((ch) => {
                  const Icon = ch.icon;
                  const isActive = activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannel(ch.id);
                        setShouldAutoScroll(true);
                        setShowChannels(false);
                      }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-channel-${ch.id}`}
                    >
                      <Hash className="h-3 w-3 flex-shrink-0 opacity-60" />
                      <span className="truncate">{ch.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            <Separator />
            <div className="p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Users className="h-3 w-3 opacity-60" />
                <span className="text-[10px] font-medium">En línea ({onlineAgents.length})</span>
              </div>
              <div className="space-y-0.5 max-h-20 overflow-y-auto">
                {onlineAgents.map((agent) => (
                  <div key={agent.id} className="flex items-center gap-1.5 text-[10px]">
                    <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500" />
                    <span className="truncate">{agent.name}</span>
                  </div>
                ))}
                {onlineAgents.length === 0 && (
                  <p className="text-[10px] text-muted-foreground">Nadie conectado</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/20 flex-shrink-0">
            <Hash className="h-3.5 w-3.5 opacity-60" />
            <span className="text-xs font-semibold">{activeChannelInfo.label}</span>
          </div>

          <ScrollArea className="flex-1 px-3 py-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-xs text-muted-foreground">Cargando...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <MessageSquare className="h-8 w-8 opacity-20" />
                <p className="text-xs text-muted-foreground text-center">
                  Sin mensajes en este canal.
                </p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {groupMessagesByDate(messages).map((group) => (
                  <div key={group.date}>
                    <div className="flex items-center gap-2 my-2">
                      <Separator className="flex-1" />
                      <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
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
                          className={`flex gap-2 px-1 py-0.5 rounded-md ${isOwn ? "bg-primary/5" : ""}`}
                          data-testid={`chat-message-${msg.id}`}
                        >
                          <div className="flex-shrink-0 w-6">
                            {!isConsecutive && (
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-[9px] font-semibold">
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
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-semibold">{msg.senderName}</span>
                                <span className="text-[10px] text-muted-foreground">{formatTime(msg.createdAt)}</span>
                              </div>
                            )}
                            <p className="text-xs whitespace-pre-wrap break-words">
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

          <div className="px-2 py-1.5 border-t flex-shrink-0">
            <div className="flex items-end gap-1.5">
              <Textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`#${activeChannelInfo.label}...`}
                className="min-h-[32px] max-h-[80px] resize-none text-xs"
                rows={1}
                data-testid="input-floating-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!messageText.trim() || sendMutation.isPending}
                size="icon"
                className="h-8 w-8 flex-shrink-0"
                data-testid="button-send-floating-message"
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
