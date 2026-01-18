import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  CheckCircle,
  Award,
  Clock,
  Play,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Download,
  FileText,
  Flame,
  Lock,
  Medal,
  Users,
  Target,
  Gamepad2,
  Shield,
  Zap,
  Brain,
  Heart,
  Crown,
  Sparkles,
  CalendarDays,
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

interface Curso {
  id: string;
  titulo: string;
  descripcion: string;
  duracionMinutos: number;
  totalLecciones: number;
  leccionesCompletadas: number;
  completado: boolean;
  puntos: number;
  imagenUrl?: string;
}

interface Leccion {
  id: string;
  cursoId: string;
  titulo: string;
  descripcion: string;
  duracionMinutos: number;
  orden: number;
  contenidoHtml: string;
  videoUrl?: string;
  completada: boolean;
}

interface QuizPregunta {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta?: number;
}

interface Certificado {
  id: string;
  cursoId: string;
  cursoTitulo: string;
  fechaEmision: string;
  puntajeObtenido: number;
  pdfUrl?: string;
}

interface ProgresoUsuario {
  totalCursos: number;
  cursosCompletados: number;
  puntosTotal: number;
  certificadosObtenidos: number;
}

interface Insignia {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  iconoLucide: string;
  categoria: string;
  puntosBonus: number;
}

interface InsigniaUsuario {
  id: string;
  insigniaId: string;
  fechaDesbloqueo: string;
  insignia: Insignia;
}

interface Racha {
  rachaActual: number;
  rachaMaxima: number;
  ultimaActividad: string;
  puntosBonusAcumulados: number;
}

interface LeaderboardEntry {
  userId: string;
  nombreCompleto: string;
  puntosTotal: number;
  cursosCompletados: number;
  position: number;
}

interface Escenario {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  duracionMinutos: number;
  puntosPerfecto: number;
  completado?: boolean;
  puntosObtenidos?: number;
}

interface EscenarioNodo {
  id: string;
  escenarioId: string;
  tipo: 'inicio' | 'decision' | 'resultado';
  titulo: string;
  contenidoHtml: string;
  opciones: Array<{
    texto: string;
    siguienteNodoId: string;
    puntos: number;
    feedback: string;
  }>;
  puntosNodo: number;
}

const iconMap: Record<string, any> = {
  Trophy,
  Star,
  Award,
  Shield,
  Zap,
  Brain,
  Heart,
  Crown,
  Sparkles,
  Medal,
  Target,
  CheckCircle,
  BookOpen,
  Flame,
};

type Vista = 'list' | 'course' | 'lesson';

export default function CapacitacionCopasst() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [vista, setVista] = useState<Vista>('list');
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string | null>(null);
  const [leccionSeleccionadaId, setLeccionSeleccionadaId] = useState<string | null>(null);
  const [filtroTab, setFiltroTab] = useState("todos");
  const [quizOpen, setQuizOpen] = useState(false);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [quizResultado, setQuizResultado] = useState<{ score: number; passed: boolean } | null>(null);
  
  // Scenario player state
  const [escenarioActivo, setEscenarioActivo] = useState<string | null>(null);
  const [nodoActual, setNodoActual] = useState<string | null>(null);
  const [progresoId, setProgresoId] = useState<string | null>(null);
  const [puntosEscenario, setPuntosEscenario] = useState(0);
  const [feedbackActual, setFeedbackActual] = useState<string | null>(null);

  const { data: cursos = [], isLoading: loadingCursos } = useQuery<Curso[]>({
    queryKey: ["/api/copasst-capacitacion/cursos"],
  });

  const { data: progreso } = useQuery<ProgresoUsuario>({
    queryKey: ["/api/copasst-capacitacion/mi-progreso"],
  });

  const { data: certificados = [] } = useQuery<Certificado[]>({
    queryKey: ["/api/copasst-capacitacion/certificados"],
  });

  const { data: cursoDetalle } = useQuery<Curso & { lecciones: Leccion[] }>({
    queryKey: [`/api/copasst-capacitacion/cursos/${cursoSeleccionadoId}`],
    enabled: !!cursoSeleccionadoId,
  });

  const { data: lecciones = [] } = useQuery<Leccion[]>({
    queryKey: [`/api/copasst-capacitacion/cursos/${cursoSeleccionadoId}/lecciones`],
    enabled: !!cursoSeleccionadoId,
  });

  const { data: leccionActual } = useQuery<Leccion>({
    queryKey: [`/api/copasst-capacitacion/lecciones/${leccionSeleccionadaId}`],
    enabled: !!leccionSeleccionadaId,
  });

  const { data: quizPreguntas = [], isLoading: loadingQuizPreguntas } = useQuery<QuizPregunta[]>({
    queryKey: [`/api/copasst-capacitacion/cursos/${cursoSeleccionadoId}/quiz`],
    enabled: !!cursoSeleccionadoId && quizOpen,
  });

  const { data: misInsignias = [] } = useQuery<InsigniaUsuario[]>({
    queryKey: ["/api/copasst-capacitacion/gamificacion/mis-insignias"],
  });

  const { data: todasInsignias = [] } = useQuery<Insignia[]>({
    queryKey: ["/api/copasst-capacitacion/gamificacion/insignias"],
  });

  const { data: racha } = useQuery<Racha>({
    queryKey: ["/api/copasst-capacitacion/gamificacion/racha"],
  });

  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/copasst-capacitacion/gamificacion/leaderboard"],
  });

  const { data: escenarios = [] } = useQuery<Escenario[]>({
    queryKey: ["/api/copasst-capacitacion/escenarios"],
  });

  const { data: nodos = [] } = useQuery<EscenarioNodo[]>({
    queryKey: [`/api/copasst-capacitacion/escenarios/${escenarioActivo}/nodos`],
    enabled: !!escenarioActivo,
  });

  const completarLeccionMutation = useMutation({
    mutationFn: async (leccionId: string) => {
      const res = await apiRequest("POST", `/api/copasst-capacitacion/lecciones/${leccionId}/completar`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/cursos"] });
      queryClient.invalidateQueries({ queryKey: [`/api/copasst-capacitacion/cursos/${cursoSeleccionadoId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/copasst-capacitacion/cursos/${cursoSeleccionadoId}/lecciones`] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/mi-progreso"] });
      // Gamification cache invalidations
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/racha"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-insignias"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-estadisticas"] });
      toast({ title: "Lección completada", description: "Has completado esta lección exitosamente." });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const enviarQuizMutation = useMutation({
    mutationFn: async (data: { cursoId: string; respuestas: Record<string, number> }) => {
      const res = await apiRequest("POST", `/api/copasst-capacitacion/cursos/${data.cursoId}/quiz/submit`, { respuestas: data.respuestas });
      return await res.json();
    },
    onSuccess: (data) => {
      // Map backend response (porcentaje, aprobado) to frontend state (score, passed)
      setQuizResultado({ score: data.porcentaje, passed: data.aprobado });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/cursos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/certificados"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/mi-progreso"] });
      // Gamification cache invalidations
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/racha"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-insignias"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-estadisticas"] });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  // Scenario mutations
  const iniciarEscenarioMutation = useMutation({
    mutationFn: async (escenarioId: string) => {
      const res = await apiRequest("POST", `/api/copasst-capacitacion/escenarios/${escenarioId}/iniciar`, {});
      return await res.json();
    },
    onSuccess: (data) => {
      setProgresoId(data.id);
      setNodoActual(data.nodoActualId);
      setPuntosEscenario(0);
      setFeedbackActual(null);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const tomarDecisionMutation = useMutation({
    mutationFn: async (data: { opcionIndex: number; siguienteNodoId: string }) => {
      const res = await apiRequest("POST", `/api/copasst-capacitacion/escenarios/progreso/${progresoId}/decision`, {
        opcionIndex: data.opcionIndex,
        siguienteNodoId: data.siguienteNodoId,
      });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      const nodoActualData = nodos.find(n => n.id === nodoActual);
      const opcion = nodoActualData?.opciones?.[variables.opcionIndex];
      if (opcion) {
        setPuntosEscenario(prev => prev + opcion.puntos);
        setFeedbackActual(opcion.feedback);
      }
      setTimeout(() => {
        setNodoActual(variables.siguienteNodoId);
        setFeedbackActual(null);
      }, 2000);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const completarEscenarioMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/copasst-capacitacion/escenarios/progreso/${progresoId}/completar`, {
        puntosObtenidos: puntosEscenario,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/escenarios"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/racha"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-insignias"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/leaderboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-capacitacion/gamificacion/mis-estadisticas"] });
      toast({ title: "Escenario completado", description: `Has obtenido ${puntosEscenario} puntos.` });
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const iniciarEscenario = (escenarioId: string) => {
    setEscenarioActivo(escenarioId);
    iniciarEscenarioMutation.mutate(escenarioId);
  };

  const cerrarEscenario = () => {
    setEscenarioActivo(null);
    setNodoActual(null);
    setProgresoId(null);
    setPuntosEscenario(0);
    setFeedbackActual(null);
  };

  const cursosFiltrados = cursos.filter((curso) => {
    if (filtroTab === "en-progreso") return curso.leccionesCompletadas > 0 && !curso.completado;
    if (filtroTab === "completados") return curso.completado;
    return true;
  });

  const navegarACurso = (cursoId: string) => {
    setCursoSeleccionadoId(cursoId);
    setVista('course');
  };

  const navegarALeccion = (leccionId: string) => {
    setLeccionSeleccionadaId(leccionId);
    setVista('lesson');
  };

  const volverALista = () => {
    setVista('list');
    setCursoSeleccionadoId(null);
    setLeccionSeleccionadaId(null);
  };

  const volverACurso = () => {
    setVista('course');
    setLeccionSeleccionadaId(null);
  };

  const abrirQuiz = () => {
    setPreguntaActual(0);
    setRespuestas({});
    setQuizResultado(null);
    setQuizOpen(true);
  };

  const cerrarQuiz = () => {
    setQuizOpen(false);
    setPreguntaActual(0);
    setRespuestas({});
    setQuizResultado(null);
  };

  const seleccionarRespuesta = (preguntaId: string, opcionIndex: number) => {
    setRespuestas({ ...respuestas, [preguntaId]: opcionIndex });
  };

  const siguientePregunta = () => {
    if (preguntaActual < quizPreguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const anteriorPregunta = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const enviarQuiz = () => {
    if (cursoSeleccionadoId) {
      enviarQuizMutation.mutate({ cursoId: cursoSeleccionadoId, respuestas });
    }
  };

  const leccionActualIndex = lecciones.findIndex((l) => l.id === leccionSeleccionadaId);
  const leccionAnterior = leccionActualIndex > 0 ? lecciones[leccionActualIndex - 1] : null;
  const leccionSiguiente = leccionActualIndex < lecciones.length - 1 ? lecciones[leccionActualIndex + 1] : null;
  const todasLeccionesCompletadas = cursoDetalle ? lecciones.every((l) => l.completada) : false;

  if (vista === 'lesson' && leccionActual) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={volverACurso}
          className="mb-4"
          data-testid="button-volver-curso"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver al curso
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <CardTitle data-testid="text-leccion-titulo">{leccionActual.titulo}</CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4" />
                  {leccionActual.duracionMinutos} minutos
                </CardDescription>
              </div>
              {leccionActual.completada ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="badge-leccion-completada">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Completada
                </Badge>
              ) : (
                <Button
                  onClick={() => completarLeccionMutation.mutate(leccionActual.id)}
                  disabled={completarLeccionMutation.isPending}
                  data-testid="button-marcar-completada"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Marcar como Completada
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {leccionActual.videoUrl && (
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={leccionActual.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                  data-testid="video-leccion"
                />
              </div>
            )}

            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: leccionActual.contenidoHtml }}
              data-testid="content-leccion"
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => leccionAnterior && navegarALeccion(leccionAnterior.id)}
            disabled={!leccionAnterior}
            data-testid="button-leccion-anterior"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => leccionSiguiente && navegarALeccion(leccionSiguiente.id)}
            disabled={!leccionSiguiente}
            data-testid="button-leccion-siguiente"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  if (vista === 'course' && cursoDetalle) {
    const porcentajeProgreso = cursoDetalle.totalLecciones > 0
      ? (cursoDetalle.leccionesCompletadas / cursoDetalle.totalLecciones) * 100
      : 0;

    return (
      <div className="container mx-auto p-6 space-y-6">
        <Button
          variant="ghost"
          onClick={volverALista}
          className="mb-4"
          data-testid="button-volver-lista"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Volver a cursos
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <CardTitle className="text-2xl" data-testid="text-curso-titulo">{cursoDetalle.titulo}</CardTitle>
                <CardDescription data-testid="text-curso-descripcion">{cursoDetalle.descripcion}</CardDescription>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {cursoDetalle.duracionMinutos} minutos
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {cursoDetalle.totalLecciones} lecciones
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    {cursoDetalle.puntos} puntos
                  </span>
                </div>
              </div>
              {cursoDetalle.completado && (
                <Badge variant="secondary" className="bg-green-100 text-green-800" data-testid="badge-curso-completado">
                  <Trophy className="h-4 w-4 mr-1" />
                  Completado
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progreso del curso</span>
                <span className="font-medium" data-testid="text-progreso-porcentaje">{Math.round(porcentajeProgreso)}%</span>
              </div>
              <Progress value={porcentajeProgreso} className="h-2" data-testid="progress-curso" />
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Lecciones</h3>
              <div className="space-y-2">
                {lecciones.map((leccion, index) => (
                  <Card
                    key={leccion.id}
                    className="cursor-pointer hover-elevate"
                    onClick={() => navegarALeccion(leccion.id)}
                    data-testid={`card-leccion-${leccion.id}`}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium ${
                          leccion.completada
                            ? 'bg-green-100 text-green-800'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {leccion.completada ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{leccion.titulo}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {leccion.duracionMinutos} min
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {leccion.completada ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Completada
                          </Badge>
                        ) : (
                          <Button size="sm" variant="ghost">
                            <Play className="h-4 w-4 mr-1" />
                            Iniciar
                          </Button>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={abrirQuiz}
                disabled={!todasLeccionesCompletadas}
                className="w-full sm:w-auto"
                data-testid="button-tomar-quiz"
              >
                <Award className="h-4 w-4 mr-2" />
                {todasLeccionesCompletadas
                  ? 'Tomar Quiz de Evaluación'
                  : 'Completa todas las lecciones para tomar el quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {quizResultado
                  ? 'Resultados del Quiz'
                  : `Pregunta ${preguntaActual + 1} de ${quizPreguntas.length}`}
              </DialogTitle>
            </DialogHeader>

            {quizResultado ? (
              <div className="space-y-6 py-4">
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center h-20 w-20 rounded-full ${
                    quizResultado.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {quizResultado.passed ? (
                      <Trophy className="h-10 w-10 text-green-600" />
                    ) : (
                      <Award className="h-10 w-10 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-3xl font-bold" data-testid="text-quiz-puntaje">
                      {quizResultado.score}%
                    </p>
                    <p className={`text-lg font-medium ${
                      quizResultado.passed ? 'text-green-600' : 'text-red-600'
                    }`} data-testid="text-quiz-resultado">
                      {quizResultado.passed ? '¡Aprobado!' : 'No aprobado'}
                    </p>
                  </div>
                  {quizResultado.passed ? (
                    <p className="text-muted-foreground">
                      ¡Felicitaciones! Has completado el curso exitosamente. Tu certificado está disponible.
                    </p>
                  ) : (
                    <p className="text-muted-foreground">
                      Necesitas un mínimo de 70% para aprobar. Revisa las lecciones e intenta de nuevo.
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={cerrarQuiz} data-testid="button-cerrar-quiz">
                    Cerrar
                  </Button>
                </DialogFooter>
              </div>
            ) : loadingQuizPreguntas ? (
              <div className="py-8 text-center text-muted-foreground">
                Cargando preguntas...
              </div>
            ) : quizPreguntas.length > 0 ? (
              <div className="space-y-6 py-4">
                <p className="text-lg font-medium" data-testid="text-pregunta">
                  {quizPreguntas[preguntaActual]?.pregunta}
                </p>

                <RadioGroup
                  value={respuestas[quizPreguntas[preguntaActual]?.id]?.toString() || ''}
                  onValueChange={(value) =>
                    seleccionarRespuesta(quizPreguntas[preguntaActual]?.id, parseInt(value))
                  }
                  data-testid="radio-group-opciones"
                >
                  {quizPreguntas[preguntaActual]?.opciones.map((opcion, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={index.toString()}
                        id={`opcion-${index}`}
                        data-testid={`radio-opcion-${index}`}
                      />
                      <Label htmlFor={`opcion-${index}`} className="cursor-pointer flex-1">
                        {opcion}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <DialogFooter className="flex gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={anteriorPregunta}
                    disabled={preguntaActual === 0}
                    data-testid="button-pregunta-anterior"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  {preguntaActual === quizPreguntas.length - 1 ? (
                    <Button
                      onClick={enviarQuiz}
                      disabled={Object.keys(respuestas).length !== quizPreguntas.length || enviarQuizMutation.isPending}
                      data-testid="button-enviar-quiz"
                    >
                      Enviar Quiz
                    </Button>
                  ) : (
                    <Button onClick={siguientePregunta} data-testid="button-pregunta-siguiente">
                      Siguiente
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </DialogFooter>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground" data-testid="empty-quiz-preguntas">
                Este curso no tiene preguntas de evaluación configuradas.
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

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
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Capacitación COPASST</h1>
          <p className="text-muted-foreground">
            Formación para miembros del Comité Paritario de Seguridad y Salud en el Trabajo
          </p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {racha && racha.rachaActual > 0 && (
            <div className="flex items-center gap-2 text-sm" data-testid="widget-racha">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-semibold text-orange-600" data-testid="text-racha-actual">
                {racha.rachaActual} días
              </span>
            </div>
          )}
          {progreso && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold" data-testid="text-puntos-total">{progreso.puntosTotal} puntos</span>
              </div>
              <Badge variant="outline" data-testid="badge-certificados">
                <Award className="h-4 w-4 mr-1" />
                {progreso.certificadosObtenidos} certificados
              </Badge>
            </>
          )}
        </div>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('1.1.7');
        return estandar ? (
          <AutomationAssistant
            titulo="Capacitación COPASST / Vigía SST"
            estandar={estandar.codigo}
            descripcion="Formación obligatoria de 20 horas para integrantes del COPASST según Resolución 0312/2019"
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

      <Tabs value={filtroTab} onValueChange={setFiltroTab}>
        <TabsList data-testid="tabs-filtro" className="flex-wrap h-auto gap-1">
          <TabsTrigger value="todos" data-testid="tab-todos">Todos</TabsTrigger>
          <TabsTrigger value="en-progreso" data-testid="tab-en-progreso">En Progreso</TabsTrigger>
          <TabsTrigger value="completados" data-testid="tab-completados">Completados</TabsTrigger>
          <TabsTrigger value="certificados" data-testid="tab-certificados">Certificados</TabsTrigger>
          <TabsTrigger value="insignias" data-testid="tab-insignias">Insignias</TabsTrigger>
          <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="escenarios" data-testid="tab-escenarios">Escenarios</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          {loadingCursos ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <CursoGrid cursos={cursosFiltrados} onCursoClick={navegarACurso} />
          )}
        </TabsContent>

        <TabsContent value="en-progreso" className="mt-6">
          <CursoGrid cursos={cursosFiltrados} onCursoClick={navegarACurso} />
        </TabsContent>

        <TabsContent value="completados" className="mt-6">
          <CursoGrid cursos={cursosFiltrados} onCursoClick={navegarACurso} />
        </TabsContent>

        <TabsContent value="certificados" className="mt-6">
          {certificados.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Award className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Sin certificados aún</h3>
                <p className="text-muted-foreground mt-1">
                  Completa cursos y aprueba los quizzes para obtener certificados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {certificados.map((cert) => (
                <Card key={cert.id} data-testid={`card-certificado-${cert.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-base">{cert.cursoTitulo}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {cert.puntajeObtenido}%
                      </Badge>
                    </div>
                    <CardDescription>
                      Emitido el {new Date(cert.fechaEmision).toLocaleDateString('es-CO')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => cert.pdfUrl && window.open(cert.pdfUrl, '_blank')}
                      data-testid={`button-descargar-certificado-${cert.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="insignias" className="mt-6">
          <div className="space-y-6">
            {racha && (
              <Card data-testid="card-racha-info">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-500" />
                    Tu Racha de Aprendizaje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-orange-500" data-testid="text-racha-actual-card">
                        {racha.rachaActual}
                      </p>
                      <p className="text-sm text-muted-foreground">Días consecutivos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-500" data-testid="text-racha-maxima">
                        {racha.rachaMaxima}
                      </p>
                      <p className="text-sm text-muted-foreground">Racha máxima</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500" data-testid="text-puntos-bonus-racha">
                        +{racha.puntosBonusAcumulados}
                      </p>
                      <p className="text-sm text-muted-foreground">Puntos bonus</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-lg font-semibold mb-4">Todas las Insignias</h2>
              {todasInsignias.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <Medal className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-semibold text-lg">Sin insignias disponibles</h3>
                    <p className="text-muted-foreground mt-1">
                      Las insignias estarán disponibles pronto.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {todasInsignias.map((insignia) => {
                    const desbloqueada = misInsignias.some(
                      (mi) => mi.insigniaId === insignia.id
                    );
                    const IconComponent = iconMap[insignia.iconoLucide] || Medal;

                    return (
                      <Card
                        key={insignia.id}
                        className={`relative ${
                          desbloqueada ? 'hover-elevate' : 'opacity-60'
                        }`}
                        data-testid={`card-insignia-${insignia.id}`}
                      >
                        <CardHeader className="text-center pb-2">
                          <div
                            className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                              desbloqueada
                                ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {desbloqueada ? (
                              <IconComponent className="h-8 w-8" />
                            ) : (
                              <Lock className="h-8 w-8" />
                            )}
                          </div>
                          <CardTitle className="text-base mt-2">{insignia.titulo}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {insignia.descripcion}
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <Badge
                              variant={desbloqueada ? 'secondary' : 'outline'}
                              className={
                                desbloqueada
                                  ? 'bg-green-100 text-green-800'
                                  : ''
                              }
                            >
                              +{insignia.puntosBonus} pts
                            </Badge>
                            <Badge variant="outline">{insignia.categoria}</Badge>
                          </div>
                          {desbloqueada && (
                            <p className="text-xs text-green-600 font-medium" data-testid={`text-desbloqueada-${insignia.id}`}>
                              Desbloqueada
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Tabla de Líderes
              </CardTitle>
              <CardDescription>
                Los mejores participantes en capacitación COPASST
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Sin datos aún</h3>
                  <p className="text-muted-foreground mt-1">
                    Completa cursos para aparecer en el leaderboard.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Pos.</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="text-right">Puntos</TableHead>
                      <TableHead className="text-right">Cursos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry) => {
                      const isCurrentUser = user && entry.userId === user.id.toString();
                      const PositionIcon =
                        entry.position === 1
                          ? Trophy
                          : entry.position === 2
                          ? Medal
                          : entry.position === 3
                          ? Award
                          : null;

                      return (
                        <TableRow
                          key={entry.userId}
                          className={isCurrentUser ? 'bg-green-50 dark:bg-green-900/20' : ''}
                          data-testid={`row-leaderboard-${entry.userId}`}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {PositionIcon ? (
                                <PositionIcon
                                  className={`h-5 w-5 ${
                                    entry.position === 1
                                      ? 'text-yellow-500'
                                      : entry.position === 2
                                      ? 'text-gray-400'
                                      : 'text-amber-600'
                                  }`}
                                />
                              ) : (
                                <span className="text-muted-foreground font-medium">
                                  {entry.position}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {entry.nombreCompleto}
                            {isCurrentUser && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Tú
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {entry.puntosTotal.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {entry.cursosCompletados}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escenarios" className="mt-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Escenarios Interactivos</h2>
              <p className="text-muted-foreground">
                Practica con situaciones reales de seguridad y salud en el trabajo
              </p>
            </div>

            {escenarios.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <Gamepad2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">Sin escenarios disponibles</h3>
                  <p className="text-muted-foreground mt-1">
                    Los escenarios interactivos estarán disponibles pronto.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {escenarios.map((escenario) => {
                  const enProgreso =
                    escenario.puntosObtenidos !== undefined &&
                    escenario.puntosObtenidos > 0 &&
                    !escenario.completado;

                  return (
                    <Card
                      key={escenario.id}
                      className="hover-elevate cursor-pointer"
                      data-testid={`card-escenario-${escenario.id}`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-lg">{escenario.titulo}</CardTitle>
                          {escenario.completado ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Completado
                            </Badge>
                          ) : enProgreso ? (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 shrink-0">
                              <Play className="h-3 w-3 mr-1" />
                              En Progreso
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="shrink-0">
                              Nuevo
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="line-clamp-2">
                          {escenario.descripcion}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {escenario.duracionMinutos} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {escenario.puntosPerfecto} pts máx.
                          </span>
                        </div>

                        {escenario.completado && escenario.puntosObtenidos !== undefined && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Tu puntuación:</span>
                            <span className="font-semibold text-green-600" data-testid={`text-puntos-escenario-${escenario.id}`}>
                              {escenario.puntosObtenidos} / {escenario.puntosPerfecto}
                            </span>
                          </div>
                        )}

                        <Badge variant="outline" className="w-fit">{escenario.categoria}</Badge>

                        <Button
                          className="w-full"
                          variant={escenario.completado ? 'outline' : 'default'}
                          onClick={() => iniciarEscenario(escenario.id)}
                          disabled={iniciarEscenarioMutation.isPending}
                          data-testid={`button-iniciar-escenario-${escenario.id}`}
                        >
                          {escenario.completado ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Volver a Jugar
                            </>
                          ) : enProgreso ? (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Continuar
                            </>
                          ) : (
                            <>
                              <Gamepad2 className="h-4 w-4 mr-2" />
                              Iniciar Escenario
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Scenario Player Dialog */}
      <Dialog open={!!escenarioActivo && !!nodoActual} onOpenChange={(open) => !open && cerrarEscenario()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" data-testid="dialog-escenario-player">
          {(() => {
            const escenarioInfo = escenarios.find(e => e.id === escenarioActivo);
            const nodoData = nodos.find(n => n.id === nodoActual);
            const esResultado = nodoData?.tipo === 'resultado';
            const nodosTotal = nodos.length;
            const nodoIndex = nodos.findIndex(n => n.id === nodoActual) + 1;
            
            return (
              <>
                <DialogHeader>
                  <div className="flex items-center justify-between gap-2">
                    <DialogTitle className="text-xl">{escenarioInfo?.titulo || 'Escenario'}</DialogTitle>
                    <Badge variant="secondary" className="shrink-0" data-testid="badge-puntos-escenario">
                      <Star className="h-3 w-3 mr-1" />
                      {puntosEscenario} pts
                    </Badge>
                  </div>
                  {!esResultado && nodosTotal > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Progreso del escenario</span>
                        <span>{nodoIndex} / {nodosTotal}</span>
                      </div>
                      <Progress value={(nodoIndex / nodosTotal) * 100} className="h-2" />
                    </div>
                  )}
                </DialogHeader>

                {feedbackActual && (
                  <div className="p-4 rounded-lg bg-muted border" data-testid="feedback-escenario">
                    <p className="text-sm font-medium">{feedbackActual}</p>
                  </div>
                )}

                {nodoData && !feedbackActual && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{nodoData.titulo}</h3>
                      <div 
                        className="prose prose-sm max-w-none dark:prose-invert"
                        dangerouslySetInnerHTML={{ __html: nodoData.contenidoHtml }}
                        data-testid="contenido-nodo-escenario"
                      />
                    </div>

                    {esResultado ? (
                      <div className="space-y-4">
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                          <CardContent className="pt-6 text-center space-y-4">
                            <Trophy className="h-16 w-16 mx-auto text-primary" />
                            <div>
                              <h4 className="text-2xl font-bold" data-testid="text-puntos-finales">
                                {puntosEscenario} puntos
                              </h4>
                              <p className="text-muted-foreground">
                                de {escenarioInfo?.puntosPerfecto || 0} posibles
                              </p>
                            </div>
                            {escenarioInfo && (
                              <div className="flex justify-center">
                                <Progress 
                                  value={(puntosEscenario / escenarioInfo.puntosPerfecto) * 100} 
                                  className="w-48 h-3" 
                                />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={cerrarEscenario}
                            data-testid="button-cerrar-escenario"
                          >
                            Cerrar
                          </Button>
                          <Button
                            onClick={() => completarEscenarioMutation.mutate()}
                            disabled={completarEscenarioMutation.isPending}
                            data-testid="button-guardar-escenario"
                          >
                            {completarEscenarioMutation.isPending ? 'Guardando...' : 'Guardar Puntuación'}
                          </Button>
                        </DialogFooter>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">¿Qué decisión tomarías?</p>
                        <div className="grid gap-3">
                          {nodoData.opciones.map((opcion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              className="h-auto p-4 text-left justify-start whitespace-normal"
                              onClick={() => tomarDecisionMutation.mutate({ 
                                opcionIndex: index, 
                                siguienteNodoId: opcion.siguienteNodoId 
                              })}
                              disabled={tomarDecisionMutation.isPending}
                              data-testid={`button-opcion-${index}`}
                            >
                              <span>{opcion.texto}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!nodoData && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center space-y-2">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                      <p className="text-muted-foreground">Cargando escenario...</p>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CursoGrid({ cursos, onCursoClick }: { cursos: Curso[]; onCursoClick: (id: string) => void }) {
  if (cursos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg">No hay cursos disponibles</h3>
          <p className="text-muted-foreground mt-1">
            No se encontraron cursos con los filtros seleccionados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => {
        const porcentajeProgreso = curso.totalLecciones > 0
          ? (curso.leccionesCompletadas / curso.totalLecciones) * 100
          : 0;

        return (
          <Card
            key={curso.id}
            className="cursor-pointer hover-elevate"
            onClick={() => onCursoClick(curso.id)}
            data-testid={`card-curso-${curso.id}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-tight">{curso.titulo}</CardTitle>
                {curso.completado && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 shrink-0">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completado
                  </Badge>
                )}
              </div>
              <CardDescription className="line-clamp-2">{curso.descripcion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {curso.duracionMinutos} min
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {curso.totalLecciones} lecciones
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {curso.puntos} pts
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso</span>
                  <span className="font-medium">{Math.round(porcentajeProgreso)}%</span>
                </div>
                <Progress value={porcentajeProgreso} className="h-2" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
