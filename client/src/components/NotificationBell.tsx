import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  Bell, MessageSquare, Clock, Mail, MailOpen, Archive, Send, CheckCheck,
  GraduationCap, Heart, Monitor, Headphones, Vote, ClipboardList, Truck, ChevronRight,
} from "lucide-react";
import { playNotificationSound } from "@/lib/notification-sound";
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
import { syncAppBadge } from "@/lib/app-badge";
import type { InternalMessage } from "@shared/schema";

const priorityColors: Record<string, string> = {
  normal: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const priorityLabels: Record<string, string> = {
  normal: "Normal",
  urgent: "Urgente",
};

type PortalNotificationCount = {
  messages: number;
  capacitaciones: number;
  capacitacionesSst: number;
  capacitacionesPesv: number;
  examenes: number;
  inducciones: number;
  induccionesSst: number;
  induccionesPesv: number;
  audiometrias: number;
  elecciones: number;
  eleccionesCopasst: number;
  eleccionesConvivencia: number;
  encuestaDiaria: number;
  inspeccionesVehiculo: number;
  total: number;
};

const workerPendingItems = [
  { key: "messages", label: "Mensajes internos", description: "Mensajes que aún no has leído", path: "/mensajes-internos", icon: Mail },
  { key: "capacitacionesSst", label: "Capacitaciones SST", description: "Confirma o completa tus capacitaciones", section: "capacitaciones", icon: GraduationCap },
  { key: "capacitacionesPesv", label: "Capacitaciones PESV", description: "Confirma o completa tus capacitaciones viales", section: "capacitaciones-pesv", icon: GraduationCap },
  { key: "examenes", label: "Exámenes médicos", description: "Confirma la lectura de tus resultados", section: "mis-examenes-medicos", icon: Heart },
  { key: "induccionesSst", label: "Inducciones SST", description: "Completa tu inducción o reinducción", section: "inducciones-virtuales", icon: Monitor },
  { key: "induccionesPesv", label: "Inducción PESV", description: "Completa tu inducción de seguridad vial", section: "induccion-pesv", icon: Monitor },
  { key: "audiometrias", label: "Audiometrías", description: "Revisa tus audiometrías programadas", section: "mis-audiometrias", icon: Headphones },
  { key: "eleccionesCopasst", label: "Elección COPASST", description: "Participa en la votación abierta", section: "elecciones-copasst", icon: Vote },
  { key: "eleccionesConvivencia", label: "Elección de Convivencia", description: "Participa en la votación abierta", section: "elecciones-convivencia", icon: Vote },
  { key: "encuestaDiaria", label: "Encuesta diaria", description: "Registra tu encuesta de conductor", section: "encuesta-conductor", icon: ClipboardList },
  { key: "inspeccionesVehiculo", label: "Inspección vehicular", description: "Completa la inspección pendiente de hoy", section: "inspeccion-vehiculo", icon: Truck },
] as const;

export function NotificationBell({ simple = false }: { simple?: boolean }) {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isSupportRole = user?.role === 'soporte';
  const isWorkerRole = user?.role === 'trabajador';
  const prevUnreadRef = useRef<number | null>(null);
  
  // Get unread count — workers use the consolidated portal endpoint
  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ["/api/internal-messages/unread-count"],
    refetchInterval: 15000,
    enabled: !isWorkerRole,
  });

  const { data: portalCountData } = useQuery<PortalNotificationCount>({
    queryKey: ["/api/portal/notification-count"],
    refetchInterval: 15000,
    enabled: isWorkerRole,
  });

  // Unified count: workers use consolidated total, others use message count
  const unreadCount = isWorkerRole
    ? (portalCountData?.total ?? 0)
    : (unreadData?.count ?? 0);

  useEffect(() => {
    if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
      playNotificationSound("ticket");
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    void syncAppBadge(unreadCount);
  }, [unreadCount]);

  // Get recent messages
  const { data: messages, isLoading } = useQuery<InternalMessage[]>({
    queryKey: ["/api/internal-messages"],
    refetchInterval: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("PATCH", `/api/internal-messages/${messageId}/read`);
    },
    onMutate: async (messageId: string) => {
      await queryClient.cancelQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      const prev = queryClient.getQueryData<{ count: number }>(["/api/internal-messages/unread-count"]);
      if (prev && prev.count > 0) {
        queryClient.setQueryData(["/api/internal-messages/unread-count"], { count: prev.count - 1 });
      }
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["/api/internal-messages/unread-count"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/notification-count"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/internal-messages/mark-all-read");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      const prev = queryClient.getQueryData<{ count: number }>(["/api/internal-messages/unread-count"]);
      queryClient.setQueryData(["/api/internal-messages/unread-count"], { count: 0 });
      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["/api/internal-messages/unread-count"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/notification-count"] });
    },
  });

  // Filter to show only received unread messages first, then recent messages
  const recentMessages = messages
    ?.filter(m => m.status !== 'archived')
    .slice(0, 5) || [];

  const actionableWorkerItems = workerPendingItems
    .map(item => ({ ...item, count: portalCountData?.[item.key] ?? 0 }))
    .filter(item => item.count > 0);

  const handleMarkAsRead = (e: React.MouseEvent, messageId: string) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate(messageId);
  };
  
  const handleMessageClick = (e: React.MouseEvent, message: InternalMessage) => {
    e.preventDefault();
    setIsOpen(false);

    if (message.status === 'unread') {
      markAsReadMutation.mutate(message.id);
    }

    if (message.relatedEntity === 'support_ticket' && message.relatedEntityId) {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      if (isSupportRole) {
        setLocation(`/soporte/tickets?ticket=${message.relatedEntityId}&t=${Date.now()}`);
      } else {
        setLocation(`/tickets-soporte?ticket=${message.relatedEntityId}&t=${Date.now()}`);
      }
      return;
    }

    const targetUrl = `/mensajes-internos?mensaje=${message.id}&t=${Date.now()}`;
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

  const handleWorkerPendingClick = (item: typeof actionableWorkerItems[number]) => {
    setIsOpen(false);
    if ("path" in item && item.path) {
      setLocation(item.path);
      return;
    }
    if ("section" in item && item.section) {
      setLocation(`/portal-empleados?section=${encodeURIComponent(item.section)}`);
    }
  };

  if (simple) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative text-white hover:bg-white/20"
        onClick={handleViewAll}
        data-testid="button-notification-bell"
        aria-label={isWorkerRole ? "Ver acciones pendientes" : "Ver mensajes internos"}
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
    );
  }

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
            {isWorkerRole ? <Bell className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4 text-primary" />}
            <span className="font-semibold">{isWorkerRole ? "Acciones pendientes" : "Mensajes Internos"}</span>
          </div>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} {isWorkerRole ? (unreadCount === 1 ? "pendiente" : "pendientes") : "sin leer"}
            </Badge>
          )}
        </div>

        {/* Pending actions for workers / internal messages for other roles */}
        <ScrollArea className="max-h-80">
          {isWorkerRole ? (
            actionableWorkerItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <CheckCheck className="h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Estás al día</p>
                <p className="text-xs mt-1">No tienes acciones pendientes</p>
              </div>
            ) : (
              <div className="divide-y">
                {actionableWorkerItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => handleWorkerPendingClick(item)}
                      className="w-full p-3 text-left hover-elevate transition-colors"
                      data-testid={`portal-pending-${item.key}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <ItemIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{item.label}</span>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )
          ) : isLoading ? (
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
                  onClick={(e) => handleMessageClick(e, message)}
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

        {!isWorkerRole && (
          <div className="border-t p-2 flex gap-2">
            {isSupportRole ? (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  markAllAsReadMutation.mutate();
                }}
                disabled={unreadCount === 0 || markAllAsReadMutation.isPending}
                data-testid="button-mark-all-read"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como leídas
              </Button>
            ) : (
              <>
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
              </>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
