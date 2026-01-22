import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { 
  Loader2, 
  UserCheck, 
  Sparkles,
  CheckCircle,
  User,
  Search,
  CalendarIcon
} from "lucide-react";

import type { Worker } from "@shared/schema";

interface SstResponsible {
  licenciaSstNumero?: string | null;
  licenciaSstVigencia?: string | null;
}

const PARTICIPANT_ROLES = [
  { value: "investigador_lider", label: "Investigador Líder" },
  { value: "copasst", label: "Miembro COPASST/Vigía" },
  { value: "profesional_sst", label: "Profesional SST (Licenciado)" },
  { value: "testigo", label: "Testigo del Evento" },
  { value: "jefe_inmediato", label: "Jefe Inmediato" },
  { value: "trabajador_afectado", label: "Trabajador Afectado" },
  { value: "brigadista", label: "Brigadista de Emergencia" },
  { value: "otro", label: "Otro" },
];

const participantFormSchema = z.object({
  participantName: z.string().min(1, "El nombre es requerido"),
  participantRole: z.string().min(1, "Seleccione un rol"),
  participantDocument: z.string().optional(),
  participantArea: z.string().optional(),
  participantPosition: z.string().optional(),
  hasLicense: z.boolean().default(false),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
  participationDate: z.string().optional(),
  observations: z.string().optional(),
});

type ParticipantFormData = z.infer<typeof participantFormSchema>;

interface ParticipantDialogEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investigationId: string | null;
  workers: Worker[];
  sstResponsibles: SstResponsible[];
}

export function ParticipantDialogEnhanced({ 
  open, 
  onOpenChange, 
  investigationId,
  workers,
  sstResponsibles
}: ParticipantDialogEnhancedProps) {
  const { toast } = useToast();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [participationDateOpen, setParticipationDateOpen] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const participantForm = useForm<ParticipantFormData>({
    resolver: zodResolver(participantFormSchema),
    defaultValues: {
      participantName: "",
      participantRole: "",
      participantDocument: "",
      participantArea: "",
      participantPosition: "",
      hasLicense: false,
      licenseNumber: "",
      licenseExpiry: "",
      participationDate: getTodayDate(),
      observations: "",
    },
  });

  const createParticipantMutation = useMutation({
    mutationFn: async (data: ParticipantFormData & { investigationId: string }) => {
      const { investigationId: invId, hasLicense, licenseExpiry, licenseNumber, ...rest } = data;
      const payload = {
        ...rest,
        hasLicense: hasLicense ? 1 : 0,
        licenseNumber: licenseNumber || null,
        licenseExpiry: licenseExpiry || null,
      };
      const res = await apiRequest("POST", `/api/investigations/${invId}/participants`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/investigations"] });
      onOpenChange(false);
      participantForm.reset();
      setSelectedWorkerId(null);
      setIsAutoFilled(false);
      toast({
        title: "Participante agregado",
        description: "El participante ha sido registrado en la investigación",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ParticipantFormData) => {
    if (!investigationId) return;
    createParticipantMutation.mutate({ ...data, investigationId });
  };

  const handleWorkerSelect = (workerId: string) => {
    const worker = workers.find((w: Worker) => String(w.id) === workerId);
    if (worker) {
      setSelectedWorkerId(workerId);
      setIsAutoFilled(true);
      
      participantForm.setValue("participantName", worker.name || "");
      participantForm.setValue("participantDocument", worker.identificationNumber || "");
      participantForm.setValue("participantPosition", worker.position || "");
      participantForm.setValue("participantArea", worker.department || "");
      
      toast({
        title: "Datos cargados",
        description: `Se han llenado los datos de ${worker.name}`,
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedWorkerId(null);
    setIsAutoFilled(false);
    participantForm.reset({
      participantName: "",
      participantRole: "",
      participantDocument: "",
      participantArea: "",
      participantPosition: "",
      hasLicense: false,
      licenseNumber: "",
      licenseExpiry: "",
      participationDate: getTodayDate(),
      observations: "",
    });
  };

  useEffect(() => {
    if (open) {
      participantForm.reset({
        participantName: "",
        participantRole: "",
        participantDocument: "",
        participantArea: "",
        participantPosition: "",
        hasLicense: false,
        licenseNumber: "",
        licenseExpiry: "",
        participationDate: getTodayDate(),
        observations: "",
      });
      setSelectedWorkerId(null);
      setIsAutoFilled(false);
      setSearchTerm("");
    }
  }, [open]);

  const activeWorkers = workers.filter((w: Worker) => w.status === "activo");
  const filteredWorkers = searchTerm 
    ? activeWorkers.filter((w: Worker) => 
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.identificationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : activeWorkers;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            Agregar Participante
          </DialogTitle>
          <DialogDescription>
            Seleccione un trabajador para auto-completar los datos automáticamente
          </DialogDescription>
        </DialogHeader>

        <Form {...participantForm}>
          <form onSubmit={participantForm.handleSubmit(handleSubmit)} className="space-y-4">
            
            <div className={`p-4 rounded-lg border-2 transition-all ${
              isAutoFilled 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700" 
                : "bg-muted/50 border-muted"
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {isAutoFilled ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <User className="h-5 w-5 text-muted-foreground" />
                  )}
                  <FormLabel className="text-sm font-medium">
                    {isAutoFilled ? "Trabajador Seleccionado" : "Seleccionar Trabajador"}
                  </FormLabel>
                </div>
                {isAutoFilled && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearSelection}
                    className="text-xs"
                  >
                    Cambiar
                  </Button>
                )}
              </div>

              {!isAutoFilled ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o documento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                      data-testid="input-search-worker-enhanced"
                    />
                  </div>
                  <Select onValueChange={handleWorkerSelect}>
                    <SelectTrigger data-testid="select-worker-autofill-enhanced">
                      <SelectValue placeholder="Seleccione un trabajador..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredWorkers.length === 0 ? (
                        <div className="p-2 text-sm text-muted-foreground text-center">
                          No se encontraron trabajadores
                        </div>
                      ) : (
                        filteredWorkers.map((worker: Worker) => (
                          <SelectItem key={worker.id} value={String(worker.id)}>
                            <div className="flex items-center gap-2">
                              <UserCheck className="h-4 w-4 text-emerald-600" />
                              <span>{worker.name}</span>
                              <span className="text-muted-foreground">- {worker.identificationNumber}</span>
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Al seleccionar, los campos se llenarán automáticamente
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-800 rounded-md">
                  <div className="h-10 w-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">{participantForm.watch("participantName")}</p>
                    <p className="text-sm text-muted-foreground">
                      {participantForm.watch("participantDocument")} • {participantForm.watch("participantPosition")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
                    Auto-llenado
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={participantForm.control}
                name="participantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Nombre del Participante *
                      {isAutoFilled && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Nombre completo" 
                        disabled={isAutoFilled}
                        className={isAutoFilled ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}
                        data-testid="input-participant-name-enhanced" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={participantForm.control}
                name="participantRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol en la Investigación *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-participant-role-enhanced">
                          <SelectValue placeholder="Seleccione rol" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PARTICIPANT_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={participantForm.control}
                name="participantDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Documento
                      {isAutoFilled && field.value && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="CC o CE" 
                        disabled={isAutoFilled}
                        className={isAutoFilled ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}
                        data-testid="input-participant-doc-enhanced" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={participantForm.control}
                name="participantArea"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      Área
                      {isAutoFilled && field.value && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Área o departamento" 
                        disabled={isAutoFilled}
                        className={isAutoFilled ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}
                        data-testid="input-participant-area-enhanced" 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={participantForm.control}
              name="participantPosition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    Cargo
                    {isAutoFilled && field.value && <CheckCircle className="h-3 w-3 text-emerald-500" />}
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Cargo o posición" 
                      disabled={isAutoFilled}
                      className={isAutoFilled ? "bg-emerald-50 dark:bg-emerald-900/20" : ""}
                      data-testid="input-participant-position-enhanced" 
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={participantForm.control}
              name="participationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex items-center gap-2">
                    Fecha de Participación
                  </FormLabel>
                  <Popover open={participationDateOpen} onOpenChange={setParticipationDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          data-testid="button-participation-date-picker-enhanced"
                        >
                          {field.value ? (
                            <span>{formatDate(field.value)}</span>
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value + "T00:00:00") : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date.toISOString().split("T")[0]);
                            setParticipationDateOpen(false);
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={participantForm.control}
              name="hasLicense"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked && sstResponsibles.length > 0) {
                          const firstLSO = sstResponsibles[0];
                          if (firstLSO.licenciaSstNumero) {
                            participantForm.setValue("licenseNumber", firstLSO.licenciaSstNumero);
                          }
                          if (firstLSO.licenciaSstVigencia) {
                            const expiryDate = firstLSO.licenciaSstVigencia.split("T")[0];
                            participantForm.setValue("licenseExpiry", expiryDate);
                          }
                        }
                      }}
                      data-testid="checkbox-has-license-enhanced"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Tiene Licencia SST</FormLabel>
                </FormItem>
              )}
            />

            {participantForm.watch("hasLicense") && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <FormField
                  control={participantForm.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Licencia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de licencia" data-testid="input-license-number-enhanced" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={participantForm.control}
                  name="licenseExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Vencimiento</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-license-expiry-enhanced" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={participantForm.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Observaciones adicionales..." data-testid="textarea-participant-obs-enhanced" />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createParticipantMutation.isPending}
                data-testid="button-submit-participant-enhanced"
              >
                {createParticipantMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Agregar Participante
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
