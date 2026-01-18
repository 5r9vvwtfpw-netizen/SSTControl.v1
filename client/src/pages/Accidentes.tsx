import { AccidentCard } from "@/components/AccidentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, X, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { format } from "date-fns";

const ACCIDENT_TYPES = [
  { value: "caida", label: "Caída (mismo nivel o altura)" },
  { value: "golpe", label: "Golpe con/contra objeto" },
  { value: "corte", label: "Corte o punzamiento" },
  { value: "atrapamiento", label: "Atrapamiento" },
  { value: "quemadura", label: "Quemadura (térmica o química)" },
  { value: "intoxicacion", label: "Intoxicación" },
  { value: "electrocucion", label: "Electrocución" },
  { value: "otro", label: "Otro (especificar)" },
];

const LOCATION_OPTIONS = [
  { value: "area_produccion", label: "Área de producción" },
  { value: "bodega_almacen", label: "Bodega / Almacén" },
  { value: "oficinas", label: "Oficinas administrativas" },
  { value: "zona_carga", label: "Zona de carga/descarga" },
  { value: "parqueadero", label: "Parqueadero" },
  { value: "escaleras", label: "Escaleras" },
  { value: "pasillos", label: "Pasillos / Corredores" },
  { value: "banos", label: "Baños" },
  { value: "comedor_cafeteria", label: "Comedor / Cafetería" },
  { value: "exterior", label: "Área exterior" },
  { value: "vehiculo", label: "En vehículo" },
  { value: "desplazamiento", label: "En desplazamiento laboral" },
  { value: "otro", label: "Otro (especificar)" },
];
import { useQuery, useMutation } from "@tanstack/react-query";
import { Accident, Worker, Company, insertAccidentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaAccidentes = [
  {
    codigo: 'DEC-1072-2.2.4.6.32',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.32',
    descripcion: 'Investigación de incidentes, accidentes de trabajo y enfermedades laborales',
    requisitos: [
      'Investigar todos los incidentes y accidentes de trabajo',
      'Determinar causas básicas e inmediatas',
      'Identificar y documentar deficiencias del SG-SST',
      'Comunicar resultados a trabajadores y COPASST',
      'Implementar medidas correctivas y preventivas'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-3.2',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 3.2',
    descripcion: 'Investigación de accidentes, incidentes y enfermedades laborales',
    requisitos: [
      'Registro y análisis estadístico de accidentes',
      'Investigación con participación del COPASST',
      'Implementación de acciones correctivas',
      'Seguimiento a medidas implementadas'
    ],
    obligatorio: true
  }
];

export default function Accidentes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWitnesses, setSelectedWitnesses] = useState<string[]>([]);
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isGlobalAdmin = user?.role ? hasGlobalAccess(user.role) : false;

  const [formData, setFormData] = useState({
    companyId: "",
    workerId: "",
    type: "caida",
    customType: "",
    description: "",
    severity: "leve" as const,
    date: format(new Date(), "yyyy-MM-dd"),
    time: format(new Date(), "HH:mm"),
    location: "",
    customLocation: "",
    actionsTaken: "",
  });

  // Actualizar fecha, hora y companyId cuando se abre el diálogo
  useEffect(() => {
    if (dialogOpen) {
      setFormData(prev => ({
        ...prev,
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        companyId: user?.companyId || "",
      }));
    }
  }, [dialogOpen, user?.companyId]);

  const { data: accidents = [], isLoading: accidentsLoading } = useQuery<Accident[]>({
    queryKey: ["/api/accidents"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isGlobalAdmin,
  });

  const createAccidentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertAccidentSchema>) => {
      const payload = isGlobalAdmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/accidents", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      setSelectedWitnesses([]);
      setFormData({
        companyId: "",
        workerId: "",
        type: "caida",
        customType: "",
        description: "",
        severity: "leve",
        date: format(new Date(), "yyyy-MM-dd"),
        time: format(new Date(), "HH:mm"),
        location: "",
        customLocation: "",
        actionsTaken: "",
      });
      toast({
        title: "Accidente registrado",
        description: "El accidente se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGlobalAdmin && !formData.companyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.workerId) {
      toast({
        title: "Error",
        description: "Debe seleccionar un trabajador afectado",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.location) {
      toast({
        title: "Error",
        description: "Debe seleccionar la ubicación del accidente",
        variant: "destructive",
      });
      return;
    }
    
    const witnessesStr = selectedWitnesses.length > 0 
      ? workers.filter(w => selectedWitnesses.includes(w.id))
          .map(w => `${w.name} - ${w.position}`)
          .join(", ")
      : undefined;

    const finalLocation = formData.location === "otro" && formData.customLocation 
      ? formData.customLocation 
      : getLocationLabel(formData.location);

    createAccidentMutation.mutate({
      ...formData,
      location: finalLocation,
      customType: formData.type === "otro" ? formData.customType : undefined,
      witnesses: witnessesStr,
      actionsTaken: formData.actionsTaken || undefined,
    });
  };

  const getAccidentTypeLabel = (type: string) => {
    const found = ACCIDENT_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  const getLocationLabel = (location: string) => {
    const found = LOCATION_OPTIONS.find(l => l.value === location);
    return found ? found.label : location;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const filteredAccidents = accidents.filter((accident) => {
    const worker = workers.find(w => w.id === accident.workerId);
    const displayType = accident.type === "otro" && accident.customType ? accident.customType : getAccidentTypeLabel(accident.type);
    
    const matchesSearch = displayType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker?.name.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesSeverity = severityFilter === "todos" || accident.severity === severityFilter;
    
    return matchesSearch && matchesSeverity;
  });

  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    
    // Always show the link first, then validate in background
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        {lastPlanTrabajoId ? (
          <Link 
            href={`/planes-trabajo-anual/${lastPlanTrabajoId}?tab=mensual${lastCronogramaMes ? `&mes=${lastCronogramaMes}` : ''}`} 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al cronograma
            <CalendarDays className="h-4 w-4" />
          </Link>
        ) : (
          <Link 
            href="/planes-trabajo-anual" 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al Plan Anual
            <CalendarDays className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Accidentes e Incidentes</h1>
          <p className="text-muted-foreground">Registro y seguimiento de accidentes laborales</p>
        </div>
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-accident">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Accidente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Accidente</DialogTitle>
                <DialogDescription>Complete los datos del accidente</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {isGlobalAdmin && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="companyId">Empresa *</Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                      >
                        <SelectTrigger id="companyId" data-testid="select-company">
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="workerId">Trabajador Afectado</Label>
                    <Select
                      value={formData.workerId}
                      onValueChange={(value) => {
                        console.log("[Accidentes] Worker selected:", value);
                        setFormData(prev => ({ ...prev, workerId: value }));
                      }}
                    >
                      <SelectTrigger id="workerId" data-testid="select-worker">
                        <SelectValue placeholder="Seleccionar trabajador">
                          {formData.workerId && workers.find(w => w.id === formData.workerId)
                            ? `${workers.find(w => w.id === formData.workerId)?.name} - ${workers.find(w => w.id === formData.workerId)?.position}`
                            : "Seleccionar trabajador"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Accidente</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger id="type" data-testid="select-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACCIDENT_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.type === "otro" && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="customType">Especificar Tipo</Label>
                      <Input
                        id="customType"
                        value={formData.customType}
                        onChange={(e) => setFormData({ ...formData, customType: e.target.value })}
                        required={formData.type === "otro"}
                        placeholder="Ej: Caída desde altura"
                        data-testid="input-custom-type"
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="severity">Gravedad</Label>
                    <Select
                      value={formData.severity}
                      onValueChange={(value: any) => setFormData({ ...formData, severity: value })}
                    >
                      <SelectTrigger id="severity" data-testid="select-severity">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="grave">Grave</SelectItem>
                        <SelectItem value="mortal">Mortal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                      data-testid="input-time"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación</Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger id="location" data-testid="select-location">
                        <SelectValue placeholder="Seleccione ubicación" />
                      </SelectTrigger>
                      <SelectContent>
                        {LOCATION_OPTIONS.map((loc) => (
                          <SelectItem key={loc.value} value={loc.value}>
                            {loc.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.location === "otro" && (
                    <div className="space-y-2">
                      <Label htmlFor="customLocation">Especificar Ubicación</Label>
                      <Input
                        id="customLocation"
                        value={formData.customLocation}
                        onChange={(e) => setFormData({ ...formData, customLocation: e.target.value })}
                        required={formData.location === "otro"}
                        placeholder="Ej: Taller de mantenimiento"
                        data-testid="input-custom-location"
                      />
                    </div>
                  )}
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="description">Descripción del Accidente</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      placeholder="Describa cómo ocurrió el accidente"
                      data-testid="input-description"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Testigos (opcional)</Label>
                    <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2" data-testid="checkbox-group-witnesses">
                      {workers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No hay trabajadores disponibles</p>
                      ) : (
                        workers.map((worker) => (
                          <div key={worker.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`witness-${worker.id}`}
                              checked={selectedWitnesses.includes(worker.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedWitnesses([...selectedWitnesses, worker.id]);
                                } else {
                                  setSelectedWitnesses(selectedWitnesses.filter(id => id !== worker.id));
                                }
                              }}
                              data-testid={`checkbox-witness-${worker.id}`}
                            />
                            <Label htmlFor={`witness-${worker.id}`} className="cursor-pointer font-normal">
                              {worker.name} - {worker.position}
                            </Label>
                          </div>
                        ))
                      )}
                    </div>
                    {selectedWitnesses.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedWitnesses.map((witnessId) => {
                          const worker = workers.find(w => w.id === witnessId);
                          return worker ? (
                            <Badge key={witnessId} variant="secondary" className="gap-1">
                              {worker.name} - {worker.position}
                              <X 
                                className="h-3 w-3 cursor-pointer" 
                                onClick={() => setSelectedWitnesses(selectedWitnesses.filter(id => id !== witnessId))}
                              />
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="actionsTaken">Acciones Tomadas (opcional)</Label>
                    <Textarea
                      id="actionsTaken"
                      value={formData.actionsTaken}
                      onChange={(e) => setFormData({ ...formData, actionsTaken: e.target.value })}
                      placeholder="Describa las acciones inmediatas tomadas"
                      data-testid="input-actions-taken"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createAccidentMutation.isPending} data-testid="button-submit-accident">
                    {createAccidentMutation.isPending ? "Registrando..." : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <AutomationAssistant
        titulo="Investigación de Accidentes"
        estandar="2.3.1"
        descripcion="Gestión de investigación de accidentes e incidentes de trabajo"
        normativaAplicable={normativaAccidentes}
        compact={true}
      />

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar accidentes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-accidents"
          />
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-severity-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Gravedad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las gravedades</SelectItem>
            <SelectItem value="leve">Leve</SelectItem>
            <SelectItem value="grave">Grave</SelectItem>
            <SelectItem value="mortal">Mortal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {accidentsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando accidentes...</p>
        </div>
      ) : filteredAccidents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron accidentes</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccidents.map((accident) => {
            const worker = workers.find(w => w.id === accident.workerId);
            const displayType = accident.type === "otro" && accident.customType 
              ? accident.customType 
              : getAccidentTypeLabel(accident.type);
            
            return (
              <AccidentCard
                key={accident.id}
                id={accident.id}
                type={displayType}
                description={accident.description}
                severity={accident.severity}
                date={formatDate(accident.date)}
                time={accident.time}
                worker={worker?.name || "Desconocido"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
