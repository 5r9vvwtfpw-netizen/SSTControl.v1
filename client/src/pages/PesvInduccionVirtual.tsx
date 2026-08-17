import { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/hooks/use-company-context";
import {
  Plus, Pencil, Trash2, Video, FileText, BookOpen, GraduationCap, Eye, Send,
  Users, CheckCircle2, XCircle, Car, Loader2, UserPlus, UsersRound, Wand2,
  ChevronUp, ChevronDown, Upload, File, ClipboardList, AlertCircle, Download,
} from "lucide-react";
import { getPlantillaPesv } from "@/data/induccion-plantillas-pesv";
import type { ContenidoInduccion, PreguntaInduccion, SesionInduccionVirtual, Worker } from "@shared/schema";

const TIPO = "pesv";

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
  titulo: "", descripcion: "", tipoContenido: "video",
  urlVideo: "", urlDocumento: "", contenidoTexto: "",
  duracionMinutos: 10, estado: "borrador", obligatorio: 1,
};

const defaultPregunta: PreguntaFormData = {
  pregunta: "", opciones: ["", "", "", ""],
  respuestaCorrecta: 0, explicacion: "", activa: 1,
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function getIconForType(tipo: string) {
  switch (tipo) {
    case "video": return <Video className="h-4 w-4 text-red-500" />;
    case "documento": return <FileText className="h-4 w-4 text-blue-500" />;
    case "presentacion": return <BookOpen className="h-4 w-4 text-purple-500" />;
    default: return <FileText className="h-4 w-4 text-gray-500" />;
  }
}

function getEstadoBadge(estado: string) {
  switch (estado) {
    case "publicado": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Publicado</Badge>;
    case "borrador": return <Badge variant="outline">Borrador</Badge>;
    case "archivado": return <Badge variant="secondary">Archivado</Badge>;
    default: return <Badge variant="outline">{estado}</Badge>;
  }
}

function getSesionEstadoBadge(estado: string) {
  switch (estado) {
    case "completada": return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"><CheckCircle2 className="h-3 w-3 mr-1" />Completada</Badge>;
    case "en_progreso": return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">En Progreso</Badge>;
    case "pendiente": return <Badge variant="outline">Pendiente</Badge>;
    case "expirada": return <Badge variant="secondary">Expirada</Badge>;
    default: return <Badge variant="outline">{estado}</Badge>;
  }
}

// ── Component ────────────────────────────────────────────────────────────────

export default function PesvInduccionVirtual() {
  const { toast } = useToast();
  const { selectedCompany } = useCompanyContext();
  const [activeTab, setActiveTab] = useState("contenidos");

  // dialogs
  const [contenidoDialogOpen, setContenidoDialogOpen] = useState(false);
  const [preguntaDialogOpen, setPreguntaDialogOpen] = useState(false);
  const [enviarIndividualOpen, setEnviarIndividualOpen] = useState(false);
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [respuestasDialogOpen, setRespuestasDialogOpen] = useState(false);
  const [plantillaDialogOpen, setPlantillaDialogOpen] = useState(false);

  // editing state
  const [editingContenido, setEditingContenido] = useState<ContenidoInduccion | null>(null);
  const [editingPregunta, setEditingPregunta] = useState<PreguntaInduccion | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: "contenido" | "pregunta"; id: string } | null>(null);
  const [sesionSeleccionada, setSesionSeleccionada] = useState<SesionInduccionVirtual | null>(null);

  // forms
  const [contenidoForm, setContenidoForm] = useState<ContenidoFormData>(defaultContenido);
  const [preguntaForm, setPreguntaForm] = useState<PreguntaFormData>(defaultPregunta);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedWorker, setSelectedWorker] = useState("");

  // ── Queries ─────────────────────────────────────────────────────────────
  const { data: contenidos = [], isLoading: loadingContenidos } = useQuery<ContenidoInduccion[]>({
    queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`],
  });
  const { data: preguntas = [], isLoading: loadingPreguntas } = useQuery<PreguntaInduccion[]>({
    queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`],
  });
  const { data: sesiones = [], isLoading: loadingSesiones } = useQuery<SesionInduccionVirtual[]>({
    queryKey: ["/api/sesiones-induccion-pesv"],
  });
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  // ── Mutations — Contenidos ───────────────────────────────────────────────
  const createContenidoMutation = useMutation({
    mutationFn: async (data: ContenidoFormData) => {
      const res = await apiRequest("POST", "/api/contenidos-induccion", { ...data, tipoInduccion: TIPO });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`] });
      setContenidoDialogOpen(false);
      setContenidoForm(defaultContenido);
      setSelectedFileName("");
      toast({ title: "Contenido creado", description: "El contenido PESV se ha creado exitosamente." });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateContenidoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ContenidoFormData> }) => {
      const res = await apiRequest("PATCH", `/api/contenidos-induccion/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`] });
      setContenidoDialogOpen(false);
      setEditingContenido(null);
      setContenidoForm(defaultContenido);
      setSelectedFileName("");
      toast({ title: "Contenido actualizado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteContenidoMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/contenidos-induccion/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: "Contenido eliminado" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderContenidoMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const res = await apiRequest("PATCH", `/api/contenidos-induccion/${id}/reorder`, { direction });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`] }),
    onError: (e: Error) => toast({ title: "Error al reordenar", description: e.message, variant: "destructive" }),
  });

  // ── Mutations — Preguntas ────────────────────────────────────────────────
  const createPreguntaMutation = useMutation({
    mutationFn: async (data: PreguntaFormData) => {
      const res = await apiRequest("POST", "/api/preguntas-induccion", {
        ...data, opciones: JSON.stringify(data.opciones), tipoInduccion: TIPO,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`] });
      setPreguntaDialogOpen(false);
      setPreguntaForm(defaultPregunta);
      toast({ title: "Pregunta creada" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updatePreguntaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PreguntaFormData> }) => {
      const res = await apiRequest("PATCH", `/api/preguntas-induccion/${id}`, {
        ...data, opciones: data.opciones ? JSON.stringify(data.opciones) : undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`] });
      setPreguntaDialogOpen(false);
      setEditingPregunta(null);
      setPreguntaForm(defaultPregunta);
      toast({ title: "Pregunta actualizada" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deletePreguntaMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/preguntas-induccion/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`] });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      toast({ title: "Pregunta eliminada" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const reorderPreguntaMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const res = await apiRequest("PATCH", `/api/preguntas-induccion/${id}/reorder`, { direction });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`] }),
    onError: (e: Error) => toast({ title: "Error al reordenar", description: e.message, variant: "destructive" }),
  });

  // ── Mutations — Sesiones ─────────────────────────────────────────────────
  const enviarIndividualMutation = useMutation({
    mutationFn: async (workerId: string) => {
      const res = await apiRequest("POST", "/api/sesiones-induccion-pesv/enviar", { workerIds: [workerId] });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sesiones-induccion-pesv"] });
      setEnviarIndividualOpen(false);
      setSelectedWorker("");
      toast({ title: "✅ Inducción asignada", description: data?.mensaje });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const enviarMasivoMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/sesiones-induccion-pesv/enviar-masivo", {});
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sesiones-induccion-pesv"] });
      setEnviarDialogOpen(false);
      toast({
        title: "✅ Inducción enviada",
        description: `La inducción PESV fue asignada a ${data.enviados} trabajador${data.enviados !== 1 ? "es" : ""}.`,
      });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  // ── Mutation — Plantilla PESV ────────────────────────────────────────────
  const plantilla = getPlantillaPesv();

  const cargarPlantillaMutation = useMutation({
    mutationFn: async () => {
      for (const c of plantilla.contenidos) {
        await apiRequest("POST", "/api/contenidos-induccion", c);
      }
      for (const p of plantilla.preguntas) {
        await apiRequest("POST", "/api/preguntas-induccion", {
          ...p, opciones: JSON.stringify(p.opciones),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contenidos-induccion?tipo=${TIPO}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/preguntas-induccion?tipo=${TIPO}`] });
      setPlantillaDialogOpen(false);
      toast({
        title: "Plantilla cargada exitosamente",
        description: `Se crearon ${plantilla.contenidos.length} contenidos y ${plantilla.preguntas.length} preguntas PESV. Revise y publique los contenidos antes de enviar inducciones.`,
      });
      setActiveTab("contenidos");
    },
    onError: (e: Error) => toast({ title: "Error al cargar plantilla", description: e.message, variant: "destructive" }),
  });

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleEditContenido = (c: ContenidoInduccion) => {
    setEditingContenido(c);
    setContenidoForm({
      titulo: c.titulo, descripcion: c.descripcion || "",
      tipoContenido: c.tipoContenido as any,
      urlVideo: c.urlVideo || "", urlDocumento: c.urlDocumento || "",
      contenidoTexto: c.contenidoTexto || "",
      duracionMinutos: c.duracionMinutos, estado: c.estado as any, obligatorio: c.obligatorio,
    });
    setSelectedFileName(c.urlDocumento ? "Archivo existente" : "");
    setContenidoDialogOpen(true);
  };

  const handleEditPregunta = (p: PreguntaInduccion) => {
    setEditingPregunta(p);
    setPreguntaForm({
      pregunta: p.pregunta, opciones: JSON.parse(p.opciones),
      respuestaCorrecta: p.respuestaCorrecta,
      explicacion: p.explicacion || "", activa: p.activa,
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
    if (itemToDelete.type === "contenido") deleteContenidoMutation.mutate(itemToDelete.id);
    else deletePreguntaMutation.mutate(itemToDelete.id);
  };

  const handleFileUpload = async (file: globalThis.File) => {
    setUploadingFile(true);
    setSelectedFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", "capacitaciones");
      const res = await fetch("/api/upload", { method: "POST", body: formData, credentials: "include" });
      if (!res.ok) throw new Error(await res.text() || "Error al subir archivo");
      const data = await res.json();
      setContenidoForm(prev => ({ ...prev, urlDocumento: data.url }));
      toast({ title: "Archivo subido", description: `${file.name} subido correctamente` });
    } catch (error: any) {
      toast({ title: "Error al subir archivo", description: error.message, variant: "destructive" });
      setSelectedFileName("");
    } finally {
      setUploadingFile(false);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────
  const sesionesConActiva = (sesiones as any[]).filter(s => s.estado === "pendiente" || s.estado === "en_progreso");
  const activosIds = new Set(sesionesConActiva.map((s: any) => s.workerId));
  const availableWorkers = (workers as any[]).filter(w => !activosIds.has(w.id));

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            Inducción Virtual PESV
          </h1>
          <p className="text-muted-foreground">
            Configure contenidos, evaluaciones y gestione el envío de inducciones de seguridad vial — Resolución 40595/2022
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Plantilla */}
          <Button variant="outline" onClick={() => setPlantillaDialogOpen(true)}>
            <Wand2 className="h-4 w-4 mr-2" />
            Cargar Plantilla PESV
          </Button>

          {/* Enviar individual */}
          <Dialog open={enviarIndividualOpen} onOpenChange={open => { setEnviarIndividualOpen(open); if (!open) setSelectedWorker(""); }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Enviar a trabajador
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Inducción PESV a Trabajador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Trabajador *</Label>
                  <Select value={selectedWorker} onValueChange={setSelectedWorker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un trabajador" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableWorkers.map((w: any) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}{w.email ? ` — ${w.email}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableWorkers.length === 0 && (
                    <p className="text-xs text-muted-foreground">Todos los trabajadores ya tienen sesión activa.</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEnviarIndividualOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => enviarIndividualMutation.mutate(selectedWorker)}
                  disabled={!selectedWorker || enviarIndividualMutation.isPending}
                >
                  {enviarIndividualMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Enviar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Enviar masivo */}
          <Dialog open={enviarDialogOpen} onOpenChange={setEnviarDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Inducción
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enviar Inducción PESV a Todos</DialogTitle>
                <DialogDescription>
                  Se creará una sesión de inducción de seguridad vial para <strong>todos los trabajadores</strong>. Podrán verla en su Portal del Empleado.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-lg border bg-muted/40 p-4 text-sm flex justify-between items-center">
                  <span className="text-muted-foreground">Trabajadores que recibirán la inducción</span>
                  <span className="font-bold text-green-600 text-lg">{availableWorkers.length}</span>
                </div>
                {availableWorkers.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">Todos los trabajadores ya tienen sesión PESV activa.</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEnviarDialogOpen(false)}>Cancelar</Button>
                <Button
                  onClick={() => enviarMasivoMutation.mutate()}
                  disabled={enviarMasivoMutation.isPending || availableWorkers.length === 0}
                >
                  {enviarMasivoMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                  Enviar a todos ({availableWorkers.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Contenidos", value: contenidos.length, sub: `${contenidos.filter(c => c.estado === "publicado").length} publicados` },
          { label: "Preguntas", value: preguntas.length, sub: `${preguntas.filter(p => p.activa).length} activas` },
          { label: "Sesiones enviadas", value: sesiones.length, sub: `${sesionesConActiva.length} activas` },
          { label: "Completadas", value: (sesiones as any[]).filter(s => s.estado === "completada").length, sub: `${(sesiones as any[]).filter(s => s.aprobado).length} aprobadas` },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
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

        {/* ── CONTENIDOS ────────────────────────────────────────────────── */}
        <TabsContent value="contenidos" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={contenidoDialogOpen} onOpenChange={open => {
              setContenidoDialogOpen(open);
              if (!open) { setEditingContenido(null); setContenidoForm(defaultContenido); setSelectedFileName(""); }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Contenido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingContenido ? "Editar Contenido" : "Nuevo Contenido PESV"}</DialogTitle>
                  <DialogDescription>Material educativo sobre el Plan Estratégico de Seguridad Vial.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título *</Label>
                      <Input
                        value={contenidoForm.titulo}
                        onChange={e => setContenidoForm({ ...contenidoForm, titulo: e.target.value })}
                        placeholder="Ej: Introducción al PESV"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Tipo de Contenido</Label>
                      <Select
                        value={contenidoForm.tipoContenido}
                        onValueChange={v => setContenidoForm({ ...contenidoForm, tipoContenido: v as any })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="documento">Documento PDF</SelectItem>
                          <SelectItem value="presentacion">Presentación</SelectItem>
                          <SelectItem value="texto">Texto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Descripción</Label>
                    <Textarea
                      value={contenidoForm.descripcion}
                      onChange={e => setContenidoForm({ ...contenidoForm, descripcion: e.target.value })}
                      placeholder="Descripción del contenido..."
                    />
                  </div>

                  {contenidoForm.tipoContenido === "video" && (
                    <div className="space-y-2">
                      <Label>URL del Video (YouTube, Vimeo, etc.)</Label>
                      <Input
                        value={contenidoForm.urlVideo}
                        onChange={e => setContenidoForm({ ...contenidoForm, urlVideo: e.target.value })}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  )}

                  {(contenidoForm.tipoContenido === "documento" || contenidoForm.tipoContenido === "presentacion") && (
                    <div className="space-y-2">
                      <Label>Adjuntar Archivo {contenidoForm.tipoContenido === "documento" ? "(PDF)" : "(PDF, DOCX)"}</Label>
                      {contenidoForm.urlDocumento ? (
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-md">
                          <File className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-sm text-emerald-700 dark:text-emerald-300 flex-1 truncate">
                            {selectedFileName || "Archivo adjunto"}
                          </span>
                          <Button
                            type="button" variant="ghost" size="icon"
                            onClick={() => { setContenidoForm(p => ({ ...p, urlDocumento: "" })); setSelectedFileName(""); }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                          onClick={() => document.getElementById("pesv-file-input")?.click()}
                        >
                          {uploadingFile ? (
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Subiendo archivo...</p>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Haga clic para seleccionar un archivo</p>
                              <p className="text-xs text-muted-foreground">PDF, DOC, DOCX (máx. 10MB)</p>
                            </div>
                          )}
                        </div>
                      )}
                      <input
                        id="pesv-file-input" type="file" className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); e.target.value = ""; }}
                      />
                    </div>
                  )}

                  {contenidoForm.tipoContenido === "texto" && (
                    <div className="space-y-2">
                      <Label>Contenido de texto</Label>
                      <Textarea
                        value={contenidoForm.contenidoTexto}
                        onChange={e => setContenidoForm({ ...contenidoForm, contenidoTexto: e.target.value })}
                        rows={6}
                        placeholder="Escriba el contenido educativo aquí..."
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duración (minutos)</Label>
                      <Input
                        type="number"
                        value={contenidoForm.duracionMinutos || ""}
                        onChange={e => setContenidoForm({ ...contenidoForm, duracionMinutos: e.target.value === "" ? ('' as any) : parseInt(e.target.value, 10) })}
                        onBlur={e => { if (e.target.value === "") setContenidoForm(p => ({ ...p, duracionMinutos: 10 })); }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Estado</Label>
                      <Select
                        value={contenidoForm.estado}
                        onValueChange={v => setContenidoForm({ ...contenidoForm, estado: v as any })}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Button variant="outline" onClick={() => setContenidoDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmitContenido} disabled={!contenidoForm.titulo || createContenidoMutation.isPending || updateContenidoMutation.isPending}>
                    {(createContenidoMutation.isPending || updateContenidoMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingContenido ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingContenidos ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : contenidos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin contenidos PESV</h3>
                <p className="text-muted-foreground mb-4">
                  Agregue videos, documentos o textos sobre seguridad vial, o use la plantilla predefinida.
                </p>
                <Button variant="outline" onClick={() => setPlantillaDialogOpen(true)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Cargar Plantilla PESV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {contenidos.map((c, index) => (
                <Card key={c.id}>
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            disabled={index === 0 || reorderContenidoMutation.isPending}
                            onClick={() => reorderContenidoMutation.mutate({ id: c.id, direction: "up" })}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            disabled={index === contenidos.length - 1 || reorderContenidoMutation.isPending}
                            onClick={() => reorderContenidoMutation.mutate({ id: c.id, direction: "down" })}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        {getIconForType(c.tipoContenido)}
                        <div>
                          <CardTitle className="text-base">{c.titulo}</CardTitle>
                          {c.descripcion && <CardDescription className="text-sm">{c.descripcion}</CardDescription>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getEstadoBadge(c.estado)}
                        <Badge variant="outline">{c.duracionMinutos} min</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleEditContenido(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemToDelete({ type: "contenido", id: c.id }); setDeleteDialogOpen(true); }}>
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

        {/* ── PREGUNTAS ─────────────────────────────────────────────────── */}
        <TabsContent value="preguntas" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={preguntaDialogOpen} onOpenChange={open => {
              setPreguntaDialogOpen(open);
              if (!open) { setEditingPregunta(null); setPreguntaForm(defaultPregunta); }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Pregunta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPregunta ? "Editar Pregunta" : "Nueva Pregunta PESV"}</DialogTitle>
                  <DialogDescription>Preguntas de evaluación sobre seguridad vial (aprobación ≥ 80%).</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Pregunta *</Label>
                    <Textarea
                      value={preguntaForm.pregunta}
                      onChange={e => setPreguntaForm({ ...preguntaForm, pregunta: e.target.value })}
                      placeholder="¿Cuál es la velocidad máxima en zona residencial?"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Opciones de Respuesta</Label>
                    {preguntaForm.opciones.map((opcion, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          value={opcion}
                          onChange={e => {
                            const opts = [...preguntaForm.opciones];
                            opts[index] = e.target.value;
                            setPreguntaForm({ ...preguntaForm, opciones: opts });
                          }}
                          placeholder={`Opción ${index + 1}`}
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
                      onValueChange={v => setPreguntaForm({ ...preguntaForm, respuestaCorrecta: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {preguntaForm.opciones.map((_, index) => (
                          <SelectItem key={index} value={index.toString()}>Opción {index + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Explicación (opcional)</Label>
                    <Textarea
                      value={preguntaForm.explicacion}
                      onChange={e => setPreguntaForm({ ...preguntaForm, explicacion: e.target.value })}
                      placeholder="Explicación de por qué esta es la respuesta correcta..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select
                      value={preguntaForm.activa.toString()}
                      onValueChange={v => setPreguntaForm({ ...preguntaForm, activa: parseInt(v) })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Activa</SelectItem>
                        <SelectItem value="0">Inactiva</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPreguntaDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSubmitPregunta} disabled={!preguntaForm.pregunta || createPreguntaMutation.isPending || updatePreguntaMutation.isPending}>
                    {(createPreguntaMutation.isPending || updatePreguntaMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingPregunta ? "Actualizar" : "Crear"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {loadingPreguntas ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : preguntas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin preguntas de evaluación</h3>
                <p className="text-muted-foreground mb-4">
                  Agregue preguntas sobre seguridad vial o use la plantilla predefinida.
                </p>
                <Button variant="outline" onClick={() => setPlantillaDialogOpen(true)}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Cargar Plantilla PESV
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {preguntas.map((p, index) => (
                <Card key={p.id}>
                  <CardHeader className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            disabled={index === 0 || reorderPreguntaMutation.isPending}
                            onClick={() => reorderPreguntaMutation.mutate({ id: p.id, direction: "up" })}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-6 w-6"
                            disabled={index === preguntas.length - 1 || reorderPreguntaMutation.isPending}
                            onClick={() => reorderPreguntaMutation.mutate({ id: p.id, direction: "down" })}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-base mb-2">{index + 1}. {p.pregunta}</CardTitle>
                          <div className="space-y-1">
                            {(JSON.parse(p.opciones) as string[]).map((op, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                {i === p.respuestaCorrecta
                                  ? <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                                  : <span className="h-4 w-4 flex-shrink-0" />
                                }
                                <span className={i === p.respuestaCorrecta ? "font-medium text-green-700 dark:text-green-400" : "text-muted-foreground"}>
                                  {op}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={p.activa ? "default" : "secondary"}>{p.activa ? "Activa" : "Inactiva"}</Badge>
                        <Button variant="ghost" size="icon" onClick={() => handleEditPregunta(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setItemToDelete({ type: "pregunta", id: p.id }); setDeleteDialogOpen(true); }}>
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

        {/* ── SESIONES ──────────────────────────────────────────────────── */}
        <TabsContent value="sesiones" className="space-y-4 mt-4">
          {loadingSesiones ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : sesiones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Sin sesiones</h3>
                <p className="text-muted-foreground mb-4">
                  No hay sesiones de inducción PESV enviadas aún.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(sesiones as any[]).map(s => {
                const w = (workers as any[]).find(wk => wk.id === s.workerId);
                return (
                  <Card key={s.id}>
                    <CardHeader className="py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">{w?.name || "Trabajador"}</CardTitle>
                          <CardDescription>
                            Enviada: {new Date(s.fechaEnvio).toLocaleDateString("es-CO")}
                            {s.fechaFinalizacion && (
                              <> | Completada: {new Date(s.fechaFinalizacion).toLocaleDateString("es-CO")}</>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {getSesionEstadoBadge(s.estado)}
                          {s.puntajeEvaluacion !== null && (
                            <Badge className={s.aprobado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {s.puntajeEvaluacion}%
                            </Badge>
                          )}
                          {s.estado === "completada" && (
                            <Button
                              size="sm" variant="outline"
                              onClick={() => { setSesionSeleccionada(s); setRespuestasDialogOpen(true); }}
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              Ver respuestas
                            </Button>
                          )}
                          <a href={`/api/sesiones-induccion-pesv/${s.id}/pdf`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver PDF
                            </Button>
                          </a>
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

      {/* ── Dialog Plantilla PESV ────────────────────────────────────────── */}
      <Dialog open={plantillaDialogOpen} onOpenChange={setPlantillaDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Cargar Plantilla de Inducción PESV
            </DialogTitle>
            <DialogDescription>
              Carga automática de contenidos y preguntas de evaluación de seguridad vial — Resolución 40595/2022.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-muted/40 p-4 text-sm flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Plantilla de Seguridad Vial</p>
                <p className="text-xs text-muted-foreground">Resolución 40595/2022 — Ministerio de Transporte</p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p><strong>{plantilla.contenidos.length}</strong> contenidos educativos</p>
                <p><strong>{plantilla.preguntas.length}</strong> preguntas de evaluación</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Contenidos que se crearán:</p>
              <ScrollArea className="h-36 border rounded-md p-3">
                <ul className="space-y-1">
                  {plantilla.contenidos.map((c, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      {getIconForType(c.tipoContenido)}
                      {c.titulo}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Preguntas de evaluación que se crearán:</p>
              <ScrollArea className="h-36 border rounded-md p-3">
                <ul className="space-y-1">
                  {plantilla.preguntas.map((p, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <GraduationCap className="h-3 w-3 text-primary flex-shrink-0" />
                      {p.pregunta}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </div>

            {(contenidos.length > 0 || preguntas.length > 0) && (
              <Card className="bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Plantillas ya cargadas</p>
                      <p className="text-sm text-red-600 dark:text-red-300">
                        Ya tiene <strong>{contenidos.length}</strong> contenido(s) y <strong>{preguntas.length}</strong> pregunta(s).
                        Cargar nuevamente crearía duplicados. Elimine primero los existentes si desea reiniciar.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <CardContent className="pt-4">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Los contenidos se crearán en estado <strong>Borrador</strong>. Agregue la URL del video o suba el documento y luego publíquelos antes de enviar inducciones.
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlantillaDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={() => cargarPlantillaMutation.mutate()}
              disabled={cargarPlantillaMutation.isPending || contenidos.length > 0 || preguntas.length > 0}
            >
              {cargarPlantillaMutation.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Cargando...</>
              ) : (contenidos.length > 0 || preguntas.length > 0) ? (
                <><AlertCircle className="h-4 w-4 mr-2" />Ya hay plantillas cargadas</>
              ) : (
                <><Wand2 className="h-4 w-4 mr-2" />Cargar {plantilla.contenidos.length} contenidos y {plantilla.preguntas.length} preguntas</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Ver Respuestas ────────────────────────────────────────── */}
      <Dialog open={respuestasDialogOpen} onOpenChange={open => { setRespuestasDialogOpen(open); if (!open) setSesionSeleccionada(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Respuestas de Evaluación PESV
            </DialogTitle>
            <DialogDescription>
              {sesionSeleccionada && (
                <>
                  Trabajador: {(workers as any[]).find(w => w.id === sesionSeleccionada.workerId)?.name || "Trabajador"} |{" "}
                  Puntaje: {sesionSeleccionada.puntajeEvaluacion}%{" "}
                  {sesionSeleccionada.aprobado
                    ? <Badge className="bg-green-100 text-green-800 ml-1">Aprobado</Badge>
                    : <Badge className="bg-red-100 text-red-800 ml-1">Reprobado</Badge>
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {sesionSeleccionada && (() => {
                const respuestas = JSON.parse(sesionSeleccionada.progresoEvaluacion || "{}");
                const preguntasActivas = preguntas.filter(p => p.activa === 1).sort((a, b) => a.orden - b.orden);

                const buscarRespuesta = (pregunta: PreguntaInduccion, index: number) => {
                  if (respuestas[pregunta.id] !== undefined) return respuestas[pregunta.id];
                  if (respuestas[index] !== undefined) return respuestas[index];
                  if (respuestas[String(index)] !== undefined) return respuestas[String(index)];
                  return undefined;
                };

                if (preguntasActivas.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No hay preguntas configuradas actualmente.</p>
                      <p className="text-sm text-muted-foreground mt-1">Puntaje obtenido: {sesionSeleccionada.puntajeEvaluacion}%</p>
                    </div>
                  );
                }

                return preguntasActivas.map((pregunta, index) => {
                  const opciones = JSON.parse(pregunta.opciones) as string[];
                  const respuestaUsuario = buscarRespuesta(pregunta, index);
                  const tieneRespuesta = respuestaUsuario !== undefined && respuestaUsuario !== null;
                  const esCorrecta = tieneRespuesta && respuestaUsuario === pregunta.respuestaCorrecta;

                  return (
                    <Card key={pregunta.id} className={
                      !tieneRespuesta
                        ? "border-gray-300 bg-gray-50/50 dark:bg-gray-950/20"
                        : esCorrecta
                        ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
                        : "border-red-300 bg-red-50/50 dark:bg-red-950/20"
                    }>
                      <CardHeader className="py-3">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-sm font-medium">{index + 1}. {pregunta.pregunta}</CardTitle>
                          {!tieneRespuesta
                            ? <Badge variant="outline" className="text-gray-500 flex-shrink-0">Sin respuesta</Badge>
                            : esCorrecta
                            ? <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                            : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          }
                        </div>
                      </CardHeader>
                      <CardContent className="py-2 pt-0">
                        <div className="space-y-1">
                          {opciones.map((op, i) => {
                            const esRespuestaUsuario = respuestaUsuario === i;
                            const esRespuestaCorrecta = pregunta.respuestaCorrecta === i;
                            return (
                              <div key={i} className={`p-2 rounded text-sm ${
                                esRespuestaCorrecta
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-medium"
                                  : esRespuestaUsuario && !esRespuestaCorrecta
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 line-through"
                                  : "text-muted-foreground"
                              }`}>
                                {String.fromCharCode(65 + i)}. {op}
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
            <Button variant="outline" onClick={() => setRespuestasDialogOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Eliminar ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente {itemToDelete?.type === "contenido" ? "este contenido" : "esta pregunta"}.
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
    </div>
  );
}
