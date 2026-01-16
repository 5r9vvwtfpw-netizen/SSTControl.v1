import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Trash2,
  MailOpen,
  RefreshCw
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import type { InternalMessage } from "@shared/schema";

const notificationCategories = [
  {
    id: "mensajes",
    label: "Mensajes Internos",
    description: "Notificaciones cuando recibe nuevos mensajes internos",
    icon: MessageSquare,
  },
  {
    id: "examenes",
    label: "Exámenes Médicos",
    description: "Alertas de vencimiento de exámenes médicos ocupacionales",
    icon: Calendar,
  },
  {
    id: "capacitaciones",
    label: "Capacitaciones",
    description: "Recordatorios de capacitaciones programadas y vencimientos",
    icon: Bell,
  },
  {
    id: "documentos",
    label: "Documentos",
    description: "Alertas cuando documentos están por vencer o requieren actualización",
    icon: AlertTriangle,
  },
  {
    id: "sistema",
    label: "Sistema",
    description: "Notificaciones importantes del sistema y actualizaciones",
    icon: Settings,
  },
];

export default function ConfiguracionNotificaciones() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, boolean>>({
    mensajes: true,
    examenes: true,
    capacitaciones: true,
    documentos: true,
    sistema: true,
    emailNotifications: true,
    pushNotifications: false,
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<InternalMessage[]>({
    queryKey: ["/api/internal-messages"],
  });

  const { data: unreadCount } = useQuery<{ count: number }>({
    queryKey: ["/api/internal-messages/unread-count"],
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/internal-messages/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      toast({
        title: "Mensajes marcados como leídos",
        description: "Todos los mensajes han sido marcados como leídos",
      });
    },
  });

  const handleSettingChange = (settingId: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
    toast({
      title: "Configuración actualizada",
      description: `Las notificaciones de ${settingId} han sido ${value ? "activadas" : "desactivadas"}`,
    });
  };

  const recentNotifications = messages?.slice(0, 10) || [];
  const unreadMessages = unreadCount?.count || 0;

  return (
    <div className="space-y-6" data-testid="page-configuracion-notificaciones">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Configuración de Notificaciones
          </h1>
          <p className="text-muted-foreground">
            Gestione cómo y cuándo recibe notificaciones del sistema
          </p>
        </div>
        {unreadMessages > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {unreadMessages} sin leer
          </Badge>
        )}
      </div>

      <Tabs defaultValue="historial" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="historial" data-testid="tab-historial">
            <MessageSquare className="h-4 w-4 mr-2" />
            Historial de Notificaciones
          </TabsTrigger>
          <TabsTrigger value="preferencias" data-testid="tab-preferencias">
            <Settings className="h-4 w-4 mr-2" />
            Preferencias
          </TabsTrigger>
        </TabsList>

        <TabsContent value="historial" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <div>
                <CardTitle className="text-lg">Notificaciones Recientes</CardTitle>
                <CardDescription>
                  Sus últimas 10 notificaciones y mensajes
                </CardDescription>
              </div>
              {unreadMessages > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markAllAsReadMutation.mutate()}
                  disabled={markAllAsReadMutation.isPending}
                  data-testid="button-mark-all-read"
                >
                  {markAllAsReadMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MailOpen className="h-4 w-4 mr-2" />
                  )}
                  Marcar todo como leído
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p>No hay notificaciones recientes</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {recentNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border transition-colors ${
                          notification.status === "unread"
                            ? "bg-primary/5 border-primary/20"
                            : "bg-muted/30"
                        }`}
                        data-testid={`notification-item-${notification.id}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              notification.status === "unread" 
                                ? "bg-primary/10" 
                                : "bg-muted"
                            }`}>
                              {notification.status === "unread" ? (
                                <Mail className="h-4 w-4 text-primary" />
                              ) : (
                                <MailOpen className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`font-medium truncate ${
                                  notification.status === "unread" ? "text-foreground" : "text-muted-foreground"
                                }`}>
                                  {notification.subject}
                                </p>
                                {notification.priority === "urgent" && (
                                  <Badge variant="destructive" className="text-xs">
                                    Urgente
                                  </Badge>
                                )}
                                {(notification.priority as string) === "high" && (
                                  <Badge className="bg-orange-500 text-xs">
                                    Alta
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                De: {notification.senderName}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                    locale: es,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {notification.status === "unread" && (
                            <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferencias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Canales de Notificación</CardTitle>
              <CardDescription>
                Elija cómo desea recibir las notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones importantes por correo electrónico
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  data-testid="switch-email-notifications"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30">
                    <Bell className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <Label className="text-base font-medium">Notificaciones en Plataforma</Label>
                    <p className="text-sm text-muted-foreground">
                      Ver notificaciones en la campana del sistema
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  data-testid="switch-push-notifications"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categorías de Notificación</CardTitle>
              <CardDescription>
                Active o desactive notificaciones por categoría
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10">
                        <category.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <Label className="text-base font-medium">{category.label}</Label>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={settings[category.id] ?? true}
                      onCheckedChange={(checked) => handleSettingChange(category.id, checked)}
                      data-testid={`switch-${category.id}`}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold text-primary">{unreadMessages}</p>
                  <p className="text-sm text-muted-foreground">Sin leer</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold text-green-600">{messages?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total mensajes</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {Object.values(settings).filter(v => v).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Categorías activas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
