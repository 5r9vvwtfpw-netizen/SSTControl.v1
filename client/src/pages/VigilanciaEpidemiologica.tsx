import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, FileText, Activity, AlertTriangle, Heart, Brain, Ear, Droplet, Wind, Stethoscope, Trash2, Edit, Printer, CalendarDays, Sparkles, Info, Shield } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { SveProgram, SveCase, insertSveProgramSchema, insertSveCaseSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { formatDateShort } from "@/lib/utils/formatters";
import { SVE_CLASSIFICATION_CONFIGS, getBadgeConfig } from "@/lib/utils/badge-helpers";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaVigilancia = [
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control - Vigilancia Epidemiológica',
    requisitos: [
      'Sistemas de vigilancia epidemiológica ocupacional',
      'Seguimiento a condiciones de salud',
      'Análisis de tendencias de morbilidad',
      'Implementación de programas preventivos'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-2.6.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 2.6.1',
    descripcion: 'Programa de vigilancia epidemiológica',
    requisitos: [
      'Programas de vigilancia según riesgos prioritarios',
      'Indicadores de seguimiento',
      'Actividades de intervención',
      'Evaluación de efectividad'
    ],
    obligatorio: true
  }
];

const riskTypeIcons: Record<string, typeof Activity> = {
  "biomecanico": Activity,
  "psicosocial": Brain,
  "auditivo": Ear,
  "quimico": Droplet,
  "biologico": Stethoscope,
  "visual": Eye,
  "cardiovascular": Heart,
  "respiratorio": Wind,
};

const riskTypeLabels: Record<string, string> = {
  "biomecanico": "Biomecánico",
  "psicosocial": "Psicosocial",
  "auditivo": "Auditivo",
  "quimico": "Químico",
  "biologico": "Biológico",
  "visual": "Visual",
  "cardiovascular": "Cardiovascular",
  "respiratorio": "Respiratorio",
};

const SVE_NORMATIVA_COLOMBIA: Record<string, {
  name: string;
  objective: string;
  targetPopulation: string;
  protocol: string;
  normaBase: string;
}> = {
  biomecanico: {
    name: "Programa SVE Prevención de Desórdenes Musculoesqueléticos (DME) 2026",
    objective: "Identificar, evaluar, prevenir y controlar los factores de riesgo biomecánico que puedan generar desórdenes musculoesqueléticos (DME) en los trabajadores, mediante vigilancia médica y ambiental sistemática, conforme a las GATISO para DME (Resolución 2844/2007), Decreto 1072/2015 Art. 2.2.4.6.24, y Resolución 0312/2019 Estándar 2.6.1.",
    targetPopulation: "Trabajadores expuestos a factores de riesgo biomecánico: manipulación manual de cargas, movimientos repetitivos, posturas prolongadas (sedente o bípeda), vibración de cuerpo entero o segmentaria. Incluye áreas operativas, administrativas con uso prolongado de computador, y personal de bodega/logística.",
    protocol: "1) Evaluaciones médicas ocupacionales con énfasis osteomuscular (ingreso, periódicas anuales, retiro) según Resolución 2346/2007. 2) Aplicación de encuestas de morbilidad sentida (Cuestionario Nórdico Estandarizado). 3) Inspección ergonómica de puestos de trabajo con metodologías validadas (RULA, REBA, NIOSH, OCRA). 4) Pausas activas mínimo 2 veces por jornada. 5) Capacitación en higiene postural y manejo de cargas. 6) Seguimiento semestral de casos en vigilancia. 7) Indicadores: prevalencia DME, incidencia de casos nuevos, cobertura de intervención.",
    normaBase: "GATISO DME (Res. 2844/2007), Decreto 1072/2015, Res. 0312/2019 Est. 2.6.1"
  },
  psicosocial: {
    name: "Programa SVE Prevención de Riesgo Psicosocial 2026",
    objective: "Identificar, evaluar, prevenir, intervenir y monitorear los factores de riesgo psicosocial intralaboral, extralaboral e individual, y sus efectos en la salud de los trabajadores, conforme a la Resolución 2646/2008, Resolución 2764/2022 (actualización de la Batería de Riesgo Psicosocial), Decreto 1072/2015 Art. 2.2.4.6.24, y la Ley 1616/2013 de Salud Mental.",
    targetPopulation: "Todos los trabajadores de la organización, con énfasis en aquellos con resultados de riesgo alto y muy alto en la aplicación de la Batería de Riesgo Psicosocial, trabajadores con cargos de alta demanda emocional, atención al público, jornadas extendidas, trabajo bajo presión o con exposición a eventos potencialmente traumáticos.",
    protocol: "1) Aplicación anual de la Batería de Riesgo Psicosocial (Resolución 2764/2022) por psicólogo especialista con licencia SST vigente. 2) Evaluación de estrés laboral con instrumentos validados. 3) Intervención primaria: promoción de salud mental, manejo del tiempo, comunicación asertiva. 4) Intervención secundaria: grupos focales para riesgo medio, talleres de afrontamiento. 5) Intervención terciaria: remisión a EPS/ARL para riesgo alto y muy alto, seguimiento individual. 6) Programa de prevención de acoso laboral (Ley 1010/2006, Resolución 652/2012 — Comité de Convivencia). 7) Indicadores: distribución por nivel de riesgo, tasa de ausentismo por causa mental, cobertura de intervención.",
    normaBase: "Res. 2646/2008, Res. 2764/2022, Ley 1616/2013, Decreto 1072/2015"
  },
  auditivo: {
    name: "Programa SVE Conservación Auditiva 2026",
    objective: "Prevenir la aparición y progresión de la hipoacusia neurosensorial inducida por ruido (HNIR) en trabajadores expuestos a niveles de presión sonora iguales o superiores a 80 dB(A) TWA, mediante vigilancia audiométrica periódica y control de la exposición, conforme a las GATISO para Hipoacusia Neurosensorial (Resolución 2844/2007), Resolución 0312/2019 Estándar 2.6.1, y la GTC 45.",
    targetPopulation: "Trabajadores expuestos a niveles de ruido iguales o superiores a 80 dB(A) promedio ponderado para 8 horas (TWA), incluyendo áreas de producción, mantenimiento, operación de maquinaria, talleres, plantas industriales y cualquier puesto donde la medición ambiental o dosimetría personal supere el nivel de acción.",
    protocol: "1) Sonometrías y dosimetrías según Resolución 0627/2006 (mínimo anual en áreas críticas). 2) Audiometría tonal por vía aérea de base (ingreso) y de seguimiento (anual para expuestos). 3) Otoscopia previa a cada audiometría. 4) Clasificación de hallazgos: GATI criterios de Larsen/ELI. 5) Dotación y verificación de uso de protección auditiva (NRR adecuado al nivel de exposición). 6) Señalización de áreas con niveles superiores a 85 dB(A). 7) Capacitación anual en efectos del ruido y uso correcto de protectores. 8) Control de ingeniería: aislamiento de fuentes, mantenimiento preventivo. 9) Indicadores: STS (cambio significativo de umbral), prevalencia de hipoacusia, cobertura audiométrica.",
    normaBase: "GATISO HNIR (Res. 2844/2007), Res. 0627/2006, GTC 45, Decreto 1072/2015"
  },
  quimico: {
    name: "Programa SVE Prevención de Riesgo Químico 2026",
    objective: "Prevenir enfermedades laborales derivadas de la exposición a agentes químicos (sólidos, líquidos, gaseosos y vapores) mediante la identificación, evaluación y control de los riesgos asociados, conforme al Sistema Globalmente Armonizado — SGA (Decreto 1496/2018), las GATISO aplicables (Resolución 2844/2007), Decreto 1072/2015 Art. 2.2.4.6.24, y la Resolución 0312/2019 Estándar 2.6.1.",
    targetPopulation: "Trabajadores que manipulan, almacenan, transportan o están expuestos a sustancias químicas peligrosas: personal de laboratorio, mantenimiento, aseo, fumigación, pintura, soldadura, operaciones con solventes, ácidos, bases, plaguicidas, y cualquier puesto con exposición identificada en la matriz de peligros.",
    protocol: "1) Inventario actualizado de sustancias químicas con fichas de datos de seguridad (FDS/SDS) según SGA. 2) Evaluaciones ambientales de exposición (TLV-TWA, TLV-STEL según ACGIH vigente). 3) Monitoreo biológico de trabajadores expuestos (indicadores biológicos de exposición — BEI). 4) Exámenes médicos ocupacionales con paraclínicos específicos según agente (espirometría, hepatograma, hemograma, etc.). 5) Matriz de compatibilidad química para almacenamiento. 6) Dotación de EPP específico (respiradores con filtro adecuado al agente, guantes de material compatible). 7) Capacitación en SGA, etiquetado, lectura de FDS, y procedimientos de emergencia por derrame/fuga. 8) Indicadores: nivel de exposición vs. TLV, biomarcadores dentro de rango, incidencia de efectos adversos.",
    normaBase: "Decreto 1496/2018 (SGA), GATISO (Res. 2844/2007), Decreto 1072/2015, Res. 0312/2019"
  },
  biologico: {
    name: "Programa SVE Prevención de Riesgo Biológico 2026",
    objective: "Prevenir infecciones y enfermedades ocupacionales por exposición a agentes biológicos (virus, bacterias, hongos, parásitos, fluidos corporales, material biológico) mediante medidas de bioseguridad, vacunación y vigilancia médica, conforme al Decreto 1072/2015 Art. 2.2.4.6.24, Resolución 0312/2019 Estándar 2.6.1, y los lineamientos del Ministerio de Salud.",
    targetPopulation: "Trabajadores del sector salud, laboratorio clínico, servicios generales en instituciones de salud, veterinarios, personal de manejo de residuos, manipuladores de alimentos, personal agrícola expuesto a zoonosis, y cualquier trabajador con exposición ocupacional a agentes biológicos identificada en la matriz de peligros.",
    protocol: "1) Evaluación del riesgo biológico según clasificación de agentes (Grupos 1-4 OMS). 2) Esquema de vacunación ocupacional completo (Hepatitis B con titulación de anticuerpos, tétanos, influenza, fiebre amarilla según zona). 3) Capacitación en precauciones universales y estándar de bioseguridad. 4) Gestión integral de residuos biológicos (Decreto 351/2014). 5) Protocolo de atención post-exposición a fluidos corporales (accidente biológico). 6) Suministro y control de EPP de barrera (guantes, tapabocas, gafas, bata). 7) Exámenes médicos periódicos con serologías según exposición. 8) Indicadores: cobertura de vacunación, tasa de accidentes biológicos, cumplimiento de protocolos de bioseguridad.",
    normaBase: "Decreto 1072/2015, Res. 0312/2019 Est. 2.6.1, Decreto 351/2014, Lineamientos MinSalud"
  },
  visual: {
    name: "Programa SVE Conservación Visual 2026",
    objective: "Prevenir y controlar alteraciones visuales de origen ocupacional en trabajadores expuestos a factores de riesgo para la salud visual, mediante vigilancia optométrica y control de condiciones de iluminación, conforme a las GATISO (Resolución 2844/2007), Decreto 1072/2015 Art. 2.2.4.6.24, Resolución 0312/2019 Estándar 2.6.1, y el RETILAP (Resolución 180540/2010).",
    targetPopulation: "Trabajadores con uso prolongado de pantallas de visualización de datos (PVD) — más de 4 horas diarias —, trabajadores expuestos a radiaciones ópticas (soldadura, UV, láser), personal de control de calidad con inspección visual de detalle, y trabajadores en áreas con iluminación deficiente o excesiva.",
    protocol: "1) Examen optométrico ocupacional de ingreso, periódico (anual) y de retiro. 2) Luxometrías en puestos de trabajo según RETILAP (niveles recomendados por actividad). 3) Encuesta de sintomatología visual (fatiga visual, cefalea, ojo seco). 4) Adecuación ergonómica de puestos con PVD: distancia, altura, ángulo de pantalla, uso de filtros antirreflejos. 5) Regla 20-20-20 para usuarios de PVD (cada 20 min, mirar a 20 pies, por 20 segundos). 6) Control de fuentes de deslumbramiento y reflejos. 7) Dotación de protección ocular específica según riesgo (filtros UV, lentes de seguridad). 8) Indicadores: prevalencia de alteraciones visuales, cobertura de exámenes optométricos, cumplimiento de niveles de iluminación.",
    normaBase: "GATISO (Res. 2844/2007), RETILAP (Res. 180540/2010), Decreto 1072/2015, Res. 0312/2019"
  },
  cardiovascular: {
    name: "Programa SVE Prevención de Riesgo Cardiovascular 2026",
    objective: "Identificar, evaluar y controlar los factores de riesgo cardiovascular modificables en los trabajadores, promoviendo estilos de vida y trabajo saludables para prevenir eventos cardiovasculares y cerebrovasculares, conforme al Decreto 1072/2015 Art. 2.2.4.6.24, Resolución 0312/2019 Estándar 2.6.1, y la Guía de Práctica Clínica para la prevención de enfermedad cardiovascular del Ministerio de Salud.",
    targetPopulation: "Trabajadores con factores de riesgo cardiovascular identificados: hipertensión arterial, dislipidemia, diabetes mellitus, sobrepeso u obesidad (IMC ≥ 25), sedentarismo, tabaquismo, antecedentes familiares de enfermedad cardiovascular, edad mayor a 45 años (hombres) o 55 años (mujeres), y trabajadores con estrés laboral alto.",
    protocol: "1) Tamizaje cardiovascular en exámenes médicos ocupacionales: presión arterial, perfil lipídico, glicemia en ayunas, IMC, perímetro abdominal. 2) Estratificación de riesgo cardiovascular (escala Framingham o equivalente validada para Colombia). 3) Programa de actividad física laboral: pausas activas y acondicionamiento físico. 4) Intervención nutricional: educación en alimentación saludable, control de máquinas dispensadoras. 5) Programa de cesación tabáquica. 6) Seguimiento trimestral de casos de riesgo alto y muy alto. 7) Remisión a EPS para manejo de patologías diagnosticadas. 8) Indicadores: distribución por nivel de riesgo cardiovascular, prevalencia de factores de riesgo, adherencia a intervenciones, tasas de ausentismo por causa cardiovascular.",
    normaBase: "Decreto 1072/2015, Res. 0312/2019 Est. 2.6.1, GPC MinSalud Riesgo Cardiovascular"
  },
  respiratorio: {
    name: "Programa SVE Prevención de Enfermedad Respiratoria Ocupacional 2026",
    objective: "Prevenir la aparición y progresión de enfermedades respiratorias de origen ocupacional (neumoconiosis, asma ocupacional, EPOC ocupacional) en trabajadores expuestos a material particulado, gases, vapores, humos y fibras, mediante vigilancia espirométrica y control ambiental, conforme a las GATISO para Neumoconiosis (Resolución 2844/2007), Decreto 1072/2015 Art. 2.2.4.6.24, y Resolución 0312/2019 Estándar 2.6.1.",
    targetPopulation: "Trabajadores expuestos a polvo mineral (sílice, asbesto, carbón), polvo orgánico (algodón, madera, granos), humos metálicos (soldadura), gases y vapores irritantes, fibras minerales, y cualquier agente con potencial de daño al sistema respiratorio identificado en la matriz de peligros con concentraciones cercanas o superiores al nivel de acción.",
    protocol: "1) Evaluación ambiental de material particulado (PM10, PM2.5, fracción respirable) y agentes químicos aerodispersados según TLV-TWA ACGIH. 2) Espirometría ocupacional de base (ingreso) y de seguimiento (anual para expuestos) con interpretación según ATS/ERS. 3) Radiografía de tórax según protocolo OIT para neumoconiosis (lectura por B-Reader certificado) cuando aplique. 4) Encuesta de síntomas respiratorios estandarizada. 5) Dotación de protección respiratoria con factor de protección adecuado al agente y concentración (selección según NIOSH). 6) Pruebas de ajuste (fit test) de respiradores. 7) Control de ingeniería: ventilación localizada, sistemas de extracción, humectación de polvo. 8) Indicadores: función pulmonar (FEV1, FVC, FEV1/FVC), prevalencia de alteraciones espirométricas, concentración ambiental vs. TLV.",
    normaBase: "GATISO Neumoconiosis (Res. 2844/2007), Decreto 1072/2015, Res. 0312/2019, ATS/ERS"
  }
};

export default function VigilanciaEpidemiologica() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("todos");
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [caseDialogOpen, setCaseDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<SveProgram | null>(null);
  const [editingCase, setEditingCase] = useState<SveCase | null>(null);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  
  const [programFormData, setProgramFormData] = useState<{
    name: string;
    riskType: "biomecanico" | "psicosocial" | "auditivo" | "quimico" | "biologico" | "visual" | "cardiovascular" | "respiratorio";
    objective: string;
    targetPopulation: string;
    protocol: string;
    responsibleName: string;
    responsiblePosition: string;
    startDate: string;
    reviewDate: string;
    status: "activo" | "inactivo" | "en_revision";
  }>({
    name: "",
    riskType: "biomecanico",
    objective: "",
    targetPopulation: "",
    protocol: "",
    responsibleName: "",
    responsiblePosition: "",
    startDate: "",
    reviewDate: "",
    status: "activo",
  });

  const [caseFormData, setCaseFormData] = useState<{
    programId: string;
    workerId: string;
    evaluationType: "medica" | "higienica" | "seguimiento" | "inicial";
    evaluatedBy: string;
    evaluationDate: string;
    findings: string;
    results: string;
    classification: "normal" | "vigilancia" | "caso_confirmado" | "caso_cerrado";
    recommendations: string;
    followUpDate: string;
  }>({
    programId: "",
    workerId: "",
    evaluationType: "medica",
    evaluatedBy: "",
    evaluationDate: "",
    findings: "",
    results: "",
    classification: "normal",
    recommendations: "",
    followUpDate: "",
  });

  const { data: programs = [], isLoading: programsLoading } = useQuery<SveProgram[]>({
    queryKey: ["/api/sve-programs"],
  });

  const { data: allCases = [], isLoading: casesLoading } = useQuery<SveCase[]>({
    queryKey: ["/api/sve-cases"],
  });

  const { data: lsoAssignment } = useQuery<{ ok: boolean; data: { type: string; name: string; licenseNumber?: string; licenseExpiry?: string } | null }>({
    queryKey: ["/api/lso-directory-jwt/current-assignment"],
  });

  const createProgramMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSveProgramSchema>) => {
      const res = await apiRequest("POST", "/api/sve-programs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-programs"] });
      setProgramDialogOpen(false);
      resetProgramForm();
      toast({
        title: "Programa SVE creado",
        description: "El programa de vigilancia se ha creado exitosamente",
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

  const updateProgramMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertSveProgramSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/sve-programs/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-programs"] });
      setProgramDialogOpen(false);
      setEditingProgram(null);
      resetProgramForm();
      toast({
        title: "Programa actualizado",
        description: "El programa se ha actualizado exitosamente",
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

  const deleteProgramMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sve-programs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-programs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sve-cases"] });
      toast({
        title: "Programa eliminado",
        description: "El programa se ha eliminado exitosamente",
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

  const createCaseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertSveCaseSchema>) => {
      const res = await apiRequest("POST", "/api/sve-cases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-cases"] });
      setCaseDialogOpen(false);
      resetCaseForm();
      toast({
        title: "Caso registrado",
        description: "El caso de vigilancia se ha registrado exitosamente",
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

  const updateCaseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<z.infer<typeof insertSveCaseSchema>> }) => {
      const res = await apiRequest("PATCH", `/api/sve-cases/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-cases"] });
      setCaseDialogOpen(false);
      setEditingCase(null);
      resetCaseForm();
      toast({
        title: "Caso actualizado",
        description: "El caso se ha actualizado exitosamente",
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

  const deleteCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sve-cases/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sve-cases"] });
      toast({
        title: "Caso eliminado",
        description: "El caso se ha eliminado exitosamente",
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

  const lsoName = lsoAssignment?.data?.name || "";
  const lsoPosition = lsoAssignment?.data ? "Licenciado en Salud Ocupacional" : "";

  useEffect(() => {
    if (lsoName && !editingProgram && !programDialogOpen) {
      setProgramFormData(prev => ({
        ...prev,
        responsibleName: prev.responsibleName || lsoName,
        responsiblePosition: prev.responsiblePosition || lsoPosition,
      }));
    }
  }, [lsoName, lsoPosition, editingProgram, programDialogOpen]);

  const resetProgramForm = () => {
    setProgramFormData({
      name: "",
      riskType: "biomecanico",
      objective: "",
      targetPopulation: "",
      protocol: "",
      responsibleName: lsoName,
      responsiblePosition: lsoPosition,
      startDate: "",
      reviewDate: "",
      status: "activo",
    });
  };

  const resetCaseForm = () => {
    setCaseFormData({
      programId: "",
      workerId: "",
      evaluationType: "medica",
      evaluatedBy: "",
      evaluationDate: "",
      findings: "",
      results: "",
      classification: "normal",
      recommendations: "",
      followUpDate: "",
    });
  };

  const handleAutoFillFromNormativa = useCallback((riskType: string) => {
    if (editingProgram) return;
    const normativa = SVE_NORMATIVA_COLOMBIA[riskType];
    if (!normativa) return;
    
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const startDate = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const review = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate());
    const reviewDate = `${review.getFullYear()}-${pad(review.getMonth() + 1)}-${pad(review.getDate())}`;
    
    setProgramFormData(prev => ({
      ...prev,
      name: normativa.name,
      objective: normativa.objective,
      targetPopulation: normativa.targetPopulation,
      protocol: normativa.protocol,
      startDate,
      reviewDate,
    }));
    
    toast({
      title: "Datos normativos aplicados",
      description: `Formulario completado con normativa colombiana vigente: ${normativa.normaBase}`,
      className: "bg-yellow-50 border-yellow-200",
    });
  }, [editingProgram, toast]);

  const handleProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingProgram) {
      updateProgramMutation.mutate({
        id: editingProgram.id,
        data: {
          ...programFormData,
          reviewDate: programFormData.reviewDate ? new Date(programFormData.reviewDate) : undefined,
          startDate: new Date(programFormData.startDate),
        },
      });
    } else {
      createProgramMutation.mutate({
        ...programFormData,
        reviewDate: programFormData.reviewDate ? new Date(programFormData.reviewDate) : undefined,
        startDate: new Date(programFormData.startDate),
      });
    }
  };

  const handleCaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCase) {
      updateCaseMutation.mutate({
        id: editingCase.id,
        data: {
          ...caseFormData,
          evaluationDate: new Date(caseFormData.evaluationDate),
          followUpDate: caseFormData.followUpDate ? new Date(caseFormData.followUpDate) : undefined,
        },
      });
    } else {
      createCaseMutation.mutate({
        ...caseFormData,
        evaluationDate: new Date(caseFormData.evaluationDate),
        followUpDate: caseFormData.followUpDate ? new Date(caseFormData.followUpDate) : undefined,
      });
    }
  };

  const handleEditProgram = (program: SveProgram) => {
    setEditingProgram(program);
    setProgramFormData({
      name: program.name,
      riskType: program.riskType,
      objective: program.objective,
      targetPopulation: program.targetPopulation,
      protocol: program.protocol || "",
      responsibleName: program.responsibleName,
      responsiblePosition: program.responsiblePosition || "",
      startDate: program.startDate,
      reviewDate: program.reviewDate || "",
      status: program.status,
    });
    setProgramDialogOpen(true);
  };

  const handlePrintProgram = async (programId: string) => {
    try {
      const response = await fetch(`/api/sve-programs/${programId}/pdf`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
      toast({
        title: "PDF generado",
        description: "El informe del programa se ha generado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleEditCase = (sveCase: SveCase) => {
    setEditingCase(sveCase);
    setCaseFormData({
      programId: sveCase.programId,
      workerId: sveCase.workerId,
      evaluationType: sveCase.evaluationType,
      evaluatedBy: sveCase.evaluatedBy,
      evaluationDate: sveCase.evaluationDate,
      findings: sveCase.findings || "",
      results: sveCase.results || "",
      classification: sveCase.classification,
      recommendations: sveCase.recommendations || "",
      followUpDate: sveCase.followUpDate || "",
    });
    setCaseDialogOpen(true);
  };

  const handleNewCase = (programId: string) => {
    setSelectedProgramId(programId);
    setCaseFormData({
      ...caseFormData,
      programId,
    });
    setCaseDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setProgramDialogOpen(false);
    setCaseDialogOpen(false);
    setEditingProgram(null);
    setEditingCase(null);
    setSelectedProgramId(null);
    resetProgramForm();
    resetCaseForm();
  };

  const filteredPrograms = programs.filter((program) => {
    const matchesSearch = 
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.objective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.targetPopulation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = riskFilter === "todos" || program.riskType === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getCasesForProgram = (programId: string) => {
    return allCases.filter(c => c.programId === programId);
  };

  const isLoading = programsLoading || casesLoading;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Vigilancia Epidemiológica Ocupacional (SVE)</h1>
          <p className="text-muted-foreground">
            Gestión de programas de vigilancia epidemiológica según Resolución 0312 de 2019
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open('/api/sve-programs/pdf', '_blank')}
          data-testid="button-download-general-pdf"
        >
          <FileText className="h-4 w-4 mr-2" />
          Descargar PDF
        </Button>
      </div>

      <AutomationAssistant
        titulo="Vigilancia Epidemiológica"
        estandar="2.6.1"
        descripcion="Programa de vigilancia epidemiológica ocupacional"
        normativaAplicable={normativaVigilancia}
        compact={true}
      />

      {/* Filters and Actions */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar programas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-programs"
          />
        </div>
        <Select value={riskFilter} onValueChange={setRiskFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-risk-filter">
            <SelectValue placeholder="Tipo de riesgo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los riesgos</SelectItem>
            <SelectItem value="biomecanico">Biomecánico</SelectItem>
            <SelectItem value="psicosocial">Psicosocial</SelectItem>
            <SelectItem value="auditivo">Auditivo</SelectItem>
            <SelectItem value="quimico">Químico</SelectItem>
            <SelectItem value="biologico">Biológico</SelectItem>
            <SelectItem value="visual">Visual</SelectItem>
            <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
            <SelectItem value="respiratorio">Respiratorio</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={programDialogOpen} onOpenChange={(open) => {
          setProgramDialogOpen(open);
          if (!open) handleCloseDialogs();
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-program">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Programa SVE
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? "Editar" : "Nuevo"} Programa SVE</DialogTitle>
              <DialogDescription>
                Configure el programa de vigilancia epidemiológica ocupacional
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleProgramSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Programa *</Label>
                <Input
                  id="name"
                  value={programFormData.name}
                  onChange={(e) => setProgramFormData({ ...programFormData, name: e.target.value })}
                  placeholder="Ej: Programa SVE Riesgo Biomecánico 2026"
                  required
                  data-testid="input-program-name"
                />
              </div>

              {!editingProgram && (
                <div className="rounded-md border border-yellow-300 dark:border-yellow-700 bg-yellow-50/50 dark:bg-yellow-950/30 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Asistente normativo colombiano</span>
                  </div>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    Seleccione el tipo de riesgo y presione "Aplicar normativa" para completar automáticamente el formulario con datos conforme a la legislación colombiana vigente (Decreto 1072/2015, Resolución 0312/2019, GATISO, y normativa específica por riesgo).
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoFillFromNormativa(programFormData.riskType)}
                    className="border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300"
                    data-testid="button-apply-normativa"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    Aplicar normativa — {riskTypeLabels[programFormData.riskType]}
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="riskType">Tipo de Riesgo *</Label>
                  <Select
                    value={programFormData.riskType}
                    onValueChange={(value: any) =>
                      setProgramFormData({ ...programFormData, riskType: value })
                    }
                  >
                    <SelectTrigger id="riskType" data-testid="select-program-risk-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="biomecanico">Biomecánico</SelectItem>
                      <SelectItem value="psicosocial">Psicosocial</SelectItem>
                      <SelectItem value="auditivo">Auditivo</SelectItem>
                      <SelectItem value="quimico">Químico</SelectItem>
                      <SelectItem value="biologico">Biológico</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="cardiovascular">Cardiovascular</SelectItem>
                      <SelectItem value="respiratorio">Respiratorio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={programFormData.status}
                    onValueChange={(value: any) =>
                      setProgramFormData({ ...programFormData, status: value })
                    }
                  >
                    <SelectTrigger id="status" data-testid="select-program-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                      <SelectItem value="en_revision">En Revisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objetivo del Programa *</Label>
                <Textarea
                  id="objective"
                  value={programFormData.objective}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, objective: e.target.value })
                  }
                  placeholder="Ej: Prevenir lesiones osteomusculares en trabajadores expuestos a manipulación manual de cargas"
                  required
                  rows={3}
                  data-testid="input-program-objective"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetPopulation">Población Objetivo *</Label>
                <Textarea
                  id="targetPopulation"
                  value={programFormData.targetPopulation}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, targetPopulation: e.target.value })
                  }
                  placeholder="Ej: Trabajadores de almacén y logística con exposición diaria a manipulación de cargas"
                  required
                  rows={2}
                  data-testid="input-program-population"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="protocol">Protocolo de Vigilancia</Label>
                <Textarea
                  id="protocol"
                  value={programFormData.protocol}
                  onChange={(e) =>
                    setProgramFormData({ ...programFormData, protocol: e.target.value })
                  }
                  placeholder="Ej: Evaluación médica semestral, análisis ergonómico de puestos, capacitación en higiene postural"
                  rows={3}
                  data-testid="input-program-protocol"
                />
              </div>

              {!editingProgram && programFormData.protocol && SVE_NORMATIVA_COLOMBIA[programFormData.riskType] && (
                <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
                  <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Base normativa:</span> {SVE_NORMATIVA_COLOMBIA[programFormData.riskType].normaBase}. Los campos son editables — ajuste la población objetivo y protocolo según las condiciones específicas de su empresa.
                  </p>
                </div>
              )}

              {!editingProgram && lsoAssignment?.data && (
                <div className="flex items-start gap-2 rounded-md bg-green-50 dark:bg-green-950 p-2">
                  <Shield className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 dark:text-green-300">
                    <span className="font-medium">Trazabilidad LSO:</span> Responsable auto-llenado con los datos del profesional licenciado asignado ({lsoAssignment.data.name}).
                    {lsoAssignment.data.licenseNumber && <> Licencia SST: {lsoAssignment.data.licenseNumber}.</>}
                    {' '}Los campos son editables si necesita ajustarlos.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="responsibleName">Responsable *</Label>
                  <Input
                    id="responsibleName"
                    value={programFormData.responsibleName}
                    onChange={(e) =>
                      setProgramFormData({ ...programFormData, responsibleName: e.target.value })
                    }
                    placeholder="Nombre del responsable"
                    required
                    data-testid="input-program-responsible-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsiblePosition">Cargo</Label>
                  <Input
                    id="responsiblePosition"
                    value={programFormData.responsiblePosition}
                    onChange={(e) =>
                      setProgramFormData({ ...programFormData, responsiblePosition: e.target.value })
                    }
                    placeholder="Cargo del responsable"
                    data-testid="input-program-responsible-position"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={programFormData.startDate}
                    onChange={(e) =>
                      setProgramFormData({ ...programFormData, startDate: e.target.value })
                    }
                    required
                    data-testid="input-program-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reviewDate">Fecha de Revisión</Label>
                  <Input
                    id="reviewDate"
                    type="date"
                    value={programFormData.reviewDate}
                    onChange={(e) =>
                      setProgramFormData({ ...programFormData, reviewDate: e.target.value })
                    }
                    data-testid="input-program-review-date"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialogs} data-testid="button-cancel-program">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProgramMutation.isPending || updateProgramMutation.isPending}
                  data-testid="button-save-program"
                >
                  {(createProgramMutation.isPending || updateProgramMutation.isPending) ? "Guardando..." : editingProgram ? "Actualizar" : "Crear Programa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Cargando programas...</p>
        </div>
      ) : filteredPrograms.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">
                {searchTerm || riskFilter !== "todos"
                  ? "No se encontraron programas con los filtros aplicados"
                  : "No hay programas de vigilancia registrados"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPrograms.map((program) => {
            const Icon = riskTypeIcons[program.riskType];
            const programCases = getCasesForProgram(program.id);
            const criticalCases = programCases.filter(c => c.classification === "caso_confirmado").length;

            return (
              <Card key={program.id} data-testid={`card-program-${program.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <CardDescription>{riskTypeLabels[program.riskType]}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={program.status === "activo" ? "default" : "secondary"}>
                          {program.status === "activo" ? "Activo" : program.status === "inactivo" ? "Inactivo" : "En Revisión"}
                        </Badge>
                        {criticalCases > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {criticalCases} caso{criticalCases !== 1 ? 's' : ''} confirmado{criticalCases !== 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintProgram(program.id)}
                        data-testid={`button-print-program-${program.id}`}
                        title="Imprimir informe del programa"
                      >
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProgram(program)}
                        data-testid={`button-edit-program-${program.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("¿Está seguro de eliminar este programa? Se eliminarán también todos los casos asociados.")) {
                            deleteProgramMutation.mutate(program.id);
                          }
                        }}
                        data-testid={`button-delete-program-${program.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Objetivo:</span>
                      <p className="mt-1">{program.objective}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Población:</span>
                      <p className="mt-1">{program.targetPopulation}</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Responsable:</span>
                      <p className="mt-1">
                        {program.responsibleName}
                        {program.responsiblePosition && ` - ${program.responsiblePosition}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-2 border-t">
                    <div className="flex gap-4">
                      <span>
                        <span className="text-muted-foreground">Inicio:</span>{" "}
                        {formatDateShort(program.startDate)}
                      </span>
                      {program.reviewDate && (
                        <span>
                          <span className="text-muted-foreground">Revisión:</span>{" "}
                          {formatDateShort(program.reviewDate)}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {programCases.length} caso{programCases.length !== 1 ? 's' : ''} registrado{programCases.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Program Cases */}
                  {programCases.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="font-medium text-sm">Casos Asociados</h4>
                      <div className="space-y-2">
                        {programCases.map((sveCase) => (
                          <div
                            key={sveCase.id}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg text-sm"
                            data-testid={`case-${sveCase.id}`}
                          >
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Trabajador ID: {sveCase.workerId}</span>
                                <Badge variant={getBadgeConfig(sveCase.classification, SVE_CLASSIFICATION_CONFIGS).variant}>
                                  {getBadgeConfig(sveCase.classification, SVE_CLASSIFICATION_CONFIGS).label}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground text-xs">
                                Evaluación: {formatDateShort(sveCase.evaluationDate)} • Evaluado por: {sveCase.evaluatedBy}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCase(sveCase)}
                                data-testid={`button-edit-case-${sveCase.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm("¿Está seguro de eliminar este caso?")) {
                                    deleteCaseMutation.mutate(sveCase.id);
                                  }
                                }}
                                data-testid={`button-delete-case-${sveCase.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleNewCase(program.id)}
                    data-testid={`button-new-case-${program.id}`}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Nuevo Caso
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Case Dialog */}
      <Dialog open={caseDialogOpen} onOpenChange={(open) => {
        setCaseDialogOpen(open);
        if (!open) handleCloseDialogs();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCase ? "Editar" : "Nuevo"} Caso de Vigilancia</DialogTitle>
            <DialogDescription>
              Registre los hallazgos de la evaluación del trabajador
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCaseSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workerId">ID Trabajador *</Label>
                <Input
                  id="workerId"
                  value={caseFormData.workerId}
                  onChange={(e) =>
                    setCaseFormData({ ...caseFormData, workerId: e.target.value })
                  }
                  placeholder="ID del trabajador"
                  required
                  data-testid="input-case-worker-id"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evaluationType">Tipo de Evaluación *</Label>
                <Select
                  value={caseFormData.evaluationType}
                  onValueChange={(value: any) =>
                    setCaseFormData({ ...caseFormData, evaluationType: value })
                  }
                >
                  <SelectTrigger id="evaluationType" data-testid="select-case-evaluation-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medica">Médica</SelectItem>
                    <SelectItem value="higienica">Higiénica</SelectItem>
                    <SelectItem value="seguimiento">Seguimiento</SelectItem>
                    <SelectItem value="inicial">Inicial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="evaluationDate">Fecha de Evaluación *</Label>
                <Input
                  id="evaluationDate"
                  type="date"
                  value={caseFormData.evaluationDate}
                  onChange={(e) =>
                    setCaseFormData({ ...caseFormData, evaluationDate: e.target.value })
                  }
                  required
                  data-testid="input-case-evaluation-date"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="evaluatedBy">Evaluado Por *</Label>
                <Input
                  id="evaluatedBy"
                  value={caseFormData.evaluatedBy}
                  onChange={(e) =>
                    setCaseFormData({ ...caseFormData, evaluatedBy: e.target.value })
                  }
                  placeholder="Nombre del profesional"
                  required
                  data-testid="input-case-evaluated-by"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="classification">Clasificación *</Label>
              <Select
                value={caseFormData.classification}
                onValueChange={(value: any) =>
                  setCaseFormData({ ...caseFormData, classification: value })
                }
              >
                <SelectTrigger id="classification" data-testid="select-case-classification">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="vigilancia">Vigilancia</SelectItem>
                  <SelectItem value="caso_confirmado">Caso Confirmado</SelectItem>
                  <SelectItem value="caso_cerrado">Caso Cerrado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="findings">Hallazgos</Label>
              <Textarea
                id="findings"
                value={caseFormData.findings}
                onChange={(e) =>
                  setCaseFormData({ ...caseFormData, findings: e.target.value })
                }
                placeholder="Describa los hallazgos principales"
                rows={3}
                data-testid="input-case-findings"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="results">Resultados</Label>
              <Textarea
                id="results"
                value={caseFormData.results}
                onChange={(e) =>
                  setCaseFormData({ ...caseFormData, results: e.target.value })
                }
                placeholder="Resultados de la evaluación"
                rows={3}
                data-testid="input-case-results"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendations">Recomendaciones</Label>
              <Textarea
                id="recommendations"
                value={caseFormData.recommendations}
                onChange={(e) =>
                  setCaseFormData({ ...caseFormData, recommendations: e.target.value })
                }
                placeholder="Especifique las recomendaciones y acciones a seguir"
                rows={3}
                data-testid="input-case-recommendations"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="followUpDate">Fecha de Seguimiento</Label>
              <Input
                id="followUpDate"
                type="date"
                value={caseFormData.followUpDate}
                onChange={(e) =>
                  setCaseFormData({ ...caseFormData, followUpDate: e.target.value })
                }
                data-testid="input-case-followup-date"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialogs} data-testid="button-cancel-case">
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createCaseMutation.isPending || updateCaseMutation.isPending}
                data-testid="button-save-case"
              >
                {(createCaseMutation.isPending || updateCaseMutation.isPending) ? "Guardando..." : editingCase ? "Actualizar" : "Registrar Caso"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
