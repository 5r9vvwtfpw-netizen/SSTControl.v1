import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Ticket, 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  ChevronRight,
  User,
  Loader2,
  Filter,
  Search as SearchIcon,
  Paperclip,
  Image,
  X,
  Download
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  companyId: string;
  companyName: string;
  userId: string;
  userName: string;
  userEmail: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  attachments: string[] | null;
  resolution: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
}

interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  userName: string;
  userRole: string;
  isStaff: number;
  content: string;
  attachments: string[] | null;
  isInternal: number;
  createdAt: string;
}

interface TicketWithDetails extends SupportTicket {
  responses: TicketResponse[];
  statusHistory: any[];
  attachments: string[] | null;
}

const statusLabels: Record<string, string> = {
  abierto: "Abierto",
  en_revision: "En Revisión",
  en_progreso: "En Progreso",
  pendiente_cliente: "Pendiente Cliente",
  resuelto: "Resuelto",
  cerrado: "Cerrado"
};

const statusColors: Record<string, string> = {
  abierto: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  en_revision: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  en_progreso: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  pendiente_cliente: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  resuelto: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cerrado: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
};

const priorityLabels: Record<string, string> = {
  baja: "Baja",
  media: "Media",
  alta: "Alta",
  critica: "Crítica"
};

const priorityColors: Record<string, string> = {
  baja: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  media: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  alta: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  critica: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
};

const categoryLabels: Record<string, string> = {
  soporte_tecnico: "Soporte Técnico",
  facturacion: "Facturación",
  nueva_funcionalidad: "Nueva Funcionalidad",
  error_bug: "Error/Bug",
  capacitacion: "Capacitación",
  consulta_general: "Consulta General"
};

const slaHoursByPriority: Record<string, number> = {
  critica: 4,
  alta: 12,
  media: 24,
  baja: 48,
};

function getSlaInfo(priority: string, createdAt: string, status: string) {
  const slaHours = slaHoursByPriority[priority] || 24;
  const created = new Date(createdAt).getTime();
  const deadline = created + slaHours * 60 * 60 * 1000;
  const now = Date.now();
  const remaining = deadline - now;
  const isClosed = status === 'cerrado' || status === 'resuelto';

  if (isClosed) {
    return { label: '', expired: false, slaHours, show: false };
  }
  if (remaining <= 0) {
    const overHours = Math.abs(remaining) / (1000 * 60 * 60);
    if (overHours >= 24) {
      const days = Math.floor(overHours / 24);
      const hrs = Math.floor(overHours % 24);
      return { label: `Vencido hace ${days}d ${hrs}h`, expired: true, slaHours, show: true };
    }
    return { label: `Vencido hace ${Math.floor(overHours)}h ${Math.floor((overHours % 1) * 60)}m`, expired: true, slaHours, show: true };
  }
  const remainingHours = remaining / (1000 * 60 * 60);
  if (remainingHours <= slaHours * 0.25) {
    if (remainingHours >= 1) {
      return { label: `${Math.floor(remainingHours)}h ${Math.floor((remainingHours % 1) * 60)}m`, expired: false, slaHours, show: true };
    }
    return { label: `${Math.floor(remainingHours * 60)}m`, expired: false, slaHours, show: true };
  }
  return { label: '', expired: false, slaHours, show: false };
}

function ResponsesList({ responses }: { responses: TicketResponse[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses.length]);
  return (
    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1" data-testid="responses-list">
      {responses.map((response) => (
        <div
          key={response.id}
          className={`p-3 rounded-lg text-sm ${
            response.isStaff === 1
              ? 'bg-primary/10 ml-4'
              : 'bg-muted mr-4'
          }`}
          data-testid={`response-${response.id}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <User className="h-3 w-3" />
            <span className="font-medium">{response.userName}</span>
            {response.isStaff === 1 && (
              <Badge variant="secondary" className="text-xs">Soporte</Badge>
            )}
          </div>
          <p className="whitespace-pre-wrap">{response.content}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(new Date(response.createdAt), "d MMM yyyy HH:mm", { locale: es })}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function TicketsSoporte() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [urlTicketProcessed, setUrlTicketProcessed] = useState<string | null>(null);
  
  const [newTicket, setNewTicket] = useState({
    subject: "",
    description: "",
    category: "consulta_general"
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets']
  });

  useEffect(() => {
    if (tickets.length === 0) return;
    const params = new URLSearchParams(searchString);
    const ticketId = params.get("ticket");
    const urlTimestamp = params.get("t");
    const urlKey = ticketId ? `${ticketId}_${urlTimestamp || ''}` : null;
    if (ticketId && urlKey !== urlTicketProcessed) {
      const found = tickets.find(t => t.id === ticketId);
      if (found) {
        setSelectedTicket(found as any);
        setUrlTicketProcessed(urlKey);
      }
    }
  }, [searchString, tickets, urlTicketProcessed]);

  const { data: selectedTicketDetails, isLoading: isLoadingDetails } = useQuery<TicketWithDetails>({
    queryKey: ['/api/support-tickets', selectedTicket?.id],
    enabled: !!selectedTicket?.id
  });

  const createTicketMutation = useMutation({
    mutationFn: async (data: typeof newTicket) => {
      return await apiRequest('POST', '/api/support-tickets', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      toast({
        title: "Ticket creado",
        description: "Su ticket de soporte ha sido creado exitosamente."
      });
      setIsCreateDialogOpen(false);
      setNewTicket({
        subject: "",
        description: "",
        category: "consulta_general"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ticket",
        variant: "destructive"
      });
    }
  });

  const addResponseMutation = useMutation({
    mutationFn: async (data: { ticketId: string; content: string }) => {
      return await apiRequest('POST', `/api/support-tickets/${data.ticketId}/responses`, { content: data.content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id] });
      toast({
        title: "Respuesta enviada",
        description: "Su respuesta ha sido enviada exitosamente."
      });
      setResponseContent("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    }
  });

  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return await apiRequest('PATCH', `/api/support-tickets/${ticketId}`, { status: 'cerrado' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id] });
      toast({
        title: "Ticket cerrado",
        description: "El ticket ha sido cerrado exitosamente."
      });
      setSelectedTicket(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo cerrar el ticket",
        variant: "destructive"
      });
    }
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTickets = tickets.filter(t => t.status !== 'cerrado' && t.status !== 'resuelto');
  const closedTickets = tickets.filter(t => t.status === 'cerrado' || t.status === 'resuelto');

  const uploadAttachments = async (ticketId: string, files: File[]) => {
    if (files.length === 0) return;
    
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('attachments', file);
    });
    
    const response = await fetch(`/api/support-tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Error al subir archivos');
      }
      const errorText = await response.text().catch(() => '');
      throw new Error(errorText || 'Error al subir archivos');
    }
    
    return response.json();
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete el asunto y la descripción",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const response = await apiRequest('POST', '/api/support-tickets', newTicket);
      const ticket = await response.json();
      
      let attachmentError = false;
      if (selectedFiles.length > 0 && ticket.id) {
        try {
          await uploadAttachments(ticket.id, selectedFiles);
        } catch (uploadError: any) {
          attachmentError = true;
          toast({
            title: "Advertencia",
            description: "El ticket fue creado pero hubo un error al subir los archivos adjuntos. Puede intentar subirlos nuevamente.",
            variant: "destructive"
          });
        }
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      
      if (!attachmentError) {
        toast({
          title: "Ticket creado",
          description: selectedFiles.length > 0 
            ? `Ticket creado con ${selectedFiles.length} archivo(s) adjunto(s)`
            : "Su ticket de soporte ha sido creado exitosamente."
        });
      }
      
      setIsCreateDialogOpen(false);
      setNewTicket({
        subject: "",
        description: "",
        category: "consulta_general"
      });
      setSelectedFiles([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el ticket",
        variant: "destructive"
      });
      setSelectedFiles([]); // Clear files on error
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendResponse = () => {
    if (!responseContent.trim() || !selectedTicket) return;
    addResponseMutation.mutate({
      ticketId: selectedTicket.id,
      content: responseContent.trim()
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-tickets">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 px-6 py-6" data-testid="page-tickets-soporte">
      <div className="flex-shrink-0 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Ticket className="h-6 w-6" />
            Tickets de Soporte
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestione sus solicitudes de soporte técnico
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-ticket">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Ticket</DialogTitle>
              <DialogDescription>
                Complete el formulario para crear una nueva solicitud de soporte.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Asunto</Label>
                <Input
                  id="subject"
                  data-testid="input-ticket-subject"
                  placeholder="Descripción breve del problema"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    value={newTicket.category}
                    onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}
                  >
                    <SelectTrigger data-testid="select-ticket-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soporte_tecnico">Soporte Técnico</SelectItem>
                      <SelectItem value="facturacion">Facturación</SelectItem>
                      <SelectItem value="nueva_funcionalidad">Nueva Funcionalidad</SelectItem>
                      <SelectItem value="error_bug">Error/Bug</SelectItem>
                      <SelectItem value="capacitacion">Capacitación</SelectItem>
                      <SelectItem value="consulta_general">Consulta General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  data-testid="input-ticket-description"
                  placeholder="Describa detalladamente su solicitud o problema..."
                  rows={5}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="attachments">Adjuntar Imágenes (opcional)</Label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      id="attachments"
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,.pdf"
                      multiple
                      className="hidden"
                      data-testid="input-ticket-attachments"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        
                        // Validar número máximo de archivos
                        if (files.length + selectedFiles.length > 5) {
                          toast({
                            title: "Límite de archivos",
                            description: "Máximo 5 archivos por ticket",
                            variant: "destructive"
                          });
                          e.target.value = '';
                          return;
                        }
                        
                        // Validar tamaño de archivos (10MB máximo)
                        const MAX_SIZE = 10 * 1024 * 1024;
                        const oversizedFiles = files.filter(f => f.size > MAX_SIZE);
                        if (oversizedFiles.length > 0) {
                          toast({
                            title: "Archivo demasiado grande",
                            description: `Los archivos deben ser menores a 10MB. Archivos rechazados: ${oversizedFiles.map(f => f.name).join(', ')}`,
                            variant: "destructive"
                          });
                          e.target.value = '';
                          return;
                        }
                        
                        // Validar tipos de archivo
                        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
                        const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
                        if (invalidFiles.length > 0) {
                          toast({
                            title: "Tipo de archivo no permitido",
                            description: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP) y PDFs",
                            variant: "destructive"
                          });
                          e.target.value = '';
                          return;
                        }
                        
                        setSelectedFiles([...selectedFiles, ...files]);
                        e.target.value = '';
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('attachments')?.click()}
                      data-testid="button-attach-files"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Adjuntar Archivos
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      Máx. 5 archivos, 10MB c/u
                    </span>
                  </div>
                  
                  {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-xs"
                          data-testid={`file-preview-${index}`}
                        >
                          <Image className="h-3 w-3" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => setSelectedFiles(selectedFiles.filter((_, i) => i !== index))}
                            data-testid={`button-remove-file-${index}`}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                data-testid="button-cancel-ticket"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateTicket}
                disabled={isUploading}
                data-testid="button-submit-ticket"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {selectedFiles.length > 0 ? 'Subiendo archivos...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Crear Ticket
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-shrink-0 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                <Ticket className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold" data-testid="text-total-tickets">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abiertos</p>
                <p className="text-2xl font-bold" data-testid="text-open-tickets">{openTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold" data-testid="text-pending-tickets">
                  {tickets.filter(t => t.status === 'pendiente_cliente').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resueltos</p>
                <p className="text-2xl font-bold" data-testid="text-resolved-tickets">{closedTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número o asunto..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-tickets"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_revision">En Revisión</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="pendiente_cliente">Pendiente Cliente</SelectItem>
            <SelectItem value="resuelto">Resuelto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
        <Card className="lg:col-span-2 flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Mis Tickets</CardTitle>
            <CardDescription>
              {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} encontrado{filteredTickets.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "todos" 
                    ? "No se encontraron tickets con los filtros aplicados"
                    : "No tiene tickets de soporte. ¡Cree uno si necesita ayuda!"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 rounded-lg border cursor-pointer hover-elevate ${
                      selectedTicket?.id === ticket.id 
                        ? 'border-primary bg-accent/50' 
                        : 'border-border'
                    }`}
                    onClick={() => setSelectedTicket(ticket as any)}
                    data-testid={`ticket-row-${ticket.id}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">
                            {ticket.ticketNumber}
                          </span>
                          <Badge className={priorityColors[ticket.priority]} variant="secondary">
                            {priorityLabels[ticket.priority]}
                          </Badge>
                          {(() => {
                            const sla = getSlaInfo(ticket.priority, ticket.createdAt, ticket.status);
                            if (!sla.show) return null;
                            if (sla.expired) {
                              return (
                                <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800" data-testid={`sla-badge-${ticket.id}`}>
                                  <AlertCircle className="h-2.5 w-2.5" />
                                  {sla.label}
                                </span>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800" data-testid={`sla-badge-${ticket.id}`}>
                                <Clock className="h-2.5 w-2.5" />
                                {sla.label}
                              </span>
                            );
                          })()}
                        </div>
                        <h4 className="font-medium truncate">{ticket.subject}</h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {categoryLabels[ticket.category]} • {format(new Date(ticket.createdAt), "d MMM yyyy", { locale: es })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={statusColors[ticket.status]} variant="secondary">
                          {statusLabels[ticket.status]}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Detalle del Ticket</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 min-h-0 overflow-y-auto">
            {!selectedTicket ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Seleccione un ticket para ver sus detalles
                </p>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedTicketDetails ? (
              <div className="space-y-4" data-testid="ticket-detail">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-muted-foreground">
                      {selectedTicketDetails.ticketNumber}
                    </span>
                    <Badge className={statusColors[selectedTicketDetails.status]} variant="secondary">
                      {statusLabels[selectedTicketDetails.status]}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{selectedTicketDetails.subject}</h3>
                  <div className="flex gap-2">
                    <Badge className={priorityColors[selectedTicketDetails.priority]} variant="secondary">
                      {priorityLabels[selectedTicketDetails.priority]}
                    </Badge>
                    <Badge variant="outline">
                      {categoryLabels[selectedTicketDetails.category]}
                    </Badge>
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{selectedTicketDetails.description}</p>
                </div>

                {selectedTicketDetails.attachments && selectedTicketDetails.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Archivos Adjuntos ({selectedTicketDetails.attachments.length})
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedTicketDetails.attachments.map((attachment, index) => {
                        const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);
                        return (
                          <a
                            key={index}
                            href={attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col gap-1 p-2 rounded-lg border hover-elevate transition-all"
                            data-testid={`attachment-${index}`}
                          >
                            {isImage ? (
                              <img 
                                src={attachment} 
                                alt={`Adjunto ${index + 1}`}
                                className="w-full h-20 object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-20 bg-muted flex items-center justify-center rounded">
                                <Download className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <span className="text-xs text-muted-foreground truncate">
                              {attachment.split('/').pop()}
                            </span>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  Creado: {format(new Date(selectedTicketDetails.createdAt), "d MMM yyyy HH:mm", { locale: es })}
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Respuestas
                  </h4>
                  {selectedTicketDetails.responses && selectedTicketDetails.responses.filter(r => r.isInternal === 0).length > 0 ? (
                    <ResponsesList responses={selectedTicketDetails.responses.filter(r => r.isInternal === 0)} />
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4" data-testid="text-no-responses">
                      Sin respuestas aún
                    </p>
                  )}
                </div>

                {selectedTicketDetails.status !== 'cerrado' && selectedTicketDetails.status !== 'resuelto' && (
                  <div className="space-y-2 pt-2 border-t">
                    <Textarea
                      placeholder="Escriba su respuesta..."
                      rows={3}
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                      data-testid="input-ticket-response"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSendResponse}
                        disabled={!responseContent.trim() || addResponseMutation.isPending}
                        className="flex-1"
                        data-testid="button-send-response"
                      >
                        {addResponseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {selectedTicketDetails.resolution && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-sm mb-1 text-green-800 dark:text-green-200">Resolución</h4>
                    <p className="text-sm text-green-700 dark:text-green-300">{selectedTicketDetails.resolution}</p>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
