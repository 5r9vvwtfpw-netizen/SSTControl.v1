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

// Tipos de accidentes según Decreto 1072/2015 y clasificación internacional de lesiones ocupacionales
const ACCIDENT_TYPES = [
  // Caídas
  { value: "caida_mismo_nivel", label: "Caída al mismo nivel (resbalón, tropiezo)" },
  { value: "caida_diferente_nivel", label: "Caída de diferente nivel (escaleras, andamios, alturas)" },
  { value: "caida_objetos", label: "Caída de objetos" },
  
  // Golpes y contacto con objetos
  { value: "golpe_objeto", label: "Golpe con/contra objeto fijo" },
  { value: "golpe_objeto_movil", label: "Golpe por objeto en movimiento" },
  { value: "golpe_herramientas", label: "Golpe por herramientas manuales" },
  { value: "proyeccion_particulas", label: "Proyección de partículas/fragmentos" },
  
  // Cortes y punzamientos
  { value: "corte", label: "Corte o laceración" },
  { value: "punzamiento", label: "Punzamiento o perforación" },
  { value: "amputacion", label: "Amputación traumática" },
  
  // Atrapamientos
  { value: "atrapamiento", label: "Atrapamiento por/entre objetos" },
  { value: "aplastamiento", label: "Aplastamiento" },
  { value: "atrapamiento_maquinaria", label: "Atrapamiento por maquinaria" },
  
  // Quemaduras
  { value: "quemadura_termica", label: "Quemadura térmica (calor/frío)" },
  { value: "quemadura_quimica", label: "Quemadura química" },
  { value: "quemadura_electrica", label: "Quemadura eléctrica" },
  { value: "quemadura_radiacion", label: "Quemadura por radiación" },
  
  // Riesgos eléctricos
  { value: "electrocucion", label: "Electrocución" },
  { value: "choque_electrico", label: "Choque eléctrico (contacto)" },
  { value: "arco_electrico", label: "Arco eléctrico" },
  
  // Riesgos químicos y biológicos
  { value: "intoxicacion", label: "Intoxicación/Envenenamiento" },
  { value: "inhalacion_gases", label: "Inhalación de gases/vapores" },
  { value: "contacto_sustancias", label: "Contacto con sustancias peligrosas" },
  { value: "exposicion_biologica", label: "Exposición a agentes biológicos" },
  { value: "mordedura_picadura", label: "Mordedura o picadura de animal/insecto" },
  
  // Esfuerzos físicos
  { value: "sobreesfuerzo", label: "Sobreesfuerzo físico" },
  { value: "movimiento_repetitivo", label: "Lesión por movimientos repetitivos" },
  { value: "manipulacion_cargas", label: "Lesión por manipulación de cargas" },
  { value: "postura_forzada", label: "Lesión por postura forzada" },
  
  // Accidentes de tránsito
  { value: "accidente_transito", label: "Accidente de tránsito (in itinere)" },
  { value: "accidente_vehiculo_trabajo", label: "Accidente con vehículo en trabajo" },
  { value: "atropellamiento", label: "Atropellamiento" },
  
  // Sector minero
  { value: "derrumbe", label: "Derrumbe/Desprendimiento de material" },
  { value: "explosion", label: "Explosión" },
  { value: "incendio", label: "Incendio" },
  { value: "asfixia", label: "Asfixia/Sofocación" },
  { value: "inmersion", label: "Inmersión/Ahogamiento" },
  
  // Espacios confinados
  { value: "atmosfera_peligrosa", label: "Exposición a atmósfera peligrosa" },
  
  // Violencia
  { value: "agresion_fisica", label: "Agresión física" },
  { value: "asalto_robo", label: "Asalto/Robo" },
  
  // Otros
  { value: "exposicion_ruido", label: "Exposición aguda a ruido" },
  { value: "exposicion_vibraciones", label: "Exposición a vibraciones" },
  { value: "exposicion_temperaturas", label: "Exposición a temperaturas extremas" },
  { value: "radiacion_ionizante", label: "Exposición a radiación ionizante" },
  { value: "esfuerzo_visual", label: "Fatiga visual aguda" },
  { value: "estres_agudo", label: "Estrés térmico/Golpe de calor" },
  { value: "otro", label: "Otro (especificar)" },
];

// Ubicaciones según sectores económicos colombianos
const LOCATION_OPTIONS = [
  // Áreas generales/comunes
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
  { value: "taller_mantenimiento", label: "Taller de mantenimiento" },
  { value: "laboratorio", label: "Laboratorio" },
  { value: "cuarto_tecnico", label: "Cuarto técnico / Cuarto de máquinas" },
  
  // Sector Minero
  { value: "mina_cielo_abierto", label: "Mina a cielo abierto" },
  { value: "mina_subterranea", label: "Mina subterránea / Túnel" },
  { value: "frente_explotacion", label: "Frente de explotación" },
  { value: "galeria_minera", label: "Galería / Socavón" },
  { value: "planta_beneficio_minera", label: "Planta de beneficio minero" },
  { value: "tolva_trituradora", label: "Tolva / Trituradora" },
  { value: "polvorin", label: "Polvorín / Almacén de explosivos" },
  { value: "banda_transportadora", label: "Banda transportadora" },
  { value: "patio_acopio", label: "Patio de acopio" },
  
  // Sector Construcción
  { value: "obra_civil", label: "Obra civil / Construcción" },
  { value: "andamio_plataforma", label: "Andamio / Plataforma elevada" },
  { value: "excavacion_zanja", label: "Excavación / Zanja" },
  { value: "cimentacion", label: "Cimentación / Fundación" },
  { value: "cubierta_tejado", label: "Cubierta / Tejado" },
  { value: "fachada", label: "Fachada" },
  { value: "torre_grua", label: "Torre / Grúa" },
  { value: "demolicion", label: "Zona de demolición" },
  { value: "encofrado", label: "Encofrado" },
  
  // Sector Hidrocarburos
  { value: "pozo_petrolero", label: "Pozo petrolero" },
  { value: "plataforma_petrolera", label: "Plataforma petrolera" },
  { value: "refineria", label: "Refinería" },
  { value: "estacion_servicio", label: "Estación de servicio" },
  { value: "tanque_almacenamiento", label: "Tanque de almacenamiento" },
  { value: "oleoducto_gasoducto", label: "Oleoducto / Gasoducto" },
  { value: "planta_gas", label: "Planta de gas" },
  
  // Sector Transporte
  { value: "vehiculo", label: "En vehículo" },
  { value: "desplazamiento", label: "En desplazamiento laboral" },
  { value: "via_publica", label: "Vía pública" },
  { value: "terminal_transporte", label: "Terminal de transporte" },
  { value: "muelle_portuario", label: "Muelle / Puerto" },
  { value: "aeropuerto", label: "Aeropuerto" },
  { value: "ferrocarril", label: "Ferrocarril / Vía férrea" },
  { value: "embarcacion", label: "Embarcación / Buque" },
  
  // Sector Agroindustrial
  { value: "campo_cultivo", label: "Campo de cultivo" },
  { value: "invernadero", label: "Invernadero" },
  { value: "beneficiadero", label: "Beneficiadero" },
  { value: "corral_establo", label: "Corral / Establo" },
  { value: "silo", label: "Silo" },
  { value: "planta_procesamiento", label: "Planta de procesamiento agrícola" },
  
  // Sector Energía
  { value: "subestacion", label: "Subestación eléctrica" },
  { value: "linea_transmision", label: "Línea de transmisión" },
  { value: "central_generacion", label: "Central de generación" },
  { value: "poste_electrico", label: "Poste eléctrico" },
  { value: "panel_solar", label: "Panel solar / Parque eólico" },
  
  // Sector Salud
  { value: "sala_cirugia", label: "Sala de cirugía / Quirófano" },
  { value: "urgencias", label: "Urgencias" },
  { value: "hospitalizacion", label: "Hospitalización" },
  { value: "laboratorio_clinico", label: "Laboratorio clínico" },
  { value: "morgue", label: "Morgue" },
  
  // Sector Comercio/Servicios
  { value: "punto_venta", label: "Punto de venta / Local comercial" },
  { value: "cocina_restaurante", label: "Cocina / Restaurante" },
  { value: "hotel", label: "Hotel / Hospedaje" },
  { value: "call_center", label: "Call center" },
  { value: "centro_comercial", label: "Centro comercial" },
  
  // Espacios confinados
  { value: "espacio_confinado", label: "Espacio confinado" },
  { value: "tanque_silo", label: "Tanque / Silo / Cisterna" },
  { value: "pozo_alcantarillado", label: "Pozo / Alcantarillado" },
  { value: "camara_inspeccion", label: "Cámara de inspección" },
  
  // Trabajos en altura
  { value: "trabajo_altura", label: "Trabajo en alturas (>1.5m)" },
  { value: "azotea_terraza", label: "Azotea / Terraza" },
  
  // Telecomunicaciones
  { value: "torre_comunicaciones", label: "Torre de comunicaciones" },
  { value: "data_center", label: "Data center" },
  
  // Otros
  { value: "zona_residuos", label: "Zona de residuos / Reciclaje" },
  { value: "piscina", label: "Piscina / Zona húmeda" },
  { value: "gimnasio", label: "Gimnasio / Área deportiva" },
  { value: "aula_capacitacion", label: "Aula / Sala de capacitación" },
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
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

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

  // Mutación para eliminar accidente (solo superadmin)
  const deleteAccidentMutation = useMutation({
    mutationFn: async (accidentId: string) => {
      const res = await apiRequest("DELETE", `/api/accidents/${accidentId}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al eliminar accidente");
      }
      return accidentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accidents"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Accidente eliminado",
        description: "El registro del accidente ha sido eliminado",
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
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
                showDeleteButton={user?.role === 'superadmin'}
                onDelete={(id) => deleteAccidentMutation.mutate(id)}
                isDeleting={deleteAccidentMutation.isPending}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
