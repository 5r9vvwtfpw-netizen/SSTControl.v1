import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { Plus, Pencil, Trash2, Video, FileText, BookOpen, GraduationCap, Settings, Eye, Send, Users, CheckCircle2, XCircle, ClipboardList, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AutomationAssistant, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import type { ContenidoInduccion, PreguntaInduccion, SesionInduccionVirtual, Worker } from "@shared/schema";

type ContenidoFormData = {
  titulo: string;
  descripcion: string;
  tipoContenido: "video" | "documento" | "presentacion" | "texto";
  urlVideo: string;
  urlDocumento: string;
  contenidoTexto: string;
  duracionMinutos: number;
  estado: "borrador" | "publicado" | "archivado";
  obligatorio: number;
};

type PreguntaFormData = {
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  explicacion: string;
  activa: number;
};

const defaultContenido: ContenidoFormData = {
  titulo: "",
  descripcion: "",
  tipoContenido: "video",
  urlVideo: "",
  urlDocumento: "",
  contenidoTexto: "",
  duracionMinutos: 10,
  estado: "borrador",
  obligatorio: 1,
};

const defaultPregunta: PreguntaFormData = {
  pregunta: "",
  opciones: ["", "", "", ""],
  respuestaCorrecta: 0,
  explicacion: "",
  activa: 1,
};

export default function ConfiguracionInduccion() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contenidos");
  
  const [contenidoDialogOpen, setContenidoDialogOpen] = useState(false);
  const [preguntaDialogOpen, setPreguntaDialogOpen] = useState(false);
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [respuestasDialogOpen, setRespuestasDialogOpen] = useState(false);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionInduccionVirtual | null>(null);
  
  const [editingContenido, setEditingContenido] = useState<ContenidoInduccion | null>(null);
  const [editingPregunta, setEditingPregunta] = useState<PreguntaInduccion | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: "contenido" | "pregunta"; id: string } | null>(null);
  
  const [contenidoForm, setContenidoForm] = useState<ContenidoFormData>(defaultContenido);
  const [preguntaForm, setPreguntaForm] = useState<PreguntaFormData>(defaultPregunta);
  const [selectedWorker, setSelectedWorker] = useState("");
  const [tipoInduccion, setTipoInduccion] = useState<"induccion" | "reinduccion">("induccion");

  const { data: contenidos = [], isLoading: loadingContenidos } = useQuery<ContenidoInduccion[]>({
    queryKey: ["/api/contenidos-induccion"],
  });

  const { data: preguntas = [], isLoading: loadingPreguntas } = useQuery<PreguntaInduccion[]>({
    queryKey: ["/api/preguntas-induccion"],
  });

  const { data: sesiones = [] } = useQuery<SesionInduccionVirtual[]>({
    queryKey: ["/api/sesiones-induccion-virtual"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const createContenidoMutation = useMutation({
    mutationFn: async (data: ContenidoFormData) => {
      const res = await apiRequest("POST", "/api/contenidos-induccion", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
      setContenidoDialogOpen(false);
      setContenidoForm(defaultContenido);
      toast({ title: "Contenido creado", description: "El contenido de inducción se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateContenidoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContenidoFormData> }) => {
      const res = await apiRequest("PATCH", `/api/contenidos-induccion/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
      setContenidoDialogOpen(false);
      setEditingContenido(null);
      setContenidoForm(defaultContenido);
      toast({ title: "Contenido actualizado", description: "El contenido se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteContenidoMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contenidos-induccion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: "Contenido eliminado", description: "El contenido se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createPreguntaMutation = useMutation({
    mutationFn: async (data: PreguntaFormData) => {
      const res = await apiRequest("POST", "/api/preguntas-induccion", {
        ...data,
        opciones: JSON.stringify(data.opciones),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      setPreguntaDialogOpen(false);
      setPreguntaForm(defaultPregunta);
      toast({ title: "Pregunta creada", description: "La pregunta de evaluación se ha creado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updatePreguntaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PreguntaFormData> }) => {
      const res = await apiRequest("PATCH", `/api/preguntas-induccion/${id}`, {
        ...data,
        opciones: data.opciones ? JSON.stringify(data.opciones) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      setPreguntaDialogOpen(false);
      setEditingPregunta(null);
      setPreguntaForm(defaultPregunta);
      toast({ title: "Pregunta actualizada", description: "La pregunta se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePreguntaMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/preguntas-induccion/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: "Pregunta eliminada", description: "La pregunta se ha eliminado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const enviarInduccionMutation = useMutation({
    mutationFn: async (data: { workerId: string; tipoInduccion: string }) => {
      const res = await apiRequest("POST", "/api/sesiones-induccion-virtual/enviar", data);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sesiones-induccion-virtual"] });
      setEnviarDialogOpen(false);
      setSelectedWorker("");
      toast({
        title: "Inducción enviada",
        description: `Se ha enviado el enlace de inducción al trabajador. URL: ${data.inductionUrl}`,
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderContenidoMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const res = await apiRequest("PATCH", `/api/contenidos-induccion/${id}/reorder`, { direction });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const reorderPreguntaMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: 'up' | 'down' }) => {
      const res = await apiRequest("PATCH", `/api/preguntas-induccion/${id}/reorder`, { direction });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEditContenido = (contenido: ContenidoInduccion) => {
    setEditingContenido(contenido);
    setContenidoForm({
      titulo: contenido.titulo,
      descripcion: contenido.descripcion || "",
      tipoContenido: contenido.tipoContenido,
      urlVideo: contenido.urlVideo || "",
      urlDocumento: contenido.urlDocumento || "",
      contenidoTexto: contenido.contenidoTexto || "",
      duracionMinutos: contenido.duracionMinutos,
      estado: contenido.estado,
      obligatorio: contenido.obligatorio,
    });
    setContenidoDialogOpen(true);
  };

  const handleEditPregunta = (pregunta: PreguntaInduccion) => {
    setEditingPregunta(pregunta);
    setPreguntaForm({
      pregunta: pregunta.pregunta,
      opciones: JSON.parse(pregunta.opciones),
      respuestaCorrecta: pregunta.respuestaCorrecta,
      explicacion: pregunta.explicacion || "",
      activa: pregunta.activa,
    });
    setPreguntaDialogOpen(true);
  };

  const handleSubmitContenido = () => {
    if (editingContenido) {
      updateContenidoMutation.mutate({ id: editingContenido.id, data: contenidoForm });
    } else {
      createContenidoMutation.mutate(contenidoForm);
    }
  };

  const handleSubmitPregunta = () => {
    if (editingPregunta) {
      updatePreguntaMutation.mutate({ id: editingPregunta.id, data: preguntaForm });
    } else {
      createPreguntaMutation.mutate(preguntaForm);
    }
  };

  const handleDelete = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === "contenido") {
      deleteContenidoMutation.mutate(itemToDelete.id);
    } else {
      deletePreguntaMutation.mutate(itemToDelete.id);
    }
  };

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "video": return <Video className="h-4 w-4 text-red-500" />;
      case "documento": return <FileText className="h-4 w-4 text-blue-500" />;
      case "presentacion": return <BookOpen className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "publicado": return <Badge className="bg-green-100 text-green-800">Publicado</Badge>;
      case "borrador": return <Badge variant="outline">Borrador</Badge>;
      case "archivado": return <Badge variant="secondary">Archivado</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getSesionEstadoBadge = (estado: string) => {
    switch (estado) {
      case "completada": return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completada</Badge>;
      case "en_progreso": return <Badge className="bg-yellow-100 text-yellow-800">En Progreso</Badge>;
      case "pendiente": return <Badge variant="outline">Pendiente</Badge>;
      case "expirada": return <Badge variant="secondary">Expirada</Badge>;
      default: return <Badge variant="outline">{estado}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2" data-testid="text-page-title">
            Configuración de Inducción Virtual
          </h1>
          <p className="text-muted-foreground">
            Configure el contenido, evaluaciones y gestione el envío de inducciones virtuales
          </p>
        </div>
        <Dialog open={enviarDialogOpen} onOpenChange={setEnviarDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-enviar-induccion">
              <Send className="h-4 w-4 mr-2" />
              Enviar Inducción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Inducción Virtual</DialogTitle>
              <DialogDescription>
                Seleccione un trabajador para enviarle el enlace de inducción por email.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Trabajador *</Label>
                <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                  <SelectTrigger data-testid="select-trabajador-induccion">
                    <SelectValue placeholder="Seleccione un trabajador" />
                  </SelectTrigger>
                  <SelectContent>
                    {workers.filter(w => w.email).map((worker) => (
                      <SelectItem key={worker.id} value={worker.id}>
                        {worker.name} - {worker.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Inducción</Label>
                <Select value={tipoInduccion} onValueChange={(v) => setTipoInduccion(v as "induccion" | "reinduccion")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="induccion">Inducción (nuevo ingreso)</SelectItem>
                    <SelectItem value="reinduccion">Reinducción (anual)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEnviarDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => enviarInduccionMutation.mutate({ workerId: selectedWorker, tipoInduccion })}
                disabled={!selectedWorker || enviarInduccionMutation.isPending}
                data-testid="button-confirmar-envio"
              >
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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

        const plantillasInduccion: PlantillaInfo[] = [
          {
            id: 'contenido-induccion-sst',
            nombre: 'Contenidos Obligatorios de Inducción SST',
            descripcion: 'Temas mínimos requeridos para inducción según Decreto 1072/2015',
            campos: {
              titulo: 'Inducción en SST - Temas Obligatorios',
              descripcion: `Contenido de inducción que incluye:\n1. Generalidades de la empresa\n2. Política de SST\n3. Objetivos del SG-SST\n4. Peligros y riesgos del cargo\n5. Medidas de prevención y control\n6. Uso de EPP\n7. Reporte de condiciones y actos inseguros\n8. Procedimiento de emergencias\n9. Derechos y deberes en SST`,
            },
            normativaBase: 'DEC-1072-2.2.4.6.11'
          },
          {
            id: 'contenido-reinduccion-sst',
            nombre: 'Contenidos de Reinducción Anual',
            descripcion: 'Temas para reinducción anual según normativa SST',
            campos: {
              titulo: 'Reinducción Anual en SST',
              descripcion: `Reinducción que incluye:\n1. Actualización de la Política de SST\n2. Cambios en la identificación de peligros y riesgos\n3. Nuevos controles implementados\n4. Lecciones aprendidas de accidentes e incidentes\n5. Actualización del plan de emergencias\n6. Cambios en normativa aplicable\n7. Indicadores de SST del período`,
            },
            normativaBase: 'RES-0312-2019-ART16'
          }
        ];

        return (
          <AutomationAssistant
            titulo="Configuración de Inducción Virtual"
            estandar="1.2.2"
            descripcion="Gestión de contenidos de inducción y reinducción en SST"
            normativaAplicable={estandar.normativaAplicable}
            plantillasDisponibles={plantillasInduccion}
            camposSugeridos={camposSugeridos}
            onAutoFill={(datos) => {
              if (datos.temasObligatorios) {
                setContenidoForm(prev => ({
                  ...prev,
                  titulo: 'Inducción en SST - Temas Obligatorios',
                  descripcion: datos.temasObligatorios,
                  tipoContenido: 'texto',
                  contenidoTexto: datos.temasObligatorios,
                }));
                setContenidoDialogOpen(true);
              }
            }}
            onSelectPlantilla={(plantilla) => {
              if (plantilla.campos) {
                setContenidoForm(prev => ({
                  ...prev,
                  titulo: plantilla.campos.titulo || prev.titulo,
                  descripcion: plantilla.campos.descripcion || prev.descripcion,
                }));
                setContenidoDialogOpen(true);
              }
            }}
            compact={true}
          />
        );
      })()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contenidos" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Contenidos ({contenidos.length})
          </TabsTrigger>
          <TabsTrigger value="preguntas" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Evaluación ({preguntas.length})
          </TabsTrigger>
          <TabsTrigger value="sesiones" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Sesiones ({sesiones.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contenidos" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={contenidoDialogOpen} onOpenChange={(open) => {
              setContenidoDialogOpen(open);
              if (!open) {
                setEditingContenido(null);
                setContenidoForm(defaultContenido);
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-nuevo-contenido">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingContenido ? "Editar Contenido" : "Nuevo Contenido"}</DialogTitle>
                  <DialogDescription>
                    Configure el material educativo para la inducción virtual.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input
                        value={contenidoForm.titulo}
                        onChange={(e) => setContenidoForm({ ...contenidoForm, titulo: e.target.value })}
                        placeholder="Ej: Introducción a SST"
                        data-testid="input-contenido-titulo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Contenido</Label>
                      <Select
                        value={contenidoForm.tipoContenido}
                        onValueChange={(v) => setContenidoForm({ ...contenidoForm, tipoContenido: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="documento">Documento PDF</SelectItem>
                          <SelectItem value="presentacion">Presentación</SelectItem>
                          <SelectItem value="texto">Texto/HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={contenidoForm.descripcion}
                      onChange={(e) => setContenidoForm({ ...contenidoForm, descripcion: e.target.value })}
                      placeholder="Descripción del contenido..."
                    />
                  </div>
                  {contenidoForm.tipoContenido === "video" && (
                    <div className="space-y-2">
                      <Label>URL del Video (YouTube, Vimeo, etc.)</Label>
                      <Input
                        value={contenidoForm.urlVideo}
                        onChange={(e) => setContenidoForm({ ...contenidoForm, urlVideo: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}
                  {(contenidoForm.tipoContenido === "documento" || contenidoForm.tipoContenido === "presentacion") && (
                    <div className="space-y-2">
                      <Label>URL del Documento</Label>
                      <Input
                        value={contenidoForm.urlDocumento}
                        onChange={(e) => setContenidoForm({ ...contenidoForm, urlDocumento: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  {contenidoForm.tipoContenido === "texto" && (
                    <div className="space-y-2">
                      <Label>Contenido (HTML permitido)</Label>
                      <Textarea
                        value={contenidoForm.contenidoTexto}
                        onChange={(e) => setContenidoForm({ ...contenidoForm, contenidoTexto: e.target.value })}
                        placeholder="<p>Contenido de la inducción...</p>"
                        rows={6}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duración (minutos)</Label>
                      <Input
                        type="number"
                        value={contenidoForm.duracionMinutos || ''}
                        onChange={(e) => setContenidoForm({ ...contenidoForm, duracionMinutos: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                        onBlur={(e) => { if (e.target.value === '' || contenidoForm.duracionMinutos === '') setContenidoForm(prev => ({ ...prev, duracionMinutos: 10 })); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={contenidoForm.estado}
                        onValueChange={(v) => setContenidoForm({ ...contenidoForm, estado: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="borrador">Borrador</SelectItem>
                          <SelectItem value="publicado">Publicado</SelectItem>
                          <SelectItem value="archivado">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setContenidoDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitContenido} disabled={!contenidoForm.titulo} data-testid="button-guardar-contenido">
                    {editingContenido ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {contenidos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin contenidos</h3>
                <p className="text-muted-foreground mb-4">
                  Agregue videos, documentos o textos para la inducción virtual.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contenidos.map((contenido, index) => (
                <Card key={contenido.id}>
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0 || reorderContenidoMutation.isPending}
                            onClick={() => reorderContenidoMutation.mutate({ id: contenido.id, direction: 'up' })}
                            data-testid={`button-move-up-contenido-${contenido.id}`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === contenidos.length - 1 || reorderContenidoMutation.isPending}
                            onClick={() => reorderContenidoMutation.mutate({ id: contenido.id, direction: 'down' })}
                            data-testid={`button-move-down-contenido-${contenido.id}`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {getIconForType(contenido.tipoContenido)}
                        <div>
                          <CardTitle className="text-base">{contenido.titulo}</CardTitle>
                          {contenido.descripcion && (
                            <CardDescription className="text-sm">{contenido.descripcion}</CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEstadoBadge(contenido.estado)}
                        <Badge variant="outline">{contenido.duracionMinutos} min</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleEditContenido(contenido)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemToDelete({ type: "contenido", id: contenido.id });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preguntas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={preguntaDialogOpen} onOpenChange={(open) => {
              setPreguntaDialogOpen(open);
              if (!open) {
                setEditingPregunta(null);
                setPreguntaForm(defaultPregunta);
              }
            }}>
              <DialogTrigger asChild>
                <Button data-testid="button-nueva-pregunta">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Pregunta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPregunta ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
                  <DialogDescription>
                    Configure las preguntas de evaluación para la inducción.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Pregunta *</Label>
                    <Textarea
                      value={preguntaForm.pregunta}
                      onChange={(e) => setPreguntaForm({ ...preguntaForm, pregunta: e.target.value })}
                      placeholder="¿Cuál es la importancia de...?"
                      data-testid="input-pregunta-texto"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opciones de Respuesta</Label>
                    {preguntaForm.opciones.map((opcion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={opcion}
                          onChange={(e) => {
                            const newOpciones = [...preguntaForm.opciones];
                            newOpciones[index] = e.target.value;
                            setPreguntaForm({ ...preguntaForm, opciones: newOpciones });
                          }}
                          placeholder={`Opción ${index + 1}`}
                          data-testid={`input-opcion-${index}`}
                        />
                        {preguntaForm.respuestaCorrecta === index && (
                          <Badge className="bg-green-100 text-green-800 whitespace-nowrap">Correcta</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Label>Respuesta Correcta</Label>
                    <Select
                      value={preguntaForm.respuestaCorrecta.toString()}
                      onValueChange={(v) => setPreguntaForm({ ...preguntaForm, respuestaCorrecta: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {preguntaForm.opciones.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            Opción {index + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Explicación (opcional)</Label>
                    <Textarea
                      value={preguntaForm.explicacion}
                      onChange={(e) => setPreguntaForm({ ...preguntaForm, explicacion: e.target.value })}
                      placeholder="Explicación de por qué esta es la respuesta correcta..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={preguntaForm.activa.toString()}
                      onValueChange={(v) => setPreguntaForm({ ...preguntaForm, activa: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Activa</SelectItem>
                        <SelectItem value="0">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPreguntaDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSubmitPregunta} disabled={!preguntaForm.pregunta} data-testid="button-guardar-pregunta">
                    {editingPregunta ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {preguntas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin preguntas</h3>
                <p className="text-muted-foreground mb-4">
                  Agregue preguntas de evaluación para verificar la comprensión de los trabajadores.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {preguntas.map((pregunta, index) => (
                <Card key={pregunta.id}>
                  <CardHeader className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === 0 || reorderPreguntaMutation.isPending}
                            onClick={() => reorderPreguntaMutation.mutate({ id: pregunta.id, direction: 'up' })}
                            data-testid={`button-move-up-pregunta-${pregunta.id}`}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            disabled={index === preguntas.length - 1 || reorderPreguntaMutation.isPending}
                            onClick={() => reorderPreguntaMutation.mutate({ id: pregunta.id, direction: 'down' })}
                            data-testid={`button-move-down-pregunta-${pregunta.id}`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">
                            {index + 1}. {pregunta.pregunta}
                          </CardTitle>
                          <div className="space-y-1">
                            {JSON.parse(pregunta.opciones).map((opcion: string, opIndex: number) => (
                              <div key={opIndex} className="flex items-center gap-2 text-sm">
                                {opIndex === pregunta.respuestaCorrecta ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                ) : (
                                  <span className="h-4 w-4" />
                                )}
                                <span className={opIndex === pregunta.respuestaCorrecta ? "font-medium text-green-700" : "text-muted-foreground"}>
                                  {opcion}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={pregunta.activa ? "default" : "secondary"}>
                          {pregunta.activa ? "Activa" : "Inactiva"}
                        </Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPregunta(pregunta)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setItemToDelete({ type: "pregunta", id: pregunta.id });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sesiones" className="space-y-4 mt-4">
          {sesiones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin sesiones</h3>
                <p className="text-muted-foreground mb-4">
                  No hay sesiones de inducción virtual enviadas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sesiones.map((sesion) => {
                const worker = workers.find(w => w.id === sesion.workerId);
                return (
                  <Card key={sesion.id}>
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{worker?.name || "Trabajador"}</CardTitle>
                          <CardDescription>
                            Enviada: {new Date(sesion.fechaEnvio).toLocaleDateString("es-CO")}
                            {sesion.fechaFinalizacion && (
                              <> | Completada: {new Date(sesion.fechaFinalizacion).toLocaleDateString("es-CO")}</>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getSesionEstadoBadge(sesion.estado)}
                          <Badge variant="outline">
                            {sesion.tipoInduccion === "induccion" ? "Inducción" : "Reinducción"}
                          </Badge>
                          {sesion.puntajeEvaluacion !== null && (
                            <Badge className={sesion.aprobado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {sesion.puntajeEvaluacion}%
                            </Badge>
                          )}
                          {sesion.estado === "completada" && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSesionSeleccionada(sesion);
                                setRespuestasDialogOpen(true);
                              }}
                              data-testid={`button-ver-respuestas-${sesion.id}`}
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Ver respuestas
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este {itemToDelete?.type === "contenido" ? "contenido" : "pregunta"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para ver respuestas de inducción completada */}
      <Dialog open={respuestasDialogOpen} onOpenChange={(open) => {
        setRespuestasDialogOpen(open);
        if (!open) setSesionSeleccionada(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Respuestas de Evaluación
            </DialogTitle>
            <DialogDescription>
              {sesionSeleccionada && (
                <>
                  Trabajador: {workers.find(w => w.id === sesionSeleccionada.workerId)?.name || "Trabajador"} | 
                  Puntaje: {sesionSeleccionada.puntajeEvaluacion}% | 
                  {sesionSeleccionada.aprobado ? (
                    <Badge className="bg-green-100 text-green-800 ml-1">Aprobado</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 ml-1">Reprobado</Badge>
                  )}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {sesionSeleccionada && (() => {
                const respuestas = JSON.parse(sesionSeleccionada.progresoEvaluacion || "{}");
                const preguntasActivas = preguntas.filter(p => p.activa === 1).sort((a, b) => a.orden - b.orden);
                
                // Función para buscar respuesta del usuario (maneja ambos formatos: UUID y numérico)
                const buscarRespuesta = (pregunta: PreguntaInduccion, index: number) => {
                  // Primero intentar con UUID (formato actual)
                  if (respuestas[pregunta.id] !== undefined) {
                    return respuestas[pregunta.id];
                  }
                  // Si no, intentar con índice numérico (formato legacy)
                  if (respuestas[index] !== undefined) {
                    return respuestas[index];
                  }
                  // También intentar con string del índice
                  if (respuestas[String(index)] !== undefined) {
                    return respuestas[String(index)];
                  }
                  return undefined;
                };
                
                if (preguntasActivas.length === 0) {
                  return (
                    <div className="text-center py-8 space-y-2">
                      <p className="text-muted-foreground">
                        No hay preguntas de evaluación configuradas actualmente.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Puntaje obtenido: {sesionSeleccionada.puntajeEvaluacion}%
                      </p>
                    </div>
                  );
                }
                
                return preguntasActivas.map((pregunta, index) => {
                    const opciones = JSON.parse(pregunta.opciones);
                    // Buscar respuesta del usuario (compatible con UUID y legacy numérico)
                    const respuestaUsuario = buscarRespuesta(pregunta, index);
                    const tieneRespuesta = respuestaUsuario !== undefined && respuestaUsuario !== null;
                    const esCorrecta = tieneRespuesta && respuestaUsuario === pregunta.respuestaCorrecta;
                    
                    return (
                      <Card key={pregunta.id} className={!tieneRespuesta ? "border-gray-300 bg-gray-50/50 dark:bg-gray-950/20" : esCorrecta ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" : "border-red-300 bg-red-50/50 dark:bg-red-950/20"}>
                        <CardHeader className="py-3">
                          <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-sm font-medium">
                              {index + 1}. {pregunta.pregunta}
                            </CardTitle>
                            {!tieneRespuesta ? (
                              <Badge variant="outline" className="text-gray-500">Sin respuesta</Badge>
                            ) : esCorrecta ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="py-2 pt-0">
                          <div className="space-y-1">
                            {opciones.map((opcion: string, opcionIndex: number) => {
                              const esRespuestaUsuario = respuestaUsuario === opcionIndex;
                              const esRespuestaCorrecta = pregunta.respuestaCorrecta === opcionIndex;
                              
                              return (
                                <div 
                                  key={opcionIndex} 
                                  className={`p-2 rounded text-sm ${
                                    esRespuestaCorrecta 
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium" 
                                      : esRespuestaUsuario && !esRespuestaCorrecta
                                      ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 line-through"
                                      : "text-muted-foreground"
                                  }`}
                                  data-testid={`respuesta-opcion-${pregunta.id}-${opcionIndex}`}
                                >
                                  {String.fromCharCode(65 + opcionIndex)}. {opcion}
                                  {esRespuestaCorrecta && <span className="ml-2">(Correcta)</span>}
                                  {esRespuestaUsuario && !esRespuestaCorrecta && <span className="ml-2">(Respuesta del trabajador)</span>}
                                </div>
                              );
                            })}
                          </div>
                          {pregunta.explicacion && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded text-sm text-blue-800 dark:text-blue-300">
                              <strong>Explicación:</strong> {pregunta.explicacion}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  });
              })()}
              
            </div>
          </ScrollArea>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespuestasDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
