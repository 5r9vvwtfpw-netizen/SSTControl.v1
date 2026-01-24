import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  ClipboardCheck,
  BarChart3,
  Star,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

interface EvaluacionPeriodo {
  id: string;
  nombre: string;
  descripcion?: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  createdAt: string;
}

interface Competencia {
  id: string;
  nombre: string;
  descripcion?: string;
  dimension: string;
  activo: boolean;
}

interface EvaluacionAsignacion {
  id: string;
  periodoId: string;
  evaluadorId: string;
  evaluadoId: string;
  tipoEvaluador: string;
  estado: string;
  fechaCompletada?: string;
  evaluadorNombre?: string;
  evaluadoNombre?: string;
}

interface EvaluacionResultado {
  id: string;
  periodoId: string;
  evaluadoId: string;
  promedioGeneral: number;
  promediosPorDimension: Record<string, number>;
  fortalezas?: string[];
  oportunidades?: string[];
  evaluadoNombre?: string;
}

export default function CopasstEvaluaciones() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("periodos");
  const [periodoDialogOpen, setPeriodoDialogOpen] = useState(false);
  const [periodoEditando, setPeriodoEditando] = useState<EvaluacionPeriodo | null>(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<EvaluacionPeriodo | null>(null);
  const [competenciaDialogOpen, setCompetenciaDialogOpen] = useState(false);
  const [competenciaEditando, setCompetenciaEditando] = useState<Competencia | null>(null);

  const [periodoForm, setPeriodoForm] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    estado: "configuracion",
  });

  const [competenciaForm, setCompetenciaForm] = useState({
    nombre: "",
    descripcion: "",
    dimension: "tecnica",
    activo: true,
  });

  // Queries
  const { data: periodos = [], isLoading: periodosLoading } = useQuery<EvaluacionPeriodo[]>({
    queryKey: ["/api/copasst-evaluaciones/periodos"],
  });

  const { data: competencias = [], isLoading: competenciasLoading } = useQuery<Competencia[]>({
    queryKey: ["/api/copasst-evaluaciones/competencias"],
  });

  const asignacionesUrl = periodoSeleccionado ? `/api/copasst-evaluaciones/periodos/${periodoSeleccionado.id}/asignaciones` : "";
  const { data: asignaciones = [], isLoading: asignacionesLoading } = useQuery<EvaluacionAsignacion[]>({
    queryKey: [asignacionesUrl],
    enabled: !!periodoSeleccionado,
  });

  const resultadosUrl = periodoSeleccionado ? `/api/copasst-evaluaciones/periodos/${periodoSeleccionado.id}/resultados` : "";
  const { data: resultados = [], isLoading: resultadosLoading } = useQuery<EvaluacionResultado[]>({
    queryKey: [resultadosUrl],
    enabled: !!periodoSeleccionado && periodoSeleccionado.estado === "resultados",
  });

  const { data: misEvaluaciones = [] } = useQuery<EvaluacionAsignacion[]>({
    queryKey: ["/api/copasst-evaluaciones/mis-evaluaciones"],
  });

  // Mutations
  const crearPeriodoMutation = useMutation({
    mutationFn: async (data: typeof periodoForm) => {
      return apiRequest("POST", "/api/copasst-evaluaciones/periodos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/periodos"] });
      toast({ title: "Período de evaluación creado" });
      setPeriodoDialogOpen(false);
      resetPeriodoForm();
    },
    onError: () => {
      toast({ title: "Error al crear el período", variant: "destructive" });
    },
  });

  const actualizarPeriodoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof periodoForm> }) => {
      return apiRequest("PATCH", `/api/copasst-evaluaciones/periodos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/periodos"] });
      toast({ title: "Período actualizado" });
      setPeriodoDialogOpen(false);
      setPeriodoEditando(null);
      resetPeriodoForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar el período", variant: "destructive" });
    },
  });

  const eliminarPeriodoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-evaluaciones/periodos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/periodos"] });
      toast({ title: "Período eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar el período", variant: "destructive" });
    },
  });

  const crearCompetenciaMutation = useMutation({
    mutationFn: async (data: typeof competenciaForm) => {
      return apiRequest("POST", "/api/copasst-evaluaciones/competencias", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/competencias"] });
      toast({ title: "Competencia creada" });
      setCompetenciaDialogOpen(false);
      resetCompetenciaForm();
    },
    onError: () => {
      toast({ title: "Error al crear la competencia", variant: "destructive" });
    },
  });

  const actualizarCompetenciaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof competenciaForm> }) => {
      return apiRequest("PATCH", `/api/copasst-evaluaciones/competencias/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/competencias"] });
      toast({ title: "Competencia actualizada" });
      setCompetenciaDialogOpen(false);
      setCompetenciaEditando(null);
      resetCompetenciaForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar la competencia", variant: "destructive" });
    },
  });

  const eliminarCompetenciaMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-evaluaciones/competencias/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/copasst-evaluaciones/competencias"] });
      toast({ title: "Competencia eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar la competencia", variant: "destructive" });
    },
  });

  // Helpers
  const resetPeriodoForm = () => {
    setPeriodoForm({
      nombre: "",
      descripcion: "",
      fechaInicio: "",
      fechaFin: "",
      estado: "configuracion",
    });
  };

  const resetCompetenciaForm = () => {
    setCompetenciaForm({
      nombre: "",
      descripcion: "",
      dimension: "tecnica",
      activo: true,
    });
  };

  const handleEditPeriodo = (periodo: EvaluacionPeriodo) => {
    setPeriodoEditando(periodo);
    setPeriodoForm({
      nombre: periodo.nombre,
      descripcion: periodo.descripcion || "",
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      estado: periodo.estado,
    });
    setPeriodoDialogOpen(true);
  };

  const handleEditCompetencia = (competencia: Competencia) => {
    setCompetenciaEditando(competencia);
    setCompetenciaForm({
      nombre: competencia.nombre,
      descripcion: competencia.descripcion || "",
      dimension: competencia.dimension,
      activo: competencia.activo,
    });
    setCompetenciaDialogOpen(true);
  };

  const handleSubmitPeriodo = () => {
    if (periodoEditando) {
      actualizarPeriodoMutation.mutate({ id: periodoEditando.id, data: periodoForm });
    } else {
      crearPeriodoMutation.mutate(periodoForm);
    }
  };

  const handleSubmitCompetencia = () => {
    if (competenciaEditando) {
      actualizarCompetenciaMutation.mutate({ id: competenciaEditando.id, data: competenciaForm });
    } else {
      crearCompetenciaMutation.mutate(competenciaForm);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "configuracion":
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Configuración</Badge>;
      case "activo":
        return <Badge variant="default"><Play className="w-3 h-3 mr-1" />Activo</Badge>;
      case "cerrado":
        return <Badge variant="outline"><AlertCircle className="w-3 h-3 mr-1" />Cerrado</Badge>;
      case "resultados":
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Resultados</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      tecnica: "Técnica",
      interpersonal: "Interpersonal",
      liderazgo: "Liderazgo",
      cumplimiento: "Cumplimiento",
    };
    return labels[dimension] || dimension;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-end">
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Evaluaciones 360° COPASST</h1>
          <p className="text-muted-foreground">Gestión de evaluaciones de desempeño entre miembros del COPASST</p>
        </div>
        {misEvaluaciones.length > 0 && (
          <Badge variant="destructive" className="text-lg px-4 py-2">
            {misEvaluaciones.length} evaluaciones pendientes
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="periodos" data-testid="tab-periodos">
            <Calendar className="w-4 h-4 mr-2" />
            Períodos
          </TabsTrigger>
          <TabsTrigger value="competencias" data-testid="tab-competencias">
            <Star className="w-4 h-4 mr-2" />
            Competencias
          </TabsTrigger>
          <TabsTrigger value="asignaciones" data-testid="tab-asignaciones">
            <Users className="w-4 h-4 mr-2" />
            Asignaciones
          </TabsTrigger>
          <TabsTrigger value="resultados" data-testid="tab-resultados">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resultados
          </TabsTrigger>
        </TabsList>

        {/* Períodos Tab */}
        <TabsContent value="periodos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Períodos de Evaluación</CardTitle>
              <Button onClick={() => { resetPeriodoForm(); setPeriodoDialogOpen(true); }} data-testid="button-nuevo-periodo">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Período
              </Button>
            </CardHeader>
            <CardContent>
              {periodosLoading ? (
                <Skeleton className="h-40" />
              ) : periodos.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay períodos de evaluación. Crea el primero.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Fecha Inicio</TableHead>
                      <TableHead>Fecha Fin</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {periodos.map((periodo) => (
                      <TableRow key={periodo.id} data-testid={`row-periodo-${periodo.id}`}>
                        <TableCell className="font-medium">{periodo.nombre}</TableCell>
                        <TableCell>{periodo.fechaInicio}</TableCell>
                        <TableCell>{periodo.fechaFin}</TableCell>
                        <TableCell>{getEstadoBadge(periodo.estado)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="icon" onClick={() => setPeriodoSeleccionado(periodo)} data-testid={`button-ver-periodo-${periodo.id}`}>
                            <ClipboardCheck className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditPeriodo(periodo)} data-testid={`button-edit-periodo-${periodo.id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => eliminarPeriodoMutation.mutate(periodo.id)} data-testid={`button-delete-periodo-${periodo.id}`}>
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

        {/* Competencias Tab */}
        <TabsContent value="competencias" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle>Catálogo de Competencias</CardTitle>
              <Button onClick={() => { resetCompetenciaForm(); setCompetenciaDialogOpen(true); }} data-testid="button-nueva-competencia">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Competencia
              </Button>
            </CardHeader>
            <CardContent>
              {competenciasLoading ? (
                <Skeleton className="h-40" />
              ) : competencias.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No hay competencias definidas. Crea la primera.</p>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {competencias.map((competencia) => (
                    <Card key={competencia.id} data-testid={`card-competencia-${competencia.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">{competencia.nombre}</CardTitle>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditCompetencia(competencia)}>
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => eliminarCompetenciaMutation.mutate(competencia.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Badge variant="outline">{getDimensionLabel(competencia.dimension)}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{competencia.descripcion || "Sin descripción"}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Asignaciones Tab */}
        <TabsContent value="asignaciones" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asignaciones de Evaluación</CardTitle>
              <CardDescription>
                {periodoSeleccionado 
                  ? `Período: ${periodoSeleccionado.nombre}`
                  : "Selecciona un período en la pestaña Períodos para ver las asignaciones"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!periodoSeleccionado ? (
                <p className="text-muted-foreground text-center py-8">
                  Selecciona un período de evaluación primero
                </p>
              ) : asignacionesLoading ? (
                <Skeleton className="h-40" />
              ) : asignaciones.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay asignaciones en este período
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evaluador</TableHead>
                      <TableHead>Evaluado</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha Completada</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {asignaciones.map((asignacion) => (
                      <TableRow key={asignacion.id} data-testid={`row-asignacion-${asignacion.id}`}>
                        <TableCell>{asignacion.evaluadorNombre || asignacion.evaluadorId}</TableCell>
                        <TableCell>{asignacion.evaluadoNombre || asignacion.evaluadoId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asignacion.tipoEvaluador}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={asignacion.estado === "completada" ? "default" : "secondary"}>
                            {asignacion.estado}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {asignacion.fechaCompletada 
                            ? format(new Date(asignacion.fechaCompletada), "dd/MM/yyyy", { locale: es })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resultados Tab */}
        <TabsContent value="resultados" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resultados de Evaluación</CardTitle>
              <CardDescription>
                {periodoSeleccionado 
                  ? `Período: ${periodoSeleccionado.nombre}`
                  : "Selecciona un período con estado 'Resultados' para ver los resultados"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!periodoSeleccionado || periodoSeleccionado.estado !== "resultados" ? (
                <p className="text-muted-foreground text-center py-8">
                  Selecciona un período con estado "Resultados" para ver los resultados
                </p>
              ) : resultadosLoading ? (
                <Skeleton className="h-40" />
              ) : resultados.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No hay resultados disponibles
                </p>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {resultados.map((resultado) => (
                    <Card key={resultado.id} data-testid={`card-resultado-${resultado.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{resultado.evaluadoNombre || resultado.evaluadoId}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-bold">{Number(resultado.promedioGeneral).toFixed(1)}</span>
                          <span className="text-muted-foreground">/ 5.0</span>
                        </div>
                        <Progress value={(Number(resultado.promedioGeneral) / 5) * 100} className="h-2" />
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Por Dimensión</h4>
                          <div className="space-y-2">
                            {Object.entries(resultado.promediosPorDimension || {}).map(([dimension, valor]) => (
                              <div key={dimension} className="flex items-center justify-between text-sm">
                                <span>{getDimensionLabel(dimension)}</span>
                                <span className="font-medium">{Number(valor).toFixed(1)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {resultado.fortalezas && resultado.fortalezas.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-1 text-green-600">Fortalezas</h4>
                            <ul className="text-sm text-muted-foreground">
                              {resultado.fortalezas.map((f, i) => <li key={i}>• {f}</li>)}
                            </ul>
                          </div>
                        )}
                        {resultado.oportunidades && resultado.oportunidades.length > 0 && (
                          <div>
                            <h4 className="font-medium text-sm mb-1 text-orange-600">Oportunidades</h4>
                            <ul className="text-sm text-muted-foreground">
                              {resultado.oportunidades.map((o, i) => <li key={i}>• {o}</li>)}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Período Dialog */}
      <Dialog open={periodoDialogOpen} onOpenChange={setPeriodoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{periodoEditando ? "Editar Período" : "Nuevo Período de Evaluación"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="periodo-nombre">Nombre *</Label>
              <Input id="periodo-nombre" value={periodoForm.nombre} onChange={(e) => setPeriodoForm({ ...periodoForm, nombre: e.target.value })} placeholder="Evaluación Q4 2024" data-testid="input-periodo-nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodo-descripcion">Descripción</Label>
              <Textarea id="periodo-descripcion" value={periodoForm.descripcion} onChange={(e) => setPeriodoForm({ ...periodoForm, descripcion: e.target.value })} placeholder="Descripción del período" data-testid="input-periodo-descripcion" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="periodo-inicio">Fecha Inicio *</Label>
                <Input id="periodo-inicio" type="date" value={periodoForm.fechaInicio} onChange={(e) => setPeriodoForm({ ...periodoForm, fechaInicio: e.target.value })} data-testid="input-periodo-inicio" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="periodo-fin">Fecha Fin *</Label>
                <Input id="periodo-fin" type="date" value={periodoForm.fechaFin} onChange={(e) => setPeriodoForm({ ...periodoForm, fechaFin: e.target.value })} data-testid="input-periodo-fin" />
              </div>
            </div>
            {periodoEditando && (
              <div className="space-y-2">
                <Label htmlFor="periodo-estado">Estado</Label>
                <Select value={periodoForm.estado} onValueChange={(v) => setPeriodoForm({ ...periodoForm, estado: v })}>
                  <SelectTrigger data-testid="select-periodo-estado">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="configuracion">Configuración</SelectItem>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                    <SelectItem value="resultados">Resultados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodoDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitPeriodo} disabled={crearPeriodoMutation.isPending || actualizarPeriodoMutation.isPending} data-testid="button-guardar-periodo">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Competencia Dialog */}
      <Dialog open={competenciaDialogOpen} onOpenChange={setCompetenciaDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{competenciaEditando ? "Editar Competencia" : "Nueva Competencia"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="competencia-nombre">Nombre *</Label>
              <Input id="competencia-nombre" value={competenciaForm.nombre} onChange={(e) => setCompetenciaForm({ ...competenciaForm, nombre: e.target.value })} placeholder="Liderazgo en SST" data-testid="input-competencia-nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competencia-descripcion">Descripción</Label>
              <Textarea id="competencia-descripcion" value={competenciaForm.descripcion} onChange={(e) => setCompetenciaForm({ ...competenciaForm, descripcion: e.target.value })} placeholder="Descripción de la competencia" data-testid="input-competencia-descripcion" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="competencia-dimension">Dimensión</Label>
              <Select value={competenciaForm.dimension} onValueChange={(v) => setCompetenciaForm({ ...competenciaForm, dimension: v })}>
                <SelectTrigger data-testid="select-competencia-dimension">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecnica">Técnica</SelectItem>
                  <SelectItem value="interpersonal">Interpersonal</SelectItem>
                  <SelectItem value="liderazgo">Liderazgo</SelectItem>
                  <SelectItem value="cumplimiento">Cumplimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompetenciaDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmitCompetencia} disabled={crearCompetenciaMutation.isPending || actualizarCompetenciaMutation.isPending} data-testid="button-guardar-competencia">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
