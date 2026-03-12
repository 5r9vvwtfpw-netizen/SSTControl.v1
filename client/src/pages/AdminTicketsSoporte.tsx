import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Ticket, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  User,
  Loader2,
  Filter,
  Search as SearchIcon,
  Building2,
  RefreshCw,
  AlertTriangle,
  X,
  History,
  Paperclip,
  Download,
  Key,
  ArrowUpRight,
  Archive,
  ArrowLeft,
  ChevronRight
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
  userRole?: string;
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

interface StatusHistoryEntry {
  id: string;
  ticketId: string;
  previousStatus: string | null;
  newStatus: string;
  changedBy: string;
  changedByName: string;
  notes: string | null;
  createdAt: string;
}

interface TicketWithDetails extends SupportTicket {
  responses: TicketResponse[];
  statusHistory: StatusHistoryEntry[];
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

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const created = new Date(dateStr).getTime();
  const diff = now - created;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 1) return "ahora";
  if (minutes < 60) return `hace ${minutes}m`;
  if (hours < 24) return `hace ${hours}h`;
  if (days === 1) return "hace 1 día";
  if (days < 30) return `hace ${days} días`;
  const months = Math.floor(days / 30);
  return `hace ${months} mes${months > 1 ? 'es' : ''}`;
}

const categoryLabels: Record<string, string> = {
  soporte_tecnico: "Soporte Técnico",
  facturacion: "Facturación",
  nueva_funcionalidad: "Nueva Funcionalidad",
  error_bug: "Error/Bug",
  capacitacion: "Capacitación",
  consulta_general: "Consulta General"
};

function AdminResponsesList({ responses }: { responses: TicketResponse[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses.length]);
  return (
    <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1 mb-4" data-testid="admin-responses-list">
      {responses.map((response) => (
        <div 
          key={response.id}
          className={`p-3 rounded-lg text-sm ${
            response.isStaff 
              ? response.isInternal 
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-500' 
                : 'bg-primary/10 border-l-2 border-primary'
              : 'bg-muted'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{response.userName}</span>
            {response.isStaff === 1 && (
              <Badge variant="outline" className="text-xs">Staff</Badge>
            )}
            {response.isInternal === 1 && (
              <Badge variant="secondary" className="text-xs">Interno</Badge>
            )}
          </div>
          <p className="text-muted-foreground whitespace-pre-wrap">{response.content}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {format(new Date(response.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
          </p>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function AdminTicketsSoporte() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [responseContent, setResponseContent] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusChangeNotes, setStatusChangeNotes] = useState("");
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [escalateToUserId, setEscalateToUserId] = useState("");
  const [escalateReason, setEscalateReason] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedVaultCompanyId, setSelectedVaultCompanyId] = useState<string | null>(null);
  const [vaultSearchTerm, setVaultSearchTerm] = useState("");

  if (user?.role !== 'superadmin' && user?.role !== 'soporte') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Acceso Denegado</h2>
            <p className="text-muted-foreground">
              Esta página es solo para administradores del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: tickets = [], isLoading, isError, error: ticketsError, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets'],
    retry: 2,
    retryDelay: 1000,
  });

  const [urlTicketProcessed, setUrlTicketProcessed] = useState<string | null>(null);

  useEffect(() => {
    if (tickets.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const ticketId = params.get('ticket');
    const urlTimestamp = params.get('t');
    const urlKey = ticketId ? `${ticketId}_${urlTimestamp || ''}` : null;
    if (ticketId && urlKey !== urlTicketProcessed) {
      const found = tickets.find(t => t.id === ticketId);
      if (found) {
        setSelectedTicket(found as TicketWithDetails);
        setUrlTicketProcessed(urlKey);
      }
    }
  }, [tickets, urlTicketProcessed]);

  useEffect(() => {
    const handleUrlChange = () => {
      const params = new URLSearchParams(window.location.search);
      const ticketId = params.get('ticket');
      if (ticketId) {
        setUrlTicketProcessed(null);
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  const { data: selectedTicketDetails, isLoading: isLoadingDetails } = useQuery<TicketWithDetails>({
    queryKey: ['/api/support-tickets', selectedTicket?.id],
    enabled: !!selectedTicket?.id
  });

  const addResponseMutation = useMutation({
    mutationFn: async (data: { ticketId: string; content: string; isInternal: boolean }) => {
      return await apiRequest('POST', `/api/support-tickets/${data.ticketId}/responses`, { 
        content: data.content,
        isInternal: data.isInternal
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id] });
      toast({
        title: isInternalNote ? "Nota interna agregada" : "Respuesta enviada",
        description: isInternalNote 
          ? "La nota interna ha sido agregada exitosamente."
          : "Su respuesta ha sido enviada al cliente."
      });
      setResponseContent("");
      setIsInternalNote(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la respuesta",
        variant: "destructive"
      });
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (data: { ticketId: string; status: string; notes?: string }) => {
      return await apiRequest('PATCH', `/api/support-tickets/${data.ticketId}`, { 
        status: data.status,
        statusChangeNotes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id] });
      toast({
        title: "Estado actualizado",
        description: "El estado del ticket ha sido actualizado."
      });
      setShowStatusDialog(false);
      setNewStatus("");
      setStatusChangeNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado",
        variant: "destructive"
      });
    }
  });

  const { data: supportAgents = [] } = useQuery<{ id: string; username: string; fullName: string | null; role: string }[]>({
    queryKey: ['/api/support-tickets/agents'],
    enabled: user?.role === 'superadmin' || user?.role === 'soporte',
  });

  const escalateMutation = useMutation({
    mutationFn: async (data: { ticketId: string; assignToUserId: string; reason: string }) => {
      return await apiRequest('POST', `/api/support-tickets/${data.ticketId}/escalate`, {
        assignToUserId: data.assignToUserId,
        reason: data.reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-tickets', selectedTicket?.id] });
      toast({
        title: "Ticket escalado",
        description: "El ticket ha sido escalado exitosamente y se notificó al agente."
      });
      setShowEscalateDialog(false);
      setEscalateToUserId("");
      setEscalateReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo escalar el ticket",
        variant: "destructive"
      });
    }
  });

  const handleEscalate = () => {
    if (!escalateToUserId || !escalateReason.trim() || !selectedTicket) return;
    escalateMutation.mutate({
      ticketId: selectedTicket.id,
      assignToUserId: escalateToUserId,
      reason: escalateReason.trim()
    });
  };

  const isArchivedStatus = (status: string) => status === 'cerrado' || status === 'resuelto';

  const activeTickets = tickets.filter(t => !isArchivedStatus(t.status));
  const archivedTickets = tickets.filter(t => isArchivedStatus(t.status));

  const visibleTickets = showArchived ? archivedTickets : activeTickets;

  const filteredTickets = visibleTickets.filter(ticket => {
    const matchesSearch = 
      ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "todos" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "todos" || ticket.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const ticketsByStatus = {
    abierto: tickets.filter(t => t.status === 'abierto').length,
    en_revision: tickets.filter(t => t.status === 'en_revision').length,
    en_progreso: tickets.filter(t => t.status === 'en_progreso').length,
    pendiente_cliente: tickets.filter(t => t.status === 'pendiente_cliente').length,
    resuelto: tickets.filter(t => t.status === 'resuelto').length,
    cerrado: tickets.filter(t => t.status === 'cerrado').length
  };

  const criticalTickets = tickets.filter(t => t.priority === 'critica' && t.status !== 'cerrado' && t.status !== 'resuelto');

  const isSuperadmin = user?.role === 'superadmin';

  interface CompanyVault {
    companyId: string;
    companyName: string;
    ticketsAbiertos: number;
    ticketsPendientes: number;
    highestPriority: string | null;
    lastTicketDate: string | null;
    totalTickets: number;
  }

  const companyVaults = useMemo<CompanyVault[]>(() => {
    if (!isSuperadmin || tickets.length === 0) return [];
    const grouped: Record<string, CompanyVault> = {};
    const priorityOrder: Record<string, number> = { critica: 4, alta: 3, media: 2, baja: 1 };

    tickets.forEach((t) => {
      const key = t.companyId || "__unknown__";
      if (!grouped[key]) {
        grouped[key] = {
          companyId: key,
          companyName: t.companyName || "Sin empresa",
          ticketsAbiertos: 0,
          ticketsPendientes: 0,
          highestPriority: null,
          lastTicketDate: null,
          totalTickets: 0,
        };
      }
      const v = grouped[key];
      v.totalTickets++;
      if (t.status === 'abierto') v.ticketsAbiertos++;
      if (t.status === 'pendiente_cliente') v.ticketsPendientes++;
      if (!isArchivedStatus(t.status)) {
        const currentPrio = priorityOrder[t.priority] || 0;
        const existingPrio = v.highestPriority ? (priorityOrder[v.highestPriority] || 0) : 0;
        if (currentPrio > existingPrio) v.highestPriority = t.priority;
      }
      if (!v.lastTicketDate || new Date(t.createdAt) > new Date(v.lastTicketDate)) {
        v.lastTicketDate = t.createdAt;
      }
    });

    return Object.values(grouped).sort((a, b) => {
      const aPrio = a.highestPriority ? (priorityOrder[a.highestPriority] || 0) : 0;
      const bPrio = b.highestPriority ? (priorityOrder[b.highestPriority] || 0) : 0;
      if (bPrio !== aPrio) return bPrio - aPrio;
      return b.ticketsAbiertos - a.ticketsAbiertos;
    });
  }, [tickets, isSuperadmin]);

  const filteredVaults = useMemo(() => {
    if (!vaultSearchTerm.trim()) return companyVaults;
    const term = vaultSearchTerm.toLowerCase();
    return companyVaults.filter(v => v.companyName.toLowerCase().includes(term));
  }, [companyVaults, vaultSearchTerm]);

  const showVaults = isSuperadmin && !selectedVaultCompanyId;

  const vaultFilteredTickets = useMemo(() => {
    if (!selectedVaultCompanyId) return filteredTickets;
    return filteredTickets.filter(t => (t.companyId || "__unknown__") === selectedVaultCompanyId);
  }, [filteredTickets, selectedVaultCompanyId]);

  const selectedVaultName = useMemo(() => {
    if (!selectedVaultCompanyId) return "";
    const vault = companyVaults.find(v => v.companyId === selectedVaultCompanyId);
    return vault?.companyName || "Empresa";
  }, [selectedVaultCompanyId, companyVaults]);

  const displayTickets = showVaults ? [] : (selectedVaultCompanyId ? vaultFilteredTickets : filteredTickets);

  const handleSendResponse = () => {
    if (!responseContent.trim() || !selectedTicket) return;
    addResponseMutation.mutate({
      ticketId: selectedTicket.id,
      content: responseContent.trim(),
      isInternal: isInternalNote
    });
  };

  const handleStatusChange = () => {
    if (!newStatus || !selectedTicket) return;
    updateStatusMutation.mutate({
      ticketId: selectedTicket.id,
      status: newStatus,
      notes: statusChangeNotes
    });
  };

  const openStatusDialog = (ticket: SupportTicket) => {
    setSelectedTicket(ticket as TicketWithDetails);
    setNewStatus(ticket.status);
    setShowStatusDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-admin-tickets">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="error-admin-tickets">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Error al cargar tickets</h2>
            <p className="text-muted-foreground mb-4">
              {(ticketsError as any)?.message || "No se pudieron obtener los tickets de soporte. Intente nuevamente."}
            </p>
            <Button onClick={() => refetch()} variant="outline" data-testid="button-retry-tickets">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6" data-testid="page-admin-tickets">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-admin-title">
            <Ticket className="h-6 w-6" />
            Panel de Administración de Tickets
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestione todos los tickets de soporte del sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <Button 
            onClick={() => {
              setShowArchived(!showArchived);
              setStatusFilter('todos');
              setSelectedTicket(null);
            }} 
            variant={showArchived ? "default" : "outline"}
            data-testid="button-toggle-archived"
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? `Archivo (${archivedTickets.length})` : `Ver archivo (${archivedTickets.length})`}
          </Button>
          <Button onClick={() => { setUrlTicketProcessed(null); refetch(); }} variant="outline" data-testid="button-refresh-tickets">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {criticalTickets.length > 0 && (
        <div 
          className="rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-orange-400 p-4 shadow-lg shadow-red-500/20"
          data-testid="card-critical-alert"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <p className="font-bold text-white" data-testid="text-critical-count">
                {criticalTickets.length} Ticket{criticalTickets.length !== 1 ? 's' : ''} Crítico{criticalTickets.length !== 1 ? 's' : ''} Pendiente{criticalTickets.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-white/80">
                Requieren atención inmediata
              </p>
            </div>
          </div>
        </div>
      )}

      {showArchived && (
        <div className="rounded-2xl bg-muted/50 border border-border p-4 flex items-center justify-between" data-testid="banner-archive-mode">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">Archivo de Tickets</p>
              <p className="text-sm text-muted-foreground">
                {archivedTickets.length} ticket{archivedTickets.length !== 1 ? 's' : ''} cerrado{archivedTickets.length !== 1 ? 's' : ''} y resuelto{archivedTickets.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => { setShowArchived(false); setStatusFilter('todos'); }} data-testid="button-back-to-active">
            Volver a tickets activos
          </Button>
        </div>
      )}

      <div className={`grid gap-4 ${showArchived ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-2' : 'grid-cols-2 md:grid-cols-2 lg:grid-cols-4'}`}>
        {!showArchived && (
        <>
        <div 
          className={`cursor-pointer rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-blue-100/80 dark:hover:bg-blue-950/50 transition-all duration-300 border border-blue-200/50 dark:border-blue-800/30 ${statusFilter === 'abierto' ? 'ring-2 ring-blue-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'abierto' ? 'todos' : 'abierto')}
          data-testid="card-stat-abierto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-blue-700/70 dark:text-blue-400/70">Abiertos</p>
                <p className="text-3xl font-extrabold text-blue-600 leading-tight" data-testid="text-count-abierto">{ticketsByStatus.abierto}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div 
          className={`cursor-pointer rounded-2xl bg-yellow-50/80 dark:bg-yellow-950/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-yellow-100/80 dark:hover:bg-yellow-950/50 transition-all duration-300 border border-yellow-200/50 dark:border-yellow-800/30 ${statusFilter === 'en_revision' ? 'ring-2 ring-yellow-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'en_revision' ? 'todos' : 'en_revision')}
          data-testid="card-stat-en-revision"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-yellow-700/70 dark:text-yellow-400/70">En Revisión</p>
                <p className="text-3xl font-extrabold text-yellow-600 leading-tight" data-testid="text-count-en-revision">{ticketsByStatus.en_revision}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`cursor-pointer rounded-2xl bg-purple-50/80 dark:bg-purple-950/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-purple-100/80 dark:hover:bg-purple-950/50 transition-all duration-300 border border-purple-200/50 dark:border-purple-800/30 ${statusFilter === 'en_progreso' ? 'ring-2 ring-purple-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'en_progreso' ? 'todos' : 'en_progreso')}
          data-testid="card-stat-en-progreso"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-purple-700/70 dark:text-purple-400/70">En Progreso</p>
                <p className="text-3xl font-extrabold text-purple-600 leading-tight" data-testid="text-count-en-progreso">{ticketsByStatus.en_progreso}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`cursor-pointer rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-orange-100/80 dark:hover:bg-orange-950/50 transition-all duration-300 border border-orange-200/50 dark:border-orange-800/30 ${statusFilter === 'pendiente_cliente' ? 'ring-2 ring-orange-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'pendiente_cliente' ? 'todos' : 'pendiente_cliente')}
          data-testid="card-stat-pendiente"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-orange-700/70 dark:text-orange-400/70">Pendiente</p>
                <p className="text-3xl font-extrabold text-orange-600 leading-tight" data-testid="text-count-pendiente">{ticketsByStatus.pendiente_cliente}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
        </>
        )}

        {showArchived && (
        <>
        <div 
          className={`cursor-pointer rounded-2xl bg-green-50/80 dark:bg-green-950/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-green-100/80 dark:hover:bg-green-950/50 transition-all duration-300 border border-green-200/50 dark:border-green-800/30 ${statusFilter === 'resuelto' ? 'ring-2 ring-green-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'resuelto' ? 'todos' : 'resuelto')}
          data-testid="card-stat-resuelto"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-green-700/70 dark:text-green-400/70">Resueltos</p>
                <p className="text-3xl font-extrabold text-green-600 leading-tight" data-testid="text-count-resuelto">{ticketsByStatus.resuelto}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`cursor-pointer rounded-2xl bg-gray-50/80 dark:bg-gray-900/30 backdrop-blur-sm shadow-sm hover:shadow-lg hover:-translate-y-1 hover:bg-gray-100/80 dark:hover:bg-gray-900/50 transition-all duration-300 border border-gray-200/50 dark:border-gray-700/30 ${statusFilter === 'cerrado' ? 'ring-2 ring-gray-500 shadow-md' : ''}`}
          onClick={() => setStatusFilter(statusFilter === 'cerrado' ? 'todos' : 'cerrado')}
          data-testid="card-stat-cerrado"
        >
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Cerrados</p>
                <p className="text-3xl font-extrabold text-gray-600 leading-tight" data-testid="text-count-cerrado">{ticketsByStatus.cerrado}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800/30 flex items-center justify-center">
                <X className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {showVaults ? (
        <>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empresa por nombre..."
              className="pl-10"
              value={vaultSearchTerm}
              onChange={(e) => setVaultSearchTerm(e.target.value)}
              data-testid="input-search-ticket-vaults"
            />
          </div>

          {filteredVaults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No se encontraron empresas{vaultSearchTerm ? ` para "${vaultSearchTerm}"` : ""}</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="grid-ticket-vaults">
              {filteredVaults.map((vault) => (
                <Card
                  key={vault.companyId}
                  className="hover-elevate cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedVaultCompanyId(vault.companyId);
                    setVaultSearchTerm("");
                    setSearchTerm("");
                    setStatusFilter("todos");
                    setPriorityFilter("todos");
                    setCategoryFilter("todos");
                    setSelectedTicket(null);
                  }}
                  data-testid={`vault-ticket-company-${vault.companyId}`}
                >
                  <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                      <CardTitle className="text-base truncate" data-testid={`vault-ticket-name-${vault.companyId}`}>{vault.companyName}</CardTitle>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Ticket className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium" data-testid={`vault-ticket-open-${vault.companyId}`}>{vault.ticketsAbiertos} abierto{vault.ticketsAbiertos !== 1 ? 's' : ''}</span>
                      </div>
                      {vault.ticketsPendientes > 0 && (
                        <div className="flex items-center gap-1.5">
                          <AlertCircle className="h-4 w-4 text-orange-500" />
                          <span className="text-sm font-medium" data-testid={`vault-ticket-pending-${vault.companyId}`}>{vault.ticketsPendientes} pendiente{vault.ticketsPendientes !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {vault.highestPriority && (
                        <Badge className={priorityColors[vault.highestPriority]} data-testid={`vault-ticket-priority-${vault.companyId}`}>
                          {priorityLabels[vault.highestPriority]}
                        </Badge>
                      )}
                      <Badge variant="secondary" data-testid={`vault-ticket-total-${vault.companyId}`}>
                        {vault.totalTickets} total
                      </Badge>
                    </div>
                    {vault.lastTicketDate && (
                      <p className="text-xs text-muted-foreground" data-testid={`vault-ticket-last-${vault.companyId}`}>
                        Último ticket: {timeAgo(vault.lastTicketDate)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
      <>
      {selectedVaultCompanyId && (
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              setSelectedVaultCompanyId(null);
              setSearchTerm("");
              setSelectedTicket(null);
              setStatusFilter("todos");
              setPriorityFilter("todos");
              setCategoryFilter("todos");
              setShowArchived(false);
            }}
            data-testid="button-back-to-ticket-vaults"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a empresas
          </Button>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-lg font-semibold" data-testid="text-vault-ticket-company-name">{selectedVaultName}</span>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número, asunto, empresa o usuario..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-admin-tickets"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="abierto">Abierto</SelectItem>
            <SelectItem value="en_revision">En Revisión</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="pendiente_cliente">Pendiente</SelectItem>
            <SelectItem value="resuelto">Resuelto</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-priority-filter">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="critica">Crítica</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-category-filter">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas</SelectItem>
            <SelectItem value="soporte_tecnico">Soporte Técnico</SelectItem>
            <SelectItem value="facturacion">Facturación</SelectItem>
            <SelectItem value="nueva_funcionalidad">Nueva Funcionalidad</SelectItem>
            <SelectItem value="error_bug">Error/Bug</SelectItem>
            <SelectItem value="capacitacion">Capacitación</SelectItem>
            <SelectItem value="consulta_general">Consulta General</SelectItem>
          </SelectContent>
        </Select>
        {(statusFilter !== 'todos' || priorityFilter !== 'todos' || categoryFilter !== 'todos') && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setStatusFilter('todos');
              setPriorityFilter('todos');
              setCategoryFilter('todos');
            }}
            data-testid="button-clear-filters"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedVaultCompanyId ? `Tickets — ${selectedVaultName}` : 'Tickets del Sistema'}
            </CardTitle>
            <CardDescription>
              {displayTickets.length} ticket{displayTickets.length !== 1 ? 's' : ''} encontrado{displayTickets.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {displayTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    No se encontraron tickets con los filtros aplicados
                  </p>
                </div>
              ) : (
                <Table className="border-collapse">
                  <TableHeader>
                    <TableRow className="border-none hover:bg-transparent">
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Ticket</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Empresa</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Estado</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Prioridad</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Categoría</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Asignado</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fecha</TableHead>
                      <TableHead className="py-3 px-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayTickets.map((ticket) => (
                      <TableRow 
                        key={ticket.id}
                        className={`border-none cursor-pointer transition-all duration-300 hover:bg-accent/40 rounded-lg ${selectedTicket?.id === ticket.id ? 'bg-accent' : ''}`}
                        onClick={() => setSelectedTicket(ticket as TicketWithDetails)}
                        data-testid={`admin-ticket-row-${ticket.id}`}
                      >
                        <TableCell className="py-4 px-5">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber}</p>
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
                            <p className="font-medium truncate max-w-[200px]">{ticket.subject}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm truncate max-w-[120px]">{ticket.companyName}</span>
                            {ticket.userRole === 'lso' && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500 text-blue-600 dark:text-blue-400">Portal LSO</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${statusColors[ticket.status]}`}>
                            {statusLabels[ticket.status] || ticket.status}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${priorityColors[ticket.priority]}`}>
                            {priorityLabels[ticket.priority] || ticket.priority}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <span className="text-sm text-muted-foreground">
                            {categoryLabels[ticket.category] || ticket.category}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          {ticket.assignedToName ? (
                            <span className="text-sm truncate max-w-[100px] block">{ticket.assignedToName}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground/60 italic">Sin asignar</span>
                          )}
                        </TableCell>
                        <TableCell className="py-4 px-5">
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(ticket.createdAt), "dd MMM yyyy", { locale: es })}
                            </span>
                            <p className="text-xs text-muted-foreground/70" data-testid={`text-time-ago-${ticket.id}`}>
                              {timeAgo(ticket.createdAt)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              openStatusDialog(ticket);
                            }}
                            data-testid={`button-change-status-${ticket.id}`}
                          >
                            Cambiar Estado
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-4">
          <CardHeader>
            <CardTitle>Detalle del Ticket</CardTitle>
            <CardDescription>
              {selectedTicket ? selectedTicket.ticketNumber : 'Seleccione un ticket'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedTicket ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Seleccione un ticket para ver los detalles
                </p>
              </div>
            ) : isLoadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-220px)]">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={statusColors[selectedTicket.status]}>
                      {statusLabels[selectedTicket.status]}
                    </Badge>
                    <Badge className={priorityColors[selectedTicket.priority]}>
                      {priorityLabels[selectedTicket.priority]}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold">{selectedTicket.subject}</h3>
                  
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTicket.companyName}</span>
                      {selectedTicket.userRole === 'lso' && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500 text-blue-600 dark:text-blue-400">Portal LSO</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedTicket.userName}</span>
                      {selectedTicket.userEmail && (
                        <span className="text-muted-foreground">({selectedTicket.userEmail})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(selectedTicket.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}</span>
                    </div>
                  </div>

                  {(() => {
                    const sla = getSlaInfo(selectedTicket.priority, selectedTicket.createdAt, selectedTicket.status);
                    const bgColor = sla.expired
                      ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                      : sla.show
                        ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
                        : 'bg-muted';
                    const textColor = sla.expired
                      ? 'text-red-700 dark:text-red-400'
                      : sla.show
                        ? 'text-amber-700 dark:text-amber-400'
                        : 'text-muted-foreground';
                    const displayLabel = sla.show ? sla.label : 'Dentro del plazo';
                    return (
                      <div className={`rounded-md p-3 ${bgColor}`} data-testid="sla-indicator">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <AlertCircle className={`h-4 w-4 ${textColor}`} />
                            <span className={`text-sm font-semibold ${textColor}`}>
                              SLA: {displayLabel}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            Límite: {sla.slaHours}h ({priorityLabels[selectedTicket.priority]})
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium mb-1">Descripción:</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedTicket.description}
                    </p>
                  </div>
                  
                  {selectedTicketDetails?.attachments && selectedTicketDetails.attachments.length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Paperclip className="h-4 w-4" />
                        Archivos Adjuntos ({selectedTicketDetails.attachments.length})
                      </p>
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
                              data-testid={`admin-attachment-${index}`}
                            >
                              {isImage ? (
                                <img 
                                  src={attachment} 
                                  alt={`Adjunto ${index + 1}`}
                                  className="w-full h-16 object-cover rounded"
                                />
                              ) : (
                                <div className="w-full h-16 bg-muted flex items-center justify-center rounded">
                                  <Download className="h-5 w-5 text-muted-foreground" />
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
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowHistoryDialog(true)}
                    data-testid="button-view-history"
                  >
                    <History className="h-4 w-4 mr-1" />
                    Historial
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openStatusDialog(selectedTicket)}
                    data-testid="button-change-status-detail"
                  >
                    Cambiar Estado
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowEscalateDialog(true)}
                    data-testid="button-escalate-ticket"
                  >
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    Escalar
                  </Button>
                </div>
                {selectedTicket.assignedToName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Asignado a: <span className="font-medium">{selectedTicket.assignedToName}</span>
                  </p>
                )}

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    Respuestas
                    {selectedTicketDetails?.responses && selectedTicketDetails.responses.length > 0 && (
                      <Badge variant="secondary" className="text-xs">{selectedTicketDetails.responses.length}</Badge>
                    )}
                  </p>
                  {selectedTicketDetails?.responses && selectedTicketDetails.responses.length > 0 ? (
                    <AdminResponsesList responses={selectedTicketDetails.responses} />
                  ) : (
                    <p className="text-center text-muted-foreground text-sm py-4">
                      Sin respuestas aún
                    </p>
                  )}

                  <div className="space-y-3">
                    <Textarea
                      placeholder={isInternalNote ? "Escriba una nota interna (solo visible para el equipo)..." : "Escriba su respuesta al cliente..."}
                      value={responseContent}
                      onChange={(e) => setResponseContent(e.target.value)}
                      rows={3}
                      data-testid="textarea-admin-response"
                    />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isInternalNote}
                          onChange={(e) => setIsInternalNote(e.target.checked)}
                          className="rounded"
                          data-testid="checkbox-internal-note"
                        />
                        Nota interna
                      </label>
                      <Button
                        size="sm"
                        onClick={handleSendResponse}
                        disabled={!responseContent.trim() || addResponseMutation.isPending}
                        data-testid="button-send-admin-response"
                      >
                        {addResponseMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            {isInternalNote ? "Agregar Nota" : "Enviar"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
      </>
      )}

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado del Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.subject}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nuevo Estado</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger data-testid="select-new-status">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abierto">Abierto</SelectItem>
                  <SelectItem value="en_revision">En Revisión</SelectItem>
                  <SelectItem value="en_progreso">En Progreso</SelectItem>
                  <SelectItem value="pendiente_cliente">Pendiente Cliente</SelectItem>
                  <SelectItem value="resuelto">Resuelto</SelectItem>
                  <SelectItem value="cerrado">Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                placeholder="Agregue notas sobre el cambio de estado..."
                value={statusChangeNotes}
                onChange={(e) => setStatusChangeNotes(e.target.value)}
                rows={3}
                data-testid="textarea-status-notes"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleStatusChange}
              disabled={!newStatus || updateStatusMutation.isPending}
              data-testid="button-confirm-status-change"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Historial de Cambios</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[400px]">
            {selectedTicketDetails?.statusHistory && selectedTicketDetails.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {selectedTicketDetails.statusHistory.map((entry: StatusHistoryEntry) => (
                  <div key={entry.id} className="flex gap-3 pb-4 border-b last:border-0">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {entry.previousStatus && (
                          <>
                            <Badge variant="outline" className="text-xs">
                              {statusLabels[entry.previousStatus] || entry.previousStatus}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        )}
                        <Badge className={statusColors[entry.newStatus]}>
                          {statusLabels[entry.newStatus] || entry.newStatus}
                        </Badge>
                      </div>
                      <p className="text-sm">
                        Por: <span className="font-medium">{entry.changedByName}</span>
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Sin historial de cambios
              </p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalar Ticket</DialogTitle>
            <DialogDescription>
              {selectedTicket?.ticketNumber} - {selectedTicket?.subject}
              {selectedTicket?.assignedToName && (
                <span className="block mt-1">Actualmente asignado a: {selectedTicket.assignedToName}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Escalar a</Label>
              <Select value={escalateToUserId} onValueChange={setEscalateToUserId}>
                <SelectTrigger data-testid="select-escalate-agent">
                  <SelectValue placeholder="Seleccione un agente" />
                </SelectTrigger>
                <SelectContent>
                  {supportAgents
                    .filter(a => a.id !== user?.id)
                    .map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.fullName || agent.username} ({agent.role === 'superadmin' ? 'Superadmin' : 'Soporte'})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Motivo del escalamiento</Label>
              <Textarea
                placeholder="Describa por qué se escala este ticket..."
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
                rows={3}
                data-testid="textarea-escalate-reason"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleEscalate}
              disabled={!escalateToUserId || !escalateReason.trim() || escalateMutation.isPending}
              data-testid="button-confirm-escalate"
            >
              {escalateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Escalar Ticket"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
