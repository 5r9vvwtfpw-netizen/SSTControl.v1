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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/hooks/use-company-context";
import { Plus, Pencil, Trash2, Video, FileText, BookOpen, Eye, Send, Users, CheckCircle2, XCircle, Car, Loader2 } from "lucide-react";
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

// Preguntas PESV sugeridas para arrancar
const PREGUNTAS_EJEMPLO: Partial<PreguntaFormData>[] = [
  {
    pregunta: "¿Qué norma colombiana regula el Plan Estratégico de Seguridad Vial (PESV)?",
    opciones: ["Resolución 40595 de 2022", "Decreto 1072 de 2015", "Ley 769 de 2002", "Resolución 0312 de 2019"],
    respuestaCorrecta: 0,
    explicacion: "La Resolución 40595 de 2022 del Ministerio de Transporte establece los lineamientos del PESV.",
  },
  {
    pregunta: "¿Cuál es la velocidad máxima permitida en zona residencial según el Código Nacional de Tránsito?",
    opciones: ["60 km/h", "50 km/h", "30 km/h", "80 km/h"],
    respuestaCorrecta: 2,
    explicacion: "En zonas residenciales la velocidad máxima es 30 km/h según el Código Nacional de Tránsito.",
  },
  {
    pregunta: "¿Qué debe hacer un trabajador si ocurre un accidente de tránsito en misión?",
    opciones: [
      "Notificar a la empresa y a las autoridades inmediatamente",
      "Continuar el viaje y reportar al llegar",
      "Solo notificar a la ARL",
      "Esperar a que llegue la policía sin hacer nada",
    ],
    respuestaCorrecta: 0,
    explicacion: "En caso de accidente en misión se debe notificar a la empresa y autoridades de inmediato.",
  },
  {
    pregunta: "¿Cuál es el uso correcto del cinturón de seguridad?",
    opciones: [
      "Solo en carretera, no en ciudad",
      "Siempre que el vehículo esté en movimiento",
      "Solo en el asiento delantero",
      "No es obligatorio si la velocidad es baja",
    ],
    respuestaCorrecta: 1,
    explicacion: "El cinturón debe usarse siempre que el vehículo esté en movimiento, en todos los asientos.",
  },
  {
    pregunta: "¿Qué factor aumenta el riesgo de accidente de tránsito en el trabajo?",
    opciones: ["Fatiga y somnolencia", "Conocer bien la ruta", "Viajar en horas del día", "Usar GPS"],
    respuestaCorrecta: 0,
    explicacion: "La fatiga y somnolencia son factores críticos de riesgo vial en el contexto laboral.",
  },
];

export default function PesvInduccionVirtual() {
  const { toast } = useToast();
  const { selectedCompany } = useCompanyContext();
  const [activeTab, setActiveTab] = useState("contenidos");
  const [contenidoDialogOpen, setContenidoDialogOpen] = useState(false);
  const [preguntaDialogOpen, setPreguntaDialogOpen] = useState(false);
  const [enviarDialogOpen, setEnviarDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingContenido, setEditingContenido] = useState<ContenidoInduccion | null>(null);
  const [editingPregunta, setEditingPregunta] = useState<PreguntaInduccion | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingType, setDeletingType] = useState<"contenido" | "pregunta">("contenido");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>("");
  const [contenidoForm, setContenidoForm] = useState<ContenidoFormData>(defaultContenido);
  const [preguntaForm, setPreguntaForm] = useState<PreguntaFormData>(defaultPregunta);

  const headers = selectedCompany?.id ? { "X-Company-Id": selectedCompany.id } : {};

  const { data: contenidos = [], isLoading: loadingContenidos } = useQuery<ContenidoInduccion[]>({
    queryKey: ["/api/contenidos-induccion", TIPO, selectedCompany?.id],
    queryFn: () => apiRequest("GET", `/api/contenidos-induccion?tipo=${TIPO}`, undefined, headers),
  });

  const { data: preguntas = [], isLoading: loadingPreguntas } = useQuery<PreguntaInduccion[]>({
    queryKey: ["/api/preguntas-induccion", TIPO, selectedCompany?.id],
    queryFn: () => apiRequest("GET", `/api/preguntas-induccion?tipo=${TIPO}`, undefined, headers),
  });

  const { data: sesiones = [], isLoading: loadingSesiones } = useQuery<SesionInduccionVirtual[]>({
    queryKey: ["/api/sesiones-induccion-pesv", selectedCompany?.id],
    queryFn: () => apiRequest("GET", `/api/sesiones-induccion-pesv`, undefined, headers),
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers", selectedCompany?.id],
    queryFn: () => apiRequest("GET", `/api/workers`, undefined, headers),
  });

  // ── Contenidos ────────────────────────────────────────────────────────────
  const saveContenidoMutation = useMutation({
    mutationFn: (data: ContenidoFormData) => {
      const body = { ...data, tipoInduccion: TIPO };
      if (editingContenido) {
        return apiRequest("PATCH", `/api/contenidos-induccion/${editingContenido.id}`, body, headers);
      }
      return apiRequest("POST", `/api/contenidos-induccion`, body, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
      setContenidoDialogOpen(false);
      setEditingContenido(null);
      setContenidoForm(defaultContenido);
      toast({ title: editingContenido ? "Contenido actualizado" : "Contenido creado" });
    },
    onError: () => toast({ title: "Error al guardar contenido", variant: "destructive" }),
  });

  // ── Preguntas ─────────────────────────────────────────────────────────────
  const savePreguntaMutation = useMutation({
    mutationFn: (data: PreguntaFormData) => {
      const body = { ...data, opciones: JSON.stringify(data.opciones), tipoInduccion: TIPO };
      if (editingPregunta) {
        return apiRequest("PATCH", `/api/preguntas-induccion/${editingPregunta.id}`, body, headers);
      }
      return apiRequest("POST", `/api/preguntas-induccion`, body, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      setPreguntaDialogOpen(false);
      setEditingPregunta(null);
      setPreguntaForm(defaultPregunta);
      toast({ title: editingPregunta ? "Pregunta actualizada" : "Pregunta creada" });
    },
    onError: () => toast({ title: "Error al guardar pregunta", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (deletingType === "contenido") {
        return apiRequest("DELETE", `/api/contenidos-induccion/${deletingId}`, undefined, headers);
      }
      return apiRequest("DELETE", `/api/preguntas-induccion/${deletingId}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contenidos-induccion"] });
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      setDeleteDialogOpen(false);
      toast({ title: "Eliminado correctamente" });
    },
    onError: () => toast({ title: "Error al eliminar", variant: "destructive" }),
  });

  const enviarIndividualMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/sesiones-induccion-pesv/enviar`,
      { workerId: selectedWorkerId }, headers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sesiones-induccion-pesv"] });
      setEnviarDialogOpen(false);
      setSelectedWorkerId("");
      toast({ title: "Inducción PESV asignada correctamente" });
    },
    onError: () => toast({ title: "Error al asignar inducción", variant: "destructive" }),
  });

  const enviarMasivoMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/sesiones-induccion-pesv/enviar-masivo`, {}, headers),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/sesiones-induccion-pesv"] });
      toast({ title: "Envío masivo completado", description: data?.mensaje });
    },
    onError: () => toast({ title: "Error en envío masivo", variant: "destructive" }),
  });

  const cargarPreguntasEjemploMutation = useMutation({
    mutationFn: async () => {
      for (const pq of PREGUNTAS_EJEMPLO) {
        await apiRequest("POST", `/api/preguntas-induccion`, {
          pregunta: pq.pregunta,
          opciones: JSON.stringify(pq.opciones),
          respuestaCorrecta: pq.respuestaCorrecta,
          explicacion: pq.explicacion,
          activa: 1,
          tipoInduccion: TIPO,
        }, headers);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preguntas-induccion"] });
      toast({ title: "Preguntas PESV de ejemplo cargadas" });
    },
    onError: () => toast({ title: "Error al cargar preguntas", variant: "destructive" }),
  });

  const openEditContenido = (c: ContenidoInduccion) => {
    setEditingContenido(c);
    setContenidoForm({
      titulo: c.titulo, descripcion: c.descripcion || "",
      tipoContenido: c.tipoContenido as any,
      urlVideo: c.urlVideo || "", urlDocumento: c.urlDocumento || "",
      contenidoTexto: c.contenidoTexto || "",
      duracionMinutos: c.duracionMinutos, estado: c.estado as any, obligatorio: c.obligatorio,
    });
    setContenidoDialogOpen(true);
  };

  const openEditPregunta = (p: PreguntaInduccion) => {
    setEditingPregunta(p);
    setPreguntaForm({
      pregunta: p.pregunta,
      opciones: JSON.parse(p.opciones),
      respuestaCorrecta: p.respuestaCorrecta,
      explicacion: p.explicacion || "", activa: p.activa,
    });
    setPreguntaDialogOpen(true);
  };

  const tipoIcon = (tipo: string) => {
    if (tipo === "video") return <Video className="h-4 w-4" />;
    if (tipo === "texto") return <BookOpen className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Car className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Inducción Virtual PESV</h1>
            <p className="text-muted-foreground text-sm">
              Contenidos y evaluación del Plan Estratégico de Seguridad Vial — Resolución 40595/2022
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => { setEnviarDialogOpen(true); setSelectedWorkerId(""); }}>
            <Send className="h-4 w-4 mr-2" /> Asignar individual
          </Button>
          <Button variant="default" onClick={() => enviarMasivoMutation.mutate()}
            disabled={enviarMasivoMutation.isPending}>
            {enviarMasivoMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Users className="h-4 w-4 mr-2" />}
            Asignar a todos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Contenidos", value: contenidos.length, sub: `${contenidos.filter(c => c.estado === "publicado").length} publicados` },
          { label: "Preguntas", value: preguntas.length, sub: `${preguntas.filter(p => p.activa).length} activas` },
          { label: "Sesiones enviadas", value: sesiones.length, sub: "" },
          { label: "Completadas", value: sesiones.filter(s => s.estado === "completada").length,
            sub: `${sesiones.filter(s => s.aprobado).length} aprobadas` },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-sm font-medium">{stat.label}</div>
              {stat.sub && <div className="text-xs text-muted-foreground">{stat.sub}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="contenidos">Contenidos</TabsTrigger>
          <TabsTrigger value="preguntas">Evaluación</TabsTrigger>
          <TabsTrigger value="sesiones">Sesiones</TabsTrigger>
        </TabsList>

        {/* ── CONTENIDOS ─────────────────────────────────────────────────── */}
        <TabsContent value="contenidos" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Agregue videos, documentos o textos sobre seguridad vial para que los trabajadores los estudien.
            </p>
            <Button onClick={() => { setEditingContenido(null); setContenidoForm(defaultContenido); setContenidoDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" /> Agregar contenido
            </Button>
          </div>

          {loadingContenidos ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : contenidos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Car className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Sin contenidos PESV</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agregue videos sobre normativa vial, factores de riesgo, uso del cinturón, etc.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {contenidos.map((c) => (
                <Card key={c.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-muted rounded">{tipoIcon(c.tipoContenido)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{c.titulo}</p>
                            <Badge variant={c.estado === "publicado" ? "default" : "secondary"} className="text-xs">
                              {c.estado}
                            </Badge>
                          </div>
                          {c.descripcion && <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{c.descripcion}</p>}
                          <p className="text-xs text-muted-foreground mt-1">{c.duracionMinutos} min · {c.tipoContenido}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" onClick={() => openEditContenido(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="text-destructive"
                          onClick={() => { setDeletingId(c.id); setDeletingType("contenido"); setDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── PREGUNTAS ──────────────────────────────────────────────────── */}
        <TabsContent value="preguntas" className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-sm text-muted-foreground">
              Configure las preguntas de evaluación PESV (aprobación ≥ 80%).
            </p>
            <div className="flex gap-2">
              {preguntas.length === 0 && (
                <Button variant="outline" onClick={() => cargarPreguntasEjemploMutation.mutate()}
                  disabled={cargarPreguntasEjemploMutation.isPending}>
                  {cargarPreguntasEjemploMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Cargar preguntas de ejemplo
                </Button>
              )}
              <Button onClick={() => { setEditingPregunta(null); setPreguntaForm(defaultPregunta); setPreguntaDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Agregar pregunta
              </Button>
            </div>
          </div>

          {loadingPreguntas ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : preguntas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Sin preguntas de evaluación</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use "Cargar preguntas de ejemplo" para comenzar con preguntas PESV predefinidas.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {preguntas.map((p, idx) => {
                const opts = JSON.parse(p.opciones) as string[];
                return (
                  <Card key={p.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{idx + 1}. {p.pregunta}</p>
                          <div className="mt-2 space-y-1">
                            {opts.map((opt, i) => (
                              <div key={i} className={`text-xs flex items-center gap-1.5 ${i === p.respuestaCorrecta ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                                {i === p.respuestaCorrecta ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                {opt}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <Button size="icon" variant="ghost" onClick={() => openEditPregunta(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-destructive"
                            onClick={() => { setDeletingId(p.id); setDeletingType("pregunta"); setDeleteDialogOpen(true); }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── SESIONES ───────────────────────────────────────────────────── */}
        <TabsContent value="sesiones" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Histórico de inducciones PESV asignadas a trabajadores.
          </p>
          {loadingSesiones ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : sesiones.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Sin sesiones asignadas</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Use "Asignar a todos" para enviar la inducción PESV a todos los trabajadores.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sesiones.map((s: any) => {
                const w = workers.find((wk: any) => wk.id === s.workerId);
                return (
                  <Card key={s.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="space-y-0.5">
                          <p className="font-medium text-sm">{w?.name || s.workerId}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviada: {new Date(s.fechaEnvio).toLocaleDateString('es-CO')} · 
                            Expira: {new Date(s.fechaExpiracion).toLocaleDateString('es-CO')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={
                            s.estado === "completada" ? "default" :
                            s.estado === "en_progreso" ? "secondary" :
                            s.estado === "expirada" ? "destructive" : "outline"
                          }>
                            {s.estado}
                          </Badge>
                          {s.puntajeEvaluacion !== null && (
                            <Badge className={s.aprobado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {s.puntajeEvaluacion}%
                            </Badge>
                          )}
                          <a href={`/induccion-virtual/${s.token}`} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" /> Ver
                            </Button>
                          </a>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Dialog Contenido ──────────────────────────────────────────────── */}
      <Dialog open={contenidoDialogOpen} onOpenChange={setContenidoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingContenido ? "Editar contenido" : "Nuevo contenido PESV"}</DialogTitle>
            <DialogDescription>Material educativo sobre seguridad vial</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={contenidoForm.titulo}
                onChange={e => setContenidoForm(f => ({ ...f, titulo: e.target.value }))} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={contenidoForm.descripcion}
                onChange={e => setContenidoForm(f => ({ ...f, descripcion: e.target.value }))} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tipo</Label>
                <Select value={contenidoForm.tipoContenido}
                  onValueChange={v => setContenidoForm(f => ({ ...f, tipoContenido: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="documento">Documento</SelectItem>
                    <SelectItem value="texto">Texto</SelectItem>
                    <SelectItem value="presentacion">Presentación</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Estado</Label>
                <Select value={contenidoForm.estado}
                  onValueChange={v => setContenidoForm(f => ({ ...f, estado: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="borrador">Borrador</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                    <SelectItem value="archivado">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {contenidoForm.tipoContenido === "video" && (
              <div>
                <Label>URL del video (YouTube / Vimeo)</Label>
                <Input placeholder="https://youtube.com/watch?v=..." value={contenidoForm.urlVideo}
                  onChange={e => setContenidoForm(f => ({ ...f, urlVideo: e.target.value }))} />
              </div>
            )}
            {contenidoForm.tipoContenido === "documento" && (
              <div>
                <Label>URL del documento (PDF)</Label>
                <Input placeholder="https://..." value={contenidoForm.urlDocumento}
                  onChange={e => setContenidoForm(f => ({ ...f, urlDocumento: e.target.value }))} />
              </div>
            )}
            {contenidoForm.tipoContenido === "texto" && (
              <div>
                <Label>Contenido de texto</Label>
                <Textarea value={contenidoForm.contenidoTexto}
                  onChange={e => setContenidoForm(f => ({ ...f, contenidoTexto: e.target.value }))} rows={4} />
              </div>
            )}
            <div>
              <Label>Duración estimada (minutos)</Label>
              <Input type="number" min={1} value={contenidoForm.duracionMinutos}
                onChange={e => setContenidoForm(f => ({ ...f, duracionMinutos: parseInt(e.target.value) || 10 }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContenidoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => saveContenidoMutation.mutate(contenidoForm)}
              disabled={!contenidoForm.titulo || saveContenidoMutation.isPending}>
              {saveContenidoMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Pregunta ───────────────────────────────────────────────── */}
      <Dialog open={preguntaDialogOpen} onOpenChange={setPreguntaDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPregunta ? "Editar pregunta" : "Nueva pregunta PESV"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Pregunta *</Label>
              <Textarea value={preguntaForm.pregunta}
                onChange={e => setPreguntaForm(f => ({ ...f, pregunta: e.target.value }))} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Opciones de respuesta</Label>
              {preguntaForm.opciones.map((op, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="radio" name="correcta" checked={preguntaForm.respuestaCorrecta === i}
                    onChange={() => setPreguntaForm(f => ({ ...f, respuestaCorrecta: i }))}
                    className="mt-0.5" />
                  <Input placeholder={`Opción ${i + 1}`} value={op}
                    onChange={e => setPreguntaForm(f => {
                      const opts = [...f.opciones]; opts[i] = e.target.value; return { ...f, opciones: opts };
                    })} />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">Seleccione el radio de la respuesta correcta</p>
            </div>
            <div>
              <Label>Explicación de la respuesta correcta</Label>
              <Textarea value={preguntaForm.explicacion}
                onChange={e => setPreguntaForm(f => ({ ...f, explicacion: e.target.value }))} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreguntaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => savePreguntaMutation.mutate(preguntaForm)}
              disabled={!preguntaForm.pregunta || savePreguntaMutation.isPending}>
              {savePreguntaMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Enviar Individual ──────────────────────────────────────── */}
      <Dialog open={enviarDialogOpen} onOpenChange={setEnviarDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar inducción PESV</DialogTitle>
            <DialogDescription>Seleccione el trabajador al que desea asignarle la inducción virtual PESV.</DialogDescription>
          </DialogHeader>
          <Select value={selectedWorkerId} onValueChange={setSelectedWorkerId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar trabajador..." /></SelectTrigger>
            <SelectContent>
              {(workers as any[]).map((w: any) => (
                <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnviarDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => enviarIndividualMutation.mutate()}
              disabled={!selectedWorkerId || enviarIndividualMutation.isPending}>
              {enviarIndividualMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Asignar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Eliminar ─────────────────────────────────────────── */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deletingType === "contenido" ? "contenido" : "pregunta"}?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
