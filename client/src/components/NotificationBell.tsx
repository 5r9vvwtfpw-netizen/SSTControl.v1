import { useState } from "react";
import { Bell, MessageSquare, Clock, Mail, MailOpen, Archive, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
// Note: Using programmatic navigation instead of Link for proper message handling
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { InternalMessage } from "@shared/schema";

const priorityColors: Record<string, string> = {
  normal: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const priorityLabels: Record<string, string> = {
  normal: "Normal",
  urgent: "Urgente",
};

export function NotificationBell() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get unread count
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/internal-messages/unread-count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get recent messages
  const { data: messages, isLoading } = useQuery<InternalMessage[]>({
    queryKey: ["/api/internal-messages"],
    refetchInterval: 30000,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("PATCH", `/api/internal-messages/${messageId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
    },
  });

  const unreadCount = unreadData?.count ?? 0;
  
  // Filter to show only received unread messages first, then recent messages
  const recentMessages = messages
    ?.filter(m => m.status !== 'archived')
    .slice(0, 5) || [];

  const handleMarkAsRead = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(messageId);
  };
  
  // Handle message click - use programmatic navigation to ensure it works even when already in the module
  const handleMessageClick = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    setIsOpen(false);
    // Add timestamp to force navigation even if path is the same
    const targetUrl = `/mensajes-internos?mensaje=${messageId}&t=${Date.now()}`;
    setLocation(targetUrl);
  };

  // Handle footer navigation
  const handleViewAll = () => {
    setIsOpen(false);
    setLocation("/mensajes-internos");
  };
  
  const handleNewMessage = () => {
    setIsOpen(false);
    setLocation(`/mensajes-internos?new=true&t=${Date.now()}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/20"
          data-testid="button-notification-bell"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span 
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
              data-testid="badge-unread-count"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        data-testid="popover-notifications"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="font-semibold">Mensajes Internos</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} sin leer
            </Badge>
          )}
        </div>

        {/* Messages List */}
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : recentMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No hay mensajes</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentMessages.map((message) => (
                <div 
                  key={message.id}
                  onClick={(e) => handleMessageClick(e, message.id)}
                  className={cn(
                    "p-3 hover-elevate cursor-pointer transition-colors",
                    message.status === 'unread' && "bg-primary/5"
                  )}
                  data-testid={`notification-item-${message.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        {message.status === 'unread' ? (
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <MailOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span 
                          className={cn(
                            "text-sm truncate block",
                            message.status === 'unread' && "font-semibold"
                          )} 
                          title={message.subject}
                          style={{ maxWidth: '180px' }}
                        >
                          {message.subject}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1 truncate">
                        De: {message.senderName}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          {formatDistanceToNow(new Date(message.createdAt), { 
                            addSuffix: true, 
                            locale: es 
                          })}
                        </span>
                        {message.priority !== 'normal' && (
                          <Badge 
                            variant="outline" 
                            className={cn("text-[9px] px-1.5 py-0 shrink-0", priorityColors[message.priority])}
                          >
                            {priorityLabels[message.priority]}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {message.status === 'unread' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => handleMarkAsRead(e, message.id)}
                        title="Marcar como leído"
                        data-testid={`button-mark-read-${message.id}`}
                      >
                        <MailOpen className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-2 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleViewAll}
            data-testid="button-view-all-messages"
          >
            <Mail className="h-4 w-4 mr-2" />
            Ver todos
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="flex-1"
            onClick={handleNewMessage}
            data-testid="button-new-message"
          >
            <Send className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
