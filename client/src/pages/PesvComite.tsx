import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowLeft, Users, FileText, FileDown } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ComiteIntegrantePesv, ActaComitePesv, Worker, insertComiteIntegrantePesvSchema, insertActaComitePesvSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";

type RolComite = "presidente" | "secretario" | "representante_direccion" | "representante_trabajadores" | "lider_pesv" | "coordinador_sst" | "otro";
type EstadoIntegrante = "activo" | "inactivo";
type EstadoActa = "borrador" | "aprobada" | "anulada";
type ModalidadReunion = "presencial" | "virtual" | "mixta";

const ROLES_COMITE: Record<RolComite, string> = {
  presidente: "Presidente",
  secretario: "Secretario",
  representante_direccion: "Representante Dirección",
  representante_trabajadores: "Representante Trabajadores",
  lider_pesv: "Líder PESV",
  coordinador_sst: "Coordinador SST",
  otro: "Otro"
};

const ESTADOS_ACTA: Record<EstadoActa, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  borrador: { label: "Borrador", variant: "secondary" },
  aprobada: { label: "Aprobada", variant: "default" },
  anulada: { label: "Anulada", variant: "destructive" }
};

export default function PesvComite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [activeTab, setActiveTab] = useState("integrantes");
  
  const [integranteDialogOpen, setIntegranteDialogOpen] = useState(false);
  const [editingIntegrante, setEditingIntegrante] = useState<ComiteIntegrantePesv | null>(null);
  const [integranteForm, setIntegranteForm] = useState<{
    nombre: string;
    cargo: string;
    rol: RolComite;
    email: string;
    telefono: string;
    fechaIngreso: string;
    workerId: string;
    observaciones: string;
  }>({
    nombre: "",
    cargo: "",
    rol: "otro",
    email: "",
    telefono: "",
    fechaIngreso: new Date().toISOString().split("T")[0],
    workerId: "",
    observaciones: ""
  });

  const [actaDialogOpen, setActaDialogOpen] = useState(false);
  const [editingActa, setEditingActa] = useState<ActaComitePesv | null>(null);
  const [actaForm, setActaForm] = useState<{
    numeroActa: number;
    fechaReunion: string;
    horaInicio: string;
    horaFin: string;
    lugar: string;
    modalidad: ModalidadReunion;
    temasOrdenDia: string;
    desarrolloReunion: string;
    compromisos: string;
    asistentesIds: string[];
    invitados: string;
    proximaReunion: string;
    estado: EstadoActa;
    observaciones: string;
  }>({
    numeroActa: 1,
    fechaReunion: new Date().toISOString().split("T")[0],
    horaInicio: "08:00",
    horaFin: "10:00",
    lugar: "",
    modalidad: "presencial",
    temasOrdenDia: "",
    desarrolloReunion: "",
    compromisos: "",
    asistentesIds: [],
    invitados: "",
    proximaReunion: "",
    estado: "borrador",
    observaciones: ""
  });

  const { data: integrantes = [], isLoading: integrantesLoading } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });

  const { data: actas = [], isLoading: actasLoading } = useQuery<ActaComitePesv[]>({
    queryKey: ["/api/pesv/comite/actas"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
    enabled: !!user?.companyId,
  });

  const handleWorkerSelect = (workerId: string) => {
    if (workerId === "manual") {
      setIntegranteForm({ ...integranteForm, workerId: "", nombre: "", cargo: "" });
      return;
    }
    const selectedWorker = workers.find(w => w.id === workerId);
    if (selectedWorker) {
      setIntegranteForm({
        ...integranteForm,
        workerId: selectedWorker.id,
        nombre: selectedWorker.name,
        email: selectedWorker.email || "",
        cargo: selectedWorker.position || ""
      });
    }
  };

  const createIntegranteMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pesv/comite/integrantes", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] });
      setIntegranteDialogOpen(false);
      resetIntegranteForm();
      toast({ title: "Integrante registrado", description: "El integrante se ha agregado al comité exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateIntegranteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/pesv/comite/integrantes/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] });
      setIntegranteDialogOpen(false);
      resetIntegranteForm();
      toast({ title: "Integrante actualizado", description: "Los datos se han actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteIntegranteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/pesv/comite/integrantes/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] });
      toast({ title: "Integrante eliminado", description: "El integrante se ha eliminado del comité" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const createActaMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/pesv/comite/actas", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] });
      setActaDialogOpen(false);
      resetActaForm();
      toast({ title: "Acta creada", description: "El acta de reunión se ha registrado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateActaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiRequest("PATCH", `/api/pesv/comite/actas/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] });
      setActaDialogOpen(false);
      resetActaForm();
      toast({ title: "Acta actualizada", description: "El acta se ha actualizado exitosamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteActaMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/pesv/comite/actas/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] });
      toast({ title: "Acta eliminada", description: "El acta se ha eliminado" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleIntegranteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...integranteForm,
      workerId: integranteForm.workerId || null,
      email: integranteForm.email || null,
      telefono: integranteForm.telefono || null,
      observaciones: integranteForm.observaciones || null,
      estado: "activo" as EstadoIntegrante
    };
    if (editingIntegrante) {
      updateIntegranteMutation.mutate({ id: editingIntegrante.id, data });
    } else {
      createIntegranteMutation.mutate(data);
    }
  };

  const handleActaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...actaForm,
      horaInicio: actaForm.horaInicio || null,
      horaFin: actaForm.horaFin || null,
      lugar: actaForm.lugar || null,
      desarrolloReunion: actaForm.desarrolloReunion || null,
      compromisos: actaForm.compromisos || null,
      asistentesIds: actaForm.asistentesIds,
      invitados: actaForm.invitados || null,
      proximaReunion: actaForm.proximaReunion || null,
      observaciones: actaForm.observaciones || null
    };
    if (editingActa) {
      updateActaMutation.mutate({ id: editingActa.id, data });
    } else {
      createActaMutation.mutate(data);
    }
  };

  const handleEditIntegrante = (integrante: ComiteIntegrantePesv) => {
    setEditingIntegrante(integrante);
    setIntegranteForm({
      nombre: integrante.nombre,
      cargo: integrante.cargo,
      rol: integrante.rol as RolComite,
      email: integrante.email || "",
      telefono: integrante.telefono || "",
      fechaIngreso: integrante.fechaIngreso,
      workerId: integrante.workerId || "",
      observaciones: integrante.observaciones || ""
    });
    setIntegranteDialogOpen(true);
  };

  const handleEditActa = (acta: ActaComitePesv) => {
    setEditingActa(acta);
    setActaForm({
      numeroActa: acta.numeroActa,
      fechaReunion: acta.fechaReunion,
      horaInicio: acta.horaInicio || "08:00",
      horaFin: acta.horaFin || "10:00",
      lugar: acta.lugar || "",
      modalidad: acta.modalidad as ModalidadReunion,
      temasOrdenDia: acta.temasOrdenDia,
      desarrolloReunion: acta.desarrolloReunion || "",
      compromisos: acta.compromisos || "",
      asistentesIds: acta.asistentesIds || [],
      invitados: acta.invitados || "",
      proximaReunion: acta.proximaReunion || "",
      estado: acta.estado as EstadoActa,
      observaciones: acta.observaciones || ""
    });
    setActaDialogOpen(true);
  };

  const handleToggleEstado = (integrante: ComiteIntegrantePesv) => {
    const newEstado = integrante.estado === "activo" ? "inactivo" : "activo";
    updateIntegranteMutation.mutate({ id: integrante.id, data: { estado: newEstado } });
  };

  const resetIntegranteForm = () => {
    setEditingIntegrante(null);
    setIntegranteForm({
      nombre: "",
      cargo: "",
      rol: "otro",
      email: "",
      telefono: "",
      fechaIngreso: new Date().toISOString().split("T")[0],
      workerId: "",
      observaciones: ""
    });
  };

  const resetActaForm = () => {
    setEditingActa(null);
    const nextNumero = actas.length > 0 ? Math.max(...actas.map(a => a.numeroActa)) + 1 : 1;
    setActaForm({
      numeroActa: nextNumero,
      fechaReunion: new Date().toISOString().split("T")[0],
      horaInicio: "08:00",
      horaFin: "10:00",
      lugar: "",
      modalidad: "presencial",
      temasOrdenDia: "",
      desarrolloReunion: "",
      compromisos: "",
      asistentesIds: [],
      invitados: "",
      proximaReunion: "",
      estado: "borrador",
      observaciones: ""
    });
  };

  const handleAsistentesChange = (integranteId: string) => {
    setActaForm(prev => {
      const current = prev.asistentesIds || [];
      if (current.includes(integranteId)) {
        return { ...prev, asistentesIds: current.filter(id => id !== integranteId) };
      } else {
        return { ...prev, asistentesIds: [...current, integranteId] };
      }
    });
  };

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const integrantesActivos = integrantes.filter(i => i.estado === "activo");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm" data-testid="button-back-pesv">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Panel PESV
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Comité de Seguridad Vial</h1>
          <p className="text-muted-foreground">Paso 2 - Planear (Aplica para nivel Estándar y Avanzado)</p>
        </div>
      </div>

      <TrazabilidadPesvBanner codigoPaso="P02" compacto />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="integrantes" data-testid="tab-integrantes">
            <Users className="h-4 w-4 mr-2" />
            Integrantes del Comité
          </TabsTrigger>
          <TabsTrigger value="actas" data-testid="tab-actas">
            <FileText className="h-4 w-4 mr-2" />
            Actas de Reuniones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrantes" className="mt-6">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div className="text-sm text-muted-foreground">
              {integrantes.length} integrantes registrados ({integrantesActivos.length} activos)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPdf('/api/pesv/comite/integrantes/pdf', 'integrantes-comite-pesv.pdf')}
                data-testid="button-download-integrantes-pdf"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Descargar PDF
              </Button>
            {isAdmin && (
              <Dialog open={integranteDialogOpen} onOpenChange={(open) => {
                setIntegranteDialogOpen(open);
                if (!open) resetIntegranteForm();
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-integrante">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Integrante
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingIntegrante ? "Editar Integrante" : "Agregar Integrante al Comité"}</DialogTitle>
                    <DialogDescription>Complete los datos del integrante del comité de seguridad vial</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleIntegranteSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {!editingIntegrante && (
                        <div className="space-y-2 col-span-2">
                          <Label>Vincular con Trabajador (opcional)</Label>
                          <Select value={integranteForm.workerId || "manual"} onValueChange={handleWorkerSelect}>
                            <SelectTrigger data-testid="select-worker">
                              <SelectValue placeholder="Seleccione un trabajador o ingrese manualmente" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="manual">Ingresar manualmente</SelectItem>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.id}>{worker.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre Completo *</Label>
                        <Input
                          id="nombre"
                          value={integranteForm.nombre}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, nombre: e.target.value })}
                          required
                          data-testid="input-nombre"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cargo">Cargo *</Label>
                        <Input
                          id="cargo"
                          value={integranteForm.cargo}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, cargo: e.target.value })}
                          required
                          data-testid="input-cargo"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rol">Rol en el Comité *</Label>
                        <Select value={integranteForm.rol} onValueChange={(v) => setIntegranteForm({ ...integranteForm, rol: v as RolComite })}>
                          <SelectTrigger data-testid="select-rol">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLES_COMITE).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={integranteForm.email}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, email: e.target.value })}
                          data-testid="input-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="telefono">Teléfono</Label>
                        <Input
                          id="telefono"
                          value={integranteForm.telefono}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, telefono: e.target.value })}
                          data-testid="input-telefono"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaIngreso">Fecha de Ingreso al Comité *</Label>
                        <Input
                          id="fechaIngreso"
                          type="date"
                          value={integranteForm.fechaIngreso}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, fechaIngreso: e.target.value })}
                          required
                          data-testid="input-fecha-ingreso"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="observaciones">Observaciones</Label>
                        <Textarea
                          id="observaciones"
                          value={integranteForm.observaciones}
                          onChange={(e) => setIntegranteForm({ ...integranteForm, observaciones: e.target.value })}
                          data-testid="textarea-observaciones"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIntegranteDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createIntegranteMutation.isPending || updateIntegranteMutation.isPending} data-testid="button-submit-integrante">
                        {editingIntegrante ? "Actualizar" : "Agregar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            </div>
          </div>

          {integrantesLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando integrantes...</div>
          ) : integrantes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay integrantes registrados en el comité</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Fecha Ingreso</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrantes.map((integrante) => (
                    <TableRow key={integrante.id} data-testid={`row-integrante-${integrante.id}`}>
                      <TableCell className="font-medium">{integrante.nombre}</TableCell>
                      <TableCell>{integrante.cargo}</TableCell>
                      <TableCell>{ROLES_COMITE[integrante.rol as RolComite] || integrante.rol}</TableCell>
                      <TableCell>{integrante.email || "-"}</TableCell>
                      <TableCell>{new Date(integrante.fechaIngreso).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={integrante.estado === "activo" ? "default" : "secondary"}>
                          {integrante.estado === "activo" ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {isAdmin && (
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="icon" onClick={() => handleEditIntegrante(integrante)} data-testid={`button-edit-integrante-${integrante.id}`}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleToggleEstado(integrante)} data-testid={`button-toggle-estado-${integrante.id}`}>
                              {integrante.estado === "activo" ? "Desactivar" : "Activar"}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar este integrante?")) deleteIntegranteMutation.mutate(integrante.id); }} data-testid={`button-delete-integrante-${integrante.id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="actas" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-muted-foreground">
              {actas.length} actas registradas
            </div>
            {isAdmin && (
              <Dialog open={actaDialogOpen} onOpenChange={(open) => {
                setActaDialogOpen(open);
                if (!open) resetActaForm();
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="button-add-acta">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Acta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingActa ? "Editar Acta" : "Nueva Acta de Reunión"}</DialogTitle>
                    <DialogDescription>Complete los datos del acta de reunión del comité</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleActaSubmit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="numeroActa">Nº Acta *</Label>
                        <Input
                          id="numeroActa"
                          type="number"
                          value={actaForm.numeroActa}
                          onChange={(e) => setActaForm({ ...actaForm, numeroActa: parseInt(e.target.value) || 1 })}
                          required
                          data-testid="input-numero-acta"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fechaReunion">Fecha de Reunión *</Label>
                        <Input
                          id="fechaReunion"
                          type="date"
                          value={actaForm.fechaReunion}
                          onChange={(e) => setActaForm({ ...actaForm, fechaReunion: e.target.value })}
                          required
                          data-testid="input-fecha-reunion"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="modalidad">Modalidad *</Label>
                        <Select value={actaForm.modalidad} onValueChange={(v) => setActaForm({ ...actaForm, modalidad: v as ModalidadReunion })}>
                          <SelectTrigger data-testid="select-modalidad">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="presencial">Presencial</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="mixta">Mixta</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaInicio">Hora Inicio</Label>
                        <Input
                          id="horaInicio"
                          type="time"
                          value={actaForm.horaInicio}
                          onChange={(e) => setActaForm({ ...actaForm, horaInicio: e.target.value })}
                          data-testid="input-hora-inicio"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="horaFin">Hora Fin</Label>
                        <Input
                          id="horaFin"
                          type="time"
                          value={actaForm.horaFin}
                          onChange={(e) => setActaForm({ ...actaForm, horaFin: e.target.value })}
                          data-testid="input-hora-fin"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lugar">Lugar</Label>
                        <Input
                          id="lugar"
                          value={actaForm.lugar}
                          onChange={(e) => setActaForm({ ...actaForm, lugar: e.target.value })}
                          data-testid="input-lugar"
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <Label htmlFor="temasOrdenDia">Temas del Orden del Día *</Label>
                        <Textarea
                          id="temasOrdenDia"
                          value={actaForm.temasOrdenDia}
                          onChange={(e) => setActaForm({ ...actaForm, temasOrdenDia: e.target.value })}
                          required
                          rows={3}
                          data-testid="textarea-temas"
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <Label htmlFor="desarrolloReunion">Desarrollo de la Reunión</Label>
                        <Textarea
                          id="desarrolloReunion"
                          value={actaForm.desarrolloReunion}
                          onChange={(e) => setActaForm({ ...actaForm, desarrolloReunion: e.target.value })}
                          rows={3}
                          data-testid="textarea-desarrollo"
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <Label htmlFor="compromisos">Compromisos</Label>
                        <Textarea
                          id="compromisos"
                          value={actaForm.compromisos}
                          onChange={(e) => setActaForm({ ...actaForm, compromisos: e.target.value })}
                          rows={3}
                          data-testid="textarea-compromisos"
                        />
                      </div>
                      <div className="space-y-2 col-span-3">
                        <Label>Asistentes del Comité</Label>
                        <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                          {integrantesActivos.length === 0 ? (
                            <span className="text-muted-foreground text-sm">No hay integrantes activos</span>
                          ) : (
                            integrantesActivos.map((integrante) => (
                              <label key={integrante.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={actaForm.asistentesIds.includes(integrante.id)}
                                  onChange={() => handleAsistentesChange(integrante.id)}
                                  className="rounded"
                                  data-testid={`checkbox-asistente-${integrante.id}`}
                                />
                                <span className="text-sm">{integrante.nombre}</span>
                              </label>
                            ))
                          )}
                        </div>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="invitados">Invitados Externos</Label>
                        <Input
                          id="invitados"
                          value={actaForm.invitados}
                          onChange={(e) => setActaForm({ ...actaForm, invitados: e.target.value })}
                          placeholder="Nombres de invitados separados por coma"
                          data-testid="input-invitados"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="proximaReunion">Próxima Reunión</Label>
                        <Input
                          id="proximaReunion"
                          type="date"
                          value={actaForm.proximaReunion}
                          onChange={(e) => setActaForm({ ...actaForm, proximaReunion: e.target.value })}
                          data-testid="input-proxima-reunion"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="estado">Estado *</Label>
                        <Select value={actaForm.estado} onValueChange={(v) => setActaForm({ ...actaForm, estado: v as EstadoActa })}>
                          <SelectTrigger data-testid="select-estado-acta">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="borrador">Borrador</SelectItem>
                            <SelectItem value="aprobada">Aprobada</SelectItem>
                            <SelectItem value="anulada">Anulada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="observacionesActa">Observaciones</Label>
                        <Textarea
                          id="observacionesActa"
                          value={actaForm.observaciones}
                          onChange={(e) => setActaForm({ ...actaForm, observaciones: e.target.value })}
                          data-testid="textarea-observaciones-acta"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setActaDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createActaMutation.isPending || updateActaMutation.isPending} data-testid="button-submit-acta">
                        {editingActa ? "Actualizar" : "Guardar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {actasLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando actas...</div>
          ) : actas.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay actas de reuniones registradas</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº Acta</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Modalidad</TableHead>
                    <TableHead>Temas</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {actas.map((acta) => (
                    <TableRow key={acta.id} data-testid={`row-acta-${acta.id}`}>
                      <TableCell className="font-medium">Acta {acta.numeroActa}</TableCell>
                      <TableCell>{new Date(acta.fechaReunion).toLocaleDateString()}</TableCell>
                      <TableCell className="capitalize">{acta.modalidad}</TableCell>
                      <TableCell className="max-w-xs truncate">{acta.temasOrdenDia}</TableCell>
                      <TableCell>
                        <Badge variant={ESTADOS_ACTA[acta.estado as EstadoActa]?.variant || "secondary"}>
                          {ESTADOS_ACTA[acta.estado as EstadoActa]?.label || acta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDownloadPdf(`/api/pesv/comite/actas/${acta.id}/pdf`, `acta-comite-pesv-${acta.numeroActa}.pdf`)}
                            data-testid={`button-download-acta-pdf-${acta.id}`}
                          >
                            <FileDown className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <>
                              <Button variant="ghost" size="icon" onClick={() => handleEditActa(acta)} data-testid={`button-edit-acta-${acta.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => { if (confirm("¿Eliminar esta acta?")) deleteActaMutation.mutate(acta.id); }} data-testid={`button-delete-acta-${acta.id}`}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}