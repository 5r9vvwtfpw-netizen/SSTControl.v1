import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Pencil, Trash2, ArrowLeft, Users, FileText, FileDown, Stamp, CalendarDays, CheckCircle2, XCircle, AlertCircle, Calendar } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ComiteIntegrantePesv, ActaComitePesv, Worker, ActoAdministrativoPesv, CronogramaReunionPesv } from "@shared/schema";
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

const FUNCIONES_POR_ROL: Record<RolComite, string> = {
  presidente: "Presidir las sesiones del comité, convocar reuniones extraordinarias, aprobar el orden del día, representar al comité ante la alta dirección, garantizar el cumplimiento de los compromisos adquiridos.",
  secretario: "Elaborar y custodiar las actas de reunión, gestionar la correspondencia del comité, llevar el control del cronograma de reuniones, mantener actualizado el archivo documental del PESV.",
  representante_direccion: "Representar los intereses de la alta dirección, gestionar la asignación de recursos, reportar avances del PESV a la gerencia, facilitar la toma de decisiones estratégicas.",
  representante_trabajadores: "Representar los intereses de los trabajadores, canalizar inquietudes y propuestas, participar en la identificación de riesgos viales, promover la cultura de seguridad vial.",
  lider_pesv: "Coordinar la implementación del PESV, realizar seguimiento a indicadores, gestionar el plan de acción, coordinar capacitaciones, presentar informes de gestión al comité.",
  coordinador_sst: "Articular el PESV con el SG-SST, identificar riesgos viales en la matriz de peligros, coordinar investigación de siniestros viales, gestionar el reporte de condiciones inseguras.",
  otro: ""
};

const ESTADOS_ACTA: Record<EstadoActa, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  borrador: { label: "Borrador", variant: "secondary" },
  aprobada: { label: "Aprobada", variant: "default" },
  anulada: { label: "Anulada", variant: "destructive" }
};

const ESTADOS_REUNION: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  programada: { label: "Programada", variant: "outline" },
  realizada: { label: "Realizada", variant: "default" },
  cancelada: { label: "Cancelada", variant: "destructive" },
  reprogramada: { label: "Reprogramada", variant: "secondary" }
};

function VerificacionP01Banner() {
  const { data: verificacion, isLoading } = useQuery<{
    criterios: Array<{ nombre: string; cumple: boolean; detalle: string }>;
    cumplimientoTotal: number;
    totalCriterios: number;
    porcentaje: number;
  }>({
    queryKey: ["/api/pesv/comite/verificacion-p01"],
  });

  if (isLoading || !verificacion) return null;

  const allCumple = verificacion.porcentaje === 100;

  return (
    <Card className={allCumple ? "border-green-500/30" : "border-orange-500/30"} data-testid="card-verificacion-p01">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {allCumple ? <CheckCircle2 className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-orange-500" />}
          Auto-verificación P01 — {verificacion.porcentaje}% de cumplimiento
        </CardTitle>
        <CardDescription>Criterios de verificación según Resolución 40595/2022, Art. 5</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {verificacion.criterios.map((c, i) => (
            <div key={i} className="flex items-start gap-2 text-sm" data-testid={`verificacion-criterio-${i}`}>
              {c.cumple
                ? <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
              <div>
                <span className="font-medium">{c.nombre}:</span>{" "}
                <span className="text-muted-foreground">{c.detalle}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PesvComite() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const [activeTab, setActiveTab] = useState("integrantes");

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Conformación del Equipo de Trabajo PESV</h1>
          <p className="text-muted-foreground">Paso 1 (P01) — Planear · Resolución 40595/2022, Art. 5 · Aplica: Básico, Estándar, Avanzado</p>
        </div>
      </div>

      <TrazabilidadPesvBanner codigoPaso="P01" compacto />
      <VerificacionP01Banner />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="integrantes" data-testid="tab-integrantes">
            <Users className="h-4 w-4 mr-2" />
            Integrantes
          </TabsTrigger>
          <TabsTrigger value="acto-administrativo" data-testid="tab-acto-administrativo">
            <Stamp className="h-4 w-4 mr-2" />
            Acto Administrativo
          </TabsTrigger>
          <TabsTrigger value="cronograma" data-testid="tab-cronograma">
            <CalendarDays className="h-4 w-4 mr-2" />
            Cronograma
          </TabsTrigger>
          <TabsTrigger value="actas" data-testid="tab-actas">
            <FileText className="h-4 w-4 mr-2" />
            Actas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrantes" className="mt-6">
          <IntegrantesTab isAdmin={isAdmin} toast={toast} />
        </TabsContent>

        <TabsContent value="acto-administrativo" className="mt-6">
          <ActoAdministrativoTab isAdmin={isAdmin} toast={toast} />
        </TabsContent>

        <TabsContent value="cronograma" className="mt-6">
          <CronogramaTab isAdmin={isAdmin} toast={toast} />
        </TabsContent>

        <TabsContent value="actas" className="mt-6">
          <ActasTab isAdmin={isAdmin} toast={toast} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrantesTab({ isAdmin, toast }: { isAdmin: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ComiteIntegrantePesv | null>(null);
  const [form, setForm] = useState({
    nombre: "", cargo: "", rol: "otro" as RolComite, funcionesResponsabilidades: "",
    email: "", telefono: "", fechaIngreso: new Date().toISOString().split("T")[0],
    workerId: "", observaciones: ""
  });

  const { data: integrantes = [], isLoading } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const resetForm = () => {
    setEditing(null);
    setForm({ nombre: "", cargo: "", rol: "otro", funcionesResponsabilidades: "", email: "", telefono: "", fechaIngreso: new Date().toISOString().split("T")[0], workerId: "", observaciones: "" });
  };

  const handleWorkerSelect = (workerId: string) => {
    if (workerId === "manual") {
      setForm({ ...form, workerId: "", nombre: "", cargo: "" });
      return;
    }
    const w = workers.find(w => w.id === workerId);
    if (w) setForm({ ...form, workerId: w.id, nombre: w.name, email: w.email || "", cargo: w.position || "" });
  };

  const handleRolChange = (rol: RolComite) => {
    const funciones = FUNCIONES_POR_ROL[rol] || "";
    setForm({ ...form, rol, funcionesResponsabilidades: form.funcionesResponsabilidades || funciones });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pesv/comite/integrantes", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setDialogOpen(false); resetForm(); toast({ title: "Integrante registrado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PATCH", `/api/pesv/comite/integrantes/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setDialogOpen(false); resetForm(); toast({ title: "Integrante actualizado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/pesv/comite/integrantes/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/integrantes"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); toast({ title: "Integrante eliminado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, workerId: form.workerId || null, email: form.email || null, telefono: form.telefono || null, observaciones: form.observaciones || null, funcionesResponsabilidades: form.funcionesResponsabilidades || null, estado: "activo" as EstadoIntegrante };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (i: ComiteIntegrantePesv) => {
    setEditing(i);
    setForm({ nombre: i.nombre, cargo: i.cargo, rol: i.rol as RolComite, funcionesResponsabilidades: i.funcionesResponsabilidades || "", email: i.email || "", telefono: i.telefono || "", fechaIngreso: i.fechaIngreso, workerId: i.workerId || "", observaciones: i.observaciones || "" });
    setDialogOpen(true);
  };

  const handleToggleEstado = (i: ComiteIntegrantePesv) => {
    updateMutation.mutate({ id: i.id, data: { estado: i.estado === "activo" ? "inactivo" : "activo" } });
  };

  const integrantesActivos = integrantes.filter(i => i.estado === "activo");
  const sinFunciones = integrantesActivos.filter(i => !i.funcionesResponsabilidades || i.funcionesResponsabilidades.trim() === "");

  return (
    <>
      {sinFunciones.length > 0 && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 mb-4" data-testid="alert-sin-funciones">
          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <p className="text-sm text-orange-700 dark:text-orange-300">
            {sinFunciones.length} integrante(s) activo(s) sin funciones y responsabilidades definidas: {sinFunciones.map(i => i.nombre).join(", ")}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          {integrantes.length} integrantes ({integrantesActivos.length} activos)
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { const link = document.createElement('a'); link.href = '/api/pesv/comite/integrantes/pdf'; link.target = '_blank'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }} data-testid="button-download-integrantes-pdf">
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-integrante"><Plus className="h-4 w-4 mr-2" /> Agregar</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Editar Integrante" : "Agregar Integrante"}</DialogTitle>
                  <DialogDescription>Datos del integrante del equipo PESV según Res. 40595/2022</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {!editing && (
                      <div className="space-y-2 col-span-2">
                        <Label>Vincular con Trabajador (opcional)</Label>
                        <Select value={form.workerId || "manual"} onValueChange={handleWorkerSelect}>
                          <SelectTrigger data-testid="select-worker"><SelectValue placeholder="Seleccione o ingrese manualmente" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Ingresar manualmente</SelectItem>
                            {workers.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label>Nombre Completo *</Label>
                      <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required data-testid="input-nombre" />
                    </div>
                    <div className="space-y-2">
                      <Label>Cargo *</Label>
                      <Input value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} required data-testid="input-cargo" />
                    </div>
                    <div className="space-y-2">
                      <Label>Rol en el Equipo *</Label>
                      <Select value={form.rol} onValueChange={(v) => handleRolChange(v as RolComite)}>
                        <SelectTrigger data-testid="select-rol"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLES_COMITE).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} data-testid="input-email" />
                    </div>
                    <div className="space-y-2">
                      <Label>Teléfono</Label>
                      <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} data-testid="input-telefono" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha Ingreso *</Label>
                      <Input type="date" value={form.fechaIngreso} onChange={e => setForm({ ...form, fechaIngreso: e.target.value })} required data-testid="input-fecha-ingreso" />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Funciones y Responsabilidades *</Label>
                      <Textarea value={form.funcionesResponsabilidades} onChange={e => setForm({ ...form, funcionesResponsabilidades: e.target.value })} rows={4} placeholder="Describa las funciones y responsabilidades específicas de este integrante en el equipo PESV..." data-testid="textarea-funciones" />
                      {form.rol !== "otro" && !form.funcionesResponsabilidades && (
                        <Button type="button" variant="outline" size="sm" onClick={() => setForm({ ...form, funcionesResponsabilidades: FUNCIONES_POR_ROL[form.rol] })}>
                          Cargar funciones sugeridas para {ROLES_COMITE[form.rol]}
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Observaciones</Label>
                      <Textarea value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} data-testid="textarea-observaciones" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-integrante">
                      {editing ? "Actualizar" : "Agregar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando integrantes...</div>
      ) : integrantes.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No hay integrantes registrados</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Funciones</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrantes.map(i => (
                <TableRow key={i.id} data-testid={`row-integrante-${i.id}`}>
                  <TableCell className="font-medium">{i.nombre}</TableCell>
                  <TableCell>{i.cargo}</TableCell>
                  <TableCell>{ROLES_COMITE[i.rol as RolComite] || i.rol}</TableCell>
                  <TableCell className="max-w-[200px]">
                    {i.funcionesResponsabilidades
                      ? <span className="text-sm text-muted-foreground line-clamp-2">{i.funcionesResponsabilidades}</span>
                      : <Badge variant="destructive">Sin definir</Badge>
                    }
                  </TableCell>
                  <TableCell>
                    <Badge variant={i.estado === "activo" ? "default" : "secondary"}
                      className={isAdmin ? "cursor-pointer" : ""}
                      onClick={() => isAdmin && handleToggleEstado(i)}>
                      {i.estado === "activo" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(i)} data-testid={`button-edit-${i.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("¿Eliminar integrante?")) deleteMutation.mutate(i.id); }} data-testid={`button-delete-${i.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

function ActoAdministrativoTab({ isAdmin, toast }: { isAdmin: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActoAdministrativoPesv | null>(null);
  const [form, setForm] = useState({
    tipoDocumento: "Resolución", numeroDocumento: "", fechaExpedicion: new Date().toISOString().split("T")[0],
    fechaVigencia: "", firmadoPor: "", cargoFirmante: "Representante Legal",
    objetoConformacion: "Conformar el equipo de trabajo para el diseño, implementación y seguimiento del Plan Estratégico de Seguridad Vial (PESV) de la organización, en cumplimiento de la Resolución 40595 de 2022 del Ministerio de Transporte.",
    considerandos: "Que la Ley 1503 de 2011 establece la obligación de adoptar políticas de seguridad vial.\nQue la Resolución 40595 de 2022 del Ministerio de Transporte establece la metodología para el diseño e implementación del PESV.\nQue el Artículo 5 de dicha resolución establece la obligación de conformar un equipo de trabajo para el PESV.",
    articulado: "", estado: "vigente", observaciones: ""
  });

  const { data: actos = [], isLoading } = useQuery<ActoAdministrativoPesv[]>({
    queryKey: ["/api/pesv/comite/actos-administrativos"],
  });

  const { data: integrantes = [] } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });

  const resetForm = () => {
    setEditing(null);
    setForm({
      tipoDocumento: "Resolución", numeroDocumento: "", fechaExpedicion: new Date().toISOString().split("T")[0],
      fechaVigencia: "", firmadoPor: "", cargoFirmante: "Representante Legal",
      objetoConformacion: "Conformar el equipo de trabajo para el diseño, implementación y seguimiento del Plan Estratégico de Seguridad Vial (PESV) de la organización, en cumplimiento de la Resolución 40595 de 2022 del Ministerio de Transporte.",
      considerandos: "Que la Ley 1503 de 2011 establece la obligación de adoptar políticas de seguridad vial.\nQue la Resolución 40595 de 2022 del Ministerio de Transporte establece la metodología para el diseño e implementación del PESV.\nQue el Artículo 5 de dicha resolución establece la obligación de conformar un equipo de trabajo para el PESV.",
      articulado: "", estado: "vigente", observaciones: ""
    });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pesv/comite/actos-administrativos", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actos-administrativos"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setDialogOpen(false); resetForm(); toast({ title: "Acto administrativo registrado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PATCH", `/api/pesv/comite/actos-administrativos/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actos-administrativos"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setDialogOpen(false); resetForm(); toast({ title: "Acto actualizado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/pesv/comite/actos-administrativos/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actos-administrativos"] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); toast({ title: "Acto eliminado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const integrantesActivos = integrantes.filter(i => i.estado === "activo");
    let articulado = form.articulado;
    if (!articulado && integrantesActivos.length > 0) {
      articulado = `ARTÍCULO PRIMERO: Conformar el equipo de trabajo del Plan Estratégico de Seguridad Vial (PESV) integrado por:\n\n${integrantesActivos.map((ig, idx) => `${idx + 1}. ${ig.nombre} - ${ig.cargo} (${ROLES_COMITE[ig.rol as RolComite] || ig.rol})`).join("\n")}\n\nARTÍCULO SEGUNDO: El equipo de trabajo tendrá las funciones establecidas en el Artículo 5 de la Resolución 40595 de 2022.\n\nARTÍCULO TERCERO: La presente resolución rige a partir de la fecha de su expedición.`;
    }
    const data = { ...form, articulado, fechaVigencia: form.fechaVigencia || null, observaciones: form.observaciones || null, considerandos: form.considerandos || null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (a: ActoAdministrativoPesv) => {
    setEditing(a);
    setForm({
      tipoDocumento: a.tipoDocumento, numeroDocumento: a.numeroDocumento,
      fechaExpedicion: a.fechaExpedicion, fechaVigencia: a.fechaVigencia || "",
      firmadoPor: a.firmadoPor, cargoFirmante: a.cargoFirmante,
      objetoConformacion: a.objetoConformacion, considerandos: a.considerandos || "",
      articulado: a.articulado || "", estado: a.estado, observaciones: a.observaciones || ""
    });
    setDialogOpen(true);
  };

  const actoVigente = actos.find(a => a.estado === "vigente");

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Criterio 1: Acto Administrativo de Conformación del Equipo</CardTitle>
          <CardDescription>Documento formal firmado por el representante legal que crea oficialmente el equipo de trabajo PESV (Res. 40595/2022, Art. 5)</CardDescription>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">{actos.length} acto(s) registrado(s)</div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-acto"><Plus className="h-4 w-4 mr-2" /> Nuevo Acto Administrativo</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Acto Administrativo" : "Registrar Acto Administrativo de Conformación"}</DialogTitle>
                <DialogDescription>Documento formal de conformación del equipo PESV según Resolución 40595/2022</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Documento *</Label>
                    <Select value={form.tipoDocumento} onValueChange={v => setForm({ ...form, tipoDocumento: v })}>
                      <SelectTrigger data-testid="select-tipo-documento"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Resolución">Resolución</SelectItem>
                        <SelectItem value="Acta">Acta</SelectItem>
                        <SelectItem value="Circular">Circular</SelectItem>
                        <SelectItem value="Memorando">Memorando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Documento *</Label>
                    <Input value={form.numeroDocumento} onChange={e => setForm({ ...form, numeroDocumento: e.target.value })} required placeholder="Ej: 001-2026" data-testid="input-numero-documento" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Expedición *</Label>
                    <Input type="date" value={form.fechaExpedicion} onChange={e => setForm({ ...form, fechaExpedicion: e.target.value })} required data-testid="input-fecha-expedicion" />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Vigencia</Label>
                    <Input type="date" value={form.fechaVigencia} onChange={e => setForm({ ...form, fechaVigencia: e.target.value })} data-testid="input-fecha-vigencia" />
                  </div>
                  <div className="space-y-2">
                    <Label>Firmado por *</Label>
                    <Input value={form.firmadoPor} onChange={e => setForm({ ...form, firmadoPor: e.target.value })} required placeholder="Nombre del firmante" data-testid="input-firmado-por" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo del Firmante *</Label>
                    <Input value={form.cargoFirmante} onChange={e => setForm({ ...form, cargoFirmante: e.target.value })} required data-testid="input-cargo-firmante" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Objeto de la Conformación *</Label>
                  <Textarea value={form.objetoConformacion} onChange={e => setForm({ ...form, objetoConformacion: e.target.value })} required rows={3} data-testid="textarea-objeto" />
                </div>
                <div className="space-y-2">
                  <Label>Considerandos</Label>
                  <Textarea value={form.considerandos} onChange={e => setForm({ ...form, considerandos: e.target.value })} rows={4} data-testid="textarea-considerandos" />
                </div>
                <div className="space-y-2">
                  <Label>Articulado</Label>
                  <Textarea value={form.articulado} onChange={e => setForm({ ...form, articulado: e.target.value })} rows={6} placeholder="Deje vacío para auto-generar con los integrantes activos del equipo" data-testid="textarea-articulado" />
                  {integrantes.filter(i => i.estado === "activo").length > 0 && !form.articulado && (
                    <p className="text-xs text-muted-foreground">Se auto-generará con los {integrantes.filter(i => i.estado === "activo").length} integrantes activos al guardar</p>
                  )}
                </div>
                {editing && (
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vigente">Vigente</SelectItem>
                        <SelectItem value="modificado">Modificado</SelectItem>
                        <SelectItem value="anulado">Anulado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-acto">
                    {editing ? "Actualizar" : "Registrar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : actos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <Stamp className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No se ha registrado ningún acto administrativo de conformación</p>
            <p className="text-sm text-muted-foreground mt-1">Este documento es obligatorio según la Resolución 40595/2022</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {actos.map(a => (
            <Card key={a.id} className={a.estado === "vigente" ? "border-green-500/30" : ""} data-testid={`card-acto-${a.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-base">{a.tipoDocumento} No. {a.numeroDocumento}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={a.estado === "vigente" ? "default" : a.estado === "anulado" ? "destructive" : "secondary"}>
                      {a.estado === "vigente" ? "Vigente" : a.estado === "modificado" ? "Modificado" : "Anulado"}
                    </Badge>
                    {isAdmin && (
                      <>
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(a)} data-testid={`button-edit-acto-${a.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("¿Eliminar este acto administrativo?")) deleteMutation.mutate(a.id); }} data-testid={`button-delete-acto-${a.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </>
                    )}
                  </div>
                </div>
                <CardDescription>Expedido: {new Date(a.fechaExpedicion).toLocaleDateString()} · Firmado por: {a.firmadoPor} ({a.cargoFirmante})</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div><span className="font-medium">Objeto:</span> {a.objetoConformacion}</div>
                  {a.considerandos && <div><span className="font-medium">Considerandos:</span><pre className="whitespace-pre-wrap text-muted-foreground mt-1">{a.considerandos}</pre></div>}
                  {a.articulado && <div><span className="font-medium">Articulado:</span><pre className="whitespace-pre-wrap text-muted-foreground mt-1">{a.articulado}</pre></div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

function CronogramaTab({ isAdmin, toast }: { isAdmin: boolean; toast: any }) {
  const currentYear = new Date().getFullYear();
  const [anio, setAnio] = useState(currentYear);
  const [generarDialogOpen, setGenerarDialogOpen] = useState(false);
  const [generarForm, setGenerarForm] = useState({ frecuencia: "mensual", temaPrincipal: "" });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingReunion, setEditingReunion] = useState<CronogramaReunionPesv | null>(null);
  const [editForm, setEditForm] = useState({ fechaProgramada: "", temaPrincipal: "", estado: "programada", observaciones: "" });

  const { data: cronograma = [], isLoading } = useQuery<CronogramaReunionPesv[]>({
    queryKey: ["/api/pesv/comite/cronograma", anio],
    queryFn: async () => { const res = await fetch(`/api/pesv/comite/cronograma?anio=${anio}`, { credentials: 'include' }); return res.json(); }
  });

  const { data: actas = [] } = useQuery<ActaComitePesv[]>({
    queryKey: ["/api/pesv/comite/actas"],
  });

  const generarMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pesv/comite/cronograma/generar", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/cronograma", anio] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setGenerarDialogOpen(false); toast({ title: "Cronograma generado", description: `Se generaron las reuniones para ${anio}` }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PATCH", `/api/pesv/comite/cronograma/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/cronograma", anio] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); setEditDialogOpen(false); toast({ title: "Reunión actualizada" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteAnioMutation = useMutation({
    mutationFn: async (a: number) => { await apiRequest("DELETE", `/api/pesv/comite/cronograma/anio/${a}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/cronograma", anio] }); queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/verificacion-p01"] }); toast({ title: "Cronograma eliminado" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleEditReunion = (r: CronogramaReunionPesv) => {
    setEditingReunion(r);
    setEditForm({ fechaProgramada: r.fechaProgramada, temaPrincipal: r.temaPrincipal || "", estado: r.estado, observaciones: r.observaciones || "" });
    setEditDialogOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReunion) {
      updateMutation.mutate({ id: editingReunion.id, data: { ...editForm, temaPrincipal: editForm.temaPrincipal || null, observaciones: editForm.observaciones || null } });
    }
  };

  const realizadas = cronograma.filter(r => r.estado === "realizada").length;
  const programadas = cronograma.filter(r => r.estado === "programada").length;

  const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  return (
    <>
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Criterio 3: Cronograma de Reuniones</CardTitle>
          <CardDescription>Planificación de reuniones periódicas del equipo PESV (Res. 40595/2022)</CardDescription>
        </CardHeader>
      </Card>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setAnio(a => a - 1)} data-testid="button-prev-year">{'<'}</Button>
          <span className="font-medium text-lg" data-testid="text-current-year">{anio}</span>
          <Button variant="outline" size="sm" onClick={() => setAnio(a => a + 1)} data-testid="button-next-year">{'>'}</Button>
          <span className="text-sm text-muted-foreground ml-2">
            {cronograma.length > 0 ? `${realizadas} realizadas, ${programadas} pendientes de ${cronograma.length} total` : "Sin cronograma"}
          </span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            {cronograma.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { if (confirm(`¿Eliminar todo el cronograma de ${anio}?`)) deleteAnioMutation.mutate(anio); }} data-testid="button-delete-cronograma">
                <Trash2 className="h-4 w-4 mr-2" /> Eliminar {anio}
              </Button>
            )}
            <Dialog open={generarDialogOpen} onOpenChange={setGenerarDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-generar-cronograma"><CalendarDays className="h-4 w-4 mr-2" /> Generar Cronograma {anio}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generar Cronograma de Reuniones {anio}</DialogTitle>
                  <DialogDescription>Se crearán las reuniones automáticamente según la frecuencia seleccionada</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Frecuencia de Reuniones *</Label>
                    <Select value={generarForm.frecuencia} onValueChange={v => setGenerarForm({ ...generarForm, frecuencia: v })}>
                      <SelectTrigger data-testid="select-frecuencia"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mensual">Mensual (12 reuniones/año)</SelectItem>
                        <SelectItem value="bimestral">Bimestral (6 reuniones/año)</SelectItem>
                        <SelectItem value="trimestral">Trimestral (4 reuniones/año)</SelectItem>
                        <SelectItem value="semestral">Semestral (2 reuniones/año)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tema Principal (opcional)</Label>
                    <Input value={generarForm.temaPrincipal} onChange={e => setGenerarForm({ ...generarForm, temaPrincipal: e.target.value })} placeholder="Ej: Seguimiento PESV" data-testid="input-tema-principal" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGenerarDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={() => generarMutation.mutate({ anio, ...generarForm })} disabled={generarMutation.isPending} data-testid="button-submit-generar">Generar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : cronograma.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <CalendarDays className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay cronograma generado para {anio}</p>
            <p className="text-sm text-muted-foreground mt-1">Use "Generar Cronograma" para crear las reuniones planificadas</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-4">
            {MESES.map((mes, idx) => {
              const reunionesMes = cronograma.filter(r => new Date(r.fechaProgramada).getMonth() === idx);
              if (reunionesMes.length === 0) return (
                <div key={idx} className="p-2 rounded-md border border-dashed text-center">
                  <div className="text-xs text-muted-foreground">{mes}</div>
                  <div className="text-xs text-muted-foreground mt-1">—</div>
                </div>
              );
              const r = reunionesMes[0];
              const isRealized = r.estado === "realizada";
              const isPast = new Date(r.fechaProgramada) < new Date() && r.estado === "programada";
              return (
                <div key={idx}
                  className={`p-2 rounded-md border text-center cursor-pointer hover-elevate ${isRealized ? "border-green-500/50 bg-green-50 dark:bg-green-950/20" : isPast ? "border-red-500/50 bg-red-50 dark:bg-red-950/20" : "border-blue-500/30"}`}
                  onClick={() => isAdmin && handleEditReunion(r)}
                  data-testid={`cronograma-mes-${idx}`}>
                  <div className="text-xs font-medium">{mes}</div>
                  <div className="text-xs mt-1">{new Date(r.fechaProgramada).getDate()}</div>
                  {isRealized ? <CheckCircle2 className="h-3 w-3 mx-auto mt-1 text-green-600" /> : isPast ? <XCircle className="h-3 w-3 mx-auto mt-1 text-red-500" /> : <Calendar className="h-3 w-3 mx-auto mt-1 text-blue-500" />}
                </div>
              );
            })}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Observaciones</TableHead>
                  {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {cronograma.map(r => {
                  const isPast = new Date(r.fechaProgramada) < new Date() && r.estado === "programada";
                  return (
                    <TableRow key={r.id} className={isPast ? "bg-red-50/50 dark:bg-red-950/10" : ""} data-testid={`row-cronograma-${r.id}`}>
                      <TableCell className="font-medium">{new Date(r.fechaProgramada).toLocaleDateString()}</TableCell>
                      <TableCell>{r.temaPrincipal || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={ESTADOS_REUNION[r.estado]?.variant || "outline"}>
                          {ESTADOS_REUNION[r.estado]?.label || r.estado}
                        </Badge>
                        {isPast && <Badge variant="destructive" className="ml-1">Vencida</Badge>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{r.observaciones || "—"}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button size="icon" variant="ghost" onClick={() => handleEditReunion(r)} data-testid={`button-edit-cronograma-${r.id}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Reunión Programada</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Fecha Programada</Label>
              <Input type="date" value={editForm.fechaProgramada} onChange={e => setEditForm({ ...editForm, fechaProgramada: e.target.value })} data-testid="input-edit-fecha" />
            </div>
            <div className="space-y-2">
              <Label>Tema Principal</Label>
              <Input value={editForm.temaPrincipal} onChange={e => setEditForm({ ...editForm, temaPrincipal: e.target.value })} data-testid="input-edit-tema" />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={editForm.estado} onValueChange={v => setEditForm({ ...editForm, estado: v })}>
                <SelectTrigger data-testid="select-edit-estado"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="programada">Programada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="reprogramada">Reprogramada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observaciones</Label>
              <Textarea value={editForm.observaciones} onChange={e => setEditForm({ ...editForm, observaciones: e.target.value })} data-testid="textarea-edit-observaciones" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-reunion">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ActasTab({ isAdmin, toast }: { isAdmin: boolean; toast: any }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ActaComitePesv | null>(null);
  const [form, setForm] = useState({
    numeroActa: 1, fechaReunion: new Date().toISOString().split("T")[0],
    horaInicio: "08:00", horaFin: "10:00", lugar: "", modalidad: "presencial" as ModalidadReunion,
    temasOrdenDia: "", desarrolloReunion: "", compromisos: "",
    asistentesIds: [] as string[], invitados: "", proximaReunion: "",
    estado: "borrador" as EstadoActa, observaciones: ""
  });

  const { data: actas = [], isLoading } = useQuery<ActaComitePesv[]>({
    queryKey: ["/api/pesv/comite/actas"],
  });

  const { data: integrantes = [] } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });

  const resetForm = () => {
    setEditing(null);
    const next = actas.length > 0 ? Math.max(...actas.map(a => a.numeroActa)) + 1 : 1;
    setForm({ numeroActa: next, fechaReunion: new Date().toISOString().split("T")[0], horaInicio: "08:00", horaFin: "10:00", lugar: "", modalidad: "presencial", temasOrdenDia: "", desarrolloReunion: "", compromisos: "", asistentesIds: [], invitados: "", proximaReunion: "", estado: "borrador", observaciones: "" });
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => { const res = await apiRequest("POST", "/api/pesv/comite/actas", data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] }); setDialogOpen(false); resetForm(); toast({ title: "Acta creada" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => { const res = await apiRequest("PATCH", `/api/pesv/comite/actas/${id}`, data); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] }); setDialogOpen(false); resetForm(); toast({ title: "Acta actualizada" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/pesv/comite/actas/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/pesv/comite/actas"] }); toast({ title: "Acta eliminada" }); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, horaInicio: form.horaInicio || null, horaFin: form.horaFin || null, lugar: form.lugar || null, desarrolloReunion: form.desarrolloReunion || null, compromisos: form.compromisos || null, invitados: form.invitados || null, proximaReunion: form.proximaReunion || null, observaciones: form.observaciones || null };
    if (editing) updateMutation.mutate({ id: editing.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (a: ActaComitePesv) => {
    setEditing(a);
    setForm({ numeroActa: a.numeroActa, fechaReunion: a.fechaReunion, horaInicio: a.horaInicio || "08:00", horaFin: a.horaFin || "10:00", lugar: a.lugar || "", modalidad: a.modalidad as ModalidadReunion, temasOrdenDia: a.temasOrdenDia, desarrolloReunion: a.desarrolloReunion || "", compromisos: a.compromisos || "", asistentesIds: a.asistentesIds || [], invitados: a.invitados || "", proximaReunion: a.proximaReunion || "", estado: a.estado as EstadoActa, observaciones: a.observaciones || "" });
    setDialogOpen(true);
  };

  const handleAsistentesChange = (id: string) => {
    setForm(prev => ({
      ...prev,
      asistentesIds: prev.asistentesIds.includes(id) ? prev.asistentesIds.filter(x => x !== id) : [...prev.asistentesIds, id]
    }));
  };

  const handleDownloadPdf = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const integrantesActivos = integrantes.filter(i => i.estado === "activo");

  return (
    <>
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">{actas.length} acta(s) de reunión</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleDownloadPdf('/api/pesv/comite/integrantes/pdf')} data-testid="button-download-pdf">
            <FileDown className="h-4 w-4 mr-2" /> PDF
          </Button>
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-acta"><Plus className="h-4 w-4 mr-2" /> Nueva Acta</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editing ? "Editar Acta" : "Nueva Acta de Reunión"}</DialogTitle>
                  <DialogDescription>Acta de reunión del equipo de trabajo PESV</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Número de Acta *</Label>
                      <Input type="number" value={form.numeroActa} onChange={e => setForm({ ...form, numeroActa: parseInt(e.target.value) || 1 })} required data-testid="input-numero-acta" />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha de Reunión *</Label>
                      <Input type="date" value={form.fechaReunion} onChange={e => setForm({ ...form, fechaReunion: e.target.value })} required data-testid="input-fecha-reunion" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora Inicio</Label>
                      <Input type="time" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} data-testid="input-hora-inicio" />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora Fin</Label>
                      <Input type="time" value={form.horaFin} onChange={e => setForm({ ...form, horaFin: e.target.value })} data-testid="input-hora-fin" />
                    </div>
                    <div className="space-y-2">
                      <Label>Lugar</Label>
                      <Input value={form.lugar} onChange={e => setForm({ ...form, lugar: e.target.value })} data-testid="input-lugar" />
                    </div>
                    <div className="space-y-2">
                      <Label>Modalidad</Label>
                      <Select value={form.modalidad} onValueChange={v => setForm({ ...form, modalidad: v as ModalidadReunion })}>
                        <SelectTrigger data-testid="select-modalidad"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="virtual">Virtual</SelectItem>
                          <SelectItem value="mixta">Mixta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Temas del Orden del Día *</Label>
                    <Textarea value={form.temasOrdenDia} onChange={e => setForm({ ...form, temasOrdenDia: e.target.value })} required rows={3} data-testid="textarea-temas" />
                  </div>
                  <div className="space-y-2">
                    <Label>Desarrollo de la Reunión</Label>
                    <Textarea value={form.desarrolloReunion} onChange={e => setForm({ ...form, desarrolloReunion: e.target.value })} rows={3} data-testid="textarea-desarrollo" />
                  </div>
                  <div className="space-y-2">
                    <Label>Compromisos</Label>
                    <Textarea value={form.compromisos} onChange={e => setForm({ ...form, compromisos: e.target.value })} rows={2} data-testid="textarea-compromisos" />
                  </div>
                  {integrantesActivos.length > 0 && (
                    <div className="space-y-2">
                      <Label>Asistentes</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {integrantesActivos.map(i => (
                          <label key={i.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={form.asistentesIds.includes(i.id)} onChange={() => handleAsistentesChange(i.id)} />
                            {i.nombre} ({ROLES_COMITE[i.rol as RolComite] || i.rol})
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={form.estado} onValueChange={v => setForm({ ...form, estado: v as EstadoActa })}>
                      <SelectTrigger data-testid="select-estado-acta"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="anulada">Anulada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-submit-acta">
                      {editing ? "Actualizar" : "Crear Acta"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando...</div>
      ) : actas.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">No hay actas de reunión registradas</div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Temas</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {actas.map(a => (
                <TableRow key={a.id} data-testid={`row-acta-${a.id}`}>
                  <TableCell className="font-medium">{a.numeroActa}</TableCell>
                  <TableCell>{new Date(a.fechaReunion).toLocaleDateString()}</TableCell>
                  <TableCell className="max-w-[250px] truncate">{a.temasOrdenDia}</TableCell>
                  <TableCell className="capitalize">{a.modalidad}</TableCell>
                  <TableCell>
                    <Badge variant={ESTADOS_ACTA[a.estado as EstadoActa]?.variant || "secondary"}>
                      {ESTADOS_ACTA[a.estado as EstadoActa]?.label || a.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isAdmin && (
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => handleEdit(a)} data-testid={`button-edit-acta-${a.id}`}><Pencil className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { if (confirm("¿Eliminar acta?")) deleteMutation.mutate(a.id); }} data-testid={`button-delete-acta-${a.id}`}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
