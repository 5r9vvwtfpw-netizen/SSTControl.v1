import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type RegistroInduccion, type Worker, type AfiliacionSsss } from "@shared/schema";
import { Plus, Pencil, Trash2, ClipboardList, FileDown, Settings, Send, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const RESPONSABLES_INDUCCION = [
  { value: "responsable_sgsst", label: "Responsable del SG-SST" },
  { value: "supervisor_area", label: "Supervisor de Área" },
  { value: "jefe_rrhh", label: "Jefe de Recursos Humanos" },
  { value: "coordinador_sst", label: "Coordinador de SST" },
  { value: "medico_ocupacional", label: "Médico Ocupacional" },
  { value: "otro", label: "Otro" },
];

const TIPOS_INDUCCION = [
  { value: "induccion", label: "Inducción General SST", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  { value: "reinduccion", label: "Reinducción Anual", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
];

const getTipoInduccionLabel = (tipo: string) => {
  const found = TIPOS_INDUCCION.find(t => t.value === tipo);
  return found ? found.label : tipo;
};

const getTipoInduccionColor = (tipo: string) => {
  const found = TIPOS_INDUCCION.find(t => t.value === tipo);
  return found ? found.color : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
};

type EvaluationData = Record<string, boolean>;

const SST_ITEMS: string[] = [
  "Conoce la política de SST",
  "Conoce sus derechos y deberes en SST",
  "Conoce el reglamento de higiene",
  "Identifica riesgos de su área",
  "Conoce uso correcto de EPP",
  "Sabe reportar accidentes",
  "Conoce rutas de evacuación",
  "Identifica señalización",
  "Conoce primeros auxilios",
  "Sabe actuar en emergencias",
  "Conoce el COPASST",
  "Identifica riesgos químicos/físicos/biológicos",
  "Conoce medidas de prevención",
  "Sabe reportar condiciones inseguras",
  "Comprende importancia del autocuidado",
];

const SECCION_ITEMS: string[] = [
  "Conoce funciones del cargo",
  "Identifica riesgos del puesto",
  "Conoce procedimientos seguros",
];

const MAQUINAS_ITEMS: string[] = [
  "Conoce maquinaria del área",
  "Sabe operar equipos asignados",
  "Conoce mantenimiento básico",
];

export default function RegistrosInduccionPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<RegistroInduccion | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    workerId: "",
    tipo: "induccion" as "induccion" | "reinduccion",
    fecha: "",
    horaInicio: "",
    duracionMinutos: undefined as number | undefined,
    responsableNombre: "",
    responsableLicencia: "",
    eps: "",
    pension: "",
    arl: "",
    factoresRiesgo: "",
    cargoFuncion: "",
    cargoObjetivo: "",
    cargoProceso: "",
    tieneExperiencia: 0,
    tiempoExperiencia: "",
    observacionesExperiencia: "",
    observaciones: "",
  });

  const [responsableSelect, setResponsableSelect] = useState("");
  const [responsableOtro, setResponsableOtro] = useState("");

  const [evaluacionSst, setEvaluacionSst] = useState<EvaluationData>(
    Object.fromEntries(SST_ITEMS.map((_, i) => [`item${i + 1}`, false]))
  );

  const [evaluacionSeccion, setEvaluacionSeccion] = useState<EvaluationData>(
    Object.fromEntries(SECCION_ITEMS.map((_, i) => [`item${i + 1}`, false]))
  );

  const [evaluacionMaquinas, setEvaluacionMaquinas] = useState<EvaluationData>(
    Object.fromEntries(MAQUINAS_ITEMS.map((_, i) => [`item${i + 1}`, false]))
  );

  const { data: registros = [], isLoading: registrosLoading } = useQuery<RegistroInduccion[]>({
    queryKey: ["/api/registros-induccion"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: afiliaciones = [] } = useQuery<AfiliacionSsss[]>({
    queryKey: ["/api/afiliaciones-ssss"],
  });

  // Ref to track if auto-fill was already done for this worker
  const autoFilledWorkerRef = useRef<string>("");

  // Auto-fill worker data when worker is selected
  useEffect(() => {
    // Skip if no worker selected, editing existing record, or already auto-filled for this worker
    if (!formData.workerId || editingRecord) return;
    if (autoFilledWorkerRef.current === formData.workerId) return;
    
    const fieldsAutoFilled: string[] = [];
    const updates: any = {};
    
    // Get selected worker for position auto-fill
    const selectedWorker = workers.find(w => w.id === formData.workerId);
    if (selectedWorker) {
      // Auto-fill cargoFuncion from worker.position
      if (!formData.cargoFuncion && selectedWorker.position) {
        updates.cargoFuncion = selectedWorker.position;
        fieldsAutoFilled.push("Cargo/Función");
      }
    }
    
    // Find the most recent affiliation for the selected worker
    const workerAfiliaciones = afiliaciones
      .filter(a => a.workerId === formData.workerId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    
    if (workerAfiliaciones.length > 0) {
      const latestAfiliacion = workerAfiliaciones[0];
      
      // Only auto-fill if fields are empty
      if (!formData.eps && latestAfiliacion.epsNombre) {
        updates.eps = latestAfiliacion.epsNombre;
        fieldsAutoFilled.push("EPS");
      }
      if (!formData.pension && latestAfiliacion.afpNombre) {
        updates.pension = latestAfiliacion.afpNombre;
        fieldsAutoFilled.push("Pensión");
      }
      if (!formData.arl && latestAfiliacion.arlNombre) {
        updates.arl = latestAfiliacion.arlNombre;
        fieldsAutoFilled.push("ARL");
      }
    }
    
    // Mark this worker as auto-filled BEFORE updating state to prevent loops
    autoFilledWorkerRef.current = formData.workerId;
    
    if (Object.keys(updates).length > 0) {
      setFormData(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Datos cargados automáticamente",
        description: `Se cargaron: ${fieldsAutoFilled.join(", ")} desde los datos del trabajador`,
        className: "bg-blue-50 border-blue-200",
      });
    }
  }, [formData.workerId, workers, afiliaciones, editingRecord, formData.eps, formData.pension, formData.arl, formData.cargoFuncion, toast]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/registros-induccion", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registros-induccion"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Registro creado",
        description: "El registro de inducción se ha creado exitosamente",
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/registros-induccion/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registros-induccion"] });
      setDialogOpen(false);
      setEditingRecord(null);
      resetForm();
      toast({
        title: "Registro actualizado",
        description: "El registro de inducción se ha actualizado exitosamente",
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

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/registros-induccion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registros-induccion"] });
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      toast({
        title: "Registro eliminado",
        description: "El registro de inducción se ha eliminado exitosamente",
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

  const resetForm = () => {
    setFormData({
      workerId: "",
      tipo: "induccion",
      fecha: "",
      horaInicio: "",
      duracionMinutos: undefined,
      responsableNombre: "",
      responsableLicencia: "",
      eps: "",
      pension: "",
      arl: "",
      factoresRiesgo: "",
      cargoFuncion: "",
      cargoObjetivo: "",
      cargoProceso: "",
      tieneExperiencia: 0,
      tiempoExperiencia: "",
      observacionesExperiencia: "",
      observaciones: "",
    });
    setResponsableSelect("");
    setResponsableOtro("");
    setEvaluacionSst(Object.fromEntries(SST_ITEMS.map((_, i) => [`item${i + 1}`, false])));
    setEvaluacionSeccion(Object.fromEntries(SECCION_ITEMS.map((_, i) => [`item${i + 1}`, false])));
    setEvaluacionMaquinas(Object.fromEntries(MAQUINAS_ITEMS.map((_, i) => [`item${i + 1}`, false])));
    autoFilledWorkerRef.current = ""; // Reset auto-fill tracking ref
  };

  const handleEdit = (record: RegistroInduccion) => {
    setEditingRecord(record);
    setFormData({
      workerId: record.workerId,
      tipo: record.tipo,
      fecha: record.fecha,
      horaInicio: record.horaInicio,
      duracionMinutos: record.duracionMinutos || undefined,
      responsableNombre: record.responsableNombre,
      responsableLicencia: record.responsableLicencia || "",
      eps: record.eps || "",
      pension: record.pension || "",
      arl: record.arl || "",
      factoresRiesgo: record.factoresRiesgo || "",
      cargoFuncion: record.cargoFuncion || "",
      cargoObjetivo: record.cargoObjetivo || "",
      cargoProceso: record.cargoProceso || "",
      tieneExperiencia: record.tieneExperiencia,
      tiempoExperiencia: record.tiempoExperiencia || "",
      observacionesExperiencia: record.observacionesExperiencia || "",
      observaciones: record.observaciones || "",
    });

    // Detectar si el responsable guardado es una opción predefinida
    const esOpcionPredefinida = RESPONSABLES_INDUCCION.some(r => r.value === record.responsableNombre);
    if (esOpcionPredefinida) {
      setResponsableSelect(record.responsableNombre);
      setResponsableOtro("");
    } else {
      setResponsableSelect("otro");
      setResponsableOtro(record.responsableNombre);
    }

    try {
      if (record.evaluacionSst) {
        setEvaluacionSst(JSON.parse(record.evaluacionSst));
      }
      if (record.evaluacionSeccion) {
        setEvaluacionSeccion(JSON.parse(record.evaluacionSeccion));
      }
      if (record.evaluacionMaquinas) {
        setEvaluacionMaquinas(JSON.parse(record.evaluacionMaquinas));
      }
    } catch (e) {
      console.error("Error parsing evaluation data:", e);
    }

    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setRecordToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setDialogOpen(true);
    
    if (plantilla.campos.temas) {
      setFormData(prev => ({
        ...prev,
        observaciones: plantilla.campos.temas,
      }));
    }
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha aplicado la plantilla "${plantilla.nombre}"`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Construir el nombre del responsable final
    let responsableFinal = formData.responsableNombre;
    if (responsableSelect === "otro") {
      responsableFinal = responsableOtro; // Usar el texto libre
    } else if (responsableSelect) {
      responsableFinal = responsableSelect; // Usar la opción seleccionada
    }

    const data = {
      ...formData,
      responsableNombre: responsableFinal,
      evaluacionSst: JSON.stringify(evaluacionSst),
      evaluacionSeccion: JSON.stringify(evaluacionSeccion),
      evaluacionMaquinas: JSON.stringify(evaluacionMaquinas),
    };

    if (editingRecord) {
      updateMutation.mutate({ id: editingRecord.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : workerId;
  };

  const getWorkerPosition = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.position : "";
  };

  if (registrosLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary mb-2">Registros de Inducción</h1>
          <p className="text-muted-foreground">
            Cargando registros...
          </p>
        </div>
      </div>
    );
  }

  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Botón volver a evaluación */}
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
          <h1 className="text-3xl font-bold text-primary mb-2" data-testid="text-page-title">
            Registros de Inducción
          </h1>
          <p className="text-muted-foreground">
            Gestión de inducciones y reinducciones de seguridad y salud en el trabajo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild data-testid="button-configuracion-induccion">
            <Link href="/configuracion-induccion">
              <Settings className="h-4 w-4 mr-2" />
              Inducción Virtual
            </Link>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingRecord(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-registro">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Registro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRecord ? "Editar" : "Nuevo"} Registro de Inducción
              </DialogTitle>
              <DialogDescription>
                Complete el formulario de evaluación de inducción SST
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información General */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ClipboardList className="w-5 h-5" />
                    Información General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="workerId">Trabajador *</Label>
                      <Select
                        value={formData.workerId}
                        onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                        required
                      >
                        <SelectTrigger id="workerId" data-testid="select-worker">
                          <SelectValue placeholder="Seleccione un trabajador" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {worker.identificationNumber}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Inducción *</Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
                      >
                        <SelectTrigger id="tipo" data-testid="select-tipo">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIPOS_INDUCCION.map((tipo) => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fecha">Fecha *</Label>
                      <Input
                        id="fecha"
                        type="date"
                        value={formData.fecha}
                        onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        required
                        data-testid="input-fecha"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="horaInicio">Hora de Inicio *</Label>
                      <Input
                        id="horaInicio"
                        type="time"
                        value={formData.horaInicio}
                        onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                        required
                        data-testid="input-hora"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracionMinutos">Duración (minutos)</Label>
                      <Input
                        id="duracionMinutos"
                        type="number"
                        min="0"
                        value={formData.duracionMinutos || ""}
                        onChange={(e) => setFormData({ ...formData, duracionMinutos: parseInt(e.target.value) || undefined })}
                        placeholder="Ej: 120"
                        data-testid="input-duracion"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="responsableSelect">Responsable de Inducción *</Label>
                      <Select
                        value={responsableSelect}
                        onValueChange={(value) => setResponsableSelect(value)}
                      >
                        <SelectTrigger id="responsableSelect" data-testid="select-responsable">
                          <SelectValue placeholder="Seleccione responsable" />
                        </SelectTrigger>
                        <SelectContent>
                          {RESPONSABLES_INDUCCION.map((resp) => (
                            <SelectItem key={resp.value} value={resp.value}>
                              {resp.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {responsableSelect === "otro" && (
                      <div className="space-y-2">
                        <Label htmlFor="responsableOtro">Nombre del Responsable *</Label>
                        <Input
                          id="responsableOtro"
                          value={responsableOtro}
                          onChange={(e) => setResponsableOtro(e.target.value)}
                          required
                          placeholder="Nombre completo del responsable"
                          data-testid="input-responsable-otro"
                        />
                      </div>
                    )}

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="responsableLicencia">Licencia SO del Responsable</Label>
                      <Input
                        id="responsableLicencia"
                        value={formData.responsableLicencia}
                        onChange={(e) => setFormData({ ...formData, responsableLicencia: e.target.value })}
                        placeholder="Número de licencia en salud ocupacional"
                        data-testid="input-licencia"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eps">EPS</Label>
                      <Input
                        id="eps"
                        value={formData.eps}
                        onChange={(e) => setFormData({ ...formData, eps: e.target.value })}
                        placeholder="Entidad Promotora de Salud"
                        data-testid="input-eps"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pension">Pensión</Label>
                      <Input
                        id="pension"
                        value={formData.pension}
                        onChange={(e) => setFormData({ ...formData, pension: e.target.value })}
                        placeholder="Fondo de Pensiones"
                        data-testid="input-pension"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="arl">ARL</Label>
                      <Input
                        id="arl"
                        value={formData.arl}
                        onChange={(e) => setFormData({ ...formData, arl: e.target.value })}
                        placeholder="Administradora de Riesgos Laborales"
                        data-testid="input-arl"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluación SST */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evaluación SST (15 ítems)</CardTitle>
                  <CardDescription>
                    Marque Sí o No para cada ítem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SST_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{index + 1}. {item}</p>
                      </div>
                      <RadioGroup
                        value={evaluacionSst[`item${index + 1}`] ? "si" : "no"}
                        onValueChange={(value) => {
                          setEvaluacionSst({
                            ...evaluacionSst,
                            [`item${index + 1}`]: value === "si",
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id={`sst-si-${index}`} data-testid={`radio-sst-${index}-si`} />
                          <Label htmlFor={`sst-si-${index}`} className="cursor-pointer">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`sst-no-${index}`} data-testid={`radio-sst-${index}-no`} />
                          <Label htmlFor={`sst-no-${index}`} className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Evaluación de Sección */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reconocimiento de la Sección (3 ítems)</CardTitle>
                  <CardDescription>
                    Marque Sí o No para cada ítem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {SECCION_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{index + 1}. {item}</p>
                      </div>
                      <RadioGroup
                        value={evaluacionSeccion[`item${index + 1}`] ? "si" : "no"}
                        onValueChange={(value) => {
                          setEvaluacionSeccion({
                            ...evaluacionSeccion,
                            [`item${index + 1}`]: value === "si",
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id={`sec-si-${index}`} data-testid={`radio-sec-${index}-si`} />
                          <Label htmlFor={`sec-si-${index}`} className="cursor-pointer">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`sec-no-${index}`} data-testid={`radio-sec-${index}-no`} />
                          <Label htmlFor={`sec-no-${index}`} className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Factores de Riesgo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Factores de Riesgo Identificados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.factoresRiesgo}
                    onChange={(e) => setFormData({ ...formData, factoresRiesgo: e.target.value })}
                    placeholder="Describa los factores de riesgo identificados en el área de trabajo"
                    rows={4}
                    data-testid="input-factores-riesgo"
                  />
                </CardContent>
              </Card>

              {/* Evaluación de Maquinaria */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conocimiento en Maquinaria y Equipos (3 ítems)</CardTitle>
                  <CardDescription>
                    Marque Sí o No para cada ítem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {MAQUINAS_ITEMS.map((item, index) => (
                    <div key={index} className="flex items-start gap-4 p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm">{index + 1}. {item}</p>
                      </div>
                      <RadioGroup
                        value={evaluacionMaquinas[`item${index + 1}`] ? "si" : "no"}
                        onValueChange={(value) => {
                          setEvaluacionMaquinas({
                            ...evaluacionMaquinas,
                            [`item${index + 1}`]: value === "si",
                          });
                        }}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="si" id={`maq-si-${index}`} data-testid={`radio-maq-${index}-si`} />
                          <Label htmlFor={`maq-si-${index}`} className="cursor-pointer">Sí</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`maq-no-${index}`} data-testid={`radio-maq-${index}-no`} />
                          <Label htmlFor={`maq-no-${index}`} className="cursor-pointer">No</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Explicación del Cargo */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Explicación del Cargo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargoFuncion">Función del Cargo</Label>
                    <Textarea
                      id="cargoFuncion"
                      value={formData.cargoFuncion}
                      onChange={(e) => setFormData({ ...formData, cargoFuncion: e.target.value })}
                      placeholder="Describa las funciones principales del cargo"
                      rows={3}
                      data-testid="input-cargo-funcion"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargoObjetivo">Objetivo del Cargo</Label>
                    <Textarea
                      id="cargoObjetivo"
                      value={formData.cargoObjetivo}
                      onChange={(e) => setFormData({ ...formData, cargoObjetivo: e.target.value })}
                      placeholder="Describa el objetivo principal del cargo"
                      rows={2}
                      data-testid="input-cargo-objetivo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargoProceso">Proceso del Cargo</Label>
                    <Textarea
                      id="cargoProceso"
                      value={formData.cargoProceso}
                      onChange={(e) => setFormData({ ...formData, cargoProceso: e.target.value })}
                      placeholder="Describa el proceso al que pertenece el cargo"
                      rows={2}
                      data-testid="input-cargo-proceso"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Experiencia del Trabajador */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experiencia del Trabajador</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>¿Tiene experiencia previa en el cargo?</Label>
                    <RadioGroup
                      value={formData.tieneExperiencia.toString()}
                      onValueChange={(value) => setFormData({ ...formData, tieneExperiencia: parseInt(value) })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="exp-si" data-testid="radio-exp-si" />
                        <Label htmlFor="exp-si" className="cursor-pointer">Sí</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="exp-no" data-testid="radio-exp-no" />
                        <Label htmlFor="exp-no" className="cursor-pointer">No</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.tieneExperiencia === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="tiempoExperiencia">Tiempo de Experiencia</Label>
                        <Input
                          id="tiempoExperiencia"
                          value={formData.tiempoExperiencia}
                          onChange={(e) => setFormData({ ...formData, tiempoExperiencia: e.target.value })}
                          placeholder="Ej: 2 años, 6 meses"
                          data-testid="input-tiempo-experiencia"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="observacionesExperiencia">Observaciones sobre Experiencia</Label>
                        <Textarea
                          id="observacionesExperiencia"
                          value={formData.observacionesExperiencia}
                          onChange={(e) => setFormData({ ...formData, observacionesExperiencia: e.target.value })}
                          placeholder="Detalles adicionales sobre la experiencia"
                          rows={3}
                          data-testid="input-obs-experiencia"
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Observaciones Generales */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Observaciones Generales</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    placeholder="Observaciones adicionales sobre la inducción"
                    rows={4}
                    data-testid="input-observaciones"
                  />
                </CardContent>
              </Card>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Guardando..." : editingRecord ? "Actualizar" : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('1.2.2');
        if (!estandar) return null;
        
        const temasObligatorios = estandar.camposSugeridos.find(c => c.campo === 'temasObligatorios');
        const camposSugeridos = temasObligatorios ? [{
          campo: 'temasObligatorios',
          valor: temasObligatorios.valorSugerido || '',
          normativaReferencia: 'Decreto 1072/2015, Art. 2.2.4.6.11'
        }] : [];

        const plantillasInduccion: PlantillaInfo[] = temasObligatorios ? [{
          id: 'induccion-temas-obligatorios',
          nombre: 'Temas Obligatorios de Inducción SST',
          descripcion: 'Temas mínimos requeridos según Decreto 1072/2015',
          campos: {
            temas: temasObligatorios.valorSugerido || ''
          },
          normativaBase: 'DEC-1072-2.2.4.6.11'
        }] : [];

        return (
          <AutomationAssistant
            titulo="Registros de Inducción"
            estandar="1.2.2"
            descripcion="Inducción y reinducción en SST según Decreto 1072/2015"
            normativaAplicable={estandar.normativaAplicable}
            compact={true}
          />
        );
      })()}

      {/* Tabla de Registros */}
      <Card data-testid="card-registros-table">
        <CardHeader>
          <CardTitle>Registros de Inducción</CardTitle>
          <CardDescription>
            {registros.length} {registros.length === 1 ? 'registro' : 'registros'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {registros.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No hay registros de inducción aún</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Trabajador</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registros.map((registro) => (
                  <TableRow key={registro.id} data-testid={`row-registro-${registro.id}`}>
                    <TableCell>{new Date(registro.fecha).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${getTipoInduccionColor(registro.tipo)} border-0`}
                        data-testid={`badge-tipo-${registro.id}`}
                      >
                        {getTipoInduccionLabel(registro.tipo)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getWorkerName(registro.workerId)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {getWorkerPosition(registro.workerId) || '-'}
                    </TableCell>
                    <TableCell>{registro.responsableNombre}</TableCell>
                    <TableCell>{registro.duracionMinutos ? `${registro.duracionMinutos} min` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/api/registros-induccion/${registro.id}/pdf`, '_blank')}
                          data-testid={`button-pdf-${registro.id}`}
                          title="Descargar PDF"
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(registro)}
                          data-testid={`button-edit-${registro.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(registro.id)}
                          data-testid={`button-delete-${registro.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro de inducción será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => recordToDelete && deleteMutation.mutate(recordToDelete)}
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
