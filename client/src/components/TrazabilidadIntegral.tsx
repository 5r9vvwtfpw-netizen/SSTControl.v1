import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useCompanyContext } from "@/hooks/use-company-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Target,
  TrendingUp,
  FileSearch,
  Link2,
  Calendar,
  Filter,
  BarChart3,
  Loader2,
} from "lucide-react";
import type { HallazgoSistema, TrazabilidadObjetivos, ObjetivoSst } from "@shared/schema";
import { MODULO_ORIGEN_LABELS, SEVERIDAD_HALLAZGO_LABELS } from "@shared/schema";

interface TrazabilidadIntegralProps {
  companyId: string;
}

const MODULOS_ORIGEN = [
  "evaluacion_0312",
  "auditoria_interna",
  "inspeccion",
  "investigacion_accidente",
  "matriz_iperc",
  "medicion_ambiental",
  "capacitacion",
  "examen_medico",
  "entrega_epp",
  "copasst",
  "revision_direccion",
  "plan_emergencias",
  "sve",
  "pesv",
  "gestion_proveedores",
  "contexto_organizacion",
  "otro",
] as const;

const SEVERIDADES = ["baja", "media", "alta", "critica", "observacion"] as const;
const ESTADOS = ["abierto", "en_tratamiento", "cerrado", "verificado"] as const;

const SEVERIDAD_COLORS: Record<string, string> = {
  baja: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  media: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  alta: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  critica: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  observacion: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

const ESTADO_COLORS: Record<string, string> = {
  abierto: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  en_tratamiento: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  cerrado: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  verificado: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
};

const ESTADO_ICONS: Record<string, typeof AlertTriangle> = {
  abierto: AlertTriangle,
  en_tratamiento: Clock,
  cerrado: CheckCircle2,
  verificado: ShieldCheck,
};

const ESTADO_LABELS: Record<string, string> = {
  abierto: "Abierto",
  en_tratamiento: "En Tratamiento",
  cerrado: "Cerrado",
  verificado: "Verificado",
};

const hallazgoFormSchema = z.object({
  codigoHallazgo: z.string().min(1, "Código requerido"),
  moduloOrigen: z.enum(MODULOS_ORIGEN),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  severidad: z.enum(SEVERIDADES),
  estado: z.enum(ESTADOS),
  ubicacion: z.string().optional(),
  evidencia: z.string().optional(),
  causaRaiz: z.string().optional(),
  accionPreventiva: z.string().optional(),
  responsableNombre: z.string().optional(),
  fechaDeteccion: z.string(),
  fechaLimiteCorreccion: z.string().optional(),
});

type HallazgoFormData = z.infer<typeof hallazgoFormSchema>;

const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "—";
  try {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "dd/MM/yyyy", { locale: es });
  } catch {
    return "—";
  }
};

export function TrazabilidadIntegral({ companyId }: TrazabilidadIntegralProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHallazgo, setEditingHallazgo] = useState<HallazgoSistema | null>(null);
  const [filterEstado, setFilterEstado] = useState<string>("todos");
  const [filterSeveridad, setFilterSeveridad] = useState<string>("todos");
  const [filterModulo, setFilterModulo] = useState<string>("todos");
  const [filterFechaDesde, setFilterFechaDesde] = useState<string>("");
  const [filterFechaHasta, setFilterFechaHasta] = useState<string>("");

  const { data: hallazgos = [], isLoading: loadingHallazgos } = useQuery<HallazgoSistema[]>({
    queryKey: [`/api/hallazgos-sistema?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: dashboardData } = useQuery<{
    totalHallazgos: number;
    porEstado: Record<string, number>;
    porSeveridad: Record<string, number>;
    porModulo: Record<string, number>;
    objetivosVinculados: number;
    porcentajeCumplimiento: number;
  }>({
    queryKey: [`/api/dashboard-trazabilidad?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: trazabilidadObjetivos = [] } = useQuery<TrazabilidadObjetivos[]>({
    queryKey: [`/api/trazabilidad-objetivos?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const { data: objetivos = [] } = useQuery<ObjetivoSst[]>({
    queryKey: [`/api/objetivos-sst?companyId=${companyId}`],
    enabled: !!companyId,
  });

  const form = useForm<HallazgoFormData>({
    resolver: zodResolver(hallazgoFormSchema),
    defaultValues: {
      codigoHallazgo: "",
      moduloOrigen: "otro",
      descripcion: "",
      severidad: "media",
      estado: "abierto",
      ubicacion: "",
      evidencia: "",
      causaRaiz: "",
      accionPreventiva: "",
      responsableNombre: "",
      fechaDeteccion: format(new Date(), "yyyy-MM-dd"),
      fechaLimiteCorreccion: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: HallazgoFormData) => {
      const res = await apiRequest("POST", "/api/hallazgos-sistema", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hallazgos-sistema"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-trazabilidad"] });
      toast({ title: "Hallazgo creado", description: "El hallazgo se ha registrado correctamente" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HallazgoFormData> }) => {
      const res = await apiRequest("PATCH", `/api/hallazgos-sistema/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hallazgos-sistema"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-trazabilidad"] });
      toast({ title: "Hallazgo actualizado", description: "Los cambios se han guardado correctamente" });
      setIsDialogOpen(false);
      setEditingHallazgo(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/hallazgos-sistema/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hallazgos-sistema"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard-trazabilidad"] });
      toast({ title: "Hallazgo eliminado", description: "El hallazgo se ha eliminado correctamente" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredHallazgos = useMemo(() => {
    return hallazgos.filter((h) => {
      if (filterEstado !== "todos" && h.estado !== filterEstado) return false;
      if (filterSeveridad !== "todos" && h.severidad !== filterSeveridad) return false;
      if (filterModulo !== "todos" && h.moduloOrigen !== filterModulo) return false;
      if (filterFechaDesde && h.fechaDeteccion) {
        const fechaHallazgo = new Date(h.fechaDeteccion);
        const fechaDesde = new Date(filterFechaDesde);
        if (fechaHallazgo < fechaDesde) return false;
      }
      if (filterFechaHasta && h.fechaDeteccion) {
        const fechaHallazgo = new Date(h.fechaDeteccion);
        const fechaHasta = new Date(filterFechaHasta);
        if (fechaHallazgo > fechaHasta) return false;
      }
      return true;
    });
  }, [hallazgos, filterEstado, filterSeveridad, filterModulo, filterFechaDesde, filterFechaHasta]);

  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    hallazgos.forEach((h) => {
      counts[h.moduloOrigen] = (counts[h.moduloOrigen] || 0) + 1;
    });
    return MODULOS_ORIGEN.map((modulo) => ({
      modulo: MODULO_ORIGEN_LABELS[modulo] || modulo,
      cantidad: counts[modulo] || 0,
    })).filter((item) => item.cantidad > 0);
  }, [hallazgos]);

  const estadoStats = useMemo(() => {
    return ESTADOS.map((estado) => ({
      estado,
      label: ESTADO_LABELS[estado],
      count: dashboardData?.porEstado?.[estado] || hallazgos.filter((h) => h.estado === estado).length,
      Icon: ESTADO_ICONS[estado],
      colorClass: ESTADO_COLORS[estado],
    }));
  }, [hallazgos, dashboardData]);

  const severidadStats = useMemo(() => {
    return SEVERIDADES.filter((s) => s !== "observacion").map((severidad) => ({
      severidad,
      label: SEVERIDAD_HALLAZGO_LABELS[severidad]?.label || severidad,
      count: dashboardData?.porSeveridad?.[severidad] || hallazgos.filter((h) => h.severidad === severidad).length,
      colorClass: SEVERIDAD_COLORS[severidad],
    }));
  }, [hallazgos, dashboardData]);

  const porcentajeCumplimiento = useMemo(() => {
    if (dashboardData?.porcentajeCumplimiento) return dashboardData.porcentajeCumplimiento;
    const total = hallazgos.length;
    if (total === 0) return 100;
    const cerradosVerificados = hallazgos.filter((h) => h.estado === "cerrado" || h.estado === "verificado").length;
    return Math.round((cerradosVerificados / total) * 100);
  }, [hallazgos, dashboardData]);

  const objetivosVinculados = dashboardData?.objetivosVinculados || trazabilidadObjetivos.length;

  const handleOpenCreate = () => {
    setEditingHallazgo(null);
    form.reset({
      codigoHallazgo: `HAL-${Date.now().toString(36).toUpperCase()}`,
      moduloOrigen: "otro",
      descripcion: "",
      severidad: "media",
      estado: "abierto",
      ubicacion: "",
      evidencia: "",
      causaRaiz: "",
      accionPreventiva: "",
      responsableNombre: "",
      fechaDeteccion: format(new Date(), "yyyy-MM-dd"),
      fechaLimiteCorreccion: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (hallazgo: HallazgoSistema) => {
    setEditingHallazgo(hallazgo);
    form.reset({
      codigoHallazgo: hallazgo.codigoHallazgo,
      moduloOrigen: hallazgo.moduloOrigen as typeof MODULOS_ORIGEN[number],
      descripcion: hallazgo.descripcion,
      severidad: hallazgo.severidad as typeof SEVERIDADES[number],
      estado: hallazgo.estado as typeof ESTADOS[number],
      ubicacion: hallazgo.ubicacion || "",
      evidencia: hallazgo.evidencia || "",
      causaRaiz: hallazgo.causaRaiz || "",
      accionPreventiva: hallazgo.accionPreventiva || "",
      responsableNombre: hallazgo.responsableNombre || "",
      fechaDeteccion: hallazgo.fechaDeteccion?.toString().split("T")[0] || format(new Date(), "yyyy-MM-dd"),
      fechaLimiteCorreccion: hallazgo.fechaLimiteCorreccion?.toString().split("T")[0] || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar este hallazgo?")) {
      deleteMutation.mutate(id);
    }
  };

  const onSubmit = (data: HallazgoFormData) => {
    if (editingHallazgo) {
      updateMutation.mutate({ id: editingHallazgo.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getObjetivoById = (id: string) => objetivos.find((o) => o.id === id);

  if (loadingHallazgos) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-trazabilidad">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="trazabilidad-integral">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileSearch className="h-6 w-6" />
            Trazabilidad Integral SG-SST
          </h2>
          <p className="text-muted-foreground">
            Sistema centralizado de hallazgos y vinculación con objetivos SST
          </p>
        </div>
        <Button onClick={handleOpenCreate} data-testid="button-create-hallazgo">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Hallazgo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {estadoStats.map(({ estado, label, count, Icon, colorClass }) => (
          <Card key={estado} data-testid={`card-estado-${estado}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <Badge className={`mt-2 ${colorClass}`} data-testid={`badge-estado-${estado}`}>
                {label}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {severidadStats.map(({ severidad, label, count, colorClass }) => (
          <Card key={severidad} data-testid={`card-severidad-${severidad}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Severidad {label}</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <Badge className={`mt-2 ${colorClass}`} data-testid={`badge-severidad-${severidad}`}>
                {label}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card data-testid="card-objetivos-vinculados">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Objetivos Vinculados</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{objetivosVinculados}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Objetivos SST conectados a hallazgos
            </p>
          </CardContent>
        </Card>
        <Card data-testid="card-cumplimiento">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cumplimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{porcentajeCumplimiento}%</div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${porcentajeCumplimiento}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hallazgos cerrados o verificados
            </p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card data-testid="card-grafico-modulos">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Hallazgos por Módulo de Origen
            </CardTitle>
            <CardDescription>
              Distribución de hallazgos según el módulo SST donde fueron detectados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ left: 100, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="modulo" width={150} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(var(--primary))`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-filtros-hallazgos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado} data-testid="select-filter-estado">
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {ESTADOS.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {ESTADO_LABELS[estado]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Severidad</Label>
              <Select value={filterSeveridad} onValueChange={setFilterSeveridad} data-testid="select-filter-severidad">
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {SEVERIDADES.map((sev) => (
                    <SelectItem key={sev} value={sev}>
                      {SEVERIDAD_HALLAZGO_LABELS[sev]?.label || sev}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Módulo de Origen</Label>
              <Select value={filterModulo} onValueChange={setFilterModulo} data-testid="select-filter-modulo">
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {MODULOS_ORIGEN.map((modulo) => (
                    <SelectItem key={modulo} value={modulo}>
                      {MODULO_ORIGEN_LABELS[modulo] || modulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha Desde</Label>
              <Input
                type="date"
                value={filterFechaDesde}
                onChange={(e) => setFilterFechaDesde(e.target.value)}
                data-testid="input-filter-fecha-desde"
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha Hasta</Label>
              <Input
                type="date"
                value={filterFechaHasta}
                onChange={(e) => setFilterFechaHasta(e.target.value)}
                data-testid="input-filter-fecha-hasta"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Hallazgos ({filteredHallazgos.length})</CardTitle>
          <CardDescription>
            Lista completa de hallazgos del sistema de gestión SST
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table data-testid="table-hallazgos">
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha Detección</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHallazgos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No se encontraron hallazgos con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHallazgos.map((hallazgo) => (
                    <TableRow key={hallazgo.id} data-testid={`row-hallazgo-${hallazgo.id}`}>
                      <TableCell className="font-mono text-sm">{hallazgo.codigoHallazgo}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={hallazgo.descripcion}>
                        {hallazgo.descripcion}
                      </TableCell>
                      <TableCell className="text-sm">
                        {MODULO_ORIGEN_LABELS[hallazgo.moduloOrigen] || hallazgo.moduloOrigen}
                      </TableCell>
                      <TableCell>
                        <Badge className={SEVERIDAD_COLORS[hallazgo.severidad]} data-testid={`badge-severidad-${hallazgo.severidad}`}>
                          {SEVERIDAD_HALLAZGO_LABELS[hallazgo.severidad]?.label || hallazgo.severidad}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={ESTADO_COLORS[hallazgo.estado]} data-testid={`badge-estado-${hallazgo.estado}`}>
                          {ESTADO_LABELS[hallazgo.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(hallazgo.fechaDeteccion)}</TableCell>
                      <TableCell>{hallazgo.responsableNombre || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleOpenEdit(hallazgo)}
                            data-testid={`button-edit-hallazgo-${hallazgo.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(hallazgo.id)}
                            data-testid={`button-delete-hallazgo-${hallazgo.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-vinculacion-objetivos">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Vinculación de Objetivos SST
          </CardTitle>
          <CardDescription>
            Relación entre objetivos del SG-SST y los módulos/hallazgos del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trazabilidadObjetivos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay vinculaciones de objetivos registradas</p>
              <p className="text-sm">Las vinculaciones se crean automáticamente cuando se asocian hallazgos a objetivos SST</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table data-testid="table-trazabilidad-objetivos">
                <TableHeader>
                  <TableRow>
                    <TableHead>Objetivo SST</TableHead>
                    <TableHead>Módulo Vinculado</TableHead>
                    <TableHead>Tipo de Vínculo</TableHead>
                    <TableHead>Contribución</TableHead>
                    <TableHead>Fecha Vinculación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trazabilidadObjetivos.map((vinculo) => {
                    const objetivo = getObjetivoById(vinculo.objetivoSstId);
                    return (
                      <TableRow key={vinculo.id} data-testid={`row-vinculo-${vinculo.id}`}>
                        <TableCell className="font-medium">
                          {objetivo?.nombre || vinculo.objetivoSstId}
                        </TableCell>
                        <TableCell>
                          {MODULO_ORIGEN_LABELS[vinculo.moduloVinculado] || vinculo.moduloVinculado}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vinculo.tipoVinculo}</Badge>
                        </TableCell>
                        <TableCell>
                          {vinculo.porcentajeContribucion ? `${vinculo.porcentajeContribucion}%` : "—"}
                        </TableCell>
                        <TableCell>{formatDate(vinculo.fechaVinculacion)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHallazgo ? "Editar Hallazgo" : "Nuevo Hallazgo"}
            </DialogTitle>
            <DialogDescription>
              {editingHallazgo
                ? "Modifique los datos del hallazgo seleccionado"
                : "Complete la información para registrar un nuevo hallazgo del SG-SST"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="codigoHallazgo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código del Hallazgo</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-codigo-hallazgo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="moduloOrigen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Módulo de Origen</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-modulo-origen">
                            <SelectValue placeholder="Seleccione módulo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {MODULOS_ORIGEN.map((modulo) => (
                            <SelectItem key={modulo} value={modulo}>
                              {MODULO_ORIGEN_LABELS[modulo] || modulo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción del Hallazgo</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Describa el hallazgo en detalle..."
                        data-testid="textarea-descripcion"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="severidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severidad</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-severidad">
                            <SelectValue placeholder="Seleccione severidad" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEVERIDADES.map((sev) => (
                            <SelectItem key={sev} value={sev}>
                              {SEVERIDAD_HALLAZGO_LABELS[sev]?.label || sev}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESTADOS.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {ESTADO_LABELS[estado]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="fechaDeteccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Detección</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-deteccion" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fechaLimiteCorreccion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Límite de Corrección</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-limite" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="ubicacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Área o lugar donde se detectó" data-testid="input-ubicacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="responsableNombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nombre del responsable" data-testid="input-responsable" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="causaRaiz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Causa Raíz</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="Análisis de la causa raíz del hallazgo..."
                        data-testid="textarea-causa-raiz"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accionPreventiva"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acción Preventiva/Correctiva</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="Describa las acciones a implementar..."
                        data-testid="textarea-accion-preventiva"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evidencia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Evidencia</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={2}
                        placeholder="Describa la evidencia del hallazgo..."
                        data-testid="textarea-evidencia"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-hallazgo"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-hallazgo"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingHallazgo ? "Guardar Cambios" : "Crear Hallazgo"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
