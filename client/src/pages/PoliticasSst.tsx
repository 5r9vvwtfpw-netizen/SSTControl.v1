import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type PoliticaSst, type Worker, type ResponsibleDesignation } from "@shared/schema";
import { Plus, Pencil, Trash2, FileText, FileDown, CheckCircle2, Clock, Archive, Bot, CalendarDays } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { politicasSstPredefinidas, getPoliticaByCodigo, categoriaPoliticaLabels } from "@/data/politicas-sst-predefinidas";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { getTodayDateString } from "@/lib/utils/formatters";

const normativaPoliticas = [
  {
    codigo: 'DEC-1072-2.2.4.6.5',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.5',
    descripcion: 'Política de Seguridad y Salud en el Trabajo',
    requisitos: [
      'Compromiso hacia la protección de la seguridad y salud',
      'Cumplimiento de requisitos legales aplicables',
      'Comunicación a todos los trabajadores',
      'Revisión anual y actualización según corresponda'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-1.1.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 1.1.1',
    descripcion: 'Política del SG-SST firmada, fechada y comunicada',
    requisitos: [
      'Documento escrito y firmado por el empleador',
      'Fecha de aprobación vigente',
      'Comunicación a todos los niveles de la organización',
      'Disponible para partes interesadas'
    ],
    obligatorio: true
  }
];

const PLANTILLA_ESTANDAR = {
  declaracionCompromiso: `La alta dirección de [NOMBRE DE LA EMPRESA] se compromete con la protección y promoción de la seguridad y salud de todos sus trabajadores, contratistas y visitantes, mediante la implementación, mantenimiento y mejora continua del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST), en cumplimiento con la normatividad vigente colombiana, especialmente la Resolución 0312 de 2019 y el Decreto 1072 de 2015.

Nos comprometemos a proporcionar condiciones de trabajo seguras y saludables para la prevención de lesiones y enfermedades laborales, así como a promover una cultura de autocuidado y corresponsabilidad en todos los niveles de la organización.`,
  objetivos: [
    "Identificar, evaluar y controlar los peligros y riesgos asociados a las actividades laborales de la empresa.",
    "Cumplir con la legislación nacional vigente en materia de Seguridad y Salud en el Trabajo, así como con otros requisitos que suscriba la organización.",
    "Proteger la seguridad y salud de todos los trabajadores, mediante la mejora continua del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST).",
    "Capacitar y entrenar a todos los trabajadores en aspectos de seguridad y salud en el trabajo, fomentando la participación activa.",
    "Garantizar que se asignen los recursos necesarios (humanos, técnicos, físicos y financieros) para el desarrollo e implementación del SG-SST.",
    "Promover una cultura de prevención de riesgos laborales y autocuidado en todos los niveles de la organización.",
    "Prevenir accidentes de trabajo y enfermedades laborales mediante la implementación de medidas de control eficaces.",
    "Realizar seguimiento continuo y medición del desempeño del SG-SST para su mejora continua.",
  ],
  alcance: `Esta política aplica a todos los trabajadores de [NOMBRE DE LA EMPRESA], independientemente de su forma de contratación o vinculación, incluyendo trabajadores en misión, contratistas, aprendices, pasantes y visitantes que desarrollen actividades en las instalaciones de la empresa o en representación de la misma.

El Sistema de Gestión de Seguridad y Salud en el Trabajo cubre todas las sedes, procesos, áreas y actividades desarrolladas por la organización en el territorio colombiano.`,
  responsabilidades: {
    altaDireccion: `La Alta Dirección es responsable de liderar y comprometerse con la implementación y mejora del SG-SST, asignando los recursos necesarios, definiendo objetivos, metas y políticas, garantizando el cumplimiento normativo, y promoviendo la participación de todos los trabajadores en el sistema.`,
    responsableSst: `El Responsable del SG-SST tiene la función de planificar, organizar, dirigir, desarrollar y aplicar el Sistema de Gestión de Seguridad y Salud en el Trabajo. Debe coordinar con las diferentes áreas de la empresa, realizar seguimiento al cumplimiento de las actividades programadas, reportar el desempeño del sistema a la alta dirección, y mantener actualizada la documentación del SG-SST.`,
    trabajadores: `Los trabajadores tienen la responsabilidad de cumplir con las normas de seguridad, utilizar adecuadamente los elementos de protección personal, reportar condiciones inseguras y accidentes, participar activamente en las actividades de capacitación y prevención, y velar por su propia seguridad y la de sus compañeros.`,
  },
  compromisos: [
    "Identificar los peligros, evaluar y valorar los riesgos y establecer los respectivos controles.",
    "Proteger la seguridad y salud de todos los trabajadores, mediante la mejora continua del SG-SST.",
    "Cumplir la normatividad nacional vigente aplicable en materia de riesgos laborales.",
    "Destinar los recursos necesarios (humanos, técnicos, físicos y financieros) para el diseño, implementación, revisión, evaluación y mejora de las medidas de prevención y control.",
    "Garantizar la participación de todos los trabajadores y sus representantes en la implementación del SG-SST.",
    "Promover y mantener un ambiente de trabajo seguro y saludable.",
    "Realizar capacitación y entrenamiento continuo en aspectos de seguridad y salud en el trabajo.",
    "Investigar todos los incidentes y accidentes de trabajo para implementar acciones correctivas y preventivas.",
    "Mejorar continuamente los procesos y el desempeño del SG-SST.",
    "Comunicar y socializar esta política a todos los niveles de la organización y partes interesadas.",
  ],
  recursos: `La organización se compromete a asignar y mantener los recursos necesarios para la implementación, mantenimiento y mejora continua del Sistema de Gestión de Seguridad y Salud en el Trabajo, incluyendo:

- **Recursos Humanos**: Personal competente y capacitado, incluyendo el Responsable del SG-SST con licencia vigente, COPASST, Comité de Convivencia Laboral, y personal médico cuando sea requerido.

- **Recursos Físicos**: Instalaciones adecuadas, equipos de protección personal, equipos de emergencia, señalización, y herramientas necesarias para el control de riesgos.

- **Recursos Financieros**: Presupuesto anual asignado para actividades de promoción, prevención, capacitación, exámenes médicos ocupacionales, adquisición de EPP y equipos de emergencia, y mejora de condiciones de trabajo.

- **Recursos Tecnológicos**: Sistemas de información, software especializado para la gestión del SG-SST, y herramientas tecnológicas para la identificación y control de peligros.`,
  revisionComunicacion: `Esta política será revisada como mínimo una vez al año por la alta dirección, o cuando las circunstancias lo ameriten, tales como cambios en la legislación, cambios en los procesos, incidentes graves, o resultados de auditorías. Las actualizaciones y modificaciones quedarán registradas mediante un control de versiones.

La política será comunicada a todos los trabajadores a través de los siguientes medios:
- Publicación en carteleras y lugares visibles de la empresa
- Inducción y reinducción de personal
- Capacitaciones periódicas del SG-SST
- Correo electrónico corporativo
- Reuniones de seguridad y charlas de 5 minutos
- Página web o intranet corporativa (si aplica)

La política estará disponible para todas las partes interesadas que lo soliciten.`,
};

export default function PoliticasSstPage() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPolitica, setEditingPolitica] = useState<PoliticaSst | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [politicaToDelete, setPoliticaToDelete] = useState<string | null>(null);
  const [selectedPredefinido, setSelectedPredefinido] = useState("");

  const [activeTab, setActiveTab] = useState("general");
  
  const [formData, setFormData] = useState({
    codigo: "",
    version: "",
    estado: "borrador" as "borrador" | "vigente" | "archivada",
    fechaEmision: "",
    fechaProximaRevision: "",
    declaracionCompromiso: "",
    objetivos: [""],
    alcance: "",
    responsabilidadAltaDireccion: "",
    responsabilidadResponsableSst: "",
    responsabilidadTrabajadores: "",
    compromisos: [""],
    recursos: "",
    revisionComunicacion: "",
    representanteLegal: "",
    cedulaRepresentante: "",
    responsableSst: "",
    licenciaSst: "",
    fechaFirma: "",
    elaboradoPorId: "",
    autorizadoPorId: "",
    aprobadoPorId: "",
  });

  const { data: politicas = [], isLoading: politicasLoading } = useQuery<PoliticaSst[]>({
    queryKey: ["/api/politicas-sst"],
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const { data: contracts = [] } = useQuery<any[]>({
    queryKey: ["/api/contracts"],
  });

  // Obtener designaciones de responsable SST para pre-poblar el campo
  const { data: responsibleDesignations = [] } = useQuery<ResponsibleDesignation[]>({
    queryKey: ["/api/responsible-designations"],
  });

  // Obtener el responsable SST activo (el más reciente con status activo)
  const activeResponsible = useMemo(() => {
    const activos = responsibleDesignations.filter((d) => d.status === "activo");
    if (activos.length === 0 || !workers) return null;
    // Ordenar por fecha de designación descendente para obtener el más reciente
    activos.sort((a, b) => new Date(b.designationDate).getTime() - new Date(a.designationDate).getTime());
    const designacion = activos[0];
    const worker = workers.find((w) => w.id === designacion.workerId);
    if (!worker) return null;
    return {
      workerId: worker.id,
      name: worker.name,
      position: worker.position || "", // Usar posición del trabajador para que coincida con el Select
      licenciaSst: designacion.licenciaSstNumero || "",
    };
  }, [responsibleDesignations, workers]);

  // Filtrar trabajadores que tienen contratos activos
  const workersConContrato = useMemo(() => {
    if (!workers || !contracts) return [];
    const workerIdsConContrato = new Set(
      contracts
        .filter((c: any) => c.status === "activo")
        .map((c: any) => c.workerId)
    );
    return workers.filter((w) => workerIdsConContrato.has(w.id));
  }, [workers, contracts]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        objetivos: JSON.stringify(data.objetivos.filter((o: string) => o.trim() !== "")),
        compromisos: JSON.stringify(data.compromisos.filter((c: string) => c.trim() !== "")),
        responsabilidades: JSON.stringify({
          altaDireccion: data.responsabilidadAltaDireccion,
          responsableSst: data.responsabilidadResponsableSst,
          trabajadores: data.responsabilidadTrabajadores,
        }),
        // Convert empty strings to null for optional fields
        licenciaSst: data.licenciaSst?.trim() || null,
        elaboradoPorId: data.elaboradoPorId?.trim() || null,
        autorizadoPorId: data.autorizadoPorId?.trim() || null,
        aprobadoPorId: data.aprobadoPorId?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
      };
      const res = await apiRequest("POST", "/api/politicas-sst", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politicas-sst"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Política creada",
        description: "La política de SST se ha creado exitosamente",
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
      const payload = {
        ...data,
        objetivos: JSON.stringify(data.objetivos.filter((o: string) => o.trim() !== "")),
        compromisos: JSON.stringify(data.compromisos.filter((c: string) => c.trim() !== "")),
        responsabilidades: JSON.stringify({
          altaDireccion: data.responsabilidadAltaDireccion,
          responsableSst: data.responsabilidadResponsableSst,
          trabajadores: data.responsabilidadTrabajadores,
        }),
        // Convert empty strings to null for optional fields
        licenciaSst: data.licenciaSst?.trim() || null,
        elaboradoPorId: data.elaboradoPorId?.trim() || null,
        autorizadoPorId: data.autorizadoPorId?.trim() || null,
        aprobadoPorId: data.aprobadoPorId?.trim() || null,
        observaciones: data.observaciones?.trim() || null,
      };
      const res = await apiRequest("PATCH", `/api/politicas-sst/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politicas-sst"] });
      setDialogOpen(false);
      setEditingPolitica(null);
      resetForm();
      toast({
        title: "Política actualizada",
        description: "La política de SST se ha actualizado exitosamente",
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
      await apiRequest("DELETE", `/api/politicas-sst/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/politicas-sst"] });
      toast({
        title: "Política eliminada",
        description: "La política ha sido eliminada exitosamente",
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
      codigo: "",
      version: "",
      estado: "borrador",
      fechaEmision: "",
      fechaProximaRevision: "",
      declaracionCompromiso: "",
      objetivos: [""],
      alcance: "",
      responsabilidadAltaDireccion: "",
      responsabilidadResponsableSst: "",
      responsabilidadTrabajadores: "",
      compromisos: [""],
      recursos: "",
      revisionComunicacion: "",
      representanteLegal: "",
      cedulaRepresentante: "",
      responsableSst: "",
      licenciaSst: "",
      fechaFirma: "",
      elaboradoPorId: "",
      autorizadoPorId: "",
      aprobadoPorId: "",
    });
    setEditingPolitica(null);
  };

  const handleOpenDialog = (politica?: PoliticaSst) => {
    setActiveTab("general"); // Siempre empezar en la primera pestaña
    if (politica) {
      const responsabilidades = JSON.parse(politica.responsabilidades);
      setFormData({
        codigo: politica.codigo,
        version: politica.version,
        estado: politica.estado,
        fechaEmision: new Date(politica.fechaEmision).toISOString().split("T")[0],
        fechaProximaRevision: new Date(politica.fechaProximaRevision).toISOString().split("T")[0],
        declaracionCompromiso: politica.declaracionCompromiso,
        objetivos: JSON.parse(politica.objetivos),
        alcance: politica.alcance,
        responsabilidadAltaDireccion: responsabilidades.altaDireccion,
        responsabilidadResponsableSst: responsabilidades.responsableSst,
        responsabilidadTrabajadores: responsabilidades.trabajadores,
        compromisos: JSON.parse(politica.compromisos),
        recursos: politica.recursos,
        revisionComunicacion: politica.revisionComunicacion,
        representanteLegal: politica.representanteLegal,
        cedulaRepresentante: politica.cedulaRepresentante,
        responsableSst: politica.responsableSst,
        licenciaSst: politica.licenciaSst || "",
        fechaFirma: new Date(politica.fechaFirma).toISOString().split("T")[0],
        elaboradoPorId: politica.elaboradoPorId || "",
        autorizadoPorId: politica.autorizadoPorId || "",
        aprobadoPorId: politica.aprobadoPorId || "",
      });
      setEditingPolitica(politica);
    } else {
      // Auto-aplicar plantilla estándar para nuevas políticas
      const todayStr = getTodayDateString();
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      const nextYearStr = nextYear.toLocaleDateString('en-CA', { timeZone: 'America/Bogota' });
      
      // Pre-poblar el responsable SST si existe una designación activa
      // El valor del Select es "${worker.name} - ${worker.position}"
      const responsableSstDefault = activeResponsible 
        ? `${activeResponsible.name} - ${activeResponsible.position}` 
        : "";
      const licenciaSstDefault = activeResponsible?.licenciaSst || "";
      
      setFormData({
        codigo: `POL-SST-${(politicas.length + 1).toString().padStart(3, '0')}`,
        version: "1.0",
        estado: "borrador",
        fechaEmision: todayStr,
        fechaProximaRevision: nextYearStr,
        declaracionCompromiso: PLANTILLA_ESTANDAR.declaracionCompromiso,
        objetivos: [...PLANTILLA_ESTANDAR.objetivos],
        alcance: PLANTILLA_ESTANDAR.alcance,
        responsabilidadAltaDireccion: PLANTILLA_ESTANDAR.responsabilidades.altaDireccion,
        responsabilidadResponsableSst: PLANTILLA_ESTANDAR.responsabilidades.responsableSst,
        responsabilidadTrabajadores: PLANTILLA_ESTANDAR.responsabilidades.trabajadores,
        compromisos: [...PLANTILLA_ESTANDAR.compromisos],
        recursos: PLANTILLA_ESTANDAR.recursos,
        revisionComunicacion: PLANTILLA_ESTANDAR.revisionComunicacion,
        representanteLegal: "",
        cedulaRepresentante: "",
        responsableSst: responsableSstDefault,
        licenciaSst: licenciaSstDefault,
        fechaFirma: todayStr,
        elaboradoPorId: "",
        autorizadoPorId: "",
        aprobadoPorId: "",
      });
      setEditingPolitica(null);
    }
    setDialogOpen(true);
  };

  // Mapping de campos a pestañas para navegación automática
  const campoTabMap: Record<string, string> = {
    codigo: 'general',
    version: 'general',
    fechaEmision: 'general',
    declaracionCompromiso: 'contenido',
    alcance: 'contenido',
    representanteLegal: 'firmas',
    cedulaRepresentante: 'firmas',
    responsableSst: 'firmas',
    fechaFirma: 'firmas',
  };

  const handleSubmit = () => {
    // Validación de campos obligatorios con mensajes específicos
    const camposObligatorios: { campo: string; valor: string; etiqueta: string; tab: string }[] = [
      { campo: 'codigo', valor: formData.codigo, etiqueta: 'Código de la política', tab: 'general' },
      { campo: 'version', valor: formData.version, etiqueta: 'Versión', tab: 'general' },
      { campo: 'fechaEmision', valor: formData.fechaEmision, etiqueta: 'Fecha de emisión', tab: 'general' },
      { campo: 'declaracionCompromiso', valor: formData.declaracionCompromiso, etiqueta: 'Declaración de compromiso', tab: 'contenido' },
      { campo: 'alcance', valor: formData.alcance, etiqueta: 'Alcance de la política', tab: 'contenido' },
      { campo: 'representanteLegal', valor: formData.representanteLegal, etiqueta: 'Nombre del representante legal', tab: 'firmas' },
      { campo: 'cedulaRepresentante', valor: formData.cedulaRepresentante, etiqueta: 'Cédula del representante', tab: 'firmas' },
      { campo: 'responsableSst', valor: formData.responsableSst, etiqueta: 'Responsable del SG-SST', tab: 'firmas' },
      { campo: 'fechaFirma', valor: formData.fechaFirma, etiqueta: 'Fecha de firma', tab: 'firmas' },
    ];

    const camposFaltantes = camposObligatorios.filter(c => !c.valor || c.valor.trim() === '');

    if (camposFaltantes.length > 0) {
      // Navegar a la primera pestaña con campos incompletos
      const primerCampoFaltante = camposFaltantes[0];
      if (primerCampoFaltante.tab && primerCampoFaltante.tab !== activeTab) {
        setActiveTab(primerCampoFaltante.tab);
      }
      
      // Agrupar por pestaña para mejor mensaje
      const camposPorTab = camposFaltantes.reduce((acc, c) => {
        const tabLabel = c.tab === 'general' ? 'General' : c.tab === 'contenido' ? 'Contenido' : c.tab === 'firmas' ? 'Firmas' : c.tab;
        if (!acc[tabLabel]) acc[tabLabel] = [];
        acc[tabLabel].push(c.etiqueta);
        return acc;
      }, {} as Record<string, string[]>);
      
      toast({
        title: "Campos obligatorios incompletos",
        description: (
          <div className="mt-2">
            <p className="mb-2 font-medium">Por favor complete los siguientes campos:</p>
            {Object.entries(camposPorTab).map(([tab, campos]) => (
              <div key={tab} className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Pestaña "{tab}":</p>
                <ul className="list-disc list-inside space-y-0.5 text-sm">
                  {campos.map((campo, i) => (
                    <li key={i}>{campo}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ),
        variant: "destructive",
        duration: 10000,
      });
      return;
    }

    // Validación específica de fechas con mensajes claros
    const validarFecha = (valor: string, etiqueta: string): string | null => {
      if (!valor) return `${etiqueta} es obligatoria`;
      const fecha = new Date(valor);
      if (isNaN(fecha.getTime())) {
        return `${etiqueta} tiene un formato inválido. Use el formato AAAA-MM-DD (ej: 2025-12-06)`;
      }
      return null;
    };

    const erroresFecha: string[] = [];
    
    const errorEmision = validarFecha(formData.fechaEmision, "Fecha de emisión");
    if (errorEmision) erroresFecha.push(errorEmision);
    
    const errorRevision = validarFecha(formData.fechaProximaRevision, "Fecha de próxima revisión");
    if (errorRevision) erroresFecha.push(errorRevision);
    
    const errorFirma = validarFecha(formData.fechaFirma, "Fecha de firma");
    if (errorFirma) erroresFecha.push(errorFirma);

    // Validar que la fecha de revisión sea posterior a la de emisión
    if (!erroresFecha.length && formData.fechaEmision && formData.fechaProximaRevision) {
      const fechaEmision = new Date(formData.fechaEmision);
      const fechaRevision = new Date(formData.fechaProximaRevision);
      if (fechaRevision <= fechaEmision) {
        erroresFecha.push("La fecha de próxima revisión debe ser posterior a la fecha de emisión");
      }
    }

    // Validar que la fecha de firma no sea futura
    if (!erroresFecha.some(e => e.includes("firma")) && formData.fechaFirma) {
      const fechaFirma = new Date(formData.fechaFirma);
      const hoy = new Date();
      hoy.setHours(23, 59, 59, 999);
      if (fechaFirma > hoy) {
        erroresFecha.push("La fecha de firma no puede ser una fecha futura");
      }
    }

    if (erroresFecha.length > 0) {
      toast({
        title: "Error en las fechas",
        description: (
          <div className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-sm">
              {erroresFecha.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      });
      return;
    }

    // Validar que haya al menos un objetivo
    const objetivosValidos = formData.objetivos.filter(o => o.trim() !== '');
    if (objetivosValidos.length === 0) {
      toast({
        title: "Objetivos requeridos",
        description: "Debe agregar al menos un objetivo para la política de SST.",
        variant: "destructive",
      });
      return;
    }

    // Validar que haya al menos un compromiso
    const compromisosValidos = formData.compromisos.filter(c => c.trim() !== '');
    if (compromisosValidos.length === 0) {
      toast({
        title: "Compromisos requeridos",
        description: "Debe agregar al menos un compromiso para la política de SST.",
        variant: "destructive",
      });
      return;
    }

    if (editingPolitica) {
      updateMutation.mutate({ id: editingPolitica.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (politicaToDelete) {
      deleteMutation.mutate(politicaToDelete);
      setDeleteDialogOpen(false);
      setPoliticaToDelete(null);
    }
  };

  const aplicarPlantilla = () => {
    setFormData((prev) => ({
      ...prev,
      declaracionCompromiso: PLANTILLA_ESTANDAR.declaracionCompromiso,
      objetivos: [...PLANTILLA_ESTANDAR.objetivos],
      alcance: PLANTILLA_ESTANDAR.alcance,
      responsabilidadAltaDireccion: PLANTILLA_ESTANDAR.responsabilidades.altaDireccion,
      responsabilidadResponsableSst: PLANTILLA_ESTANDAR.responsabilidades.responsableSst,
      responsabilidadTrabajadores: PLANTILLA_ESTANDAR.responsabilidades.trabajadores,
      compromisos: [...PLANTILLA_ESTANDAR.compromisos],
      recursos: PLANTILLA_ESTANDAR.recursos,
      revisionComunicacion: PLANTILLA_ESTANDAR.revisionComunicacion,
    }));
    toast({
      title: "Plantilla aplicada",
      description: "Se ha aplicado la plantilla estándar. Puede modificarla según sus necesidades.",
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const handleAutoFillFromPredefinido = (codigo: string) => {
    if (!codigo) return;
    
    const politica = getPoliticaByCodigo(codigo);
    if (!politica) return;

    const extractedObjectives = politica.contenido
      .split(/\d+\.\s+[A-ZÁÉÍÓÚÑ\s]+:/g)
      .filter(item => item.trim())
      .map(item => item.trim().replace(/^\s*[-•]\s*/, '').split('\n')[0].trim())
      .filter(item => item.length > 10);

    const objectives = extractedObjectives.length > 0 
      ? extractedObjectives.slice(0, 8)
      : [politica.objetivo];

    setFormData((prev) => ({
      ...prev,
      codigo: politica.codigo,
      declaracionCompromiso: politica.contenido,
      objetivos: objectives,
      alcance: politica.alcance,
    }));

    toast({
      title: "Política predefinida aplicada",
      description: `Se aplicó: ${politica.titulo}`,
      className: "bg-yellow-50 border-yellow-200",
    });
  };

  const agregarObjetivo = () => {
    setFormData((prev) => ({
      ...prev,
      objetivos: [...prev.objetivos, ""],
    }));
  };

  const eliminarObjetivo = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      objetivos: prev.objetivos.filter((_, i) => i !== index),
    }));
  };

  const agregarCompromiso = () => {
    setFormData((prev) => ({
      ...prev,
      compromisos: [...prev.compromisos, ""],
    }));
  };

  const eliminarCompromiso = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      compromisos: prev.compromisos.filter((_, i) => i !== index),
    }));
  };

  const handleViewPdf = (id: string) => {
    const url = `/api/politicas-sst/${id}/pdf`;
    // Abrir PDF en nueva pestaña para evitar bloqueo de Chrome en iframes
    window.open(url, '_blank');
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "vigente":
        return <Badge data-testid={`badge-estado-${estado}`} className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle2 className="h-3 w-3 mr-1" />Vigente</Badge>;
      case "borrador":
        return <Badge data-testid={`badge-estado-${estado}`} variant="secondary"><Clock className="h-3 w-3 mr-1" />Borrador</Badge>;
      case "archivada":
        return <Badge data-testid={`badge-estado-${estado}`} variant="outline"><Archive className="h-3 w-3 mr-1" />Archivada</Badge>;
      default:
        return <Badge data-testid={`badge-estado-${estado}`}>{estado}</Badge>;
    }
  };

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
    <div className="container mx-auto p-6 space-y-6">
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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-4">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">Políticas de SST</CardTitle>
            <CardDescription>Gestión de políticas de Seguridad y Salud en el Trabajo según Resolución 0312/2019</CardDescription>
          </div>
          <AutomationAssistant
            titulo="Política de SST"
            estandar="1.1.2"
            descripcion="Política de Seguridad y Salud en el Trabajo según Decreto 1072"
            normativaAplicable={normativaPoliticas}
            compact={true}
          />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-nueva-politica" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Nueva Política
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPolitica ? "Editar Política SST" : "Nueva Política SST"}</DialogTitle>
                <DialogDescription>
                  Complete la información de la política. Puede usar la plantilla estándar como base.
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="general" className="relative">
                    General
                    {(!formData.codigo || !formData.version || !formData.fechaEmision) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" title="Campos obligatorios incompletos" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="contenido" className="relative">
                    Contenido
                    {(!formData.declaracionCompromiso || !formData.alcance) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" title="Campos obligatorios incompletos" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="responsabilidades">Responsabilidades</TabsTrigger>
                  <TabsTrigger value="compromisos">Compromisos</TabsTrigger>
                  <TabsTrigger value="firmas" className="relative">
                    Firmas
                    {(!formData.representanteLegal || !formData.cedulaRepresentante || !formData.responsableSst || !formData.fechaFirma) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" title="Campos obligatorios incompletos" />
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  {!editingPolitica && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione una política predefinida para auto-rellenar los campos</p>
                          </div>
                          <div className="flex gap-2">
                            <Select value={selectedPredefinido} onValueChange={(value) => {
                              setSelectedPredefinido(value);
                              handleAutoFillFromPredefinido(value);
                            }}>
                              <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-predefinido">
                                <SelectValue placeholder="Seleccione una política predefinida..." />
                              </SelectTrigger>
                              <SelectContent className="max-h-[400px]">
                                {Object.entries(categoriaPoliticaLabels).map(([cat, label]) => {
                                  const politicasInCategoria = politicasSstPredefinidas.filter(p => p.categoria === cat);
                                  if (politicasInCategoria.length === 0) return null;
                                  return (
                                    <div key={cat}>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                                        {label}
                                      </div>
                                      {politicasInCategoria.map((politica) => (
                                        <SelectItem key={politica.codigo} value={politica.codigo}>
                                          {politica.titulo}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="codigo">Código del Documento *</Label>
                      <Input
                        id="codigo"
                        data-testid="input-codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="POL-SST-001"
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Versión *</Label>
                      <Input
                        id="version"
                        data-testid="input-version"
                        value={formData.version}
                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                        placeholder="1.0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="estado">Estado *</Label>
                      <Select value={formData.estado} onValueChange={(value: any) => setFormData({ ...formData, estado: value })}>
                        <SelectTrigger data-testid="select-estado">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="borrador">Borrador</SelectItem>
                          <SelectItem value="vigente">Vigente</SelectItem>
                          <SelectItem value="archivada">Archivada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
                      <Input
                        id="fechaEmision"
                        type="date"
                        data-testid="input-fecha-emision"
                        value={formData.fechaEmision}
                        onChange={(e) => setFormData({ ...formData, fechaEmision: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fechaProximaRevision">Próxima Revisión *</Label>
                      <Input
                        id="fechaProximaRevision"
                        type="date"
                        data-testid="input-fecha-revision"
                        value={formData.fechaProximaRevision}
                        onChange={(e) => setFormData({ ...formData, fechaProximaRevision: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="contenido" className="space-y-4">
                  <div>
                    <Label htmlFor="declaracionCompromiso">Declaración de Compromiso *</Label>
                    <Textarea
                      id="declaracionCompromiso"
                      data-testid="textarea-declaracion"
                      value={formData.declaracionCompromiso}
                      onChange={(e) => setFormData({ ...formData, declaracionCompromiso: e.target.value })}
                      rows={6}
                      placeholder="Declaración de compromiso de la alta dirección..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Objetivos * (8-10 recomendados)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={agregarObjetivo} data-testid="button-agregar-objetivo">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Objetivo
                      </Button>
                    </div>
                    {formData.objetivos.map((objetivo, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          data-testid={`input-objetivo-${index}`}
                          value={objetivo}
                          onChange={(e) => {
                            const newObjetivos = [...formData.objetivos];
                            newObjetivos[index] = e.target.value;
                            setFormData({ ...formData, objetivos: newObjetivos });
                          }}
                          placeholder={`Objetivo ${index + 1}`}
                        />
                        {formData.objetivos.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => eliminarObjetivo(index)}
                            data-testid={`button-eliminar-objetivo-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div>
                    <Label htmlFor="alcance">Alcance *</Label>
                    <Textarea
                      id="alcance"
                      data-testid="textarea-alcance"
                      value={formData.alcance}
                      onChange={(e) => setFormData({ ...formData, alcance: e.target.value })}
                      rows={4}
                      placeholder="Defina el alcance de la política (áreas, procesos, personal cubierto)..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="recursos">Recursos *</Label>
                    <Textarea
                      id="recursos"
                      data-testid="textarea-recursos"
                      value={formData.recursos}
                      onChange={(e) => setFormData({ ...formData, recursos: e.target.value })}
                      rows={5}
                      placeholder="Describa los recursos humanos, físicos, financieros y tecnológicos asignados al SG-SST..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="revisionComunicacion">Revisión y Comunicación *</Label>
                    <Textarea
                      id="revisionComunicacion"
                      data-testid="textarea-revision"
                      value={formData.revisionComunicacion}
                      onChange={(e) => setFormData({ ...formData, revisionComunicacion: e.target.value })}
                      rows={5}
                      placeholder="Describa el proceso de revisión periódica y los medios de comunicación de la política..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="responsabilidades" className="space-y-4">
                  <div>
                    <Label htmlFor="responsabilidadAltaDireccion">Responsabilidades de la Alta Dirección *</Label>
                    <Textarea
                      id="responsabilidadAltaDireccion"
                      data-testid="textarea-resp-alta-direccion"
                      value={formData.responsabilidadAltaDireccion}
                      onChange={(e) => setFormData({ ...formData, responsabilidadAltaDireccion: e.target.value })}
                      rows={4}
                      placeholder="Describa las responsabilidades de la alta dirección en el SG-SST..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsabilidadResponsableSst">Responsabilidades del Responsable SG-SST *</Label>
                    <Textarea
                      id="responsabilidadResponsableSst"
                      data-testid="textarea-resp-responsable-sst"
                      value={formData.responsabilidadResponsableSst}
                      onChange={(e) => setFormData({ ...formData, responsabilidadResponsableSst: e.target.value })}
                      rows={4}
                      placeholder="Describa las responsabilidades del responsable del SG-SST..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="responsabilidadTrabajadores">Responsabilidades de los Trabajadores *</Label>
                    <Textarea
                      id="responsabilidadTrabajadores"
                      data-testid="textarea-resp-trabajadores"
                      value={formData.responsabilidadTrabajadores}
                      onChange={(e) => setFormData({ ...formData, responsabilidadTrabajadores: e.target.value })}
                      rows={4}
                      placeholder="Describa las responsabilidades de los trabajadores en el SG-SST..."
                    />
                  </div>
                </TabsContent>

                <TabsContent value="compromisos" className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Compromisos Específicos * (mínimo 10 recomendados)</Label>
                      <Button type="button" variant="outline" size="sm" onClick={agregarCompromiso} data-testid="button-agregar-compromiso">
                        <Plus className="h-4 w-4 mr-1" />
                        Agregar Compromiso
                      </Button>
                    </div>
                    {formData.compromisos.map((compromiso, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          data-testid={`input-compromiso-${index}`}
                          value={compromiso}
                          onChange={(e) => {
                            const newCompromisos = [...formData.compromisos];
                            newCompromisos[index] = e.target.value;
                            setFormData({ ...formData, compromisos: newCompromisos });
                          }}
                          placeholder={`Compromiso ${index + 1}`}
                        />
                        {formData.compromisos.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => eliminarCompromiso(index)}
                            data-testid={`button-eliminar-compromiso-${index}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="firmas" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="representanteLegal">Representante Legal *</Label>
                      <Select
                        value={formData.representanteLegal}
                        onValueChange={(value) => {
                          // Buscar el trabajador por ID para autocompletar la cédula
                          const selectedWorker = workers?.find((w) => w.id === value);
                          if (selectedWorker) {
                            setFormData({ 
                              ...formData, 
                              representanteLegal: `${selectedWorker.name} - ${selectedWorker.position}`,
                              cedulaRepresentante: selectedWorker.identificationNumber || ""
                            });
                          }
                        }}
                      >
                        <SelectTrigger id="representanteLegal" data-testid="select-representante-legal">
                          <SelectValue placeholder="Seleccione representante legal">
                            {formData.representanteLegal || "Seleccione representante legal"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {workers?.map((worker) => (
                            <SelectItem key={worker.id} value={worker.id}>
                              {worker.name} - {worker.position} ({worker.identificationNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="cedulaRepresentante">Cédula del Representante *</Label>
                      <Input
                        id="cedulaRepresentante"
                        data-testid="input-cedula-representante"
                        value={formData.cedulaRepresentante}
                        onChange={(e) => setFormData({ ...formData, cedulaRepresentante: e.target.value })}
                        placeholder="Número de cédula (se autocompleta al seleccionar)"
                        className={formData.cedulaRepresentante ? "bg-muted" : ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsableSst">Responsable SG-SST *</Label>
                      <Select
                        value={formData.responsableSst}
                        onValueChange={(value) => setFormData({ ...formData, responsableSst: value })}
                      >
                        <SelectTrigger id="responsableSst" data-testid="select-responsable-sst">
                          <SelectValue placeholder="Seleccione responsable SST" />
                        </SelectTrigger>
                        <SelectContent>
                          {workers?.map((worker) => (
                            <SelectItem key={worker.id} value={`${worker.name} - ${worker.position}`}>
                              {worker.name} - {worker.position}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="licenciaSst">Licencia SST (opcional)</Label>
                      <Input
                        id="licenciaSst"
                        data-testid="input-licencia-sst"
                        value={formData.licenciaSst}
                        onChange={(e) => setFormData({ ...formData, licenciaSst: e.target.value })}
                        placeholder="Número de licencia"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="fechaFirma">Fecha de Firma *</Label>
                    <Input
                      id="fechaFirma"
                      type="date"
                      data-testid="input-fecha-firma"
                      value={formData.fechaFirma}
                      onChange={(e) => setFormData({ ...formData, fechaFirma: e.target.value })}
                    />
                  </div>

                  {/* Firmas de Aprobación - Solo trabajadores con contratos activos */}
                  <div className="border-t pt-4 space-y-4">
                    <h3 className="font-semibold text-sm">Firmas de Aprobación (Trabajadores con Contrato Activo)</h3>
                    {workersConContrato.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No hay trabajadores con contratos activos. Primero registre contratos en el módulo de Contratos.
                      </p>
                    )}
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <Label htmlFor="elaboradoPorId">Elaborado por</Label>
                        <Select
                          value={formData.elaboradoPorId}
                          onValueChange={(value) => setFormData({ ...formData, elaboradoPorId: value })}
                        >
                          <SelectTrigger id="elaboradoPorId" data-testid="select-elaborado-por-worker">
                            <SelectValue placeholder="Seleccione trabajador con contrato" />
                          </SelectTrigger>
                          <SelectContent>
                            {workersConContrato.map((worker) => (
                              <SelectItem key={`elaborado-${worker.id}`} value={worker.id}>
                                {worker.name} - {worker.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="autorizadoPorId">Autorizado por</Label>
                        <Select
                          value={formData.autorizadoPorId}
                          onValueChange={(value) => setFormData({ ...formData, autorizadoPorId: value })}
                        >
                          <SelectTrigger id="autorizadoPorId" data-testid="select-autorizado-por-worker">
                            <SelectValue placeholder="Seleccione trabajador con contrato" />
                          </SelectTrigger>
                          <SelectContent>
                            {workersConContrato.map((worker) => (
                              <SelectItem key={`autorizado-${worker.id}`} value={worker.id}>
                                {worker.name} - {worker.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="aprobadoPorId">Aprobado por</Label>
                        <Select
                          value={formData.aprobadoPorId}
                          onValueChange={(value) => setFormData({ ...formData, aprobadoPorId: value })}
                        >
                          <SelectTrigger id="aprobadoPorId" data-testid="select-aprobado-por-worker">
                            <SelectValue placeholder="Seleccione trabajador con contrato" />
                          </SelectTrigger>
                          <SelectContent>
                            {workersConContrato.map((worker) => (
                              <SelectItem key={`aprobado-${worker.id}`} value={worker.id}>
                                {worker.name} - {worker.position}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancelar">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-guardar-politica"
                >
                  {editingPolitica ? "Actualizar Política" : "Crear Política"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {politicasLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando políticas...</div>
          ) : politicas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay políticas registradas. Cree la primera política de SST.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead>Próxima Revisión</TableHead>
                  <TableHead>Representante Legal</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {politicas.map((politica) => (
                  <TableRow key={politica.id} data-testid={`row-politica-${politica.id}`}>
                    <TableCell className="font-medium" data-testid={`text-codigo-${politica.id}`}>{politica.codigo}</TableCell>
                    <TableCell data-testid={`text-version-${politica.id}`}>v{politica.version}</TableCell>
                    <TableCell>{getEstadoBadge(politica.estado)}</TableCell>
                    <TableCell data-testid={`text-fecha-emision-${politica.id}`}>
                      {new Date(politica.fechaEmision).toLocaleDateString("es-CO")}
                    </TableCell>
                    <TableCell data-testid={`text-fecha-revision-${politica.id}`}>
                      {new Date(politica.fechaProximaRevision).toLocaleDateString("es-CO")}
                    </TableCell>
                    <TableCell data-testid={`text-representante-${politica.id}`}>{politica.representanteLegal}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewPdf(politica.id)}
                          data-testid={`button-ver-pdf-${politica.id}`}
                        >
                          <FileDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(politica)}
                          data-testid={`button-editar-${politica.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setPoliticaToDelete(politica.id);
                            setDeleteDialogOpen(true);
                          }}
                          data-testid={`button-eliminar-${politica.id}`}
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


      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La política será eliminada permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancelar-eliminar">Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} data-testid="button-confirmar-eliminar">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
