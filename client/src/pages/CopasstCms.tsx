import { useState, useEffect } from "react";
import { Link } from "wouter";
import * as XLSX from "xlsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  FileQuestion,
  FolderOpen,
  Upload,
  Download,
  GripVertical,
  ChevronRight,
  ChevronLeft,
  Save,
  Lightbulb,
  Search,
  Sparkles,
  Check,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";

interface Curso {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  duracionMinutos: number;
  ordenCurso: number;
  esObligatorio: boolean;
  puntosCompletar: number;
  activo: boolean;
}

interface Leccion {
  id: string;
  cursoId: string;
  titulo: string;
  contenidoHtml: string;
  videoUrl?: string;
  duracionMinutos: number;
  ordenLeccion: number;
  puntosCompletar: number;
  activo: boolean;
}

interface BancoPregunta {
  id: string;
  categoriaId?: string;
  enunciadoHtml: string;
  tipoPregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
  explicacionHtml?: string;
  dificultad: string;
  etiquetas?: string[];
  puntos: number;
  activo: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
}

interface CopasstPeriodo {
  id: string;
  companyId: string;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

interface CopasstMiembro {
  id: string;
  periodoId: string;
  workerId: string;
  tipoRepresentante: string;
  cargo: string;
  esPresidente: boolean;
  esSecretario: boolean;
  nombre?: string;
}

export default function CopasstCms() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("cursos");
  
  // Course management state
  const [cursoDialogOpen, setCursoDialogOpen] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  
  // Lesson management state
  const [leccionDialogOpen, setLeccionDialogOpen] = useState(false);
  const [leccionEditando, setLeccionEditando] = useState<Leccion | null>(null);
  
  // Question bank state
  const [preguntaDialogOpen, setPreguntaDialogOpen] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState<BancoPregunta | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState("all");
  const [filtroDificultad, setFiltroDificultad] = useState("all");
  
  // Banco de preguntas inteligente state
  const [mostrarBancoInteligente, setMostrarBancoInteligente] = useState(true);
  const [busquedaBanco, setBusquedaBanco] = useState("");
  
  // Banco de cursos inteligente state
  const [mostrarBancoCursos, setMostrarBancoCursos] = useState(true);
  const [busquedaBancoCursos, setBusquedaBancoCursos] = useState("");
  
  // Banco de categorías inteligente state
  const [mostrarBancoCategorias, setMostrarBancoCategorias] = useState(true);
  const [busquedaBancoCategorias, setBusquedaBancoCategorias] = useState("");
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  
  // Category management state
  const [categoriaDialogOpen, setCategoriaDialogOpen] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);

  // Form state
  const [cursoForm, setCursoForm] = useState({
    codigo: "",
    titulo: "",
    descripcion: "",
    duracionMinutos: 15,
    ordenCurso: 1,
    esObligatorio: true,
    puntosCompletar: 100,
    activo: true,
    tipoAudiencia: "solo_copasst" as "todos" | "solo_copasst" | "seleccion_manual",
    miembrosAsignados: [] as string[],
  });

  const [leccionForm, setLeccionForm] = useState({
    titulo: "",
    contenidoHtml: "",
    videoUrl: "",
    duracionMinutos: 5,
    ordenLeccion: 1,
    puntosCompletar: 10,
    activo: true,
  });

  const [preguntaForm, setPreguntaForm] = useState({
    enunciadoHtml: "",
    tipoPregunta: "seleccion_multiple",
    opciones: ["", "", "", ""],
    respuestaCorrecta: "0",
    explicacionHtml: "",
    dificultad: "media",
    etiquetas: "",
    puntos: 10,
    activo: true,
    categoriaId: "",
  });

  const [categoriaForm, setCategoriaForm] = useState({
    nombre: "",
    descripcion: "",
    orden: 1,
    activo: true,
  });

  // Queries
  const { data: cursos = [], isLoading: cursosLoading } = useQuery<Curso[]>({
    queryKey: ["/api/copasst-capacitacion/cursos"],
  });

  const leccionesUrl = cursoSeleccionado ? `/api/copasst-capacitacion/cursos/${cursoSeleccionado.id}/lecciones` : "";
  const { data: lecciones = [], isLoading: leccionesLoading } = useQuery<Leccion[]>({
    queryKey: [leccionesUrl],
    enabled: !!cursoSeleccionado,
  });

  const preguntasParams = new URLSearchParams();
  if (filtroCategoria && filtroCategoria !== "all") preguntasParams.set("categoriaId", filtroCategoria);
  if (filtroDificultad && filtroDificultad !== "all") preguntasParams.set("dificultad", filtroDificultad);
  const preguntasUrl = `/api/copasst-capacitacion/banco-preguntas${preguntasParams.toString() ? `?${preguntasParams.toString()}` : ""}`;
  const { data: preguntas = [], isLoading: preguntasLoading } = useQuery<BancoPregunta[]>({
    queryKey: [preguntasUrl],
  });

  const { data: categorias = [], isLoading: categoriasLoading } = useQuery<Categoria[]>({
    queryKey: ["/api/copasst-capacitacion/categorias"],
  });

  // Query para obtener períodos del COPASST
  const { data: periodos = [] } = useQuery<CopasstPeriodo[]>({
    queryKey: ["/api/copasst-periodos"],
  });

  // Obtener el período activo
  const periodoActivo = periodos.find(p => p.activo);

  // Query para obtener miembros del COPASST del período activo
  const { data: miembrosCopasst = [] } = useQuery<CopasstMiembro[]>({
    queryKey: ["/api/copasst-miembros", periodoActivo?.id],
    enabled: !!periodoActivo?.id,
  });

  // Course mutations
  const crearCursoMutation = useMutation({
    mutationFn: async (data: typeof cursoForm) => {
      return apiRequest("POST", "/api/copasst-capacitacion/cursos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/cursos"] });
      toast({ title: "Curso creado exitosamente" });
      setCursoDialogOpen(false);
      resetCursoForm();
    },
    onError: (error: any) => {
      const mensaje = error?.message || "Error desconocido";
      toast({ title: "Error al crear el curso", description: mensaje, variant: "destructive" });
    },
  });

  const actualizarCursoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof cursoForm> }) => {
      return apiRequest("PATCH", `/api/copasst-capacitacion/cursos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/cursos"] });
      toast({ title: "Curso actualizado exitosamente" });
      setCursoDialogOpen(false);
      setCursoEditando(null);
      resetCursoForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar el curso", variant: "destructive" });
    },
  });

  const eliminarCursoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-capacitacion/cursos/${id}`);
    },
    onSuccess: (_, deletedCursoId) => {
      // Invalidar todas las queries relacionadas para asegurar actualización inmediata
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/cursos"] });
      // Invalidar las lecciones del curso eliminado (queryKey dinámico)
      queryClient.invalidateQueries({ 
        queryKey: [`/api/copasst-capacitacion/cursos/${deletedCursoId}/lecciones`] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/mi-progreso"] });
      // Limpiar selección si se eliminó el curso seleccionado
      setCursoSeleccionado(null);
      toast({ title: "Curso eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar el curso", variant: "destructive" });
    },
  });

  // Lesson mutations
  const crearLeccionMutation = useMutation({
    mutationFn: async (data: typeof leccionForm & { cursoId: string }) => {
      return apiRequest("POST", "/api/copasst-capacitacion/lecciones", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [leccionesUrl] });
      toast({ title: "Lección creada exitosamente" });
      setLeccionDialogOpen(false);
      resetLeccionForm();
    },
    onError: () => {
      toast({ title: "Error al crear la lección", variant: "destructive" });
    },
  });

  const actualizarLeccionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof leccionForm> }) => {
      return apiRequest("PATCH", `/api/copasst-capacitacion/lecciones/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [leccionesUrl] });
      toast({ title: "Lección actualizada" });
      setLeccionDialogOpen(false);
      setLeccionEditando(null);
      resetLeccionForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar la lección", variant: "destructive" });
    },
  });

  // Question bank mutations
  const crearPreguntaMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("POST", "/api/copasst-capacitacion/banco-preguntas", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/banco-preguntas"] });
      toast({ title: "Pregunta creada exitosamente" });
      setPreguntaDialogOpen(false);
      resetPreguntaForm();
    },
    onError: () => {
      toast({ title: "Error al crear la pregunta", variant: "destructive" });
    },
  });

  const actualizarPreguntaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest("PATCH", `/api/copasst-capacitacion/banco-preguntas/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/banco-preguntas"] });
      toast({ title: "Pregunta actualizada" });
      setPreguntaDialogOpen(false);
      setPreguntaEditando(null);
      resetPreguntaForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar la pregunta", variant: "destructive" });
    },
  });

  const eliminarPreguntaMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-capacitacion/banco-preguntas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/banco-preguntas"] });
      toast({ title: "Pregunta eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar la pregunta", variant: "destructive" });
    },
  });

  // Category mutations
  const crearCategoriaMutation = useMutation({
    mutationFn: async (data: typeof categoriaForm) => {
      return apiRequest("POST", "/api/copasst-capacitacion/categorias", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/categorias"] });
      toast({ title: "Categoría creada exitosamente" });
      setCategoriaDialogOpen(false);
      resetCategoriaForm();
    },
    onError: () => {
      toast({ title: "Error al crear la categoría", variant: "destructive" });
    },
  });

  const actualizarCategoriaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof categoriaForm> }) => {
      return apiRequest("PATCH", `/api/copasst-capacitacion/categorias/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/categorias"] });
      toast({ title: "Categoría actualizada" });
      setCategoriaDialogOpen(false);
      setCategoriaEditando(null);
      resetCategoriaForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar la categoría", variant: "destructive" });
    },
  });

  const eliminarCategoriaMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-capacitacion/categorias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/categorias"] });
      toast({ title: "Categoría eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar la categoría", variant: "destructive" });
    },
  });

  // Función para generar código único de curso
  const generarCodigoUnico = (prefijo: string = "CUR") => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefijo}-${timestamp.slice(-4)}${random}`;
  };

  // Form reset functions
  const resetCursoForm = () => {
    const nuevoOrden = cursos.length + 1;
    setCursoForm({
      codigo: generarCodigoUnico("CUR"),
      titulo: "",
      descripcion: "",
      duracionMinutos: 15,
      ordenCurso: nuevoOrden,
      esObligatorio: true,
      puntosCompletar: 100,
      activo: true,
      tipoAudiencia: "solo_copasst",
      miembrosAsignados: [],
    });
  };

  const resetLeccionForm = () => {
    setLeccionForm({
      titulo: "",
      contenidoHtml: "",
      videoUrl: "",
      duracionMinutos: 5,
      ordenLeccion: 1,
      puntosCompletar: 10,
      activo: true,
    });
  };

  const resetPreguntaForm = () => {
    setPreguntaForm({
      enunciadoHtml: "",
      tipoPregunta: "seleccion_multiple",
      opciones: ["", "", "", ""],
      respuestaCorrecta: "0",
      explicacionHtml: "",
      dificultad: "media",
      etiquetas: "",
      puntos: 10,
      activo: true,
      categoriaId: "",
    });
  };

  const resetCategoriaForm = () => {
    setCategoriaForm({
      nombre: "",
      descripcion: "",
      orden: 1,
      activo: true,
    });
  };

  // Edit handlers
  const handleEditCurso = (curso: Curso) => {
    setCursoEditando(curso);
    setCursoForm({
      codigo: curso.codigo,
      titulo: curso.titulo,
      descripcion: curso.descripcion || "",
      duracionMinutos: curso.duracionMinutos,
      ordenCurso: curso.ordenCurso,
      esObligatorio: curso.esObligatorio,
      puntosCompletar: curso.puntosCompletar,
      activo: curso.activo,
      tipoAudiencia: (curso as any).tipoAudiencia || "solo_copasst",
      miembrosAsignados: (curso as any).miembrosAsignados || [],
    });
    setCursoDialogOpen(true);
  };

  const handleEditLeccion = (leccion: Leccion) => {
    setLeccionEditando(leccion);
    setLeccionForm({
      titulo: leccion.titulo,
      contenidoHtml: leccion.contenidoHtml,
      videoUrl: leccion.videoUrl || "",
      duracionMinutos: leccion.duracionMinutos,
      ordenLeccion: leccion.ordenLeccion,
      puntosCompletar: leccion.puntosCompletar,
      activo: leccion.activo,
    });
    setLeccionDialogOpen(true);
  };

  const handleEditPregunta = (pregunta: BancoPregunta) => {
    setPreguntaEditando(pregunta);
    setPreguntaForm({
      enunciadoHtml: pregunta.enunciadoHtml,
      tipoPregunta: pregunta.tipoPregunta,
      opciones: pregunta.opciones || ["", "", "", ""],
      respuestaCorrecta: pregunta.respuestaCorrecta,
      explicacionHtml: pregunta.explicacionHtml || "",
      dificultad: pregunta.dificultad,
      etiquetas: (pregunta.etiquetas || []).join(", "),
      puntos: pregunta.puntos,
      activo: pregunta.activo,
      categoriaId: pregunta.categoriaId || "",
    });
    setPreguntaDialogOpen(true);
  };

  const handleEditCategoria = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setCategoriaForm({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || "",
      orden: categoria.orden,
      activo: categoria.activo,
    });
    setCategoriaDialogOpen(true);
  };

  // Exportar banco de preguntas a Excel (SST-2026-0019)
  const handleExportarPreguntas = () => {
    try {
      const data = (preguntas || []).map((p) => ({
        Enunciado: p.enunciadoHtml.replace(/<[^>]*>/g, ''),
        Tipo: p.tipoPregunta,
        Opciones: (p.opciones || []).join(" | "),
        RespuestaCorrecta: p.respuestaCorrecta,
        Explicacion: (p.explicacionHtml || '').replace(/<[^>]*>/g, ''),
        Dificultad: p.dificultad,
        Etiquetas: (p.etiquetas || []).join(", "),
        Puntos: p.puntos,
        Activo: p.activo ? "Sí" : "No",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Preguntas");
      XLSX.writeFile(wb, `banco_preguntas_${new Date().toISOString().split("T")[0]}.xlsx`);
      toast({ title: "Exportación exitosa", description: `${data.length} preguntas exportadas` });
    } catch (error) {
      toast({ title: "Error al exportar", variant: "destructive" });
    }
  };

  // Descargar plantilla de ejemplo para importar preguntas (SST-2026-0007/0008)
  const handleDescargarPlantillaPreguntas = () => {
    try {
      const ejemplos = [
        {
          Enunciado: "¿Cuál es la función principal del COPASST?",
          Tipo: "seleccion_multiple",
          Opciones: "Vigilar condiciones de trabajo | Administrar nómina | Gestionar vacaciones | Aprobar contratos",
          RespuestaCorrecta: "0",
          Explicacion: "El COPASST vigila las condiciones de trabajo y promueve la salud ocupacional.",
          Dificultad: "media",
          Etiquetas: "COPASST, funciones",
          Puntos: "10",
          Activo: "Sí"
        },
        {
          Enunciado: "¿Cada cuánto tiempo se deben realizar reuniones del COPASST?",
          Tipo: "seleccion_multiple",
          Opciones: "Mensualmente | Semanalmente | Anualmente | Trimestralmente",
          RespuestaCorrecta: "0",
          Explicacion: "Las reuniones del COPASST deben realizarse al menos una vez al mes.",
          Dificultad: "facil",
          Etiquetas: "COPASST, reuniones",
          Puntos: "5",
          Activo: "Sí"
        }
      ];
      const ws = XLSX.utils.json_to_sheet(ejemplos);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Plantilla");
      XLSX.writeFile(wb, "plantilla_banco_preguntas.xlsx");
      toast({ title: "Plantilla descargada", description: "Usa esta plantilla como guía para importar preguntas" });
    } catch (error) {
      toast({ title: "Error al descargar plantilla", variant: "destructive" });
    }
  };

  // Importar banco de preguntas desde Excel (SST-2026-0019)
  const handleImportarPreguntas = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        let imported = 0;
        for (const row of jsonData as any[]) {
          const preguntaData = {
            enunciadoHtml: row.Enunciado || "",
            tipoPregunta: row.Tipo || "seleccion_multiple",
            opciones: (row.Opciones || "").split(" | ").filter((o: string) => o.trim()),
            respuestaCorrecta: String(row.RespuestaCorrecta || "0"),
            explicacionHtml: row.Explicacion || "",
            dificultad: row.Dificultad || "media",
            etiquetas: (row.Etiquetas || "").split(",").map((t: string) => t.trim()).filter((t: string) => t),
            puntos: Number(row.Puntos) || 10,
            activo: row.Activo !== "No",
          };
          await apiRequest("POST", "/api/copasst-capacitacion/banco-preguntas", preguntaData);
          imported++;
        }
        queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/banco-preguntas"] });
        toast({ title: "Importación exitosa", description: `${imported} preguntas importadas` });
      } catch (error) {
        toast({ title: "Error al importar", variant: "destructive" });
      }
    };
    input.click();
  };

  // Submit handlers
  const handleSubmitCurso = () => {
    if (cursoEditando) {
      actualizarCursoMutation.mutate({ id: cursoEditando.id, data: cursoForm });
    } else {
      crearCursoMutation.mutate(cursoForm);
    }
  };

  const handleSubmitLeccion = () => {
    if (!cursoSeleccionado) return;
    if (leccionEditando) {
      actualizarLeccionMutation.mutate({ id: leccionEditando.id, data: leccionForm });
    } else {
      crearLeccionMutation.mutate({ ...leccionForm, cursoId: cursoSeleccionado.id });
    }
  };

  const handleSubmitPregunta = () => {
    const data = {
      ...preguntaForm,
      opciones: preguntaForm.opciones.filter(o => o.trim() !== ""),
      etiquetas: preguntaForm.etiquetas.split(",").map(e => e.trim()).filter(e => e),
      categoriaId: preguntaForm.categoriaId && preguntaForm.categoriaId !== "none" ? preguntaForm.categoriaId : null,
    };
    if (preguntaEditando) {
      actualizarPreguntaMutation.mutate({ id: preguntaEditando.id, data });
    } else {
      crearPreguntaMutation.mutate(data);
    }
  };

  const handleSubmitCategoria = () => {
    if (categoriaEditando) {
      actualizarCategoriaMutation.mutate({ id: categoriaEditando.id, data: categoriaForm });
    } else {
      crearCategoriaMutation.mutate(categoriaForm);
    }
  };

  // Banco de cursos predefinidos sobre COPASST/SST
  const bancoCursosPredefinidos = [
    {
      codigo: "COPASST-001",
      titulo: "Fundamentos del COPASST",
      descripcion: "Curso introductorio sobre el Comité Paritario de Seguridad y Salud en el Trabajo. Incluye definición, marco legal, conformación y funciones básicas según la normativa colombiana.",
      duracionMinutos: 45,
      puntosCompletar: 100,
      esObligatorio: true,
      categoria: "Fundamentos"
    },
    {
      codigo: "COPASST-002",
      titulo: "Marco Legal del COPASST en Colombia",
      descripcion: "Análisis detallado de la Resolución 2013/1986, Decreto 1072/2015, Resolución 0312/2019 y demás normativas que regulan el funcionamiento del COPASST.",
      duracionMinutos: 60,
      puntosCompletar: 150,
      esObligatorio: true,
      categoria: "Normativa Legal"
    },
    {
      codigo: "COPASST-003",
      titulo: "Funciones y Responsabilidades del COPASST",
      descripcion: "Curso sobre las funciones específicas del COPASST: vigilancia, promoción, investigación de accidentes, inspecciones de seguridad y propuestas de mejora.",
      duracionMinutos: 50,
      puntosCompletar: 120,
      esObligatorio: true,
      categoria: "Funciones"
    },
    {
      codigo: "COPASST-004",
      titulo: "Conformación y Elección del COPASST",
      descripcion: "Proceso electoral del COPASST: convocatoria, inscripción de candidatos, votación, escrutinio, constitución y posesión de miembros.",
      duracionMinutos: 40,
      puntosCompletar: 100,
      esObligatorio: true,
      categoria: "Conformación"
    },
    {
      codigo: "COPASST-005",
      titulo: "Reuniones y Actas del COPASST",
      descripcion: "Cómo organizar y dirigir las reuniones mensuales del COPASST. Elaboración de actas, seguimiento de compromisos y documentación requerida.",
      duracionMinutos: 35,
      puntosCompletar: 80,
      esObligatorio: true,
      categoria: "Funcionamiento"
    },
    {
      codigo: "COPASST-006",
      titulo: "Investigación de Accidentes de Trabajo",
      descripcion: "Metodología para la investigación de accidentes e incidentes laborales. Árbol de causas, análisis de causalidad y formulación de medidas correctivas.",
      duracionMinutos: 55,
      puntosCompletar: 130,
      esObligatorio: true,
      categoria: "Investigación"
    },
    {
      codigo: "COPASST-007",
      titulo: "Inspecciones de Seguridad",
      descripcion: "Técnicas para realizar inspecciones de seguridad en el lugar de trabajo. Identificación de condiciones inseguras y actos inseguros.",
      duracionMinutos: 45,
      puntosCompletar: 110,
      esObligatorio: true,
      categoria: "Inspecciones"
    },
    {
      codigo: "COPASST-008",
      titulo: "Identificación de Peligros y Valoración de Riesgos",
      descripcion: "Metodología IPEVR: identificación de peligros, evaluación de riesgos laborales, determinación de controles y priorización de intervenciones.",
      duracionMinutos: 60,
      puntosCompletar: 150,
      esObligatorio: true,
      categoria: "Gestión de Riesgos"
    },
    {
      codigo: "COPASST-009",
      titulo: "Elementos de Protección Personal (EPP)",
      descripcion: "Selección, uso correcto y mantenimiento de los elementos de protección personal. Normativa aplicable y responsabilidades del COPASST.",
      duracionMinutos: 40,
      puntosCompletar: 100,
      esObligatorio: true,
      categoria: "Protección"
    },
    {
      codigo: "COPASST-010",
      titulo: "Plan de Emergencias y Evacuación",
      descripcion: "Rol del COPASST en la revisión y actualización del plan de emergencias. Brigadas de emergencia, rutas de evacuación y simulacros.",
      duracionMinutos: 50,
      puntosCompletar: 120,
      esObligatorio: false,
      categoria: "Emergencias"
    },
    {
      codigo: "COPASST-011",
      titulo: "Promoción de la Salud en el Trabajo",
      descripcion: "Actividades de promoción y prevención en salud. Estilos de vida saludables, pausas activas y programas de bienestar laboral.",
      duracionMinutos: 35,
      puntosCompletar: 80,
      esObligatorio: false,
      categoria: "Promoción"
    },
    {
      codigo: "COPASST-012",
      titulo: "Vigía de Seguridad y Salud en el Trabajo",
      descripcion: "Funciones y responsabilidades del Vigía SST en empresas con menos de 10 trabajadores. Diferencias y similitudes con el COPASST.",
      duracionMinutos: 30,
      puntosCompletar: 70,
      esObligatorio: false,
      categoria: "Fundamentos"
    }
  ];

  // Función para seleccionar un curso del banco
  const seleccionarCursoBanco = (curso: typeof bancoCursosPredefinidos[0]) => {
    const ordenSiguiente = cursos.length + 1;
    // Generar código único basado en el prefijo del código original
    const prefijo = curso.codigo.split("-")[0] || "CUR";
    const codigoUnico = generarCodigoUnico(prefijo);
    setCursoForm({
      codigo: codigoUnico,
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      duracionMinutos: curso.duracionMinutos,
      ordenCurso: ordenSiguiente,
      esObligatorio: curso.esObligatorio,
      puntosCompletar: curso.puntosCompletar,
      activo: true,
      tipoAudiencia: "solo_copasst",
      miembrosAsignados: [],
    });
    setMostrarBancoCursos(false);
    toast({
      title: "Curso seleccionado",
      description: `Código único generado: ${codigoUnico}. Los campos han sido completados automáticamente.`,
    });
  };

  // Filtrar cursos del banco
  const cursosFiltrados = bancoCursosPredefinidos.filter(c =>
    c.titulo.toLowerCase().includes(busquedaBancoCursos.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busquedaBancoCursos.toLowerCase()) ||
    c.categoria.toLowerCase().includes(busquedaBancoCursos.toLowerCase()) ||
    c.codigo.toLowerCase().includes(busquedaBancoCursos.toLowerCase())
  );

  // Banco de categorías predefinidas sobre COPASST/SST
  const bancoCategoriasPredefinidas = [
    {
      nombre: "Fundamentos COPASST",
      descripcion: "Conceptos básicos sobre el Comité Paritario de Seguridad y Salud en el Trabajo, su definición, importancia y rol en la empresa.",
      icono: "book"
    },
    {
      nombre: "Marco Legal",
      descripcion: "Normativa colombiana aplicable: Resolución 2013/1986, Decreto 1072/2015, Resolución 0312/2019 y demás regulaciones.",
      icono: "scale"
    },
    {
      nombre: "Conformación COPASST",
      descripcion: "Proceso de conformación del comité: elección de representantes, requisitos, período y posesión de miembros.",
      icono: "users"
    },
    {
      nombre: "Funciones y Responsabilidades",
      descripcion: "Funciones específicas del COPASST: vigilancia, promoción, investigación, inspecciones y propuestas de mejora.",
      icono: "clipboard"
    },
    {
      nombre: "Reuniones y Actas",
      descripcion: "Organización de reuniones mensuales, elaboración de actas, seguimiento de compromisos y documentación.",
      icono: "calendar"
    },
    {
      nombre: "Investigación de Accidentes",
      descripcion: "Metodología para investigar accidentes e incidentes laborales, análisis de causas y medidas correctivas.",
      icono: "search"
    },
    {
      nombre: "Inspecciones de Seguridad",
      descripcion: "Técnicas para realizar inspecciones en el lugar de trabajo, identificación de condiciones y actos inseguros.",
      icono: "eye"
    },
    {
      nombre: "Gestión de Riesgos",
      descripcion: "Identificación de peligros, evaluación de riesgos laborales (IPEVR), determinación de controles y priorización.",
      icono: "alert"
    },
    {
      nombre: "Elementos de Protección Personal",
      descripcion: "Selección, uso y mantenimiento de EPP. Normativa aplicable y responsabilidades del COPASST.",
      icono: "shield"
    },
    {
      nombre: "Plan de Emergencias",
      descripcion: "Rol del COPASST en emergencias: brigadas, rutas de evacuación, simulacros y coordinación con entidades.",
      icono: "siren"
    },
    {
      nombre: "Promoción de la Salud",
      descripcion: "Actividades de promoción y prevención: estilos de vida saludables, pausas activas y bienestar laboral.",
      icono: "heart"
    },
    {
      nombre: "Vigía SST",
      descripcion: "Funciones del Vigía de Seguridad y Salud en el Trabajo para empresas con menos de 10 trabajadores.",
      icono: "user"
    }
  ];

  // Función para seleccionar una categoría del banco
  const seleccionarCategoriaBanco = (cat: typeof bancoCategoriasPredefinidas[0]) => {
    const ordenSiguiente = categorias.length + 1;
    setCategoriaForm({
      nombre: cat.nombre,
      descripcion: cat.descripcion,
      orden: ordenSiguiente,
      activo: true,
    });
    setMostrarBancoCategorias(false);
    toast({
      title: "Categoría seleccionada",
      description: "Los campos del formulario han sido completados automáticamente.",
    });
  };

  // Filtrar categorías del banco
  const categoriasFiltradas = bancoCategoriasPredefinidas.filter(c =>
    c.nombre.toLowerCase().includes(busquedaBancoCategorias.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(busquedaBancoCategorias.toLowerCase())
  );

  // Banco de preguntas predefinidas sobre COPASST/SST
  const bancoPreguntasPredefinidas = [
    {
      enunciado: "¿Cuál es la función principal del COPASST?",
      tipo: "seleccion_multiple",
      opciones: [
        "Promover y vigilar las normas de seguridad y salud en el trabajo",
        "Administrar los recursos financieros de la empresa",
        "Contratar nuevo personal",
        "Gestionar las ventas de la empresa"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST es el organismo de promoción y vigilancia de las normas y reglamentos de SST dentro de la empresa.",
      dificultad: "facil",
      etiquetas: "COPASST, funciones, SST",
      categoria: "Fundamentos COPASST"
    },
    {
      enunciado: "¿Cuántos representantes debe tener el COPASST por cada parte (empleador y trabajadores)?",
      tipo: "seleccion_multiple",
      opciones: [
        "Igual número de representantes por cada parte",
        "Más representantes del empleador",
        "Más representantes de los trabajadores",
        "Solo un representante por parte"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST debe estar conformado por igual número de representantes del empleador y de los trabajadores, con sus respectivos suplentes.",
      dificultad: "facil",
      etiquetas: "COPASST, conformación, representantes",
      categoria: "Conformación COPASST"
    },
    {
      enunciado: "¿Con qué frecuencia mínima debe reunirse el COPASST?",
      tipo: "seleccion_multiple",
      opciones: [
        "Una vez al mes",
        "Una vez a la semana",
        "Una vez al año",
        "Cada tres meses"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST debe reunirse por lo menos una vez al mes en la empresa y en horas de trabajo.",
      dificultad: "facil",
      etiquetas: "COPASST, reuniones, periodicidad",
      categoria: "Funcionamiento COPASST"
    },
    {
      enunciado: "¿Cuál es el período de vigencia del COPASST?",
      tipo: "seleccion_multiple",
      opciones: [
        "2 años",
        "1 año",
        "4 años",
        "6 meses"
      ],
      respuestaCorrecta: "0",
      explicacion: "El período de los miembros del COPASST es de dos años, y pueden ser reelegidos.",
      dificultad: "media",
      etiquetas: "COPASST, período, vigencia",
      categoria: "Conformación COPASST"
    },
    {
      enunciado: "¿Qué norma reglamenta la conformación y funcionamiento del COPASST en Colombia?",
      tipo: "seleccion_multiple",
      opciones: [
        "Resolución 2013 de 1986",
        "Ley 100 de 1993",
        "Decreto 614 de 1984",
        "Resolución 1016 de 1989"
      ],
      respuestaCorrecta: "0",
      explicacion: "La Resolución 2013 de 1986 reglamenta la organización y funcionamiento de los Comités de Medicina, Higiene y Seguridad Industrial (hoy COPASST).",
      dificultad: "media",
      etiquetas: "COPASST, normativa, resolución",
      categoria: "Normativa Legal"
    },
    {
      enunciado: "¿Cuántas horas semanales de capacitación debe recibir el COPASST según la Resolución 0312/2019?",
      tipo: "seleccion_multiple",
      opciones: [
        "50 horas anuales de capacitación",
        "20 horas anuales de capacitación",
        "100 horas anuales de capacitación",
        "No requiere capacitación obligatoria"
      ],
      respuestaCorrecta: "0",
      explicacion: "La Resolución 0312 de 2019 establece que los integrantes del COPASST deben recibir capacitación de 50 horas en SST.",
      dificultad: "media",
      etiquetas: "COPASST, capacitación, Resolución 0312",
      categoria: "Capacitación"
    },
    {
      enunciado: "¿Qué documento debe elaborar el COPASST después de cada reunión?",
      tipo: "seleccion_multiple",
      opciones: [
        "Acta de reunión",
        "Informe financiero",
        "Contrato laboral",
        "Factura de servicios"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST debe elaborar actas de cada reunión donde se registren los temas tratados, compromisos y responsables.",
      dificultad: "facil",
      etiquetas: "COPASST, actas, documentación",
      categoria: "Funcionamiento COPASST"
    },
    {
      enunciado: "¿Quién preside las reuniones del COPASST?",
      tipo: "seleccion_multiple",
      opciones: [
        "El presidente elegido por el comité",
        "Siempre el gerente de la empresa",
        "El representante de la ARL",
        "El inspector de trabajo"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST debe elegir un presidente de entre sus miembros, quien preside las reuniones.",
      dificultad: "facil",
      etiquetas: "COPASST, presidente, reuniones",
      categoria: "Funcionamiento COPASST"
    },
    {
      enunciado: "¿Qué es el Vigía de SST?",
      tipo: "seleccion_multiple",
      opciones: [
        "Un trabajador que hace las veces de COPASST en empresas de menos de 10 trabajadores",
        "El gerente de seguridad de la empresa",
        "El médico ocupacional",
        "El representante legal de la empresa"
      ],
      respuestaCorrecta: "0",
      explicacion: "En empresas con menos de 10 trabajadores, el empleador designa un Vigía de SST que cumple las funciones del COPASST.",
      dificultad: "media",
      etiquetas: "Vigía SST, COPASST, empresas pequeñas",
      categoria: "Fundamentos COPASST"
    },
    {
      enunciado: "¿Cuál es una de las funciones del COPASST respecto a los accidentes de trabajo?",
      tipo: "seleccion_multiple",
      opciones: [
        "Participar en la investigación de accidentes de trabajo",
        "Pagar las incapacidades de los trabajadores",
        "Contratar a los trabajadores accidentados",
        "Despedir a los trabajadores que causen accidentes"
      ],
      respuestaCorrecta: "0",
      explicacion: "El COPASST debe participar en la investigación y análisis de los accidentes de trabajo para proponer medidas correctivas.",
      dificultad: "facil",
      etiquetas: "COPASST, accidentes, investigación",
      categoria: "Funciones COPASST"
    },
    {
      enunciado: "¿Qué debe hacer el COPASST ante un riesgo inminente?",
      tipo: "seleccion_multiple",
      opciones: [
        "Solicitar medidas inmediatas para controlar el riesgo",
        "Ignorar el riesgo hasta la próxima reunión",
        "Esperar instrucciones de la ARL",
        "Permitir que los trabajadores continúen expuestos"
      ],
      respuestaCorrecta: "0",
      explicacion: "Ante un riesgo inminente, el COPASST debe actuar de inmediato solicitando medidas de control para proteger a los trabajadores.",
      dificultad: "media",
      etiquetas: "COPASST, riesgo inminente, control",
      categoria: "Funciones COPASST"
    },
    {
      enunciado: "¿El empleador puede despedir a un miembro del COPASST durante su período?",
      tipo: "verdadero_falso",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: "1",
      explicacion: "Los miembros del COPASST gozan de fuero que los protege contra despidos sin justa causa durante su período y hasta 6 meses después.",
      dificultad: "media",
      etiquetas: "COPASST, fuero, protección laboral",
      categoria: "Protección Laboral"
    },
    {
      enunciado: "¿Qué es la matriz de identificación de peligros y valoración de riesgos (IPEVR)?",
      tipo: "seleccion_multiple",
      opciones: [
        "Una herramienta para identificar, evaluar y controlar los riesgos laborales",
        "Un documento contable de la empresa",
        "Un formulario de inscripción de empleados",
        "Un registro de asistencia laboral"
      ],
      respuestaCorrecta: "0",
      explicacion: "La matriz IPEVR es una herramienta fundamental del SG-SST para identificar peligros, evaluar riesgos y definir controles.",
      dificultad: "media",
      etiquetas: "IPEVR, matriz de riesgos, SG-SST",
      categoria: "Gestión de Riesgos"
    },
    {
      enunciado: "¿El COPASST debe revisar el Plan de Emergencias de la empresa?",
      tipo: "verdadero_falso",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: "0",
      explicacion: "Sí, el COPASST debe participar en la revisión y actualización del Plan de Emergencias como parte de sus funciones de vigilancia.",
      dificultad: "facil",
      etiquetas: "COPASST, plan de emergencias, funciones",
      categoria: "Funciones COPASST"
    },
    {
      enunciado: "¿Qué significa el acrónimo SST?",
      tipo: "seleccion_multiple",
      opciones: [
        "Seguridad y Salud en el Trabajo",
        "Sistema de Servicios Temporales",
        "Supervisión de Servicios Técnicos",
        "Seguridad Social Total"
      ],
      respuestaCorrecta: "0",
      explicacion: "SST significa Seguridad y Salud en el Trabajo, antes conocida como Salud Ocupacional.",
      dificultad: "facil",
      etiquetas: "SST, definición, terminología",
      categoria: "Fundamentos SST"
    },
    {
      enunciado: "¿Cuál es el decreto único reglamentario del sector trabajo en Colombia?",
      tipo: "seleccion_multiple",
      opciones: [
        "Decreto 1072 de 2015",
        "Decreto 614 de 1984",
        "Decreto 1295 de 1994",
        "Decreto 1443 de 2014"
      ],
      respuestaCorrecta: "0",
      explicacion: "El Decreto 1072 de 2015 es el Decreto Único Reglamentario del Sector Trabajo que compila toda la normatividad laboral.",
      dificultad: "dificil",
      etiquetas: "Decreto 1072, normativa, legislación",
      categoria: "Normativa Legal"
    },
    {
      enunciado: "¿Qué es un EPP en el contexto de SST?",
      tipo: "seleccion_multiple",
      opciones: [
        "Elemento de Protección Personal",
        "Evaluación de Procesos Productivos",
        "Estándar de Práctica Profesional",
        "Empresa de Prestación de Servicios"
      ],
      respuestaCorrecta: "0",
      explicacion: "EPP significa Elemento de Protección Personal, son dispositivos destinados a proteger al trabajador de riesgos laborales.",
      dificultad: "facil",
      etiquetas: "EPP, protección, seguridad",
      categoria: "Elementos de Protección"
    },
    {
      enunciado: "¿El COPASST puede proponer actividades de capacitación en SST?",
      tipo: "verdadero_falso",
      opciones: ["Verdadero", "Falso"],
      respuestaCorrecta: "0",
      explicacion: "Sí, una de las funciones del COPASST es proponer y participar en actividades de capacitación en SST.",
      dificultad: "facil",
      etiquetas: "COPASST, capacitación, funciones",
      categoria: "Funciones COPASST"
    },
    {
      enunciado: "¿Qué es un incidente de trabajo?",
      tipo: "seleccion_multiple",
      opciones: [
        "Un suceso que pudo causar lesiones pero no las causó",
        "Un accidente con incapacidad permanente",
        "Una enfermedad laboral diagnosticada",
        "Un despido injustificado"
      ],
      respuestaCorrecta: "0",
      explicacion: "Un incidente es un suceso que tuvo el potencial de causar lesiones o daños pero que no los produjo.",
      dificultad: "media",
      etiquetas: "incidente, accidente, SST",
      categoria: "Gestión de Incidentes"
    },
    {
      enunciado: "¿Cuál es la diferencia entre peligro y riesgo?",
      tipo: "seleccion_multiple",
      opciones: [
        "Peligro es la fuente potencial de daño, riesgo es la probabilidad de que ocurra",
        "Son términos que significan lo mismo",
        "Riesgo es la fuente de daño, peligro es la probabilidad",
        "Ninguna de las anteriores"
      ],
      respuestaCorrecta: "0",
      explicacion: "El peligro es una fuente o situación con potencial de daño; el riesgo es la combinación de la probabilidad de que ocurra y sus consecuencias.",
      dificultad: "media",
      etiquetas: "peligro, riesgo, definiciones",
      categoria: "Gestión de Riesgos"
    }
  ];

  // Función para seleccionar una pregunta del banco
  const seleccionarPreguntaBanco = (pregunta: typeof bancoPreguntasPredefinidas[0]) => {
    setPreguntaForm({
      enunciadoHtml: pregunta.enunciado,
      tipoPregunta: pregunta.tipo,
      opciones: pregunta.tipo === "verdadero_falso" 
        ? ["Verdadero", "Falso", "", ""] 
        : [...pregunta.opciones, ...Array(4 - pregunta.opciones.length).fill("")],
      respuestaCorrecta: pregunta.respuestaCorrecta,
      explicacionHtml: pregunta.explicacion,
      dificultad: pregunta.dificultad,
      etiquetas: pregunta.etiquetas,
      puntos: pregunta.dificultad === "facil" ? 10 : pregunta.dificultad === "media" ? 15 : 20,
      activo: true,
      categoriaId: "",
    });
    setMostrarBancoInteligente(false);
    toast({
      title: "Pregunta seleccionada",
      description: "Los campos del formulario han sido completados automáticamente.",
    });
  };

  // Filtrar preguntas del banco
  const preguntasFiltradas = bancoPreguntasPredefinidas.filter(p =>
    p.enunciado.toLowerCase().includes(busquedaBanco.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busquedaBanco.toLowerCase()) ||
    p.etiquetas.toLowerCase().includes(busquedaBanco.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Administración de Cursos COPASST</h1>
          <p className="text-muted-foreground">Gestiona cursos, lecciones, banco de preguntas y categorías</p>
        </div>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('1.1.7');
        return estandar ? (
          <AutomationAssistant
            titulo="Capacitación COPASST / Vigía SST"
            estandar={estandar.codigo}
            descripcion="Gestión de contenidos de formación obligatoria para integrantes del COPASST según Resolución 0312/2019"
            normativaAplicable={estandar.normativaAplicable.map(n => ({
              codigo: n.codigo,
              norma: n.norma,
              articulo: n.articulo,
              descripcion: n.descripcion,
              requisitos: n.requisitos,
              obligatorio: n.obligatorio
            }))}
            compact={true}
          />
        ) : null;
      })()}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cursos" data-testid="tab-cursos">
            <BookOpen className="w-4 h-4 mr-2" />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="categorias" data-testid="tab-categorias">
            <FolderOpen className="w-4 h-4 mr-2" />
            Categorías
          </TabsTrigger>
          <TabsTrigger value="preguntas" data-testid="tab-preguntas">
            <FileQuestion className="w-4 h-4 mr-2" />
            Banco de Preguntas
          </TabsTrigger>
        </TabsList>

        {/* Cursos Tab */}
        <TabsContent value="cursos" className="space-y-4">
          {cursoSeleccionado ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => setCursoSeleccionado(null)} data-testid="button-back-cursos">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <CardTitle>Lecciones de: {cursoSeleccionado.titulo}</CardTitle>
                </div>
                <Button onClick={() => { resetLeccionForm(); setLeccionDialogOpen(true); }} data-testid="button-nueva-leccion">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Lección
                </Button>
              </CardHeader>
              <CardContent>
                {leccionesLoading ? (
                  <Skeleton className="h-40" />
                ) : lecciones.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay lecciones. Crea la primera.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Puntos</TableHead>
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lecciones.map((leccion) => (
                        <TableRow key={leccion.id} data-testid={`row-leccion-${leccion.id}`}>
                          <TableCell><GripVertical className="w-4 h-4 text-muted-foreground" /></TableCell>
                          <TableCell>{leccion.ordenLeccion}</TableCell>
                          <TableCell className="font-medium">{leccion.titulo}</TableCell>
                          <TableCell>{leccion.duracionMinutos} min</TableCell>
                          <TableCell>{leccion.puntosCompletar}</TableCell>
                          <TableCell>
                            <Badge variant={leccion.activo ? "default" : "secondary"}>
                              {leccion.activo ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleEditLeccion(leccion)} data-testid={`button-edit-leccion-${leccion.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <CardTitle>Cursos de Capacitación</CardTitle>
                  <div className="flex items-center space-x-2 border rounded-md px-2 py-1">
                    <Checkbox 
                      id="mostrar-inactivos" 
                      checked={mostrarInactivos}
                      onCheckedChange={(checked) => setMostrarInactivos(!!checked)}
                    />
                    <Label htmlFor="mostrar-inactivos" className="text-sm cursor-pointer whitespace-nowrap">
                      Ver inactivos
                    </Label>
                  </div>
                </div>
                <Button onClick={() => { resetCursoForm(); setCursoEditando(null); setCursoDialogOpen(true); }} data-testid="button-nuevo-curso">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Curso
                </Button>
              </CardHeader>
              <CardContent>
                {cursosLoading ? (
                  <Skeleton className="h-40" />
                ) : cursos.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay cursos. Crea el primero.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Duración</TableHead>
                        <TableHead>Orden</TableHead>
                        <TableHead>Obligatorio</TableHead>
                        <TableHead>Activo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cursos
                        .filter(c => mostrarInactivos || c.activo)
                        .map((curso) => (
                        <TableRow 
                          key={curso.id} 
                          data-testid={`row-curso-${curso.id}`}
                          className={!curso.activo ? "opacity-60 bg-muted/30" : ""}
                        >
                          <TableCell className="font-mono">{curso.codigo}</TableCell>
                          <TableCell className="font-medium">{curso.titulo}</TableCell>
                          <TableCell>{curso.duracionMinutos} min</TableCell>
                          <TableCell>{curso.ordenCurso}</TableCell>
                          <TableCell>
                            <Badge variant={curso.esObligatorio ? "default" : "secondary"}>
                              {curso.esObligatorio ? "Sí" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={curso.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {curso.activo ? "Activo" : "No Activo"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => setCursoSeleccionado(curso)} data-testid={`button-ver-lecciones-${curso.id}`}>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditCurso(curso)} data-testid={`button-edit-curso-${curso.id}`}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => eliminarCursoMutation.mutate(curso.id)} data-testid={`button-delete-curso-${curso.id}`}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Banco de Preguntas Tab */}
        <TabsContent value="preguntas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-4">
                <CardTitle>Banco de Preguntas</CardTitle>
                <div className="flex items-center space-x-2 border rounded-md px-2 py-1">
                  <Checkbox 
                    id="mostrar-inactivos-preg" 
                    checked={mostrarInactivos}
                    onCheckedChange={(checked) => setMostrarInactivos(!!checked)}
                  />
                  <Label htmlFor="mostrar-inactivos-preg" className="text-sm cursor-pointer whitespace-nowrap">
                    Ver inactivos
                  </Label>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="w-40" data-testid="select-filtro-categoria">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filtroDificultad} onValueChange={setFiltroDificultad}>
                  <SelectTrigger className="w-32" data-testid="select-filtro-dificultad">
                    <SelectValue placeholder="Dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={handleExportarPreguntas} data-testid="button-exportar-preguntas">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" onClick={handleDescargarPlantillaPreguntas} data-testid="button-plantilla-preguntas">
                  <Download className="w-4 h-4 mr-2" />
                  Plantilla
                </Button>
                <Button variant="outline" onClick={handleImportarPreguntas} data-testid="button-importar-preguntas">
                  <Upload className="w-4 h-4 mr-2" />
                  Importar
                </Button>
                <Button onClick={() => { setPreguntaEditando(null); resetPreguntaForm(); setPreguntaDialogOpen(true); }} data-testid="button-nueva-pregunta">
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Pregunta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {preguntasLoading ? (
                <Skeleton className="h-40" />
              ) : (preguntas || []).filter(p => mostrarInactivos || p.activo).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay preguntas que coincidan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-1/3">Pregunta</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Dificultad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Puntos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(preguntas || [])
                      .filter(p => mostrarInactivos || p.activo)
                      .map((pregunta) => (
                      <TableRow 
                        key={pregunta.id} 
                        data-testid={`row-pregunta-${pregunta.id}`}
                        className={!pregunta.activo ? "opacity-60 bg-muted/30" : ""}
                      >
                        <TableCell className="max-w-xs truncate" dangerouslySetInnerHTML={{ __html: (pregunta.enunciadoHtml || 'Sin texto').substring(0, 100) }} />
                        <TableCell>
                          <Badge variant="outline">{pregunta.tipoPregunta}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pregunta.dificultad === "facil" ? "secondary" : pregunta.dificultad === "dificil" ? "destructive" : "default"}>
                            {pregunta.dificultad}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={pregunta.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {pregunta.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{pregunta.puntos}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditPregunta(pregunta)} data-testid={`button-edit-pregunta-${pregunta.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => eliminarPreguntaMutation.mutate(pregunta.id)} data-testid={`button-delete-pregunta-${pregunta.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categorías Tab */}
        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-4">
                <CardTitle>Categorías</CardTitle>
                <div className="flex items-center space-x-2 border rounded-md px-2 py-1">
                  <Checkbox 
                    id="mostrar-inactivos-cat" 
                    checked={mostrarInactivos}
                    onCheckedChange={(checked) => setMostrarInactivos(!!checked)}
                  />
                  <Label htmlFor="mostrar-inactivos-cat" className="text-sm cursor-pointer whitespace-nowrap">
                    Ver inactivos
                  </Label>
                </div>
              </div>
              <Button onClick={() => { resetCategoriaForm(); setCategoriaDialogOpen(true); }} data-testid="button-nueva-categoria">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </CardHeader>
            <CardContent>
              {categoriasLoading ? (
                <Skeleton className="h-40" />
              ) : (categorias || []).filter(c => mostrarInactivos || c.activo).length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay categorías que coincidan.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(categorias || [])
                      .filter(cat => mostrarInactivos || cat.activo)
                      .map((categoria) => (
                      <TableRow 
                        key={categoria.id} 
                        data-testid={`row-categoria-${categoria.id}`}
                        className={!categoria.activo ? "opacity-60 bg-muted/30" : ""}
                      >
                        <TableCell className="font-medium">{categoria.nombre}</TableCell>
                        <TableCell className="max-w-xs truncate">{categoria.descripcion || "-"}</TableCell>
                        <TableCell>{categoria.orden}</TableCell>
                        <TableCell>
                          <Badge className={categoria.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {categoria.activo ? "Activo" : "No Activo"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditCategoria(categoria)} data-testid={`button-edit-categoria-${categoria.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => eliminarCategoriaMutation.mutate(categoria.id)} data-testid={`button-delete-categoria-${categoria.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Curso Dialog */}
      <Dialog open={cursoDialogOpen} onOpenChange={(open) => {
        setCursoDialogOpen(open);
        if (!open) {
          setMostrarBancoCursos(true);
          setBusquedaBancoCursos("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{cursoEditando ? "Editar Curso" : "Nuevo Curso"}</DialogTitle>
          </DialogHeader>
          
          {/* Tarjeta Inteligente - Banco de Cursos Predefinidos */}
          {!cursoEditando && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                      <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-emerald-800 dark:text-emerald-200">
                        Banco de Cursos Inteligente
                      </CardTitle>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        Selecciona un curso predefinido o crea uno personalizado
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarBancoCursos(!mostrarBancoCursos)}
                    className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
                    data-testid="button-toggle-banco-cursos"
                  >
                    {mostrarBancoCursos ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </CardHeader>
              
              {mostrarBancoCursos && (
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar curso por título, descripción o categoría..."
                        value={busquedaBancoCursos}
                        onChange={(e) => setBusquedaBancoCursos(e.target.value)}
                        className="pl-9 bg-white dark:bg-gray-900"
                        data-testid="input-buscar-banco-cursos"
                      />
                    </div>
                    
                    <ScrollArea className="h-48 rounded-md border bg-white dark:bg-gray-900">
                      <div className="p-2 space-y-1">
                        {cursosFiltrados.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4 text-sm">
                            No se encontraron cursos
                          </p>
                        ) : (
                          cursosFiltrados.map((curso, index) => (
                            <button
                              key={index}
                              onClick={() => seleccionarCursoBanco(curso)}
                              className="w-full text-left p-3 rounded-lg border border-transparent hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                              data-testid={`button-seleccionar-curso-${index}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                      Auto
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      {curso.categoria}
                                    </Badge>
                                    {curso.esObligatorio && (
                                      <Badge className="text-xs bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        Obligatorio
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm font-medium text-foreground">
                                    {curso.titulo}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                    {curso.descripcion}
                                  </p>
                                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                    <span>{curso.duracionMinutos} min</span>
                                    <span>{curso.puntosCompletar} pts</span>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {bancoCursosPredefinidos.length} cursos disponibles - Códigos únicos generados automáticamente
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="curso-codigo">Código * <span className="text-xs text-muted-foreground font-normal">(auto-generado)</span></Label>
                <Input id="curso-codigo" value={cursoForm.codigo} onChange={(e) => setCursoForm({ ...cursoForm, codigo: e.target.value })} placeholder="Se genera automáticamente" data-testid="input-curso-codigo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso-orden">Orden</Label>
                <Input id="curso-orden" type="number" min="1" value={cursoForm.ordenCurso || ''} onChange={(e) => { const val = e.target.value; setCursoForm({ ...cursoForm, ordenCurso: val === '' ? 0 : Math.max(1, parseInt(val, 10) || 0) }); }} data-testid="input-curso-orden" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso-titulo">Título *</Label>
              <Input id="curso-titulo" value={cursoForm.titulo} onChange={(e) => setCursoForm({ ...cursoForm, titulo: e.target.value })} placeholder="Nombre del curso" data-testid="input-curso-titulo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="curso-descripcion">Descripción</Label>
              <Textarea id="curso-descripcion" value={cursoForm.descripcion} onChange={(e) => setCursoForm({ ...cursoForm, descripcion: e.target.value })} placeholder="Descripción del curso" data-testid="input-curso-descripcion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="curso-duracion">Duración (min)</Label>
                <Input id="curso-duracion" type="number" min="1" value={cursoForm.duracionMinutos || ''} onChange={(e) => { const val = e.target.value; setCursoForm({ ...cursoForm, duracionMinutos: val === '' ? 0 : Math.max(1, parseInt(val, 10) || 0) }); }} data-testid="input-curso-duracion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curso-puntos">Puntos</Label>
                <Input id="curso-puntos" type="number" min="1" value={cursoForm.puntosCompletar || ''} onChange={(e) => { const val = e.target.value; setCursoForm({ ...cursoForm, puntosCompletar: val === '' ? 0 : Math.max(1, parseInt(val, 10) || 0) }); }} data-testid="input-curso-puntos" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="curso-obligatorio" checked={cursoForm.esObligatorio} onCheckedChange={(checked) => setCursoForm({ ...cursoForm, esObligatorio: !!checked })} data-testid="checkbox-curso-obligatorio" />
                <Label htmlFor="curso-obligatorio">Obligatorio</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="curso-activo" checked={cursoForm.activo} onCheckedChange={(checked) => setCursoForm({ ...cursoForm, activo: !!checked })} data-testid="checkbox-curso-activo" />
                <Label htmlFor="curso-activo">Activo</Label>
              </div>
            </div>
            
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="curso-audiencia">Audiencia del Curso *</Label>
              <Select 
                value={cursoForm.tipoAudiencia} 
                onValueChange={(value: "todos" | "solo_copasst" | "seleccion_manual") => 
                  setCursoForm({ ...cursoForm, tipoAudiencia: value, miembrosAsignados: value === "todos" ? [] : cursoForm.miembrosAsignados })
                }
              >
                <SelectTrigger id="curso-audiencia" data-testid="select-curso-audiencia">
                  <SelectValue placeholder="Seleccionar audiencia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solo_copasst">Solo miembros COPASST</SelectItem>
                  <SelectItem value="todos">Todos los trabajadores</SelectItem>
                  <SelectItem value="seleccion_manual">Selección manual</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {cursoForm.tipoAudiencia === "solo_copasst" && "El curso se asignará automáticamente a los miembros activos del COPASST"}
                {cursoForm.tipoAudiencia === "todos" && "El curso estará disponible para todos los trabajadores de la empresa"}
                {cursoForm.tipoAudiencia === "seleccion_manual" && "Seleccione manualmente los miembros del COPASST que deben tomar el curso"}
              </p>
            </div>

            {cursoForm.tipoAudiencia === "seleccion_manual" && (
              <div className="space-y-2">
                <Label>Miembros COPASST asignados</Label>
                {miembrosCopasst.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay miembros activos en el COPASST actual</p>
                ) : (
                  <div className="grid gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {miembrosCopasst.map((miembro) => (
                      <div key={miembro.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`miembro-${miembro.id}`}
                          checked={cursoForm.miembrosAsignados.includes(miembro.id)}
                          onCheckedChange={(checked) => {
                            const nuevos = checked
                              ? [...cursoForm.miembrosAsignados, miembro.id]
                              : cursoForm.miembrosAsignados.filter(id => id !== miembro.id);
                            setCursoForm({ ...cursoForm, miembrosAsignados: nuevos });
                          }}
                          data-testid={`checkbox-miembro-${miembro.id}`}
                        />
                        <Label htmlFor={`miembro-${miembro.id}`} className="text-sm font-normal">
                          {miembro.nombre || `Miembro ${miembro.id.slice(0, 8)}`}
                          <span className="text-xs text-muted-foreground ml-2">
                            ({miembro.cargo} - {miembro.tipoRepresentante === "trabajadores" ? "Rep. Trabajadores" : "Rep. Empleador"})
                          </span>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCursoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitCurso} disabled={crearCursoMutation.isPending || actualizarCursoMutation.isPending} data-testid="button-guardar-curso">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lección Dialog */}
      <Dialog open={leccionDialogOpen} onOpenChange={setLeccionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{leccionEditando ? "Editar Lección" : "Nueva Lección"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leccion-titulo">Título *</Label>
              <Input id="leccion-titulo" value={leccionForm.titulo} onChange={(e) => setLeccionForm({ ...leccionForm, titulo: e.target.value })} placeholder="Nombre de la lección" data-testid="input-leccion-titulo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leccion-contenido">Contenido HTML</Label>
              <Textarea id="leccion-contenido" value={leccionForm.contenidoHtml} onChange={(e) => setLeccionForm({ ...leccionForm, contenidoHtml: e.target.value })} placeholder="<p>Contenido de la lección...</p>" rows={6} data-testid="input-leccion-contenido" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leccion-video">URL de Video (opcional)</Label>
              <Input id="leccion-video" value={leccionForm.videoUrl} onChange={(e) => setLeccionForm({ ...leccionForm, videoUrl: e.target.value })} placeholder="https://youtube.com/embed/..." data-testid="input-leccion-video" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leccion-duracion">Duración (min)</Label>
                <Input id="leccion-duracion" type="number" value={leccionForm.duracionMinutos || ''} onChange={(e) => setLeccionForm({ ...leccionForm, duracionMinutos: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} onBlur={(e) => { if (e.target.value === '' || leccionForm.duracionMinutos === '') setLeccionForm(prev => ({ ...prev, duracionMinutos: 5 })); }} data-testid="input-leccion-duracion" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leccion-orden">Orden</Label>
                <Input id="leccion-orden" type="number" value={leccionForm.ordenLeccion || ''} onChange={(e) => setLeccionForm({ ...leccionForm, ordenLeccion: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} onBlur={(e) => { if (e.target.value === '' || leccionForm.ordenLeccion === '') setLeccionForm(prev => ({ ...prev, ordenLeccion: 1 })); }} data-testid="input-leccion-orden" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="leccion-puntos">Puntos</Label>
                <Input id="leccion-puntos" type="number" value={leccionForm.puntosCompletar || ''} onChange={(e) => setLeccionForm({ ...leccionForm, puntosCompletar: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} onBlur={(e) => { if (e.target.value === '' || leccionForm.puntosCompletar === '') setLeccionForm(prev => ({ ...prev, puntosCompletar: 10 })); }} data-testid="input-leccion-puntos" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="leccion-activo" checked={leccionForm.activo} onCheckedChange={(checked) => setLeccionForm({ ...leccionForm, activo: !!checked })} data-testid="checkbox-leccion-activo" />
              <Label htmlFor="leccion-activo">Activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeccionDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitLeccion} disabled={crearLeccionMutation.isPending || actualizarLeccionMutation.isPending} data-testid="button-guardar-leccion">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pregunta Dialog */}
      <Dialog open={preguntaDialogOpen} onOpenChange={(open) => {
        setPreguntaDialogOpen(open);
        if (!open) {
          setMostrarBancoInteligente(true);
          setBusquedaBanco("");
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{preguntaEditando ? "Editar Pregunta" : "Nueva Pregunta"}</DialogTitle>
          </DialogHeader>
          
          {/* Tarjeta Inteligente - Banco de Preguntas Predefinidas */}
          {!preguntaEditando && (
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-amber-800 dark:text-amber-200">
                        Banco de Preguntas Inteligente
                      </CardTitle>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Selecciona una pregunta predefinida o escribe la tuya propia
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarBancoInteligente(!mostrarBancoInteligente)}
                    className="text-amber-700 hover:text-amber-900 dark:text-amber-300"
                    data-testid="button-toggle-banco-inteligente"
                  >
                    {mostrarBancoInteligente ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </CardHeader>
              
              {mostrarBancoInteligente && (
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar pregunta por tema, categoría o palabra clave..."
                        value={busquedaBanco}
                        onChange={(e) => setBusquedaBanco(e.target.value)}
                        className="pl-9 bg-white dark:bg-gray-900"
                        data-testid="input-buscar-banco"
                      />
                    </div>
                    
                    <ScrollArea className="h-48 rounded-md border bg-white dark:bg-gray-900">
                      <div className="p-2 space-y-1">
                        {preguntasFiltradas.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4 text-sm">
                            No se encontraron preguntas
                          </p>
                        ) : (
                          preguntasFiltradas.map((pregunta, index) => (
                            <button
                              key={index}
                              onClick={() => seleccionarPreguntaBanco(pregunta)}
                              className="w-full text-left p-3 rounded-lg border border-transparent hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors group"
                              data-testid={`button-seleccionar-pregunta-${index}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground line-clamp-2">
                                    {pregunta.enunciado}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {pregunta.categoria}
                                    </Badge>
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs ${
                                        pregunta.dificultad === 'facil' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                        pregunta.dificultad === 'media' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}
                                    >
                                      {pregunta.dificultad === 'facil' ? 'Fácil' : pregunta.dificultad === 'media' ? 'Media' : 'Difícil'}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {pregunta.tipo === 'seleccion_multiple' ? 'Selección múltiple' : 'V/F'}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {bancoPreguntasPredefinidas.length} preguntas disponibles sobre COPASST y SST
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pregunta-enunciado">Enunciado *</Label>
              <Textarea id="pregunta-enunciado" value={preguntaForm.enunciadoHtml} onChange={(e) => setPreguntaForm({ ...preguntaForm, enunciadoHtml: e.target.value })} placeholder="¿Cuál es la función principal del COPASST?" rows={3} data-testid="input-pregunta-enunciado" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pregunta-tipo">Tipo de Pregunta</Label>
                <Select value={preguntaForm.tipoPregunta} onValueChange={(v) => setPreguntaForm({ ...preguntaForm, tipoPregunta: v })}>
                  <SelectTrigger data-testid="select-pregunta-tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seleccion_multiple">Selección Múltiple</SelectItem>
                    <SelectItem value="verdadero_falso">Verdadero/Falso</SelectItem>
                    <SelectItem value="respuesta_abierta">Respuesta Abierta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pregunta-dificultad">Dificultad</Label>
                <Select value={preguntaForm.dificultad} onValueChange={(v) => setPreguntaForm({ ...preguntaForm, dificultad: v })}>
                  <SelectTrigger data-testid="select-pregunta-dificultad">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {preguntaForm.tipoPregunta === "seleccion_multiple" && (
              <div className="space-y-2">
                <Label>Opciones de Respuesta</Label>
                {preguntaForm.opciones.map((opcion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={opcion} onChange={(e) => {
                      const newOpciones = [...preguntaForm.opciones];
                      newOpciones[index] = e.target.value;
                      setPreguntaForm({ ...preguntaForm, opciones: newOpciones });
                    }} placeholder={`Opción ${index + 1}`} data-testid={`input-pregunta-opcion-${index}`} />
                    <input type="radio" name="respuesta" checked={preguntaForm.respuestaCorrecta === String(index)} onChange={() => setPreguntaForm({ ...preguntaForm, respuestaCorrecta: String(index) })} />
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setPreguntaForm({ ...preguntaForm, opciones: [...preguntaForm.opciones, ""] })} data-testid="button-agregar-opcion">
                  <Plus className="w-3 h-3 mr-1" />
                  Agregar Opción
                </Button>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="pregunta-explicacion">Explicación (retroalimentación)</Label>
              <Textarea id="pregunta-explicacion" value={preguntaForm.explicacionHtml} onChange={(e) => setPreguntaForm({ ...preguntaForm, explicacionHtml: e.target.value })} placeholder="Explicación de la respuesta correcta..." rows={2} data-testid="input-pregunta-explicacion" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pregunta-categoria">Categoría</Label>
                <Select value={preguntaForm.categoriaId} onValueChange={(v) => setPreguntaForm({ ...preguntaForm, categoriaId: v })}>
                  <SelectTrigger data-testid="select-pregunta-categoria">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pregunta-puntos">Puntos</Label>
                <Input id="pregunta-puntos" type="number" value={preguntaForm.puntos || ''} onChange={(e) => setPreguntaForm({ ...preguntaForm, puntos: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} onBlur={(e) => { if (e.target.value === '' || preguntaForm.puntos === '') setPreguntaForm(prev => ({ ...prev, puntos: 10 })); }} data-testid="input-pregunta-puntos" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pregunta-etiquetas">Etiquetas</Label>
                <Input id="pregunta-etiquetas" value={preguntaForm.etiquetas} onChange={(e) => setPreguntaForm({ ...preguntaForm, etiquetas: e.target.value })} placeholder="SST, COPASST, legal" data-testid="input-pregunta-etiquetas" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreguntaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitPregunta} disabled={crearPreguntaMutation.isPending || actualizarPreguntaMutation.isPending} data-testid="button-guardar-pregunta">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categoría Dialog */}
      <Dialog open={categoriaDialogOpen} onOpenChange={(open) => {
        setCategoriaDialogOpen(open);
        if (!open) {
          setMostrarBancoCategorias(true);
          setBusquedaBancoCategorias("");
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
          </DialogHeader>
          
          {/* Tarjeta Inteligente - Banco de Categorías Predefinidas */}
          {!categoriaEditando && (
            <Card className="border-violet-200 dark:border-violet-800 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-base text-violet-800 dark:text-violet-200">
                        Banco de Categorías Inteligente
                      </CardTitle>
                      <p className="text-xs text-violet-600 dark:text-violet-400">
                        Selecciona una categoría predefinida o crea una personalizada
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrarBancoCategorias(!mostrarBancoCategorias)}
                    className="text-violet-700 hover:text-violet-900 dark:text-violet-300"
                    data-testid="button-toggle-banco-categorias"
                  >
                    {mostrarBancoCategorias ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>
              </CardHeader>
              
              {mostrarBancoCategorias && (
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar categoría por nombre o descripción..."
                        value={busquedaBancoCategorias}
                        onChange={(e) => setBusquedaBancoCategorias(e.target.value)}
                        className="pl-9 bg-white dark:bg-gray-900"
                        data-testid="input-buscar-banco-categorias"
                      />
                    </div>
                    
                    <ScrollArea className="h-48 rounded-md border bg-white dark:bg-gray-900">
                      <div className="p-2 space-y-1">
                        {categoriasFiltradas.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4 text-sm">
                            No se encontraron categorías
                          </p>
                        ) : (
                          categoriasFiltradas.map((cat, index) => (
                            <button
                              key={index}
                              onClick={() => seleccionarCategoriaBanco(cat)}
                              className="w-full text-left p-3 rounded-lg border border-transparent hover:border-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors group"
                              data-testid={`button-seleccionar-categoria-${index}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground">
                                    {cat.nombre}
                                  </p>
                                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                    {cat.descripcion}
                                  </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Check className="w-5 h-5 text-green-600" />
                                </div>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {bancoCategoriasPredefinidas.length} categorías disponibles sobre COPASST y SST
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoria-nombre">Nombre *</Label>
              <Input id="categoria-nombre" value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} placeholder="Nombre de la categoría" data-testid="input-categoria-nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoria-descripcion">Descripción</Label>
              <Textarea id="categoria-descripcion" value={categoriaForm.descripcion} onChange={(e) => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })} placeholder="Descripción de la categoría" data-testid="input-categoria-descripcion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria-orden">Orden</Label>
                <Input id="categoria-orden" type="number" value={categoriaForm.orden || ''} onChange={(e) => setCategoriaForm({ ...categoriaForm, orden: e.target.value === '' ? '' : parseInt(e.target.value, 10) })} onBlur={(e) => { if (e.target.value === '' || categoriaForm.orden === '') setCategoriaForm(prev => ({ ...prev, orden: 1 })); }} data-testid="input-categoria-orden" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Checkbox id="categoria-activo" checked={categoriaForm.activo} onCheckedChange={(checked) => setCategoriaForm({ ...categoriaForm, activo: !!checked })} data-testid="checkbox-categoria-activo" />
                <Label htmlFor="categoria-activo">Activo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCategoriaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitCategoria} disabled={crearCategoriaMutation.isPending || actualizarCategoriaMutation.isPending} data-testid="button-guardar-categoria">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
