import { AccidentCard } from "@/components/AccidentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, X, CalendarDays, Activity, TrendingUp, TrendingDown, AlertTriangle, BarChart3, FileText, Save, Trash2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useState, useEffect, useMemo } from "react";
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
import { Accident, Worker, Company, AccidentStatistics, insertAccidentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";

import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";

function getLsoCompanyContext(): { companyId: string; companyName: string; companyNit: string } | null {
  try {
    const raw = localStorage.getItem("lso_company_context");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

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

function IndicadorCard({ titulo, valor, formula, icono: Icono, color, descripcion }: {
  titulo: string;
  valor: string | number;
  formula: string;
  icono: any;
  color: string;
  descripcion: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-600 dark:text-blue-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    orange: "text-orange-600 dark:text-orange-400",
  };

  return (
    <Card data-testid={`card-indicador-${titulo.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{titulo}</CardTitle>
        <Icono className={`h-4 w-4 ${colorClasses[color] || "text-muted-foreground"}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colorClasses[color] || ""}`} data-testid={`text-valor-${titulo.toLowerCase().replace(/\s+/g, '-')}`}>
          {valor}
        </div>
        <p className="text-xs text-muted-foreground mt-1">{formula}</p>
        <p className="text-xs text-muted-foreground mt-1">{descripcion}</p>
      </CardContent>
    </Card>
  );
}

function EstadisticasATELTab({ accidents, workers }: { accidents: Accident[]; workers: Worker[] }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);

  const { data: savedStatistics = [] } = useQuery<AccidentStatistics[]>({
    queryKey: ["/api/accident-statistics"],
  });

  const [statsForm, setStatsForm] = useState({
    year: currentYear,
    month: undefined as number | undefined,
    totalWorkers: 0,
    hoursWorkedHHT: "0",
    totalAccidents: 0,
    fatalAccidents: 0,
    severeAccidents: 0,
    lostDays: 0,
    totalOccupationalDiseases: 0,
    totalIncidents: 0,
    trendAnalysis: "",
    conclusions: "",
    improvementActions: "",
    status: "borrador" as string,
  });

  const createStatsMutation = useMutation({
    mutationFn: async (data: typeof statsForm) => {
      const res = await apiRequest("POST", "/api/accident-statistics", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accident-statistics"] });
      setStatsDialogOpen(false);
      toast({ title: "Registro creado", description: "Estadísticas ATEL registradas correctamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteStatsMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/accident-statistics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accident-statistics"] });
      toast({ title: "Registro eliminado", description: "Estadísticas eliminadas correctamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const yearStats = useMemo(() => {
    return savedStatistics.filter(s => s.year === parseInt(selectedYear));
  }, [savedStatistics, selectedYear]);

  const calculatedFromAccidents = useMemo(() => {
    const yearAccidents = accidents.filter(a => {
      const accDate = new Date(a.date);
      return accDate.getFullYear() === parseInt(selectedYear);
    });
    const total = yearAccidents.length;
    const fatales = yearAccidents.filter(a => a.severity === "mortal").length;
    const graves = yearAccidents.filter(a => a.severity === "grave").length;
    const leves = yearAccidents.filter(a => a.severity === "leve").length;

    const byMonth: Record<number, number> = {};
    yearAccidents.forEach(a => {
      const m = new Date(a.date).getMonth() + 1;
      byMonth[m] = (byMonth[m] || 0) + 1;
    });

    const byType: Record<string, number> = {};
    yearAccidents.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    const bySeverity = { leve: leves, grave: graves, mortal: fatales };

    return { total, fatales, graves, leves, byMonth, byType, bySeverity };
  }, [accidents, selectedYear]);

  const latestAnnualStats = useMemo(() => {
    const annual = yearStats.find(s => s.month === null || s.month === undefined);
    if (annual) return annual;
    if (yearStats.length > 0) {
      let totalAT = 0, totalFatal = 0, totalSevere = 0, totalLostDays = 0;
      let totalEL = 0, totalIncidents = 0, totalWorkers = 0;
      let totalHHT = 0;
      yearStats.forEach(s => {
        totalAT += s.totalAccidents;
        totalFatal += s.fatalAccidents;
        totalSevere += s.severeAccidents;
        totalLostDays += s.lostDays;
        totalEL += s.totalOccupationalDiseases;
        totalIncidents += s.totalIncidents;
        totalWorkers = Math.max(totalWorkers, s.totalWorkers);
        totalHHT += parseFloat(s.hoursWorkedHHT);
      });

      const indicadorIF = totalHHT > 0 ? (totalAT * 200000) / totalHHT : 0;
      const indicadorIS = totalHHT > 0 ? (totalLostDays * 200000) / totalHHT : 0;
      const indicadorILI = (indicadorIF * indicadorIS) / 1000;
      const tasaAcc = totalWorkers > 0 ? (totalAT / totalWorkers) * 100 : 0;
      const tasaEL = totalWorkers > 0 ? (totalEL / totalWorkers) * 100 : 0;

      return {
        totalAccidents: totalAT,
        fatalAccidents: totalFatal,
        severeAccidents: totalSevere,
        lostDays: totalLostDays,
        totalOccupationalDiseases: totalEL,
        totalIncidents: totalIncidents,
        totalWorkers: totalWorkers,
        hoursWorkedHHT: String(totalHHT),
        indicadorIF: String(indicadorIF.toFixed(2)),
        indicadorIS: String(indicadorIS.toFixed(2)),
        indicadorILI: String(indicadorILI.toFixed(4)),
        tasaAccidentalidad: String(tasaAcc.toFixed(2)),
        tasaEnfermedadLaboral: String(tasaEL.toFixed(2)),
      };
    }
    return null;
  }, [yearStats]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    years.add(currentYear - 1);
    accidents.forEach(a => years.add(new Date(a.date).getFullYear()));
    savedStatistics.forEach(s => years.add(s.year));
    return Array.from(years).sort((a, b) => b - a);
  }, [accidents, savedStatistics, currentYear]);

  const indicadores = useMemo(() => {
    if (latestAnnualStats) {
      return {
        IF: parseFloat(latestAnnualStats.indicadorIF || "0"),
        IS: parseFloat(latestAnnualStats.indicadorIS || "0"),
        ILI: parseFloat(latestAnnualStats.indicadorILI || "0"),
        tasaAcc: parseFloat(latestAnnualStats.tasaAccidentalidad || "0"),
        tasaEL: parseFloat(latestAnnualStats.tasaEnfermedadLaboral || "0"),
        totalAT: latestAnnualStats.totalAccidents,
        fatales: latestAnnualStats.fatalAccidents,
        graves: latestAnnualStats.severeAccidents,
        diasPerdidos: latestAnnualStats.lostDays,
        totalTrabajadores: latestAnnualStats.totalWorkers,
        HHT: parseFloat(latestAnnualStats.hoursWorkedHHT),
        source: "registered" as const,
      };
    }
    return {
      IF: 0, IS: 0, ILI: 0, tasaAcc: 0, tasaEL: 0,
      totalAT: calculatedFromAccidents.total,
      fatales: calculatedFromAccidents.fatales,
      graves: calculatedFromAccidents.graves,
      diasPerdidos: 0,
      totalTrabajadores: workers.length,
      HHT: 0,
      source: "calculated" as const,
    };
  }, [latestAnnualStats, calculatedFromAccidents, workers]);

  return (
    <div className="space-y-6" data-testid="tab-estadisticas-content">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold" data-testid="text-estadisticas-title">Estadísticas ATEL</h2>
          <p className="text-sm text-muted-foreground">
            Indicadores de Accidentalidad de Trabajo y Enfermedad Laboral - Resolución 0312/2019
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]" data-testid="select-year-stats">
              <CalendarDays className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isAdmin && (
            <Dialog open={statsDialogOpen} onOpenChange={setStatsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" data-testid="button-add-stats">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Periodo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Estadísticas ATEL</DialogTitle>
                  <DialogDescription>
                    Ingrese los datos del periodo para calcular indicadores (Resolución 0312/2019 Estándar 3.2.2)
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  createStatsMutation.mutate(statsForm);
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Año</Label>
                      <Input type="number" value={statsForm.year} onChange={e => setStatsForm({...statsForm, year: parseInt(e.target.value)})} data-testid="input-stats-year" />
                    </div>
                    <div className="space-y-2">
                      <Label>Mes (vacío = anual)</Label>
                      <Select value={statsForm.month !== undefined ? String(statsForm.month) : "anual"} onValueChange={v => setStatsForm({...statsForm, month: v === "anual" ? undefined : parseInt(v)})}>
                        <SelectTrigger data-testid="select-stats-month"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anual">Acumulado Anual</SelectItem>
                          {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                            <SelectItem key={m} value={String(m)}>{new Date(2024, m-1).toLocaleString('es-CO', {month:'long'})}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Total Trabajadores</Label>
                      <Input type="number" value={statsForm.totalWorkers} onChange={e => setStatsForm({...statsForm, totalWorkers: parseInt(e.target.value) || 0})} data-testid="input-stats-workers" />
                    </div>
                    <div className="space-y-2">
                      <Label>Horas Hombre Trabajadas (HHT)</Label>
                      <Input type="number" step="0.01" value={statsForm.hoursWorkedHHT} onChange={e => setStatsForm({...statsForm, hoursWorkedHHT: e.target.value})} data-testid="input-stats-hht" />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Accidentes de Trabajo</Label>
                      <Input type="number" value={statsForm.totalAccidents} onChange={e => setStatsForm({...statsForm, totalAccidents: parseInt(e.target.value) || 0})} data-testid="input-stats-at" />
                    </div>
                    <div className="space-y-2">
                      <Label>Accidentes Mortales</Label>
                      <Input type="number" value={statsForm.fatalAccidents} onChange={e => setStatsForm({...statsForm, fatalAccidents: parseInt(e.target.value) || 0})} data-testid="input-stats-fatal" />
                    </div>
                    <div className="space-y-2">
                      <Label>Accidentes Graves</Label>
                      <Input type="number" value={statsForm.severeAccidents} onChange={e => setStatsForm({...statsForm, severeAccidents: parseInt(e.target.value) || 0})} data-testid="input-stats-severe" />
                    </div>
                    <div className="space-y-2">
                      <Label>Días Perdidos (Incapacidad)</Label>
                      <Input type="number" value={statsForm.lostDays} onChange={e => setStatsForm({...statsForm, lostDays: parseInt(e.target.value) || 0})} data-testid="input-stats-days" />
                    </div>
                    <div className="space-y-2">
                      <Label>Enfermedades Laborales</Label>
                      <Input type="number" value={statsForm.totalOccupationalDiseases} onChange={e => setStatsForm({...statsForm, totalOccupationalDiseases: parseInt(e.target.value) || 0})} data-testid="input-stats-el" />
                    </div>
                    <div className="space-y-2">
                      <Label>Incidentes Reportados</Label>
                      <Input type="number" value={statsForm.totalIncidents} onChange={e => setStatsForm({...statsForm, totalIncidents: parseInt(e.target.value) || 0})} data-testid="input-stats-incidents" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Análisis de Tendencias</Label>
                    <Textarea value={statsForm.trendAnalysis} onChange={e => setStatsForm({...statsForm, trendAnalysis: e.target.value})} placeholder="Comparación con periodos anteriores..." data-testid="input-stats-trend" />
                  </div>
                  <div className="space-y-2">
                    <Label>Conclusiones</Label>
                    <Textarea value={statsForm.conclusions} onChange={e => setStatsForm({...statsForm, conclusions: e.target.value})} placeholder="Conclusiones del análisis estadístico..." data-testid="input-stats-conclusions" />
                  </div>
                  <div className="space-y-2">
                    <Label>Acciones de Mejora</Label>
                    <Textarea value={statsForm.improvementActions} onChange={e => setStatsForm({...statsForm, improvementActions: e.target.value})} placeholder="Acciones derivadas del análisis..." data-testid="input-stats-actions" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={createStatsMutation.isPending} data-testid="button-submit-stats">
                      <Save className="h-4 w-4 mr-2" />
                      {createStatsMutation.isPending ? "Guardando..." : "Guardar Estadísticas"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {indicadores.source === "calculated" && yearStats.length === 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Sin datos estadísticos registrados para {selectedYear}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Los indicadores IF, IS e ILI requieren datos de HHT (Horas Hombre Trabajadas) y días perdidos.
                Se muestran {calculatedFromAccidents.total} accidentes del registro. Registre un periodo para calcular indicadores completos.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <IndicadorCard
          titulo="Tasa de Accidentalidad"
          valor={indicadores.tasaAcc > 0 ? `${indicadores.tasaAcc.toFixed(2)}%` : "Sin datos"}
          formula="(AT / Trabajadores) x 100"
          icono={Activity}
          color="blue"
          descripcion={`${indicadores.totalAT} AT / ${indicadores.totalTrabajadores} trabajadores`}
        />
        <IndicadorCard
          titulo="Índice de Frecuencia (IF)"
          valor={indicadores.IF > 0 ? indicadores.IF.toFixed(2) : "Sin datos"}
          formula="(AT x 200.000) / HHT"
          icono={BarChart3}
          color="amber"
          descripcion={indicadores.HHT > 0 ? `${indicadores.totalAT} AT / ${indicadores.HHT.toLocaleString('es-CO')} HHT` : "Requiere HHT"}
        />
        <IndicadorCard
          titulo="Índice de Severidad (IS)"
          valor={indicadores.IS > 0 ? indicadores.IS.toFixed(2) : "Sin datos"}
          formula="(Días perdidos x 200.000) / HHT"
          icono={TrendingUp}
          color="red"
          descripcion={indicadores.HHT > 0 ? `${indicadores.diasPerdidos} días / ${indicadores.HHT.toLocaleString('es-CO')} HHT` : "Requiere HHT y días perdidos"}
        />
        <IndicadorCard
          titulo="Índice Lesión Incapacitante (ILI)"
          valor={indicadores.ILI > 0 ? indicadores.ILI.toFixed(4) : "Sin datos"}
          formula="(IF x IS) / 1.000"
          icono={TrendingDown}
          color="purple"
          descripcion="Mide la gravedad combinada de accidentes"
        />
        <IndicadorCard
          titulo="Tasa Enfermedad Laboral"
          valor={indicadores.tasaEL > 0 ? `${indicadores.tasaEL.toFixed(2)}%` : "Sin datos"}
          formula="(EL / Trabajadores) x 100"
          icono={FileText}
          color="emerald"
          descripcion="Enfermedades laborales diagnosticadas"
        />
        <IndicadorCard
          titulo="Accidentes Registrados"
          valor={calculatedFromAccidents.total}
          formula={`${selectedYear}`}
          icono={AlertTriangle}
          color="orange"
          descripcion={`Mortales: ${calculatedFromAccidents.fatales} | Graves: ${calculatedFromAccidents.graves} | Leves: ${calculatedFromAccidents.leves}`}
        />
      </div>

      {calculatedFromAccidents.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribución Mensual de Accidentes - {selectedYear}</CardTitle>
            <CardDescription>Basado en registros del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => {
                const count = calculatedFromAccidents.byMonth[m] || 0;
                const maxCount = Math.max(...Object.values(calculatedFromAccidents.byMonth), 1);
                const heightPct = count > 0 ? Math.max((count / maxCount) * 100, 15) : 5;
                return (
                  <div key={m} className="flex flex-col items-center gap-1" data-testid={`bar-month-${m}`}>
                    <div className="w-full flex flex-col items-center justify-end" style={{ height: "80px" }}>
                      <span className="text-xs font-medium mb-1">{count}</span>
                      <div
                        className={`w-full rounded-sm ${count > 0 ? "bg-blue-500 dark:bg-blue-400" : "bg-muted"}`}
                        style={{ height: `${heightPct}%`, minHeight: "4px" }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(2024, m-1).toLocaleString('es-CO', {month:'short'}).slice(0,3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {yearStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Periodos Registrados - {selectedYear}</CardTitle>
            <CardDescription>Datos oficiales de estadísticas ATEL ingresados manualmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Periodo</th>
                    <th className="text-right py-2 px-2">Trabajadores</th>
                    <th className="text-right py-2 px-2">HHT</th>
                    <th className="text-right py-2 px-2">AT</th>
                    <th className="text-right py-2 px-2">Días</th>
                    <th className="text-right py-2 px-2">IF</th>
                    <th className="text-right py-2 px-2">IS</th>
                    <th className="text-right py-2 px-2">ILI</th>
                    <th className="text-right py-2 px-2">Estado</th>
                    {isAdmin && <th className="text-right py-2 px-2"></th>}
                  </tr>
                </thead>
                <tbody>
                  {yearStats.sort((a,b) => (a.month || 0) - (b.month || 0)).map(stat => (
                    <tr key={stat.id} className="border-b" data-testid={`row-stats-${stat.id}`}>
                      <td className="py-2 px-2">
                        {stat.month ? new Date(2024, stat.month - 1).toLocaleString('es-CO', {month:'long'}) : "Anual"}
                      </td>
                      <td className="text-right py-2 px-2">{stat.totalWorkers}</td>
                      <td className="text-right py-2 px-2">{parseFloat(stat.hoursWorkedHHT).toLocaleString('es-CO')}</td>
                      <td className="text-right py-2 px-2">{stat.totalAccidents}</td>
                      <td className="text-right py-2 px-2">{stat.lostDays}</td>
                      <td className="text-right py-2 px-2">{stat.indicadorIF ? parseFloat(stat.indicadorIF).toFixed(2) : "-"}</td>
                      <td className="text-right py-2 px-2">{stat.indicadorIS ? parseFloat(stat.indicadorIS).toFixed(2) : "-"}</td>
                      <td className="text-right py-2 px-2">{stat.indicadorILI ? parseFloat(stat.indicadorILI).toFixed(4) : "-"}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant={stat.status === "aprobado" ? "default" : "secondary"}>
                          {stat.status === "aprobado" ? "Aprobado" : stat.status === "en_revision" ? "En revisión" : "Borrador"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="text-right py-2 px-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteStatsMutation.mutate(stat.id)}
                            disabled={deleteStatsMutation.isPending}
                            data-testid={`button-delete-stats-${stat.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Marco Normativo - Indicadores ATEL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="text-sm space-y-1">
              <p className="font-medium">Resolución 0312/2019 - Estándar 3.2.2</p>
              <p className="text-muted-foreground text-xs">Medición de la severidad de los accidentes y enfermedades laborales</p>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">Decreto 1072/2015 Art. 2.2.4.6.21</p>
              <p className="text-muted-foreground text-xs">Indicadores que evalúen la estructura, el proceso y los resultados del SG-SST</p>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">ISO 45001:2018 Numeral 9.1.2</p>
              <p className="text-muted-foreground text-xs">Evaluación del cumplimiento de requisitos legales y otros requisitos</p>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">Resolución 1401/2007</p>
              <p className="text-muted-foreground text-xs">Investigación de incidentes y accidentes de trabajo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Accidentes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const tabFromUrl = searchParams.get("tab");

  const isLso = user?.role === 'lso';
  const lsoContext = isLso ? getLsoCompanyContext() : null;

  const validTabs = ["registro", "estadisticas", "investigaciones"];
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : "registro";
  const [activeTab, setActiveTab] = useState(initialTab);

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
      const payload = (isGlobalAdmin && formData.companyId)
        ? { ...data, companyId: formData.companyId }
        : isLso && lsoContext?.companyId
        ? { ...data, companyId: lsoContext.companyId }
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
      <div className="flex flex-wrap items-center gap-2">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
        <BackToPesvEvaluationButton />
      </div>

      {isLso && lsoContext && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800" data-testid="alert-lso-context">
          <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
            <span className="text-blue-800 dark:text-blue-300 text-sm">
              Viendo módulo de <strong>{lsoContext.companyName}</strong> (NIT: {lsoContext.companyNit}) desde su portal profesional.
            </span>
            <Button
              size="sm"
              variant="outline"
              data-testid="button-back-to-lso-portal"
              onClick={() => {
                localStorage.removeItem("lso_company_context");
                navigate("/portal-licenciado");
              }}
            >
              Volver al portal
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Accidentes e Incidentes</h1>
          <p className="text-muted-foreground">Registro y seguimiento de accidentes laborales</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList data-testid="tabs-accidentes">
          <TabsTrigger value="registro" data-testid="tab-registro">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Registro
          </TabsTrigger>
          <TabsTrigger value="estadisticas" data-testid="tab-estadisticas">
            <Activity className="h-4 w-4 mr-2" />
            Estadísticas ATEL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registro" className="space-y-6 mt-4">
      <div className="flex flex-wrap items-center justify-end gap-4">
        {user?.role && (hasCompanyAdminAccess(user.role) || (isLso && !!lsoContext)) && (
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
        </TabsContent>

        <TabsContent value="estadisticas" className="mt-4">
          <EstadisticasATELTab accidents={accidents} workers={workers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
