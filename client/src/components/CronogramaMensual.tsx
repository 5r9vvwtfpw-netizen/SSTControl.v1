import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronRight, Check, Clock, AlertTriangle, CheckCircle, ListTodo, HelpCircle, ArrowRight } from "lucide-react";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { ActividadPlanTrabajo } from "@shared/schema";

const MESES = [
  { id: "enero", nombre: "Enero", numero: 1 },
  { id: "febrero", nombre: "Febrero", numero: 2 },
  { id: "marzo", nombre: "Marzo", numero: 3 },
  { id: "abril", nombre: "Abril", numero: 4 },
  { id: "mayo", nombre: "Mayo", numero: 5 },
  { id: "junio", nombre: "Junio", numero: 6 },
  { id: "julio", nombre: "Julio", numero: 7 },
  { id: "agosto", nombre: "Agosto", numero: 8 },
  { id: "septiembre", nombre: "Septiembre", numero: 9 },
  { id: "octubre", nombre: "Octubre", numero: 10 },
  { id: "noviembre", nombre: "Noviembre", numero: 11 },
  { id: "diciembre", nombre: "Diciembre", numero: 12 },
];

const CICLOS_PHVA = [
  { id: "planear", nombre: "Planear", color: "#1565C0" },
  { id: "hacer", nombre: "Hacer", color: "#2E7D32" },
  { id: "verificar", nombre: "Verificar", color: "#F57C00" },
  { id: "actuar", nombre: "Actuar", color: "#C62828" },
];

const PROGRAMAS_SST_LABELS: Record<string, string> = {
  "identificacion-peligros": "Identificación de Peligros",
  "medicina-preventiva": "Medicina Preventiva",
  "higiene-seguridad": "Higiene y Seguridad",
  "riesgo-psicosocial": "Riesgo Psicosocial",
  "seguridad-vial": "Seguridad Vial (PESV)",
  "emergencias": "Emergencias",
  "vigilancia-epidemiologica": "Vigilancia Epidemiológica",
  "capacitacion": "Capacitación",
  "inspeccion": "Inspecciones",
  "epp": "EPP",
  "otro": "Gestión General",
  "comunicacion": "Comunicación",
  "auditoria": "Auditoría",
  "mejora-continua": "Mejora Continua",
  "comites": "Comités",
};

const PROGRAMA_TO_ROUTE_MAP: Record<string, string | null> = {
  "induccion": "/registros-induccion",
  "capacitacion": "/capacitaciones",
  "medicina-preventiva": "/examenes-medicos",
  "epp": "/entrega-epp",
  "inspeccion": "/inspecciones",
  "emergencias": "/plan-emergencias",
  "investigacion-accidentes": "/investigacion-accidentes",
  "comites": "/copasst-gestion",
  "auditoria": "/auditorias-internas",
  "identificacion-peligros": "/iperc",
  "higiene-seguridad": "/mediciones-ambientales",
  "riesgo-psicosocial": "/comite-convivencia-actas",
  "seguridad-vial": "/pesv",
  "vigilancia-epidemiologica": "/vigilancia-epidemiologica",
  "comunicacion": "/comunicacion-sst",
  "mejora-continua": "/plan-mejoramiento-contexto",
  "otro": null,
};

// Mapa de palabras clave en el nombre de la actividad para determinar la ruta correcta
// IMPORTANTE: El orden importa - las keywords más específicas deben ir primero
const ACTIVIDAD_KEYWORD_ROUTES: { keywords: string[]; route: string }[] = [
  // Programa de capacitación (específico, debe ir antes de "capacitacion" genérico)
  { keywords: ["programa de capacitacion", "programa de capacitación", "programa capacitacion anual", "programa capacitación anual", "plan de capacitacion", "plan de capacitación", "cronograma de capacitacion", "cronograma de capacitación", "diseño del programa de capacitacion", "diseño del programa de capacitación"], route: "/programa-capacitacion-anual" },
  
  // Curso 50 horas (específico)
  { keywords: ["50 horas", "curso virtual", "curso 50", "certificacion sst", "certificación sst", "verificacion curso", "verificación curso", "verificar certificacion", "verificar certificación"], route: "/curso-50-horas" },
  
  // Afiliaciones SSSS
  { keywords: ["afiliacion", "afiliaciones", "ssss", "arl", "eps", "afp", "seguridad social", "verificacion de afiliaciones", "verificación de afiliaciones"], route: "/afiliaciones-ssss" },
  
  // Designación y responsabilidades
  { keywords: ["designacion", "designación", "responsable del sg-sst", "responsable del sgsst", "responsabilidades en sst", "responsabilidades especificas", "responsabilidades específicas", "documentacion de responsabilidades", "documentación de responsabilidades", "documentacion de la designacion", "documentación de la designación"], route: "/designacion-responsable" },
  
  // Investigación de accidentes (específico, antes de "accidente" genérico)
  { keywords: ["investigacion de incidentes", "investigación de incidentes", "investigacion de accidentes", "investigación de accidentes", "instructivo para investigacion", "instructivo para investigación"], route: "/investigacion-accidentes" },
  
  // Accidentes y reporte
  { keywords: ["accidente", "accidentes", "at y el", "incidente", "accidentalidad", "registro estadistico", "registro estadístico", "reporte de accidentes", "enfermedad laboral", "instructivo para reporte"], route: "/accidentes" },
  
  // EPP
  { keywords: ["epp", "proteccion personal", "protección personal", "elementos de proteccion", "elementos de protección", "entrega de epp", "entrega y registro de epp", "entrega y capacitacion en epp", "entrega y capacitación en epp", "dotacion", "dotación", "matriz de epp", "inspecciones de epp"], route: "/entrega-epp" },
  
  // Inducción
  { keywords: ["induccion", "inducción", "reinduccion", "reinducción", "induccion y reinduccion", "inducción y reinducción"], route: "/registros-induccion" },
  
  // Exámenes médicos
  { keywords: ["examen", "examenes", "exámenes", "medico ocupacional", "médico ocupacional", "ocupacionales", "profesiograma", "programacion evaluaciones medicas", "programación evaluaciones médicas", "seguimiento de examenes", "seguimiento de exámenes", "historias clinicas ocupacionales", "historias clínicas ocupacionales", "restricciones y recomendaciones medicas", "restricciones y recomendaciones médicas"], route: "/examenes-medicos" },
  
  // IPERC y matriz de riesgos
  { keywords: ["iperc", "matriz iperc", "actualizacion de la matriz iperc", "actualización de la matriz iperc", "elaboracion/actualizacion matriz iperc", "elaboración/actualización matriz iperc", "identificacion de peligros", "identificación de peligros", "evaluacion de riesgos", "evaluación de riesgos"], route: "/iperc" },
  
  // Capacitaciones genéricas
  { keywords: ["capacitacion", "capacitación", "formacion", "formación", "entrenamiento", "capacitacion a brigada", "capacitación a brigada", "capacitacion a miembros", "capacitación a miembros", "capacitacion al comite", "capacitación al comité"], route: "/capacitaciones" },
  
  // Inspecciones
  { keywords: ["inspeccion", "inspección", "inspecciones", "inspecciones de seguridad", "botiquines", "primeros auxilios", "extintores", "redes contra incendio", "señalizacion", "señalización", "demarcacion", "demarcación", "actos y condiciones inseguras", "programa de inspecciones", "diseño del programa de inspecciones"], route: "/inspecciones" },
  
  // Plan de emergencias
  { keywords: ["emergencia", "emergencias", "evacuacion", "evacuación", "brigada de emergencias", "brigadas de emergencias", "conformacion de brigada", "conformación de brigada", "dotacion de brigadas", "dotación de brigadas", "simulacro", "simulacros", "plan de emergencias", "actualizacion plan de emergencias", "actualización plan de emergencias", "plan de prevencion y respuesta", "plan de prevención y respuesta", "mapa de riesgo", "analisis de vulnerabilidad", "análisis de vulnerabilidad"], route: "/plan-emergencias" },
  
  // COPASST y reuniones
  { keywords: ["copasst", "vigia", "vigía", "conformacion del copasst", "conformación del copasst", "conformacion/renovacion del copasst", "conformación/renovación del copasst", "reuniones mensuales del copasst", "actas de reuniones mensuales del copasst", "verificar certificacion de miembros copasst", "verificar certificación de miembros copasst"], route: "/copasst-gestion" },
  
  // Comité de Convivencia Laboral
  { keywords: ["convivencia laboral", "ccl", "comite de convivencia", "comité de convivencia", "reuniones trimestrales del ccl", "actas de reuniones del comite de convivencia", "actas de reuniones del comité de convivencia", "conformacion del comite de convivencia", "conformación del comité de convivencia"], route: "/comite-convivencia-actas" },
  
  // Auditorías
  { keywords: ["auditoria", "auditoría", "auditorias", "auditorías", "auditoria interna", "auditoría interna", "planificacion del programa de auditoria", "planificación del programa de auditoría"], route: "/auditorias-internas" },
  
  // Políticas SST
  { keywords: ["politica", "política", "politicas", "políticas", "publicacion y socializacion de la politica", "publicación y socialización de la política", "reglamento de higiene", "reglamento de higiene y seguridad industrial"], route: "/politicas-sst" },
  
  // Plan anual de trabajo
  { keywords: ["plan anual", "plan de trabajo", "elaboracion plan", "elaboración plan", "actualizacion plan", "actualización plan", "elaboracion/actualizacion plan anual", "elaboración/actualización plan anual", "seguimiento a programas del sg-sst"], route: "/planes-trabajo-anual" },
  
  // Indicadores SST
  { keywords: ["indicador", "indicadores", "definicion de indicadores", "definición de indicadores", "seguimiento de indicadores", "indicadores de estructura", "indicadores de proceso", "indicadores de resultado", "analisis de tendencias", "análisis de tendencias"], route: "/indicadores-accidentalidad" },
  
  // Objetivos SST
  { keywords: ["objetivo", "objetivos", "definicion de objetivos", "definición de objetivos", "objetivos sst"], route: "/objetivos-sst" },
  
  // Conservación de documentos
  { keywords: ["documento", "documentos", "conservacion", "conservación", "retencion documental", "retención documental", "archivo", "tabla de retencion", "tabla de retención", "inclusion del sg-sst en la tabla", "inclusión del sg-sst en la tabla", "revision de archivo", "revisión de archivo"], route: "/conservacion-documentos" },
  
  // Ausentismo
  { keywords: ["ausentismo", "incapacidad", "incapacidades", "registro y seguimiento de ausentismo", "seguimiento y analisis del ausentismo", "seguimiento y análisis del ausentismo", "medicion y analisis del ausentismo", "medición y análisis del ausentismo"], route: "/ausentismo-laboral" },
  
  // Perfil sociodemográfico
  { keywords: ["sociodemografico", "sociodemográfico", "descripcion sociodemografica", "descripción sociodemográfica", "actualizacion del perfil sociodemografico", "actualización del perfil sociodemográfico", "caracterizacion de condiciones de salud", "caracterización de condiciones de salud"], route: "/perfil-sociodemografico" },
  
  // Asignación de recursos
  { keywords: ["recursos", "asignacion de recursos", "asignación de recursos", "presupuesto", "recursos para sst", "recursos humanos", "recursos tecnicos", "recursos técnicos", "recursos financieros"], route: "/asignacion-recursos" },
  
  // Revisión por la dirección
  { keywords: ["revision por la direccion", "revisión por la dirección", "revision gerencial", "revisión gerencial", "revision por la alta direccion", "revisión por la alta dirección", "alta direccion", "alta dirección"], route: "/revisiones-direccion" },
  
  // Plan de mejoramiento y acciones correctivas
  { keywords: ["mejoramiento", "mejora continua", "acciones correctivas", "acciones preventivas", "acciones de mejora", "seguimiento a acciones correctivas", "seguimiento a acciones preventivas", "plan de mejoramiento"], route: "/plan-mejoramiento-contexto" },
  
  // Matriz legal
  { keywords: ["matriz de requisitos legales", "requisitos legales", "actualizacion de matriz de requisitos", "actualización de matriz de requisitos", "matriz legal"], route: "/matriz-legal" },
  
  // Perfiles de cargo
  { keywords: ["perfiles de cargo", "actualizacion de perfiles de cargo", "actualización de perfiles de cargo"], route: "/perfiles-cargo" },
  
  // Procedimientos de trabajo seguro
  { keywords: ["procedimientos de trabajo seguro", "actualizacion de procedimientos", "actualización de procedimientos", "procedimiento del sg-sst", "diseño del procedimiento"], route: "/politicas-sst" },
  
  // Comunicación SST
  { keywords: ["comunicacion", "comunicación", "comunicaciones sst", "plan de comunicaciones", "mecanismos de comunicacion", "mecanismos de comunicación", "diseño e implementacion del plan de comunicaciones", "diseño e implementación del plan de comunicaciones"], route: "/comunicacion-sst" },
  
  // Evaluación inicial del SG-SST
  { keywords: ["evaluacion inicial", "evaluación inicial", "autoevaluacion de estandares", "autoevaluación de estándares", "estandares minimos", "estándares mínimos", "resolucion 0312", "resolución 0312", "aplicacion de estandares minimos", "aplicación de estándares mínimos"], route: "/evaluaciones-sst" },
  
  // Gestión del cambio
  { keywords: ["gestion del cambio", "gestión del cambio", "procedimiento de gestion del cambio", "procedimiento de gestión del cambio", "implementar cambio"], route: "/gestion-cambios" },
  
  // Evaluación de proveedores
  { keywords: ["proveedores", "contratistas", "evaluacion y seleccion de proveedores", "evaluación y selección de proveedores", "procedimiento de evaluacion y seleccion", "procedimiento de evaluación y selección"], route: "/evaluacion-proveedores" },
  
  // Adquisiciones SST
  { keywords: ["compras", "adquisiciones", "procedimiento de compras", "compras con criterios sst"], route: "/adquisiciones-sst" },
  
  // Vigilancia epidemiológica
  { keywords: ["vigilancia epidemiologica", "vigilancia epidemiológica", "sve", "sistema de vigilancia", "implementacion del sve", "implementación del sve", "programa de vigilancia"], route: "/vigilancia-epidemiologica" },
  
  // Estilos de vida saludable
  { keywords: ["estilos de vida saludable", "promocion y prevencion en salud", "promoción y prevención en salud", "actividades de promocion", "actividades de promoción"], route: "/estilos-vida-saludable" },
  
  // Higiene y seguridad (genérico para los que no tienen ruta específica)
  { keywords: ["control de plagas", "fumigacion", "fumigación", "agua potable", "servicios sanitarios", "mediciones ambientales", "ruido", "iluminacion", "iluminación", "manejo de residuos", "residuos", "controles de riesgos", "implementacion de controles", "implementación de controles"], route: "/mediciones-ambientales" },
  
  // Mantenimiento
  { keywords: ["mantenimiento preventivo", "programa de mantenimiento"], route: "/inspecciones" },
];

function getRouteForActividad(actividad: string, programa: string): string | null {
  const actividadLower = actividad.toLowerCase();
  
  // PRIORIDAD 1: Si el programa tiene ruta definida y el nombre contiene keyword del programa, usar la ruta del programa
  // Esto evita conflictos como "Capacitación en uso de EPP" yendo a /entrega-epp en lugar de /capacitaciones
  const programaRoute = PROGRAMA_TO_ROUTE_MAP[programa];
  if (programaRoute) {
    // Verificar si hay keywords específicas que deberían sobrescribir el programa
    const overrideKeywords = [
      { keywords: ["50 horas", "curso virtual", "curso 50"], route: "/curso-50-horas" },
    ];
    for (const { keywords, route } of overrideKeywords) {
      for (const keyword of keywords) {
        if (actividadLower.includes(keyword)) {
          return route;
        }
      }
    }
    return programaRoute;
  }
  
  // PRIORIDAD 2: Buscar por palabras clave en el nombre de la actividad
  for (const { keywords, route } of ACTIVIDAD_KEYWORD_ROUTES) {
    for (const keyword of keywords) {
      if (actividadLower.includes(keyword)) {
        return route;
      }
    }
  }
  
  return null;
}

function getRouteForPrograma(programa: string): string | null {
  return PROGRAMA_TO_ROUTE_MAP[programa] || null;
}

function getCicloFromPrograma(programa: string): string {
  const planear = ["otro", "identificacion-peligros", "comunicacion"];
  const hacer = ["capacitacion", "medicina-preventiva", "higiene-seguridad", "riesgo-psicosocial", "seguridad-vial", "emergencias", "vigilancia-epidemiologica", "inspeccion", "epp", "comites"];
  const verificar = ["auditoria"];
  const actuar = ["mejora-continua"];
  
  if (planear.includes(programa)) return "planear";
  if (hacer.includes(programa)) return "hacer";
  if (verificar.includes(programa)) return "verificar";
  if (actuar.includes(programa)) return "actuar";
  return "planear";
}

function getMesInicial(anioPlan: number): string {
  const hoy = new Date();
  const anioActual = hoy.getFullYear();
  
  // Si el plan es para un año futuro, empezar en enero
  if (anioPlan > anioActual) {
    return "enero";
  }
  
  // Si el plan es para el año actual, usar el mes actual
  if (anioPlan === anioActual) {
    const mesActual = hoy.getMonth();
    return MESES[mesActual]?.id || "enero";
  }
  
  // Si el plan es de un año pasado, empezar en enero para revisar desde el inicio
  return "enero";
}

interface CronogramaMensualProps {
  actividades: ActividadPlanTrabajo[];
  planId: string;
  anio: number;
  mesInicial?: string;
}

// Palabras clave de actividades que solo aplican a capítulos 2 y 3 (no aplican a capítulo 1)
// Resolución 0312/2019: Estándar 1.2.3 (Curso 50 horas) NO aplica para empresas Capítulo I (≤10 trabajadores riesgo I-III)
const ACTIVIDADES_NO_CAPITULO_1 = [
  "50 horas",
  "curso virtual",
  "curso 50",
  "verificación curso",
  "verificacion curso",
  "certificacion sst",
  "certificación sst",
];

function actividadAplicaACapitulo(actividad: string, companyChapter: number | null): boolean {
  if (companyChapter !== 1) return true; // Para capítulos 2 y 3, todas las actividades aplican
  
  const actividadLower = actividad.toLowerCase();
  for (const keyword of ACTIVIDADES_NO_CAPITULO_1) {
    if (actividadLower.includes(keyword)) {
      return false; // Esta actividad no aplica para capítulo 1
    }
  }
  return true;
}

export function CronogramaMensual({ actividades, planId, anio, mesInicial }: CronogramaMensualProps) {
  const { toast } = useToast();
  const [mesSeleccionado, setMesSeleccionado] = useState(mesInicial || getMesInicial(anio));
  const { selectedCompany } = useCompanyContext();
  const companyChapter = selectedCompany?.calculatedChapter ? parseInt(selectedCompany.calculatedChapter) : null;

  const mesActualIndex = MESES.findIndex(m => m.id === mesSeleccionado);
  const mesInfo = MESES[mesActualIndex];

  // Filtrar actividades que aplican al capítulo de la empresa
  const actividadesFiltradas = useMemo(() => {
    return actividades.filter(act => actividadAplicaACapitulo(act.actividad, companyChapter));
  }, [actividades, companyChapter]);

  const { actividadesMes, resumen } = useMemo(() => {
    const actMes = actividadesFiltradas.filter(act => act.mes === mesSeleccionado);
    
    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActualNumero = hoy.getMonth() + 1;
    const mesSelecNumero = mesInfo?.numero || 1;
    
    const mesPasado = anio < anioActual || (anio === anioActual && mesSelecNumero < mesActualNumero);
    
    const ejecutadas = actMes.filter(a => a.ejecutado || a.estado === "completada").length;
    const pendientes = actMes.filter(a => !a.ejecutado && a.estado !== "completada").length;
    const atrasadas = mesPasado ? pendientes : 0;
    const pendientesSinAtraso = mesPasado ? 0 : pendientes;
    
    const porcentajeCumplimiento = actMes.length > 0 
      ? Math.round((ejecutadas / actMes.length) * 100) 
      : 0;

    return {
      actividadesMes: actMes.sort((a, b) => {
        const cicloOrder = ["planear", "hacer", "verificar", "actuar"];
        const cicloA = getCicloFromPrograma(a.programa);
        const cicloB = getCicloFromPrograma(b.programa);
        return cicloOrder.indexOf(cicloA) - cicloOrder.indexOf(cicloB);
      }),
      resumen: {
        total: actMes.length,
        ejecutadas,
        pendientes: pendientesSinAtraso,
        atrasadas,
        porcentajeCumplimiento,
      },
    };
  }, [actividadesFiltradas, mesSeleccionado, anio, mesInfo]);

  const toggleEjecutadoMutation = useMutation({
    mutationFn: async ({ actividadId, ejecutado }: { actividadId: string; ejecutado: boolean }) => {
      const res = await apiRequest("PATCH", `/api/actividades-plan-trabajo/${actividadId}`, { 
        ejecutado,
        estado: ejecutado ? "completada" : "pendiente"
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "actividades"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "insights"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", planId, "agenda"] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual", planId] });
      queryClient.invalidateQueries({ queryKey: ["/api/planes-trabajo-anual"] });
      toast({ 
        title: "Actualizado", 
        description: "Estado de la actividad actualizado correctamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handlePrevMes = () => {
    if (mesActualIndex > 0) {
      setMesSeleccionado(MESES[mesActualIndex - 1].id);
    }
  };

  const handleNextMes = () => {
    if (mesActualIndex < MESES.length - 1) {
      setMesSeleccionado(MESES[mesActualIndex + 1].id);
    }
  };

  const handleToggleEjecutado = (actividad: ActividadPlanTrabajo) => {
    const nuevoEstado = !(actividad.ejecutado || actividad.estado === "completada");
    toggleEjecutadoMutation.mutate({ actividadId: actividad.id, ejecutado: nuevoEstado });
  };

  const getCicloInfo = (programa: string) => {
    const cicloId = getCicloFromPrograma(programa);
    return CICLOS_PHVA.find(c => c.id === cicloId) || CICLOS_PHVA[0];
  };

  const [, setLocation] = useLocation();

  const handleNavigateToModule = (route: string) => {
    // Guardar el ID del plan de trabajo actual y el mes para poder volver desde el módulo
    localStorage.setItem("lastPlanTrabajoId", planId);
    localStorage.setItem("lastCronogramaMes", mesSeleccionado);
    setLocation(route);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center gap-4 p-4 bg-card rounded-lg border">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevMes}
          disabled={mesActualIndex === 0}
          data-testid="button-prev-mes"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Select value={mesSeleccionado} onValueChange={setMesSeleccionado}>
          <SelectTrigger className="w-[180px]" data-testid="select-mes">
            <SelectValue placeholder="Seleccionar mes" />
          </SelectTrigger>
          <SelectContent>
            {MESES.map((mes) => (
              <SelectItem key={mes.id} value={mes.id} data-testid={`select-mes-option-${mes.id}`}>
                {mes.nombre} {anio}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMes}
          disabled={mesActualIndex === MESES.length - 1}
          data-testid="button-next-mes"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card data-testid="card-resumen-total">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{resumen.total}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  Total Actividades
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-sm">
                        Este número muestra las <strong>actividades únicas</strong> definidas en el plan. En el Panel se muestra el total de ocurrencias (ejecuciones programadas durante el año).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-resumen-ejecutadas">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{resumen.ejecutadas}</p>
                <p className="text-xs text-muted-foreground">Ejecutadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-resumen-pendientes">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{resumen.pendientes}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-resumen-atrasadas">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{resumen.atrasadas}</p>
                <p className="text-xs text-muted-foreground">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-resumen-cumplimiento">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className={`text-2xl font-bold ${
                resumen.porcentajeCumplimiento >= 90 ? 'text-green-600' :
                resumen.porcentajeCumplimiento >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {resumen.porcentajeCumplimiento}%
              </p>
              <p className="text-xs text-muted-foreground">Cumplimiento</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Actividades de {mesInfo?.nombre} {anio}
        </h3>
        
        {actividadesMes.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No hay actividades programadas para este mes
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {actividadesMes.map((actividad, index) => {
              const cicloInfo = getCicloInfo(actividad.programa);
              const isEjecutado = actividad.ejecutado || actividad.estado === "completada";
              const isLoading = toggleEjecutadoMutation.isPending;
              
              return (
                <Card 
                  key={actividad.id} 
                  className={`relative ${isEjecutado ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20' : ''}`}
                  data-testid={`card-actividad-${index}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <Badge 
                        style={{ backgroundColor: cicloInfo.color }}
                        className="text-white"
                        data-testid={`badge-ciclo-${index}`}
                      >
                        {cicloInfo.nombre}
                      </Badge>
                      {isEjecutado && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <CardTitle className="text-base leading-tight mt-2" data-testid={`text-actividad-nombre-${index}`}>
                      {actividad.actividad}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium text-foreground">Programa:</span>{" "}
                        {PROGRAMAS_SST_LABELS[actividad.programa] || actividad.programa}
                      </p>
                      <p className="text-muted-foreground" data-testid={`text-responsable-${index}`}>
                        <span className="font-medium text-foreground">Responsable:</span>{" "}
                        {actividad.responsable}
                      </p>
                      {actividad.objetivo && (
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium text-foreground">Objetivo:</span>{" "}
                          {actividad.objetivo}
                        </p>
                      )}
                      {actividad.meta && (
                        <p className="text-muted-foreground text-xs">
                          <span className="font-medium text-foreground">Meta:</span>{" "}
                          {actividad.meta}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant={isEjecutado ? "default" : "outline"}
                        className={`flex-1 ${isEjecutado ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        onClick={() => handleToggleEjecutado(actividad)}
                        disabled={isLoading}
                        data-testid={`button-toggle-ejecutado-${index}`}
                      >
                        {isEjecutado ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Ejecutado
                          </>
                        ) : (
                          "Ejecutado"
                        )}
                      </Button>
                      {getRouteForActividad(actividad.actividad, actividad.programa) && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            const route = getRouteForActividad(actividad.actividad, actividad.programa);
                            if (route) handleNavigateToModule(route);
                          }}
                          data-testid={`button-navigate-module-${index}`}
                        >
                          Ir al Módulo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
