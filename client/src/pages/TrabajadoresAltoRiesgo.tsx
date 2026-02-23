import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrabajadorAltoRiesgoSchema, type InsertTrabajadorAltoRiesgo, type TrabajadorAltoRiesgo, type Worker } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, FileText, Upload, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { compressImage } from "@/lib/imageCompression";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const plantillasAltoRiesgo: PlantillaInfo[] = [
  {
    id: 'mineria-subterranea',
    nombre: 'Minería subterránea',
    descripcion: 'Actividades de extracción de minerales bajo tierra según Decreto 2090/2003',
    campos: {
      actividadAltoRiesgo: 'Minería subterránea',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Minería subterránea (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Exámenes médicos ocupacionales específicos (audiometría, espirometría, radiografía de tórax)
• Capacitación en rescate minero y primeros auxilios
• EPP especializado: casco minero con lámpara, botas de seguridad, protección respiratoria
• Monitoreo de gases (metano, CO, CO2, O2)
• Sistema de comunicación subterránea
• Plan de emergencias mineras

VIGILANCIA EPIDEMIOLÓGICA:
• Neumoconiosis
• Hipoacusia neurosensorial
• Lesiones osteomusculares

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Decreto 1886/2015'
  },
  {
    id: 'trabajo-alturas',
    nombre: 'Trabajo en alturas',
    descripcion: 'Actividades desarrolladas a 1.5 metros o más sobre nivel inferior según Resolución 4272/2021',
    campos: {
      actividadAltoRiesgo: 'Trabajo en alturas',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Trabajo en alturas (Resolución 4272/2021)

REQUISITOS ESPECIALES:
• Certificación de trabajo seguro en alturas (Nivel avanzado o coordinador)
• Examen médico con énfasis osteomuscular y neurológico
• Aptitud para trabajo en alturas sin restricciones
• Capacitación y reentrenamiento anual
• EPP certificado: arnés de cuerpo completo, líneas de vida, conectores, casco con barbuquejo

CONTROLES:
• Permiso de trabajo en alturas
• Análisis de trabajo seguro (ATS)
• Puntos de anclaje certificados
• Sistema de protección contra caídas

VIGILANCIA EPIDEMIOLÓGICA:
• Lesiones por caída
• Vértigo ocupacional
• Lesiones osteomusculares

CERTIFICACIÓN ARL: Cotización clase IV o V según actividad económica`,
    },
    normativaBase: 'Resolución 4272/2021, Decreto 1072/2015'
  },
  {
    id: 'radiaciones-ionizantes',
    nombre: 'Trabajo con radiaciones ionizantes',
    descripcion: 'Exposición a fuentes radiactivas según normativa de seguridad nuclear',
    campos: {
      actividadAltoRiesgo: 'Trabajo con radiaciones ionizantes',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Trabajo con radiaciones ionizantes (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Licencia de operación de equipos emisores de radiación
• Dosimetría personal mensual
• Exámenes médicos: hemograma completo, perfil tiroideo, examen oftalmológico
• Capacitación en protección radiológica
• EPP: delantal plomado, protector de tiroides, gafas plomadas

CONTROLES:
• Blindajes y barreras de protección
• Señalización de áreas controladas
• Límites de dosis ocupacional (20 mSv/año)
• Registro de exposiciones

VIGILANCIA EPIDEMIOLÓGICA:
• Efectos hematológicos
• Cataratas radioinducidas
• Cáncer ocupacional

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Resolución 181434/2002'
  },
  {
    id: 'altas-temperaturas',
    nombre: 'Exposición a altas temperaturas',
    descripcion: 'Trabajo en ambientes con carga térmica elevada',
    campos: {
      actividadAltoRiesgo: 'Exposición a altas temperaturas',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Exposición a altas temperaturas (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Exámenes médicos: valoración cardiovascular, pruebas de tolerancia al calor
• Mediciones de estrés térmico (WBGT)
• Capacitación en prevención de golpe de calor
• EPP: ropa de trabajo transpirable, guantes térmicos, protección facial

CONTROLES:
• Pausas de recuperación programadas
• Hidratación frecuente
• Sistemas de ventilación y refrigeración
• Rotación de personal

VIGILANCIA EPIDEMIOLÓGICA:
• Golpe de calor
• Deshidratación
• Enfermedades cardiovasculares

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Resolución 2400/1979'
  },
  {
    id: 'sustancias-cancerigenas',
    nombre: 'Exposición a sustancias cancerígenas',
    descripcion: 'Trabajo con sustancias comprobadamente cancerígenas según IARC',
    campos: {
      actividadAltoRiesgo: 'Exposición a sustancias comprobadamente cancerígenas',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Exposición a sustancias cancerígenas (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Identificación de sustancias cancerígenas (Grupo 1 IARC)
• Fichas de seguridad (SDS) actualizadas
• Exámenes médicos: biomarcadores específicos según exposición
• Capacitación en manejo seguro de sustancias peligrosas
• EPP: respiradores con filtros específicos, trajes de protección química, guantes químicos

CONTROLES:
• Sustitución por sustancias menos peligrosas
• Sistemas de ventilación localizada
• Procedimientos de trabajo seguro
• Monitoreo ambiental

VIGILANCIA EPIDEMIOLÓGICA:
• Programa específico según tipo de exposición
• Seguimiento post-ocupacional
• Registro de expuestos

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Resolución 0773/2021'
  },
  {
    id: 'espacios-confinados',
    nombre: 'Trabajo en espacios confinados',
    descripcion: 'Actividades en áreas con acceso limitado y ventilación deficiente',
    campos: {
      actividadAltoRiesgo: 'Trabajo en espacios confinados',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Trabajo en espacios confinados (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Certificación en trabajo en espacios confinados
• Exámenes médicos: aptitud cardiovascular, claustrofobia, condición física
• Capacitación en rescate y primeros auxilios
• EPP: detector de gases portátil, arnés de rescate, equipo de respiración autónomo

CONTROLES:
• Permiso de entrada a espacio confinado
• Medición de atmósfera antes y durante el trabajo
• Vigía de seguridad permanente
• Equipo de rescate disponible
• Ventilación forzada

VIGILANCIA EPIDEMIOLÓGICA:
• Intoxicaciones por gases
• Asfixia
• Lesiones por rescate

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, NTC 3631'
  },
  {
    id: 'vigilancia-seguridad',
    nombre: 'Vigilancia y seguridad privada',
    descripcion: 'Actividades de vigilancia y seguridad privada armada',
    campos: {
      actividadAltoRiesgo: 'Vigilancia y seguridad privada',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Vigilancia y seguridad privada (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Licencia de la Superintendencia de Vigilancia y Seguridad Privada
• Credencial vigente del vigilante
• Exámenes médicos: psicotécnico, prueba de esfuerzo, valoración psicológica
• Capacitación en uso de armas (si aplica) y defensa personal
• EPP: chaleco antibalas, uniforme reglamentario

CONTROLES:
• Análisis de riesgos del puesto
• Protocolos de comunicación
• Plan de emergencias y evacuación
• Acompañamiento psicológico

VIGILANCIA EPIDEMIOLÓGICA:
• Estrés laboral y burnout
• Lesiones por agresión
• Trastornos del sueño (trabajo nocturno)

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Decreto 356/1994'
  },
  {
    id: 'bomberos',
    nombre: 'Actividades de bomberos',
    descripcion: 'Labores de prevención, control de incendios y rescate',
    campos: {
      actividadAltoRiesgo: 'Actividades de bomberos',
      observaciones: `ACTIVIDAD DE ALTO RIESGO: Actividades de bomberos (Decreto 2090/2003)

REQUISITOS ESPECIALES:
• Certificación como bombero
• Exámenes médicos: prueba de esfuerzo, espirometría, valoración cardiovascular completa
• Capacitación continua en técnicas de extinción y rescate
• EPP: traje de aproximación al fuego, equipo de respiración autónomo (ERA), casco, guantes

CONTROLES:
• Protocolos de respuesta a emergencias
• Mantenimiento preventivo de equipos
• Simulacros periódicos
• Sistema de rotación y descanso

VIGILANCIA EPIDEMIOLÓGICA:
• Enfermedades respiratorias
• Lesiones térmicas
• Estrés postraumático
• Enfermedades cardiovasculares

CERTIFICACIÓN ARL: Cotización especial clase V`,
    },
    normativaBase: 'Decreto 2090/2003, Ley 1575/2012'
  }
];

export default function TrabajadoresAltoRiesgo() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTrabajador, setEditingTrabajador] = useState<TrabajadorAltoRiesgo | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const { data: trabajadores = [], isLoading } = useQuery<TrabajadorAltoRiesgo[]>({
    queryKey: ["/api/trabajadores-alto-riesgo"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const createForm = useForm<InsertTrabajadorAltoRiesgo>({
    resolver: zodResolver(insertTrabajadorAltoRiesgoSchema),
    defaultValues: {
      workerId: "",
      fecha: format(new Date(), "yyyy-MM-dd"),
      certificadoArlUrl: null,
      observaciones: null,
    },
  });

  const editForm = useForm<InsertTrabajadorAltoRiesgo>({
    resolver: zodResolver(insertTrabajadorAltoRiesgoSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTrabajadorAltoRiesgo) => {
      const res = await apiRequest("POST", "/api/trabajadores-alto-riesgo", data);
      return await res.json();
    },
    onSuccess: async (newTrabajador) => {
      // Upload file if selected
      if (selectedFile && newTrabajador.id) {
        await uploadFile(newTrabajador.id);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores-alto-riesgo"] });
      toast({
        title: "Trabajador de alto riesgo registrado",
        description: "El registro se creó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsCreateOpen(false);
      createForm.reset();
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTrabajadorAltoRiesgo> }) => {
      const res = await apiRequest("PATCH", `/api/trabajadores-alto-riesgo/${id}`, data);
      return await res.json();
    },
    onSuccess: async (updatedTrabajador) => {
      // Upload file if selected
      if (selectedFile && updatedTrabajador.id) {
        await uploadFile(updatedTrabajador.id);
      }

      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores-alto-riesgo"] });
      toast({
        title: "Trabajador actualizado",
        description: "El registro se actualizó exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
      setIsEditOpen(false);
      setEditingTrabajador(null);
      setSelectedFile(null);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/trabajadores-alto-riesgo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores-alto-riesgo"] });
      toast({
        title: "Registro eliminado",
        description: "El trabajador de alto riesgo fue eliminado exitosamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const uploadFile = async (trabajadorId: string) => {
    if (!selectedFile) return;

    // Compress image files before upload
    let fileToUpload = selectedFile;
    if (selectedFile.type.startsWith('image/')) {
      fileToUpload = await compressImage(selectedFile);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    setUploadingId(trabajadorId);

    try {
      const response = await fetch(`/api/trabajadores-alto-riesgo/${trabajadorId}/upload-certificado`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error al subir el archivo");
      }

      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores-alto-riesgo"] });

      toast({
        title: "Archivo subido",
        description: "El certificado ARL se subió correctamente.",
        className: "bg-yellow-50 border-yellow-200",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el archivo",
      });
    } finally {
      setUploadingId(null);
    }
  };

  const handleCreate = (data: InsertTrabajadorAltoRiesgo) => {
    // Validar que se haya seleccionado un archivo de certificado ARL
    if (!selectedFile) {
      toast({
        variant: "destructive",
        title: "Certificado ARL requerido",
        description: "Debe adjuntar el certificado de la ARL para guardar el registro.",
      });
      return;
    }
    createMutation.mutate(data);
  };

  const handleEdit = (data: InsertTrabajadorAltoRiesgo) => {
    if (!editingTrabajador) return;
    // Validar que tenga certificado (ya existente o nuevo archivo seleccionado)
    if (!editingTrabajador.certificadoArlUrl && !selectedFile) {
      toast({
        variant: "destructive",
        title: "Certificado ARL requerido",
        description: "Debe adjuntar el certificado de la ARL para guardar el registro.",
      });
      return;
    }
    updateMutation.mutate({ id: editingTrabajador.id, data });
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este registro?")) {
      deleteMutation.mutate(id);
    }
  };

  const openEditDialog = (trabajador: TrabajadorAltoRiesgo) => {
    setEditingTrabajador(trabajador);
    editForm.reset({
      workerId: trabajador.workerId,
      fecha: trabajador.fecha,
      certificadoArlUrl: trabajador.certificadoArlUrl,
      observaciones: trabajador.observaciones,
    });
    setSelectedFile(null);
    setIsEditOpen(true);
  };

  const handlePrintPDF = () => {
    window.open("/api/trabajadores-alto-riesgo/report/pdf", "_blank");
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    if (plantilla.campos.observaciones) {
      if (isCreateOpen) {
        createForm.setValue('observaciones', plantilla.campos.observaciones);
      } else if (isEditOpen) {
        editForm.setValue('observaciones', plantilla.campos.observaciones);
      } else {
        setIsCreateOpen(true);
        setTimeout(() => {
          createForm.setValue('observaciones', plantilla.campos.observaciones);
        }, 100);
      }
      
      toast({
        title: "Plantilla aplicada",
        description: `Se han cargado los requisitos para "${plantilla.nombre}" en el campo de observaciones.`,
        className: "bg-green-50 border-green-200 dark:bg-green-950/50 dark:border-green-800",
      });
    }
  };

  const filteredTrabajadores = trabajadores.filter((trabajador) => {
    const worker = workers.find(w => w.id === trabajador.workerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      worker?.name.toLowerCase().includes(searchLower) ||
      worker?.identificationNumber?.toLowerCase().includes(searchLower) ||
      trabajador.observaciones?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando...</div>;
  }

  const estandar = getEstandarByCodigo('1.1.5');
  
  const actividadesAltoRiesgo = estandar?.camposSugeridos.find(
    c => c.campo === 'actividadAltoRiesgo'
  )?.opciones || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trabajadores de Alto Riesgo</h1>
          <p className="text-muted-foreground mt-1">Gestión de trabajadores en condiciones de alto riesgo</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrintPDF} variant="outline" data-testid="button-print-pdf">
            <FileText className="mr-2 h-4 w-4" />
            Imprimir PDF
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} data-testid="button-create">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>
      </div>

      {estandar && (
        <AutomationAssistant
          titulo="Trabajadores de Alto Riesgo"
          estandar={estandar.codigo}
          descripcion="Identificación y gestión de trabajadores expuestos a actividades de alto riesgo según normativa colombiana"
          normativaAplicable={estandar.normativaAplicable}
          camposSugeridos={actividadesAltoRiesgo.map(actividad => ({
            campo: 'actividadAltoRiesgo',
            valor: actividad,
            normativaReferencia: 'Decreto 2090/2003'
          }))}
          compact={true}
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Registros</CardTitle>
          <CardDescription>Buscar por nombre, cédula u observaciones</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search"
              className="max-w-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Trabajadores de Alto Riesgo</CardTitle>
          <CardDescription>
            {filteredTrabajadores.length} registro{filteredTrabajadores.length !== 1 ? 's' : ''} encontrado{filteredTrabajadores.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Certificado ARL</TableHead>
                <TableHead>Observaciones</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrabajadores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No hay registros de trabajadores de alto riesgo
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrabajadores.map((trabajador) => {
                  const worker = workers.find(w => w.id === trabajador.workerId);
                  return (
                    <TableRow key={trabajador.id} data-testid={`row-trabajador-${trabajador.id}`}>
                      <TableCell>{trabajador.fecha}</TableCell>
                      <TableCell>{worker?.identificationNumber || "-"}</TableCell>
                      <TableCell>{worker?.name || "-"}</TableCell>
                      <TableCell>
                        {trabajador.certificadoArlUrl ? (
                          <a
                            href={trabajador.certificadoArlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                            data-testid={`link-certificado-${trabajador.id}`}
                          >
                            Ver archivo
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">Sin archivo</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{trabajador.observaciones || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(trabajador)}
                            data-testid={`button-edit-${trabajador.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(trabajador.id)}
                            data-testid={`button-delete-${trabajador.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-create">
          <DialogHeader>
            <DialogTitle>Registrar Trabajador de Alto Riesgo</DialogTitle>
            <DialogDescription>
              Complete los datos del trabajador en condiciones de alto riesgo
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Auto-fill basado en el cargo del trabajador o registros anteriores
                        const selectedWorker = workers.find(w => w.id === value);
                        if (selectedWorker && selectedWorker.position) {
                          // Buscar si ya tiene registro de alto riesgo previo
                          const existingRecord = trabajadores.find(t => t.workerId === value);
                          const currentObservaciones = createForm.getValues("observaciones");
                          
                          if (existingRecord && existingRecord.observaciones && !currentObservaciones) {
                            createForm.setValue("observaciones", existingRecord.observaciones);
                            toast({
                              title: "Datos cargados",
                              description: "Se han cargado las observaciones del registro anterior del trabajador.",
                              className: "bg-blue-50 border-blue-200",
                            });
                          } else if (!currentObservaciones) {
                            // Buscar plantilla que coincida con el cargo del trabajador
                            const position = selectedWorker.position.toLowerCase();
                            const matchingPlantilla = plantillasAltoRiesgo.find(p => 
                              position.includes(p.nombre.toLowerCase().split(' ')[0]) ||
                              p.nombre.toLowerCase().includes(position)
                            );
                            if (matchingPlantilla && matchingPlantilla.campos.observaciones) {
                              createForm.setValue("observaciones", matchingPlantilla.campos.observaciones);
                              toast({
                                title: "Plantilla sugerida aplicada",
                                description: `Se aplicó la plantilla de ${matchingPlantilla.nombre} basada en el cargo del trabajador.`,
                                className: "bg-green-50 border-green-200",
                              });
                            }
                          }
                        }
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-worker">
                          <SelectValue placeholder="Seleccione un trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.identificationNumber} ({worker.position})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tipo de Actividad de Alto Riesgo</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const plantilla = plantillasAltoRiesgo.find(p => p.id === value);
                    if (plantilla && plantilla.campos.observaciones) {
                      createForm.setValue("observaciones", plantilla.campos.observaciones);
                      toast({
                        title: "Plantilla aplicada",
                        description: `Se cargaron los requisitos para "${plantilla.nombre}"`,
                        className: "bg-green-50 border-green-200",
                      });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-actividad-alto-riesgo">
                    <SelectValue placeholder="Seleccione el tipo de actividad" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantillasAltoRiesgo.map((plantilla) => (
                      <SelectItem key={plantilla.id} value={plantilla.id}>
                        {plantilla.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Al seleccionar se auto-completan los requisitos según Decreto 2090/2003
                </p>
              </div>

              <FormField
                control={createForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones y Requisitos</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Descripción de las condiciones de alto riesgo y requisitos especiales..."
                        data-testid="input-observaciones"
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Certificado ARL *</FormLabel>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={selectedFile ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => document.getElementById("file-create")?.click()}
                      data-testid="button-select-file"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {selectedFile ? "Cambiar archivo" : "Seleccionar archivo"}
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-green-600 truncate max-w-xs">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    id="file-create"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {!selectedFile && (
                    <p className="text-xs text-red-500">
                      Obligatorio: Debe adjuntar el certificado de la ARL
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateOpen(false);
                    createForm.reset();
                    setSelectedFile(null);
                  }}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  data-testid="button-submit"
                >
                  {createMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
            <DialogDescription>
              Modifique los datos del trabajador de alto riesgo
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-worker-edit">
                          <SelectValue placeholder="Seleccione un trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {workers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.identificationNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="fecha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-edit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Tipo de Actividad de Alto Riesgo</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const plantilla = plantillasAltoRiesgo.find(p => p.id === value);
                    if (plantilla && plantilla.campos.observaciones) {
                      editForm.setValue("observaciones", plantilla.campos.observaciones);
                      toast({
                        title: "Plantilla aplicada",
                        description: `Se cargaron los requisitos para "${plantilla.nombre}"`,
                        className: "bg-green-50 border-green-200",
                      });
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-actividad-alto-riesgo-edit">
                    <SelectValue placeholder="Seleccione para cambiar el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {plantillasAltoRiesgo.map((plantilla) => (
                      <SelectItem key={plantilla.id} value={plantilla.id}>
                        {plantilla.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Al seleccionar se reemplazan los requisitos actuales
                </p>
              </div>

              <FormField
                control={editForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones y Requisitos</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Descripción de las condiciones de alto riesgo y requisitos especiales..."
                        data-testid="input-observaciones-edit"
                        rows={6}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Certificado ARL *</FormLabel>
                <div className="flex flex-col gap-2">
                  {editingTrabajador?.certificadoArlUrl && !selectedFile && (
                    <div className="flex items-center gap-2 text-green-600">
                      <a
                        href={editingTrabajador.certificadoArlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:underline flex items-center gap-1"
                      >
                        Ver certificado actual
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant={editingTrabajador?.certificadoArlUrl || selectedFile ? "outline" : "destructive"}
                      size="sm"
                      onClick={() => document.getElementById("file-edit")?.click()}
                      data-testid="button-select-file-edit"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {editingTrabajador?.certificadoArlUrl ? "Cambiar archivo" : "Seleccionar archivo"}
                    </Button>
                    {selectedFile && (
                      <span className="text-sm text-green-600 truncate max-w-xs">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    id="file-edit"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  {!editingTrabajador?.certificadoArlUrl && !selectedFile && (
                    <p className="text-xs text-red-500">
                      Obligatorio: Debe adjuntar el certificado de la ARL
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Formatos: PDF, JPG, PNG, DOC, DOCX (máx. 10MB)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditingTrabajador(null);
                    setSelectedFile(null);
                  }}
                  data-testid="button-cancel-edit"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
