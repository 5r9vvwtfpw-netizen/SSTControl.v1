import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Shield, Building2 } from "lucide-react";
import { Company } from "@shared/schema";

type AccessReason = 
  | "soporte_tecnico"
  | "mantenimiento"
  | "auditoria_interna"
  | "verificacion_datos"
  | "configuracion"
  | "capacitacion"
  | "migracion"
  | "backup"
  | "otro";

const ACCESS_REASONS: { value: AccessReason; label: string; description: string }[] = [
  { value: "soporte_tecnico", label: "Soporte Técnico", description: "Resolución de incidencia técnica reportada" },
  { value: "mantenimiento", label: "Mantenimiento", description: "Mantenimiento preventivo o correctivo del sistema" },
  { value: "auditoria_interna", label: "Auditoría Interna", description: "Auditoría interna del proveedor SaaS" },
  { value: "verificacion_datos", label: "Verificación de Datos", description: "Verificación de integridad de datos" },
  { value: "configuracion", label: "Configuración", description: "Configuración o ajuste del sistema" },
  { value: "capacitacion", label: "Capacitación", description: "Sesión de capacitación al cliente" },
  { value: "migracion", label: "Migración", description: "Migración de datos" },
  { value: "backup", label: "Respaldo", description: "Respaldo de datos" },
  { value: "otro", label: "Otro", description: "Otro motivo documentado" },
];

interface ProviderAccessDialogProps {
  open: boolean;
  company: Company | null;
  onConfirm: (reason: AccessReason, description: string, ticketNumber?: string) => void;
  onCancel: () => void;
}

export function ProviderAccessDialog({
  open,
  company,
  onConfirm,
  onCancel,
}: ProviderAccessDialogProps) {
  const [reason, setReason] = useState<AccessReason | "">("");
  const [description, setDescription] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!reason || !description.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onConfirm(reason, description.trim(), ticketNumber.trim() || undefined);
      setReason("");
      setDescription("");
      setTicketNumber("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setReason("");
    setDescription("");
    setTicketNumber("");
    onCancel();
  };

  const isValid = reason && description.trim().length >= 10;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Registro de Acceso - Ley 1581/2012
          </DialogTitle>
          <DialogDescription>
            Conforme al principio de transparencia de la Ley 1581/2012, debe documentar el motivo de su acceso a los datos de la empresa cliente.
          </DialogDescription>
        </DialogHeader>

        {company && (
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="font-medium">{company.name}</p>
              {company.nit && (
                <p className="text-sm text-muted-foreground">NIT: {company.nit}</p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="reason">Motivo del acceso *</Label>
            <Select value={reason} onValueChange={(v) => setReason(v as AccessReason)}>
              <SelectTrigger data-testid="select-access-reason">
                <SelectValue placeholder="Seleccione el motivo" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value} data-testid={`option-reason-${r.value}`}>
                    <div className="flex flex-col">
                      <span>{r.label}</span>
                      <span className="text-xs text-muted-foreground">{r.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descripción detallada * (mínimo 10 caracteres)</Label>
            <Textarea
              id="description"
              data-testid="input-access-description"
              placeholder="Describa el propósito específico del acceso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ticketNumber">Número de ticket (opcional)</Label>
            <Input
              id="ticketNumber"
              data-testid="input-ticket-number"
              placeholder="Ej: TKT-2024-001"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-amber-800 dark:text-amber-200">
            Este acceso quedará registrado en el sistema de auditoría y será visible para los administradores de la empresa cliente conforme al derecho de acceso establecido en la Ley 1581/2012.
          </p>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            data-testid="button-cancel-access"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={!isValid || isSubmitting}
            data-testid="button-confirm-access"
          >
            {isSubmitting ? "Registrando..." : "Confirmar Acceso"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
