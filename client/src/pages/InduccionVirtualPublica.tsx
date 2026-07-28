import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Play, FileText, Video, BookOpen, AlertCircle, ArrowRight, ArrowLeft, Award, Loader2, PenLine } from "lucide-react";

type Contenido = {
  id: string;
  titulo: string;
  descripcion: string | null;
  tipoContenido: "video" | "documento" | "presentacion" | "texto";
  urlVideo: string | null;
  urlDocumento: string | null;
  contenidoTexto: string | null;
  duracionMinutos: number;
  orden: number;
  obligatorio: number;
};

type Pregunta = {
  id: string;
  pregunta: string;
  opciones: string[];
  orden: number;
};

type InduccionData = {
  sesion: {
    id: string;
    tipoInduccion: string;
    estado: string;
    contenidosVistos: string[];
    progresoEvaluacion: Record<string, number>;
  };
  worker: {
    id: string;
    nombre: string;
    identificacion: string;
    cargo: string;
  };
  company: {
    nombre: string;
    logoUrl: string | null;
  };
  contenidos: Contenido[];
  preguntas: Pregunta[];
};

export default function InduccionVirtualPublica() {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [step, setStep] = useState<"bienvenida" | "contenido" | "evaluacion" | "firma" | "completado">("bienvenida");
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [contenidosVistos, setContenidosVistos] = useState<string[]>([]);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [firmaBase64, setFirmaBase64] = useState<string>("");

  const { data, isLoading, error, refetch } = useQuery<InduccionData>({
    queryKey: ["/api/induccion-publica", token],
    queryFn: async () => {
      const res = await fetch(`/api/induccion-publica/${token}`);
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.completada) {
          return { ...errorData, completada: true };
        }
        throw new Error(errorData.error || "Error al cargar la inducción");
      }
      return res.json();
    },
    enabled: !!token,
  });

  const guardarProgresoMutation = useMutation({
    mutationFn: async (progreso: { contenidosVistos: string[]; progresoEvaluacion: Record<string, number> }) => {
      const res = await fetch(`/api/induccion-publica/${token}/progreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progreso),
      });
      if (!res.ok) throw new Error("Error al guardar progreso");
      return res.json();
    },
  });

  const completarMutation = useMutation({
    mutationFn: async (datos: { respuestas: Record<string, number>; firmaDigital: string }) => {
      const res = await fetch(`/api/induccion-publica/${token}/completar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      if (!res.ok) throw new Error("Error al completar la inducción");
      return res.json();
    },
    onSuccess: () => {
      setStep("completado");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (data?.sesion?.contenidosVistos) {
      setContenidosVistos(data.sesion.contenidosVistos);
    }
    if (data?.sesion?.progresoEvaluacion) {
      setRespuestas(data.sesion.progresoEvaluacion);
    }
  }, [data]);

  const marcarContenidoVisto = (contenidoId: string) => {
    if (!contenidosVistos.includes(contenidoId)) {
      const nuevosVistos = [...contenidosVistos, contenidoId];
      setContenidosVistos(nuevosVistos);
      guardarProgresoMutation.mutate({
        contenidosVistos: nuevosVistos,
        progresoEvaluacion: respuestas,
      });
    }
  };

  const handleSiguienteContenido = () => {
    if (!data) return;
    
    const contenidoActual = data.contenidos[currentContentIndex];
    if (contenidoActual) {
      marcarContenidoVisto(contenidoActual.id);
    }

    if (currentContentIndex < data.contenidos.length - 1) {
      setCurrentContentIndex(currentContentIndex + 1);
    } else {
      setStep("evaluacion");
    }
  };

  const handleRespuesta = (preguntaId: string, respuestaIndex: number) => {
    const nuevasRespuestas = { ...respuestas, [preguntaId]: respuestaIndex };
    setRespuestas(nuevasRespuestas);
    guardarProgresoMutation.mutate({
      contenidosVistos,
      progresoEvaluacion: nuevasRespuestas,
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setFirmaBase64(canvas.toDataURL("image/png"));
    }
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaBase64("");
  };

  const handleCompletarInduccion = () => {
    if (!firmaBase64) {
      toast({
        title: "Firma requerida",
        description: "Por favor firme en el recuadro antes de completar",
        variant: "destructive",
      });
      return;
    }
    completarMutation.mutate({
      respuestas,
      firmaDigital: firmaBase64,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando inducción...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Error</CardTitle>
            <CardDescription>
              {(error as Error)?.message || "No se pudo cargar la inducción. El enlace puede haber expirado o ser inválido."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Si cree que esto es un error, contacte al área de Seguridad y Salud en el Trabajo de su empresa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if ((data as any).completada) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-600">Inducción Completada</CardTitle>
            <CardDescription>
              Esta inducción ya fue completada exitosamente.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const progresoTotal = data.contenidos.length + data.preguntas.length + 1;
  const progresoActual = contenidosVistos.length + Object.keys(respuestas).length + (step === "firma" || step === "completado" ? 1 : 0);
  const porcentajeProgreso = Math.round((progresoActual / progresoTotal) * 100);

  const renderContenido = (contenido: Contenido) => {
    const iconMap = {
      video: <Video className="h-6 w-6 text-red-500" />,
      documento: <FileText className="h-6 w-6 text-blue-500" />,
      presentacion: <BookOpen className="h-6 w-6 text-purple-500" />,
      texto: <FileText className="h-6 w-6 text-gray-500" />,
    };

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center gap-3">
            {iconMap[contenido.tipoContenido]}
            <div>
              <CardTitle className="text-lg">{contenido.titulo}</CardTitle>
              {contenido.descripcion && (
                <CardDescription>{contenido.descripcion}</CardDescription>
              )}
            </div>
          </div>
          <Badge variant="outline" className="w-fit">
            {contenido.duracionMinutos} minutos
          </Badge>
        </CardHeader>
        <CardContent>
          {contenido.tipoContenido === "video" && contenido.urlVideo && (
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {contenido.urlVideo.includes("youtube.com") || contenido.urlVideo.includes("youtu.be") ? (
                <iframe
                  src={contenido.urlVideo.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video src={contenido.urlVideo} controls className="w-full h-full" />
              )}
            </div>
          )}
          {contenido.tipoContenido === "documento" && contenido.urlDocumento && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <a
                href={contenido.urlDocumento}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:underline"
              >
                <FileText className="h-5 w-5" />
                Ver documento
              </a>
            </div>
          )}
          {(contenido.tipoContenido === "texto" || contenido.tipoContenido === "presentacion") && contenido.contenidoTexto && (
            <div
              className="prose prose-sm max-w-none p-4 bg-gray-50 rounded-lg"
              dangerouslySetInnerHTML={{ __html: contenido.contenidoTexto }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {data.company.logoUrl && (
              <img src={data.company.logoUrl} alt="Logo" className="h-12 w-auto" />
            )}
            <div>
              <h1 className="text-xl font-bold text-primary">{data.company.nombre}</h1>
              <p className="text-sm text-muted-foreground">Inducción de Seguridad y Salud en el Trabajo</p>
            </div>
          </div>
          <Badge variant={data.sesion.tipoInduccion === "induccion" ? "default" : "secondary"}>
            {data.sesion.tipoInduccion === "induccion" ? "Inducción" : "Reinducción"}
          </Badge>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Progreso</span>
            <span>{porcentajeProgreso}%</span>
          </div>
          <Progress value={porcentajeProgreso} className="h-2" />
        </div>

        {step === "bienvenida" && (
          <Card>
            <CardHeader className="text-center">
              <Award className="h-16 w-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl">Bienvenido(a), {data.worker.nombre}</CardTitle>
              <CardDescription className="text-base">
                A continuación completará la {data.sesion.tipoInduccion === "induccion" ? "inducción" : "reinducción"} de Seguridad y Salud en el Trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm"><strong>Identificación:</strong> {data.worker.identificacion}</p>
                <p className="text-sm"><strong>Cargo:</strong> {data.worker.cargo}</p>
              </div>
              {data.contenidos.length === 0 && data.preguntas.length === 0 ? (
                <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-800 mb-1">Inducción no configurada</p>
                      <p className="text-sm text-orange-700">
                        El área de SST de su empresa aún no ha cargado el contenido de esta inducción.
                        Por favor contacte al responsable de SST para que complete la configuración antes de continuar.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-2">Instrucciones:</p>
                  <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                    {data.contenidos.length > 0 && (
                      <li>Revise todo el contenido de capacitación ({data.contenidos.length} módulos)</li>
                    )}
                    {data.preguntas.length > 0 && (
                      <li>Responda la evaluación ({data.preguntas.length} preguntas)</li>
                    )}
                    <li>Firme digitalmente al finalizar</li>
                    {data.preguntas.length > 0 && (
                      <li>Debe obtener mínimo 80% para aprobar</li>
                    )}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                size="lg"
                disabled={data.contenidos.length === 0 && data.preguntas.length === 0}
                onClick={() => setStep(data.contenidos.length > 0 ? "contenido" : "evaluacion")}
                data-testid="button-comenzar-induccion"
              >
                <Play className="h-5 w-5 mr-2" />
                Comenzar Inducción
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "contenido" && data.contenidos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Módulo {currentContentIndex + 1} de {data.contenidos.length}
              </h2>
              {contenidosVistos.includes(data.contenidos[currentContentIndex]?.id) && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Visto
                </Badge>
              )}
            </div>
            
            {renderContenido(data.contenidos[currentContentIndex])}

            <div className="flex justify-between gap-4 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentContentIndex(Math.max(0, currentContentIndex - 1))}
                disabled={currentContentIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              <Button onClick={handleSiguienteContenido} data-testid="button-siguiente-contenido">
                {currentContentIndex < data.contenidos.length - 1 ? (
                  <>
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Ir a Evaluación
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "evaluacion" && (
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Evaluación de Conocimientos
                </CardTitle>
                <CardDescription>
                  Responda las siguientes preguntas para evaluar su comprensión del contenido.
                  Debe obtener mínimo 80% para aprobar.
                </CardDescription>
              </CardHeader>
            </Card>

            {data.preguntas.map((pregunta, index) => (
              <Card key={pregunta.id} className="mb-4">
                <CardHeader>
                  <CardTitle className="text-base">
                    {index + 1}. {pregunta.pregunta}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={respuestas[pregunta.id]?.toString() || ""}
                    onValueChange={(value) => handleRespuesta(pregunta.id, parseInt(value))}
                  >
                    {pregunta.opciones.map((opcion, opcionIndex) => (
                      <div key={opcionIndex} className="flex items-center space-x-2 py-2">
                        <RadioGroupItem
                          value={opcionIndex.toString()}
                          id={`${pregunta.id}-${opcionIndex}`}
                          data-testid={`radio-pregunta-${index}-opcion-${opcionIndex}`}
                        />
                        <Label htmlFor={`${pregunta.id}-${opcionIndex}`} className="flex-1 cursor-pointer">
                          {opcion}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  if (data.contenidos.length > 0) {
                    setStep("contenido");
                    setCurrentContentIndex(data.contenidos.length - 1);
                  } else {
                    setStep("bienvenida");
                  }
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={() => setStep("firma")}
                disabled={Object.keys(respuestas).length < data.preguntas.length}
                data-testid="button-ir-firma"
              >
                Continuar a Firma
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === "firma" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PenLine className="h-5 w-5" />
                Firma Digital
              </CardTitle>
              <CardDescription>
                Firme en el recuadro a continuación para confirmar que ha completado la inducción.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 bg-white">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={150}
                  className="w-full touch-none cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              <div className="flex justify-center">
                <Button variant="outline" size="sm" onClick={limpiarFirma}>
                  Limpiar Firma
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                <p><strong>Nombre:</strong> {data.worker.nombre}</p>
                <p><strong>Identificación:</strong> {data.worker.identificacion}</p>
                <p><strong>Fecha:</strong> {new Date().toLocaleDateString("es-CO")}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  Al firmar, declaro que he recibido, comprendido y acepto cumplir con las normas
                  de seguridad y salud en el trabajo establecidas por la empresa.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-4">
              <Button variant="outline" onClick={() => setStep("evaluacion")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <Button
                onClick={handleCompletarInduccion}
                disabled={!firmaBase64 || completarMutation.isPending}
                data-testid="button-completar-induccion"
              >
                {completarMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Completar Inducción
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {step === "completado" && (
          <Card className="text-center">
            <CardHeader>
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl text-green-600">Inducción Completada</CardTitle>
              <CardDescription className="text-base">
                Ha finalizado exitosamente la inducción de Seguridad y Salud en el Trabajo.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-green-800">
                  Su registro de inducción ha sido guardado automáticamente.
                  El área de SST recibirá una notificación de su completación.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Puede cerrar esta ventana.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
