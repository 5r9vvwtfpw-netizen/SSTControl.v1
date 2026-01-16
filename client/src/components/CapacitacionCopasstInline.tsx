import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Award,
  CheckCircle2,
  GraduationCap,
  FileText,
  PlayCircle,
} from "lucide-react";

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

export default function CapacitacionCopasstInline() {
  const { toast } = useToast();
  
  // Course dialog state
  const [cursoDialogOpen, setCursoDialogOpen] = useState(false);
  const [cursoEditando, setCursoEditando] = useState<Curso | null>(null);
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null);
  
  // Lesson dialog state
  const [leccionDialogOpen, setLeccionDialogOpen] = useState(false);
  const [leccionEditando, setLeccionEditando] = useState<Leccion | null>(null);
  const [cursoParaLeccion, setCursoParaLeccion] = useState<string | null>(null);

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

  // Query cursos
  const { data: cursos = [], isLoading: cursosLoading } = useQuery<Curso[]>({
    queryKey: ["/api/copasst-capacitacion/cursos"],
  });

  // Query lecciones del curso expandido
  const leccionesUrl = cursoExpandido ? `/api/copasst-capacitacion/cursos/${cursoExpandido}/lecciones` : "";
  const { data: lecciones = [], isLoading: leccionesLoading } = useQuery<Leccion[]>({
    queryKey: [leccionesUrl],
    enabled: !!cursoExpandido,
  });

  // Mutations
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
    onError: () => {
      toast({ title: "Error al crear el curso", variant: "destructive" });
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
      // Limpiar selección si se eliminó el curso expandido
      if (cursoExpandido === deletedCursoId) {
        setCursoExpandido(null);
      }
      toast({ title: "Curso eliminado" });
    },
    onError: () => {
      toast({ title: "Error al eliminar el curso", variant: "destructive" });
    },
  });

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
      toast({ title: "Lección actualizada exitosamente" });
      setLeccionDialogOpen(false);
      setLeccionEditando(null);
      resetLeccionForm();
    },
    onError: () => {
      toast({ title: "Error al actualizar la lección", variant: "destructive" });
    },
  });

  const eliminarLeccionMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/copasst-capacitacion/lecciones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [leccionesUrl] });
      toast({ title: "Lección eliminada" });
    },
    onError: () => {
      toast({ title: "Error al eliminar la lección", variant: "destructive" });
    },
  });

  // Form helpers
  const resetCursoForm = () => {
    setCursoForm({
      codigo: "",
      titulo: "",
      descripcion: "",
      duracionMinutos: 15,
      ordenCurso: cursos.length + 1,
      esObligatorio: true,
      puntosCompletar: 100,
      activo: true,
    });
  };

  const resetLeccionForm = () => {
    setLeccionForm({
      titulo: "",
      contenidoHtml: "",
      videoUrl: "",
      duracionMinutos: 5,
      ordenLeccion: lecciones.length + 1,
      puntosCompletar: 10,
      activo: true,
    });
  };

  const openEditCurso = (curso: Curso) => {
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
    });
    setCursoDialogOpen(true);
  };

  const openNuevoCurso = () => {
    setCursoEditando(null);
    resetCursoForm();
    setCursoDialogOpen(true);
  };

  const openNuevaLeccion = (cursoId: string) => {
    setCursoParaLeccion(cursoId);
    setLeccionEditando(null);
    resetLeccionForm();
    setLeccionDialogOpen(true);
  };

  const openEditLeccion = (leccion: Leccion) => {
    setLeccionEditando(leccion);
    setCursoParaLeccion(leccion.cursoId);
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

  const handleSubmitCurso = () => {
    if (cursoEditando) {
      actualizarCursoMutation.mutate({ id: cursoEditando.id, data: cursoForm });
    } else {
      crearCursoMutation.mutate(cursoForm);
    }
  };

  const handleSubmitLeccion = () => {
    if (!cursoParaLeccion) return;
    
    if (leccionEditando) {
      actualizarLeccionMutation.mutate({ id: leccionEditando.id, data: leccionForm });
    } else {
      crearLeccionMutation.mutate({ ...leccionForm, cursoId: cursoParaLeccion });
    }
  };

  if (cursosLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con botón crear */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-blue-600" />
          <h4 className="font-medium text-gray-800 dark:text-gray-200">
            Cursos de Capacitación COPASST
          </h4>
          <Badge variant="secondary" className="text-xs">
            {cursos.length} {cursos.length === 1 ? "curso" : "cursos"}
          </Badge>
        </div>
        <Button 
          size="sm" 
          onClick={openNuevoCurso}
          data-testid="button-crear-curso-inline"
        >
          <Plus className="h-4 w-4 mr-1" />
          Crear Curso
        </Button>
      </div>

      {/* Lista de cursos */}
      {cursos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              No hay cursos creados todavía
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Crea el primer curso para capacitar a los miembros del COPASST
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-4"
              onClick={openNuevoCurso}
              data-testid="button-crear-primer-curso"
            >
              <Plus className="h-4 w-4 mr-1" />
              Crear Primer Curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion 
          type="single" 
          collapsible 
          value={cursoExpandido || undefined}
          onValueChange={(val) => setCursoExpandido(val || null)}
          className="space-y-2"
        >
          {cursos.sort((a, b) => a.ordenCurso - b.ordenCurso).map((curso) => (
            <AccordionItem 
              key={curso.id} 
              value={curso.id}
              className="border rounded-lg overflow-hidden"
              data-testid={`curso-item-${curso.id}`}
            >
              <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex items-center gap-3 flex-1">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  <div className="text-left flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{curso.titulo}</span>
                      {curso.esObligatorio && (
                        <Badge variant="outline" className="text-xs">Obligatorio</Badge>
                      )}
                      {!curso.activo && (
                        <Badge variant="secondary" className="text-xs">Inactivo</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {curso.duracionMinutos} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        {curso.puntosCompletar} pts
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditCurso(curso)}
                      data-testid={`button-editar-curso-${curso.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm("¿Eliminar este curso?")) {
                          eliminarCursoMutation.mutate(curso.id);
                        }
                      }}
                      data-testid={`button-eliminar-curso-${curso.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {curso.descripcion && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {curso.descripcion}
                  </p>
                )}
                
                {/* Lecciones del curso */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Lecciones
                    </h5>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openNuevaLeccion(curso.id)}
                      data-testid={`button-agregar-leccion-${curso.id}`}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Lección
                    </Button>
                  </div>
                  
                  {cursoExpandido === curso.id && leccionesLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : lecciones.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center border rounded-lg border-dashed">
                      Sin lecciones. Agrega la primera lección.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {lecciones.sort((a, b) => a.ordenLeccion - b.ordenLeccion).map((leccion, idx) => (
                        <div 
                          key={leccion.id}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                          data-testid={`leccion-item-${leccion.id}`}
                        >
                          <span className="text-sm font-medium text-gray-400 w-6">
                            {idx + 1}.
                          </span>
                          {leccion.videoUrl ? (
                            <PlayCircle className="h-4 w-4 text-blue-500" />
                          ) : (
                            <FileText className="h-4 w-4 text-gray-400" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{leccion.titulo}</p>
                            <p className="text-xs text-gray-500">
                              {leccion.duracionMinutos} min · {leccion.puntosCompletar} pts
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => openEditLeccion(leccion)}
                              data-testid={`button-editar-leccion-${leccion.id}`}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => {
                                if (confirm("¿Eliminar esta lección?")) {
                                  eliminarLeccionMutation.mutate(leccion.id);
                                }
                              }}
                              data-testid={`button-eliminar-leccion-${leccion.id}`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Dialog Curso */}
      <Dialog open={cursoDialogOpen} onOpenChange={setCursoDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {cursoEditando ? "Editar Curso" : "Crear Nuevo Curso"}
            </DialogTitle>
            <DialogDescription>
              {cursoEditando 
                ? "Modifica los datos del curso de capacitación"
                : "Crea un nuevo curso de capacitación para los miembros del COPASST"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Código *</Label>
                <Input
                  value={cursoForm.codigo}
                  onChange={(e) => setCursoForm({ ...cursoForm, codigo: e.target.value })}
                  placeholder="COP-001"
                  data-testid="input-curso-codigo"
                />
              </div>
              <div>
                <Label>Duración (minutos) *</Label>
                <Input
                  type="number"
                  value={cursoForm.duracionMinutos || ''}
                  onChange={(e) => setCursoForm({ ...cursoForm, duracionMinutos: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || cursoForm.duracionMinutos === '') setCursoForm(prev => ({ ...prev, duracionMinutos: 0 })); }}
                  data-testid="input-curso-duracion"
                />
              </div>
            </div>
            
            <div>
              <Label>Título *</Label>
              <Input
                value={cursoForm.titulo}
                onChange={(e) => setCursoForm({ ...cursoForm, titulo: e.target.value })}
                placeholder="Funciones del COPASST"
                data-testid="input-curso-titulo"
              />
            </div>
            
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={cursoForm.descripcion}
                onChange={(e) => setCursoForm({ ...cursoForm, descripcion: e.target.value })}
                placeholder="Descripción del contenido del curso..."
                rows={3}
                data-testid="input-curso-descripcion"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={cursoForm.ordenCurso || ''}
                  onChange={(e) => setCursoForm({ ...cursoForm, ordenCurso: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || cursoForm.ordenCurso === '') setCursoForm(prev => ({ ...prev, ordenCurso: 1 })); }}
                  data-testid="input-curso-orden"
                />
              </div>
              <div>
                <Label>Puntos al completar</Label>
                <Input
                  type="number"
                  value={cursoForm.puntosCompletar || ''}
                  onChange={(e) => setCursoForm({ ...cursoForm, puntosCompletar: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || cursoForm.puntosCompletar === '') setCursoForm(prev => ({ ...prev, puntosCompletar: 0 })); }}
                  data-testid="input-curso-puntos"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="esObligatorio"
                  checked={cursoForm.esObligatorio}
                  onCheckedChange={(checked) => setCursoForm({ ...cursoForm, esObligatorio: !!checked })}
                  data-testid="checkbox-curso-obligatorio"
                />
                <Label htmlFor="esObligatorio" className="cursor-pointer">Obligatorio</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="activo"
                  checked={cursoForm.activo}
                  onCheckedChange={(checked) => setCursoForm({ ...cursoForm, activo: !!checked })}
                  data-testid="checkbox-curso-activo"
                />
                <Label htmlFor="activo" className="cursor-pointer">Activo</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCursoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitCurso}
              disabled={!cursoForm.codigo || !cursoForm.titulo || crearCursoMutation.isPending || actualizarCursoMutation.isPending}
              data-testid="button-guardar-curso"
            >
              {(crearCursoMutation.isPending || actualizarCursoMutation.isPending) 
                ? "Guardando..." 
                : (cursoEditando ? "Actualizar" : "Crear Curso")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Lección */}
      <Dialog open={leccionDialogOpen} onOpenChange={setLeccionDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {leccionEditando ? "Editar Lección" : "Agregar Nueva Lección"}
            </DialogTitle>
            <DialogDescription>
              {leccionEditando 
                ? "Modifica los datos de la lección"
                : "Agrega una nueva lección al curso"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={leccionForm.titulo}
                onChange={(e) => setLeccionForm({ ...leccionForm, titulo: e.target.value })}
                placeholder="Introducción al COPASST"
                data-testid="input-leccion-titulo"
              />
            </div>
            
            <div>
              <Label>Contenido HTML</Label>
              <Textarea
                value={leccionForm.contenidoHtml}
                onChange={(e) => setLeccionForm({ ...leccionForm, contenidoHtml: e.target.value })}
                placeholder="<p>Contenido de la lección...</p>"
                rows={5}
                data-testid="input-leccion-contenido"
              />
            </div>
            
            <div>
              <Label>URL de Video (opcional)</Label>
              <Input
                value={leccionForm.videoUrl}
                onChange={(e) => setLeccionForm({ ...leccionForm, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                data-testid="input-leccion-video"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Duración (min)</Label>
                <Input
                  type="number"
                  value={leccionForm.duracionMinutos || ''}
                  onChange={(e) => setLeccionForm({ ...leccionForm, duracionMinutos: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || leccionForm.duracionMinutos === '') setLeccionForm(prev => ({ ...prev, duracionMinutos: 0 })); }}
                  data-testid="input-leccion-duracion"
                />
              </div>
              <div>
                <Label>Orden</Label>
                <Input
                  type="number"
                  value={leccionForm.ordenLeccion || ''}
                  onChange={(e) => setLeccionForm({ ...leccionForm, ordenLeccion: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || leccionForm.ordenLeccion === '') setLeccionForm(prev => ({ ...prev, ordenLeccion: 1 })); }}
                  data-testid="input-leccion-orden"
                />
              </div>
              <div>
                <Label>Puntos</Label>
                <Input
                  type="number"
                  value={leccionForm.puntosCompletar || ''}
                  onChange={(e) => setLeccionForm({ ...leccionForm, puntosCompletar: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
                  onBlur={(e) => { if (e.target.value === '' || leccionForm.puntosCompletar === '') setLeccionForm(prev => ({ ...prev, puntosCompletar: 0 })); }}
                  data-testid="input-leccion-puntos"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                id="leccionActiva"
                checked={leccionForm.activo}
                onCheckedChange={(checked) => setLeccionForm({ ...leccionForm, activo: !!checked })}
                data-testid="checkbox-leccion-activa"
              />
              <Label htmlFor="leccionActiva" className="cursor-pointer">Lección activa</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLeccionDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitLeccion}
              disabled={!leccionForm.titulo || crearLeccionMutation.isPending || actualizarLeccionMutation.isPending}
              data-testid="button-guardar-leccion"
            >
              {(crearLeccionMutation.isPending || actualizarLeccionMutation.isPending) 
                ? "Guardando..." 
                : (leccionEditando ? "Actualizar" : "Agregar Lección")
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
