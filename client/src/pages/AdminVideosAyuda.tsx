import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { HelpVideo } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Video, Loader2, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MODULE_LIST = [
  { route: "/dashboard", name: "Dashboard" },
  { route: "/trabajadores", name: "Trabajadores" },
  { route: "/capacitaciones", name: "Capacitaciones" },
  { route: "/inspecciones", name: "Inspecciones" },
  { route: "/accidentes", name: "Accidentes" },
  { route: "/examenes-medicos", name: "Exámenes Médicos" },
  { route: "/entrega-epp", name: "Entrega de EPP" },
  { route: "/evaluaciones-sst", name: "Evaluaciones SST" },
  { route: "/iperc", name: "IPERC - Matriz de Riesgos" },
  { route: "/politicas-sst", name: "Políticas SST" },
  { route: "/plan-emergencias", name: "Plan de Emergencias" },
  { route: "/programa-capacitacion-anual", name: "Programa de Capacitación Anual" },
  { route: "/copasst", name: "COPASST" },
  { route: "/vigilancia-epidemiologica", name: "Vigilancia Epidemiológica" },
  { route: "/mediciones-ambientales", name: "Mediciones Ambientales" },
  { route: "/sustancias-quimicas", name: "Sustancias Químicas" },
  { route: "/ausentismo-laboral", name: "Ausentismo Laboral" },
  { route: "/planes-trabajo-anual", name: "Planes de Trabajo Anual" },
  { route: "/auditorias-internas", name: "Auditorías Internas" },
  { route: "/pesv", name: "PESV - Seguridad Vial" },
  { route: "/indicadores-accidentalidad", name: "Indicadores de Accidentalidad" },
  { route: "/objetivos-sst", name: "Objetivos SST" },
  { route: "/matriz-legal", name: "Matriz Legal" },
  { route: "/perfiles-cargo", name: "Perfiles de Cargo" },
  { route: "/portal-empleados", name: "Portal del Empleado" },
  { route: "/conservacion-documentos", name: "Conservación de Documentos" },
  { route: "/informes", name: "Informes" },
  { route: "/mi-suscripcion", name: "Mi Suscripción" },
];

export default function AdminVideosAyuda() {
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<HelpVideo | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    moduleRoute: "",
    moduleName: "",
    videoUrl: "",
    videoTitle: "",
    isActive: true,
  });

  const { data: videos = [], isLoading } = useQuery<HelpVideo[]>({
    queryKey: ["/api/help-videos"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("POST", "/api/help-videos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-videos"] });
      toast({ title: "Video creado", description: "El video de ayuda se ha configurado correctamente." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<typeof formData> }) => {
      await apiRequest("PATCH", `/api/help-videos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-videos"] });
      toast({ title: "Video actualizado", description: "El video de ayuda se ha actualizado correctamente." });
      closeModal();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/help-videos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-videos"] });
      toast({ title: "Video eliminado", description: "El video de ayuda se ha eliminado correctamente." });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/help-videos/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/help-videos"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  function closeModal() {
    setShowModal(false);
    setEditingVideo(null);
    setFormData({ moduleRoute: "", moduleName: "", videoUrl: "", videoTitle: "", isActive: true });
  }

  function openCreate() {
    setEditingVideo(null);
    setFormData({ moduleRoute: "", moduleName: "", videoUrl: "", videoTitle: "", isActive: true });
    setShowModal(true);
  }

  function openEdit(video: HelpVideo) {
    setEditingVideo(video);
    setFormData({
      moduleRoute: video.moduleRoute,
      moduleName: video.moduleName,
      videoUrl: video.videoUrl,
      videoTitle: video.videoTitle,
      isActive: video.isActive,
    });
    setShowModal(true);
  }

  function handleModuleSelect(route: string) {
    const mod = MODULE_LIST.find((m) => m.route === route);
    if (mod) {
      setFormData((prev) => ({ ...prev, moduleRoute: mod.route, moduleName: mod.name }));
    }
  }

  function handleSubmit() {
    if (!formData.moduleRoute || !formData.videoUrl || !formData.videoTitle) {
      toast({ title: "Error", description: "Todos los campos son obligatorios.", variant: "destructive" });
      return;
    }
    if (editingVideo) {
      updateMutation.mutate({ id: editingVideo.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }

  const usedRoutes = videos.map((v) => v.moduleRoute);
  const availableModules = editingVideo
    ? MODULE_LIST
    : MODULE_LIST.filter((m) => !usedRoutes.includes(m.route));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]" data-testid="loading-videos">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-page-title">Videos de Ayuda por Módulo</h1>
          <p className="text-muted-foreground">Configure videos tutoriales de Guidde para cada módulo de la aplicación.</p>
        </div>
        <Button onClick={openCreate} data-testid="button-add-video">
          <Plus className="h-4 w-4 mr-2" />
          Agregar Video
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Videos Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {videos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground" data-testid="text-empty-state">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No hay videos de ayuda configurados.</p>
              <p className="text-sm">Haga clic en "Agregar Video" para comenzar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Título del Video</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video) => (
                    <TableRow key={video.id} data-testid={`row-video-${video.id}`}>
                      <TableCell className="font-medium" data-testid={`text-module-name-${video.id}`}>
                        {video.moduleName}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1.5 py-0.5 rounded" data-testid={`text-module-route-${video.id}`}>
                          {video.moduleRoute}
                        </code>
                      </TableCell>
                      <TableCell data-testid={`text-video-title-${video.id}`}>{video.videoTitle}</TableCell>
                      <TableCell>
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline text-sm truncate max-w-[200px] inline-block"
                          data-testid={`link-video-url-${video.id}`}
                        >
                          {video.videoUrl.length > 40 ? video.videoUrl.substring(0, 40) + "..." : video.videoUrl}
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={video.isActive}
                            onCheckedChange={(checked) =>
                              toggleActiveMutation.mutate({ id: video.id, isActive: checked })
                            }
                            data-testid={`switch-active-${video.id}`}
                          />
                          <Badge variant={video.isActive ? "default" : "secondary"} data-testid={`badge-status-${video.id}`}>
                            {video.isActive ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(video)} data-testid={`button-edit-${video.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => setDeleteId(video.id)} data-testid={`button-delete-${video.id}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          data-testid="dialog-video-form"
        >
          <div className="fixed inset-0 bg-black/50" />
          <div
            className="relative z-50 bg-background rounded-md border shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold" data-testid="text-modal-title">
              {editingVideo ? "Editar Video de Ayuda" : "Agregar Video de Ayuda"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {editingVideo
                ? "Modifique los datos del video de ayuda."
                : "Configure un video tutorial de Guidde para un módulo."}
            </p>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="module-select">Módulo</Label>
                <Select
                  value={formData.moduleRoute}
                  onValueChange={handleModuleSelect}
                  disabled={!!editingVideo}
                >
                  <SelectTrigger data-testid="select-module">
                    <SelectValue placeholder="Seleccione un módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModules.map((mod) => (
                      <SelectItem key={mod.route} value={mod.route} data-testid={`option-module-${mod.route}`}>
                        {mod.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-title">Título del Video</Label>
                <Input
                  id="video-title"
                  placeholder="Ej: Cómo gestionar trabajadores"
                  value={formData.videoTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoTitle: e.target.value }))}
                  data-testid="input-video-title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="video-url">URL del Video (Guidde)</Label>
                <Input
                  id="video-url"
                  placeholder="https://app.guidde.com/share/..."
                  value={formData.videoUrl}
                  onChange={(e) => setFormData((prev) => ({ ...prev, videoUrl: e.target.value }))}
                  data-testid="input-video-url"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  data-testid="switch-form-active"
                />
                <Label>Activo</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={closeModal} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingVideo ? "Actualizar" : "Guardar"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar video de ayuda?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El video de ayuda será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
