import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Building2,
  Clock,
  Key,
  Loader2,
  Shield,
  ShieldCheck,
  Ticket,
} from "lucide-react";

interface Company {
  id: string;
  name: string;
  nit: string;
}

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  companyId: string;
  companyName: string;
  status: string;
}

interface SupportAccessSession {
  id: string;
  sessionNumber: string;
  companyId: string;
  companyName: string;
  status: string;
  scope: string;
  expiresAt: string | null;
  createdAt: string;
}

const scopeLabels: Record<string, string> = {
  read_only: "Solo Lectura",
  read_write: "Lectura y Escritura"
};

const durationOptions = [
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "240", label: "4 horas" },
];

interface SupportAccessRequestDialogProps {
  trigger?: React.ReactNode;
  preselectedCompanyId?: string;
  preselectedTicketId?: string;
}

export default function SupportAccessRequestDialog({
  trigger,
  preselectedCompanyId,
  preselectedTicketId,
}: SupportAccessRequestDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [companyId, setCompanyId] = useState(preselectedCompanyId || "");
  const [justification, setJustification] = useState("");
  const [scope, setScope] = useState<string>("read_only");
  const [relatedTicketId, setRelatedTicketId] = useState(preselectedTicketId || "");
  const [requestedDurationMinutes, setRequestedDurationMinutes] = useState("60");

  const { data: companies = [], isLoading: isLoadingCompanies } = useQuery<Company[]>({
    queryKey: ['/api/companies'],
    enabled: open && (user?.role === 'superadmin' || user?.role === 'soporte'),
  });

  const { data: tickets = [], isLoading: isLoadingTickets } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support-tickets'],
    enabled: open && (user?.role === 'superadmin' || user?.role === 'soporte'),
  });

  const filteredTickets = companyId
    ? tickets.filter(t => t.companyId === companyId && t.status !== 'cerrado')
    : tickets.filter(t => t.status !== 'cerrado');

  const requestMutation = useMutation({
    mutationFn: async (data: {
      companyId: string;
      justification: string;
      scope: string;
      relatedTicketId?: string;
      requestedDurationMinutes: number;
    }) => {
      return await apiRequest('POST', '/api/support-access/request', data);
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/support-access'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support-access/my-sessions'] });
      
      toast({
        title: "Solicitud enviada",
        description: `Sesión ${data.sessionNumber} creada. El cliente será notificado y debe aprobar su acceso.`,
      });
      
      resetForm();
      setOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error al solicitar acceso",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    if (!preselectedCompanyId) setCompanyId("");
    if (!preselectedTicketId) setRelatedTicketId("");
    setJustification("");
    setScope("read_only");
    setRequestedDurationMinutes("60");
  };

  const handleSubmit = () => {
    if (!companyId || !justification.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Debe seleccionar una empresa e indicar la justificación",
        variant: "destructive",
      });
      return;
    }

    requestMutation.mutate({
      companyId,
      justification: justification.trim(),
      scope,
      relatedTicketId: relatedTicketId && relatedTicketId !== "none" ? relatedTicketId : undefined,
      requestedDurationMinutes: parseInt(requestedDurationMinutes),
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      if (preselectedCompanyId) setCompanyId(preselectedCompanyId);
      if (preselectedTicketId) setRelatedTicketId(preselectedTicketId);
    } else {
      resetForm();
    }
  };

  if (user?.role !== 'superadmin' && user?.role !== 'soporte') {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" data-testid="button-request-access">
            <Key className="h-4 w-4 mr-2" />
            Solicitar Acceso
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-testid="dialog-request-access">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Solicitar Acceso a Datos de Empresa
          </DialogTitle>
          <DialogDescription>
            Complete este formulario para solicitar acceso temporal a los datos de una empresa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="company-select">
              Empresa <span className="text-destructive">*</span>
            </Label>
            {isLoadingCompanies ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando empresas...
              </div>
            ) : (
              <Select 
                value={companyId} 
                onValueChange={setCompanyId}
                disabled={!!preselectedCompanyId}
              >
                <SelectTrigger data-testid="select-company">
                  <SelectValue placeholder="Seleccione una empresa" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {companies.map((company) => (
                      <SelectItem 
                        key={company.id} 
                        value={company.id}
                        data-testid={`option-company-${company.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span>{company.name}</span>
                          <span className="text-xs text-muted-foreground">({company.nit})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="justification">
              Justificación <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="justification"
              placeholder="Explique por qué necesita acceder a los datos de esta empresa..."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={3}
              data-testid="textarea-justification"
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 10 caracteres. Esta justificación será visible para el cliente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scope-select">Alcance del acceso</Label>
              <Select value={scope} onValueChange={setScope}>
                <SelectTrigger data-testid="select-scope">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read_only" data-testid="option-scope-read-only">
                    {scopeLabels.read_only}
                  </SelectItem>
                  <SelectItem value="read_write" data-testid="option-scope-read-write">
                    {scopeLabels.read_write}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration-select">Duración solicitada</Label>
              <Select value={requestedDurationMinutes} onValueChange={setRequestedDurationMinutes}>
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={option.value}
                      data-testid={`option-duration-${option.value}`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ticket-select">
              Ticket relacionado <span className="text-muted-foreground">(opcional)</span>
            </Label>
            {isLoadingTickets ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando tickets...
              </div>
            ) : (
              <Select 
                value={relatedTicketId} 
                onValueChange={setRelatedTicketId}
              >
                <SelectTrigger data-testid="select-ticket">
                  <SelectValue placeholder="Vincular a un ticket (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" data-testid="option-ticket-none">
                    Sin ticket relacionado
                  </SelectItem>
                  <ScrollArea className="h-[150px]">
                    {filteredTickets.map((ticket) => (
                      <SelectItem 
                        key={ticket.id} 
                        value={ticket.id}
                        data-testid={`option-ticket-${ticket.id}`}
                      >
                        <div className="flex items-center gap-2">
                          <Ticket className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-xs">{ticket.ticketNumber}</span>
                          <span className="text-xs truncate max-w-[200px]">{ticket.subject}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 dark:text-yellow-400">
                  Notificación al cliente
                </p>
                <p className="text-yellow-700 dark:text-yellow-500 mt-1">
                  El administrador de la empresa será notificado de esta solicitud y deberá 
                  aprobar su acceso antes de que pueda ver los datos. Todas las acciones 
                  quedarán registradas en el log de auditoría.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={requestMutation.isPending}
            data-testid="button-cancel-request"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={requestMutation.isPending || !companyId || justification.trim().length < 10}
            data-testid="button-submit-request"
          >
            {requestMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Enviar Solicitud
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ActiveAccessIndicatorProps {
  className?: string;
}

export function ActiveAccessIndicator({ className }: ActiveAccessIndicatorProps) {
  const { user } = useAuth();

  const { data: mySessions = [] } = useQuery<SupportAccessSession[]>({
    queryKey: ['/api/support-access/my-sessions'],
    enabled: user?.role === 'superadmin' || user?.role === 'soporte',
    refetchInterval: 60000,
  });

  const activeSessions = mySessions.filter(
    s => s.status === 'approved' && s.expiresAt && new Date(s.expiresAt) > new Date()
  );
  const pendingSessions = mySessions.filter(s => s.status === 'pending');

  if (activeSessions.length === 0 && pendingSessions.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`} data-testid="indicator-active-access">
      {activeSessions.length > 0 && (
        <Badge 
          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          data-testid="badge-active-sessions"
        >
          <ShieldCheck className="h-3 w-3 mr-1" />
          {activeSessions.length} activo{activeSessions.length !== 1 ? 's' : ''}
        </Badge>
      )}
      {pendingSessions.length > 0 && (
        <Badge 
          className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
          data-testid="badge-pending-sessions"
        >
          <Clock className="h-3 w-3 mr-1" />
          {pendingSessions.length} pendiente{pendingSessions.length !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
}
