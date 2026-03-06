import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Paperclip,
  FileText,
  Download,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";

interface ChatAttachment {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isImage: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  channel: string;
  replyToId: string | null;
  ticketRef: string | null;
  attachments: string[] | null;
  mentions: string[] | null;
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function parseAttachment(attachmentStr: string): ChatAttachment | null {
  try {
    return JSON.parse(attachmentStr);
  } catch {
    return null;
  }
}

function RenderAttachments({ attachments }: { attachments: string[] | null }) {
  if (!attachments || attachments.length === 0) return null;
  return (
    <div className="flex flex-col gap-1 mt-1">
      {attachments.map((att, i) => {
        const parsed = parseAttachment(att);
        if (!parsed) return null;
        if (parsed.isImage) {
          return (
            <a
              key={i}
              href={parsed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block max-w-[200px] rounded-md overflow-visible border"
              data-testid={`chat-attachment-image-${i}`}
            >
              <img
                src={parsed.url}
                alt={parsed.fileName}
                className="w-full h-auto rounded-md"
                loading="lazy"
              />
            </a>
          );
        }
        return (
          <a
            key={i}
            href={parsed.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1 rounded-md border bg-muted/30 text-xs max-w-[200px]"
            data-testid={`chat-attachment-file-${i}`}
          >
            <FileText className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />
            <span className="truncate flex-1">{parsed.fileName}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatFileSize(parsed.fileSize)}
            </span>
            <Download className="h-3 w-3 flex-shrink-0 opacity-60" />
          </a>
        );
      })}
    </div>
  );
}

function renderContentWithMentionsAndRefs(content: string) {
  const ticketPattern = /#SST-\d{4}-\d{4,}/g;
  const mentionPattern = /@[A-Za-zÀ-ÿ\u00f1\u00d1][\w\sA-Za-zÀ-ÿ\u00f1\u00d1]*/g;

  interface TokenMatch { index: number; length: number; type: "ticket" | "mention"; text: string; }
  const tokens: TokenMatch[] = [];

  let m: RegExpExecArray | null;
  while ((m = ticketPattern.exec(content)) !== null) {
    tokens.push({ index: m.index, length: m[0].length, type: "ticket", text: m[0] });
  }
  while ((m = mentionPattern.exec(content)) !== null) {
    const mentionText = m[0].trimEnd();
    tokens.push({ index: m.index, length: mentionText.length, type: "mention", text: mentionText });
  }

  tokens.sort((a, b) => a.index - b.index);

  const deduped: TokenMatch[] = [];
  let lastEnd = 0;
  for (const t of tokens) {
    if (t.index >= lastEnd) {
      deduped.push(t);
      lastEnd = t.index + t.length;
    }
  }

  const elements: JSX.Element[] = [];
  let pos = 0;
  for (const token of deduped) {
    if (token.index > pos) {
      elements.push(<span key={`t-${pos}`}>{content.slice(pos, token.index)}</span>);
    }
    if (token.type === "ticket") {
      elements.push(
        <Badge key={`ticket-${token.index}`} variant="secondary" className="font-mono text-xs mx-0.5 cursor-default">
          {token.text}
        </Badge>
      );
    } else {
      elements.push(
        <Badge
          key={`mention-${token.index}`}
          variant="secondary"
          className="text-xs mx-0.5 cursor-default bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
        >
          {token.text}
        </Badge>
      );
    }
    pos = token.index + token.length;
  }
  if (pos < content.length) {
    elements.push(<span key={`t-${pos}`}>{content.slice(pos)}</span>);
  }
  return elements.length > 0 ? elements : [<span key="full">{content}</span>];
}

export function FloatingTeamChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showChannels, setShowChannels] = useState(true);
  const [activeChannel, setActiveChannel] = useState("general");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [mentionCursorPos, setMentionCursorPos] = useState(0);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const totalUnread = useMemo(() => {
    return Object.values(unreadCounts).reduce((sum, c) => sum + c, 0);
  }, [unreadCounts]);

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

  const filteredMentionAgents = useMemo(() => {
    if (!mentionFilter) return onlineAgents;
    const lower = mentionFilter.toLowerCase().trim();
    if (!lower) return onlineAgents;
    return onlineAgents.filter((a) => {
      const nameLower = a.name.toLowerCase();
      return nameLower.includes(lower) || lower.split(" ").every((word) => nameLower.includes(word));
    });
  }, [onlineAgents, mentionFilter]);

  const sendMutation = useMutation({
    mutationFn: async (data: { content: string; channel: string; attachments?: string[]; mentions?: string[] }) => {
      const res = await apiRequest("POST", "/api/support-chat/messages", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/support-chat/messages", activeChannel] });
      setMessageText("");
      setPendingAttachments([]);
      setShouldAutoScroll(true);
    },
  });

  const handleSend = useCallback(() => {
    const hasContent = messageText.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || sendMutation.isPending) return;

    const mentionedUserIds: string[] = [];
    const contentLower = messageText.toLowerCase();
    for (const agent of onlineAgents) {
      if (contentLower.includes(`@${agent.name.toLowerCase()}`)) {
        mentionedUserIds.push(agent.id);
      }
    }

    sendMutation.mutate({
      content: messageText.trim() || (hasAttachments ? "[Archivo adjunto]" : ""),
      channel: activeChannel,
      attachments: pendingAttachments.length > 0 ? pendingAttachments.map((a) => JSON.stringify(a)) : undefined,
      mentions: mentionedUserIds.length > 0 ? mentionedUserIds : undefined,
    });
  }, [messageText, activeChannel, sendMutation, pendingAttachments, onlineAgents]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentionDropdown) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.min(prev + 1, filteredMentionAgents.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedMentionIndex((prev) => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (filteredMentionAgents[selectedMentionIndex]) {
          insertMention(filteredMentionAgents[selectedMentionIndex].name);
        }
        return;
      }
      if (e.key === "Escape") {
        setShowMentionDropdown(false);
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const [mentionAtIndex, setMentionAtIndex] = useState(-1);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    setMessageText(value);

    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAt = textBeforeCursor.lastIndexOf("@");
    if (lastAt >= 0) {
      const charBefore = lastAt > 0 ? textBeforeCursor[lastAt - 1] : " ";
      if (charBefore === " " || charBefore === "\n" || lastAt === 0) {
        const fragment = textBeforeCursor.slice(lastAt + 1);
        if (!fragment.includes("\n")) {
          setShowMentionDropdown(true);
          setMentionFilter(fragment);
          setMentionCursorPos(cursorPos);
          setMentionAtIndex(lastAt);
          setSelectedMentionIndex(0);
          return;
        }
      }
    }
    setShowMentionDropdown(false);
    setMentionFilter("");
  };

  const insertMention = (name: string) => {
    if (mentionAtIndex < 0) return;
    const before = messageText.slice(0, mentionAtIndex);
    const after = messageText.slice(mentionCursorPos);
    const newText = `${before}@${name} ${after}`;
    setMessageText(newText);
    setShowMentionDropdown(false);
    setMentionFilter("");
    setMentionAtIndex(-1);

    const newCursorPos = mentionAtIndex + name.length + 2;
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/support-chat/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Error al subir archivo" }));
          console.error("Upload error:", err);
          continue;
        }

        const attachment: ChatAttachment = await res.json();
        setPendingAttachments((prev) => [...prev, attachment]);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingAttachment = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const isOpenRef = useRef(isOpen);
  const activeChannelRef = useRef(activeChannel);
  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { activeChannelRef.current = activeChannel; }, [activeChannel]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCounts((prev) => ({ ...prev, [activeChannel]: 0 }));
    }
  }, [activeChannel, isOpen, messages]);

  useEffect(() => {
    const handleWsMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "support_chat_message") {
          const msg = data.message;
          const isFromOther = msg?.senderId !== user?.id;

          if (isFromOther) {
            const hasMention = msg?.mentions && Array.isArray(msg.mentions) && msg.mentions.includes(user?.id);
            if (hasMention) {
              playNotificationSound("message");
            } else {
              playNotificationSound("message");
            }
          }

          const currentlyViewingChannel = isOpenRef.current && msg?.channel === activeChannelRef.current;

          if (msg?.channel && !currentlyViewingChannel && isFromOther) {
            setUnreadCounts((prev) => ({
              ...prev,
              [msg.channel]: (prev[msg.channel] || 0) + 1,
            }));
          }

          if (isOpenRef.current && msg?.channel === activeChannelRef.current) {
            queryClient.invalidateQueries({ queryKey: ["/api/support-chat/messages", activeChannelRef.current] });
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
  }, [user?.id]);

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
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600"
          size="icon"
          data-testid="button-open-team-chat"
        >
          <MessageSquare className="h-6 w-6 text-white" />
        </Button>
        {totalUnread > 0 ? (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold"
            data-testid="badge-unread-count"
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        ) : (
          <span
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-[10px] text-white font-bold"
            data-testid="badge-online-count"
          >
            {onlineAgents.length}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col bg-background border rounded-xl shadow-2xl overflow-hidden"
      style={{ width: showChannels ? "480px" : "360px", height: "520px" }}
      data-testid="floating-team-chat"
    >
      <div className="flex items-center justify-between gap-1 px-3 py-2 bg-blue-600 text-white flex-shrink-0">
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
                  const isActive = activeChannel === ch.id;
                  const channelUnread = unreadCounts[ch.id] || 0;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setActiveChannel(ch.id);
                        setShouldAutoScroll(true);
                      }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs text-left transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover-elevate"
                      }`}
                      data-testid={`button-channel-${ch.id}`}
                    >
                      <Hash className="h-3 w-3 flex-shrink-0 opacity-60" />
                      <span className="truncate flex-1">{ch.label}</span>
                      {channelUnread > 0 && !isActive && (
                        <span
                          className="flex-shrink-0 h-4 min-w-[16px] flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold px-1"
                          data-testid={`badge-unread-${ch.id}`}
                        >
                          {channelUnread > 99 ? "99+" : channelUnread}
                        </span>
                      )}
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
                      const isMentioned = msg.mentions && Array.isArray(msg.mentions) && msg.mentions.includes(user?.id || "");
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 px-1 py-0.5 rounded-md ${
                            isMentioned ? "bg-blue-50 dark:bg-blue-950/30 border-l-2 border-blue-400" :
                            isOwn ? "bg-primary/5" : ""
                          }`}
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
                            {msg.content && msg.content !== "[Archivo adjunto]" && (
                              <p className="text-xs whitespace-pre-wrap break-words">
                                {renderContentWithMentionsAndRefs(msg.content)}
                              </p>
                            )}
                            <RenderAttachments attachments={msg.attachments} />
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
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {pendingAttachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted text-[10px] max-w-[150px]"
                    data-testid={`pending-attachment-${i}`}
                  >
                    {att.isImage ? (
                      <ImageIcon className="h-3 w-3 flex-shrink-0 opacity-60" />
                    ) : (
                      <FileText className="h-3 w-3 flex-shrink-0 opacity-60" />
                    )}
                    <span className="truncate">{att.fileName}</span>
                    <button
                      onClick={() => removePendingAttachment(i)}
                      className="flex-shrink-0 ml-0.5 opacity-60"
                      data-testid={`button-remove-attachment-${i}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              {showMentionDropdown && filteredMentionAgents.length > 0 && (
                <div
                  className="absolute bottom-full left-0 mb-1 w-full bg-background border rounded-md shadow-lg z-10 max-h-[120px] overflow-y-auto"
                  data-testid="mention-dropdown"
                >
                  {filteredMentionAgents.map((agent, i) => (
                    <button
                      key={agent.id}
                      onClick={() => insertMention(agent.name)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left transition-colors ${
                        i === selectedMentionIndex ? "bg-primary/10" : "hover-elevate"
                      }`}
                      data-testid={`mention-option-${agent.id}`}
                    >
                      <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-semibold">
                          {agent.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase()}
                        </span>
                      </div>
                      <span className="truncate">{agent.name}</span>
                      <Circle className="h-1.5 w-1.5 fill-green-500 text-green-500 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-1.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  multiple
                  onChange={handleFileSelect}
                  data-testid="input-chat-file"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-8 w-8 flex-shrink-0"
                  data-testid="button-attach-file"
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Textarea
                  ref={textareaRef}
                  value={messageText}
                  onChange={handleTextChange}
                  onKeyDown={handleKeyDown}
                  placeholder={`#${activeChannelInfo.label}... (@ para mencionar)`}
                  className="min-h-[32px] max-h-[80px] resize-none text-xs"
                  rows={1}
                  data-testid="input-floating-chat-message"
                />
                <Button
                  onClick={handleSend}
                  disabled={(!messageText.trim() && pendingAttachments.length === 0) || sendMutation.isPending}
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
    </div>
  );
}
