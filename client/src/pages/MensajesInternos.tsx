import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import {
  MessageSquare,
  Mail,
  MailOpen,
  Send,
  Archive,
  Clock,
  User,
  ChevronLeft,
  Filter,
  Search,
  AlertCircle,
  Inbox,
  SendHorizontal,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { InternalMessage } from "@shared/schema";

// Validation schema for new message
const messageFormSchema = z.object({
  receiverId: z.string().min(1, "Seleccione un destinatario"),
  subject: z.string().min(3, "El asunto debe tener al menos 3 caracteres").max(200, "El asunto es muy largo"),
  content: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(5000, "El mensaje es muy largo"),
  priority: z.enum(["normal", "urgent"]),
});

type MessageFormData = z.infer<typeof messageFormSchema>;

interface Recipient {
  id: string;
  fullName: string | null;
  role: string;
}

const priorityColors: Record<string, string> = {
  normal: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  urgent: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

const priorityLabels: Record<string, string> = {
  normal: "Normal",
  urgent: "Urgente",
};

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  superusuario: "Super Usuario",
  admin: "Administrador",
  lso: "LSO",
  coordinador_sst: "Coordinador SST",
  responsable_sst: "Responsable SST",
  trabajador: "Trabajador",
  inspector: "Inspector",
  auditor_interno: "Auditor Interno",
  visitante: "Visitante",
  soporte: "Soporte",
};

export default function MensajesInternos() {
  const [location] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"inbox" | "sent" | "archived">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<InternalMessage | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);

  // Fetch messages with auto-refresh every 30 seconds
  const { data: messages, isLoading: messagesLoading } = useQuery<InternalMessage[]>({
    queryKey: ["/api/internal-messages"],
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch recipients - always fetch to ensure data is available
  const { data: recipients, isLoading: recipientsLoading } = useQuery<Recipient[]>({
    queryKey: ["/api/internal-messages/recipients"],
    staleTime: 0, // Always get fresh data
    refetchOnMount: true,
  });

  // Form for new message
  const form = useForm<MessageFormData>({
    resolver: zodResolver(messageFormSchema),
    defaultValues: {
      receiverId: "",
      subject: "",
      content: "",
      priority: "normal",
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: MessageFormData) => {
      return await apiRequest("POST", "/api/internal-messages", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages/unread-count"] });
      toast({
        title: "Mensaje enviado",
        description: "El mensaje ha sido enviado correctamente.",
      });
      form.reset();
      setShowNewMessage(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    },
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

  // Archive message mutation
  const archiveMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return await apiRequest("PATCH", `/api/internal-messages/${messageId}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internal-messages"] });
      toast({
        title: "Mensaje archivado",
        description: "El mensaje ha sido archivado correctamente.",
      });
      setSelectedMessage(null);
    },
  });

  // Track last processed timestamp to detect URL changes from notification clicks
  const [lastProcessedTimestamp, setLastProcessedTimestamp] = useState<string | null>(null);
  
  // Check URL for ?new=true (only on initial mount or when ?new changes)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "true") {
      setShowNewMessage(true);
      // Clear the URL param to prevent reopening on future renders
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("new");
      newUrl.searchParams.delete("t");
      window.history.replaceState({}, "", newUrl.toString());
    }
  }, [location]);

  // Check URL for ?mensaje=id - use timestamp to detect clicks from notification dropdown
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const messageId = params.get("mensaje");
    const timestamp = params.get("t");
    
    // Skip if no message ID in URL
    if (!messageId) {
      return;
    }
    
    // If timestamp exists and is different, this is a new click - always process
    // If no timestamp, check if we already processed this message ID
    const shouldProcess = timestamp ? 
      timestamp !== lastProcessedTimestamp : 
      true;
    
    if (!shouldProcess) {
      return;
    }
    
    if (messages) {
      const message = messages.find(m => m.id === messageId);
      if (message) {
        setSelectedMessage(message);
        if (timestamp) {
          setLastProcessedTimestamp(timestamp);
        }
        if (message.status === "unread") {
          markAsReadMutation.mutate(message.id);
        }
        // Clear the URL params after processing
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete("mensaje");
        newUrl.searchParams.delete("t");
        window.history.replaceState({}, "", newUrl.toString());
      }
    }
  }, [location, messages, lastProcessedTimestamp]);

  // Filter messages based on tab and search using current user ID
  const currentUserId = user?.id;
  const filteredMessages = messages?.filter((message) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        message.subject.toLowerCase().includes(query) ||
        message.senderName.toLowerCase().includes(query) ||
        message.receiverName.toLowerCase().includes(query) ||
        message.content.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }

    // Tab filter using current user ID to distinguish sender/receiver
    if (activeTab === "archived") {
      return message.status === "archived";
    }
    
    if (activeTab === "sent") {
      // Show only messages where I am the sender (not archived)
      return message.senderId === currentUserId && message.status !== "archived";
    }
    
    // inbox - show only messages where I am the receiver (not archived)
    return message.receiverId === currentUserId && message.status !== "archived";
  }) || [];

  const handleMessageClick = (message: InternalMessage) => {
    setSelectedMessage(message);
    if (message.status === "unread") {
      markAsReadMutation.mutate(message.id);
    }
  };

  const onSubmit = (data: MessageFormData) => {
    sendMessageMutation.mutate(data);
  };

  return (
    <div className="container mx-auto p-6" data-testid="page-mensajes-internos">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <MessageSquare className="h-6 w-6" />
            Mensajes Internos
          </h1>
          <p className="text-muted-foreground mt-1">
            Comunicación interna entre LSO y Responsables SST
          </p>
        </div>
        <Button
          onClick={() => setShowNewMessage(true)}
          data-testid="button-compose-message"
        >
          <Send className="h-4 w-4 mr-2" />
          Nuevo Mensaje
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="inbox" className="text-xs" data-testid="tab-inbox">
                    <Inbox className="h-3.5 w-3.5 mr-1" />
                    Bandeja
                  </TabsTrigger>
                  <TabsTrigger value="sent" className="text-xs" data-testid="tab-sent">
                    <SendHorizontal className="h-3.5 w-3.5 mr-1" />
                    Enviados
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="text-xs" data-testid="tab-archived">
                    <Archive className="h-3.5 w-3.5 mr-1" />
                    Archivo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar mensajes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-messages"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {messagesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Mail className="h-10 w-10 mb-3 opacity-50" />
                  <p className="text-sm font-medium">No hay mensajes</p>
                  <p className="text-xs mt-1">
                    {activeTab === "inbox" ? "Tu bandeja de entrada está vacía" : 
                     activeTab === "sent" ? "No has enviado mensajes" : 
                     "No hay mensajes archivados"}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      onClick={() => handleMessageClick(message)}
                      className={cn(
                        "p-3 cursor-pointer hover-elevate transition-colors",
                        message.status === "unread" && "bg-primary/5",
                        selectedMessage?.id === message.id && "bg-primary/10 border-l-2 border-l-primary"
                      )}
                      data-testid={`message-item-${message.id}`}
                    >
                      <div className="flex items-start gap-3">
                        {message.status === "unread" ? (
                          <Mail className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className={cn(
                            "text-sm truncate",
                            message.status === "unread" && "font-semibold"
                          )}>
                            {message.subject}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {activeTab === "sent" ? `Para: ${message.receiverName}` : `De: ${message.senderName}`}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(message.createdAt), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                            {message.priority !== "normal" && (
                              <Badge 
                                variant="outline" 
                                className={cn("text-[9px] px-1 py-0", priorityColors[message.priority])}
                              >
                                {priorityLabels[message.priority]}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Detail / Empty State */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {selectedMessage.subject}
                      {selectedMessage.priority !== "normal" && (
                        <Badge 
                          variant="outline" 
                          className={cn("text-xs", priorityColors[selectedMessage.priority])}
                        >
                          {priorityLabels[selectedMessage.priority]}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <strong>De:</strong> {selectedMessage.senderName}
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {roleLabels[selectedMessage.senderRole] || selectedMessage.senderRole}
                          </Badge>
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <strong>Para:</strong> {selectedMessage.receiverName}
                          <Badge variant="outline" className="ml-1 text-[10px]">
                            {roleLabels[selectedMessage.receiverRole] || selectedMessage.receiverRole}
                          </Badge>
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3" />
                        {format(new Date(selectedMessage.createdAt), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => archiveMessageMutation.mutate(selectedMessage.id)}
                      disabled={selectedMessage.status === "archived"}
                      data-testid="button-archive-message"
                    >
                      <Archive className="h-4 w-4 mr-1" />
                      Archivar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ScrollArea className="h-[400px]">
                  <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                    {selectedMessage.content}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Selecciona un mensaje</p>
              <p className="text-sm mt-1">
                Haz clic en un mensaje de la lista para ver su contenido
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* New Message Dialog */}
      <Dialog open={showNewMessage} onOpenChange={setShowNewMessage}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Nuevo Mensaje
            </DialogTitle>
            <DialogDescription>
              Envía un mensaje a otro miembro del equipo SST
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinatario *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-recipient">
                          <SelectValue placeholder="Seleccionar destinatario..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {recipientsLoading ? (
                          <SelectItem value="_loading" disabled>
                            Cargando...
                          </SelectItem>
                        ) : recipients?.length === 0 ? (
                          <SelectItem value="_empty" disabled>
                            No hay destinatarios disponibles
                          </SelectItem>
                        ) : (
                          recipients?.map((recipient) => (
                            <SelectItem key={recipient.id} value={recipient.id}>
                              {recipient.fullName || "Sin nombre"} - {roleLabels[recipient.role] || recipient.role}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Asunto *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Escriba el asunto del mensaje..." 
                          {...field}
                          data-testid="input-subject" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prioridad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-priority">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensaje *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escriba el contenido del mensaje..."
                        className="min-h-[200px] resize-none"
                        {...field}
                        data-testid="textarea-content"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setShowNewMessage(false);
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  {sendMessageMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
