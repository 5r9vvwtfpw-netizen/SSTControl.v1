import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/shared/CurrencyInput";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, Monitor, Cog, Armchair, FlaskConical, Package, Ambulance, Box,
  Plus, Pencil, Trash2, FileText, DollarSign, Calendar, ExternalLink, Bot, Users, HardHat, ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AdquisicionItem, InsertAdquisicionItem, insertAdquisicionItemSchema, ResourceAllocation, EvaluacionAdquisicion, SolicitudAdquisicion } from "@shared/schema";

interface GestionAdquisicionesProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  embedded?: boolean;
}

const categoriaConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  epp: { label: "EPP y Dotación", icon: Shield, color: "text-green-600 bg-green-100 dark:bg-green-900/30" },
  equipos: { label: "Equipos Ofimáticos", icon: Monitor, color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30" },
  maquinaria: { label: "Maquinaria", icon: Cog, color: "text-gray-600 bg-gray-100 dark:bg-gray-800/50" },
  mobiliario: { label: "Mobiliario Ergonómico", icon: Armchair, color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30" },
  quimicos: { label: "Sustancias Químicas", icon: FlaskConical, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  materiales: { label: "Materiales", icon: Package, color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30" },
  emergencia: { label: "Equipos Emergencia", icon: Ambulance, color: "text-red-600 bg-red-100 dark:bg-red-900/30" },
  otros: { label: "Otros", icon: Box, color: "text-gray-500 bg-gray-100 dark:bg-gray-800/50" },
};

const tipoToCategoria: Record<string, string> = {
  epp: "epp",
  maquinaria: "maquinaria",
  herramientas: "materiales",
  sustancias_quimicas: "quimicos",
  equipos_emergencia: "emergencia",
  mobiliario: "mobiliario",
  software: "equipos",
  servicios: "otros",
  otros: "otros",
};

const formSchema = insertAdquisicionItemSchema.extend({
  nombreProducto: z.string().min(1, "El nombre del producto es obligatorio"),
  categoria: z.enum(["epp", "equipos", "maquinaria", "mobiliario", "quimicos", "materiales", "emergencia", "otros"]),
});

type FormValues = z.infer<typeof formSchema>;

export function GestionAdquisiciones({ open, onOpenChange, embedded = false }: GestionAdquisicionesProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("items");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AdquisicionItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<AdquisicionItem | null>(null);
  const [autoFillFromEvaluacion, setAutoFillFromEvaluacion] = useState(false);
  const [selectedEvaluacionId, setSelectedEvaluacionId] = useState<string | null>(null);

  const { data: items = [], isLoading: loadingItems } = useQuery<AdquisicionItem[]>({
    queryKey: ["/api/adquisicion-items"],
    enabled: embedded || open,
  });

  const { data: resumen } = useQuery<{
    porCategoria: Record<string, number>;
    gastoTotal: number;
    gastosPorCategoria: Record<string, number>;
  }>({
    queryKey: ["/api/adquisicion-items/resumen"],
    enabled: embedded || open,
  });

  const { data: resumenIntegrado } = useQuery<{
    adquisiciones: { porCategoria: Record<string, number>; gastoTotal: number; gastosPorCategoria: Record<string, number>; totalItems: number; recursosVinculados: number };
    epp: { totalEntregas: number; trabajadoresConEpp: number; entregasPorCategoria: Record<string, number>; ultimasEntregas: { eppNombre: string; eppCategoria: string; cantidad: number; fechaEntrega: string }[] };
    recursosFinancieros: { total: number; ejecutado: number; porcentajeEjecucion: number };
  }>({
    queryKey: ["/api/adquisicion-items/resumen-integrado"],
    enabled: embedded || open,
  });

  const { data: recursos = [] } = useQuery<ResourceAllocation[]>({
    queryKey: ["/api/resource-allocations"],
    enabled: embedded || open,
  });

  const { data: evaluaciones = [] } = useQuery<EvaluacionAdquisicion[]>({
    queryKey: ["/api/evaluaciones-adquisicion"],
    enabled: embedded || open,
  });

  const { data: solicitudes = [] } = useQuery<SolicitudAdquisicion[]>({
    queryKey: ["/api/adquisiciones-sst"],
    enabled: embedded || open,
  });

  const recursosFinancieros = recursos.filter(r => r.resourceType === "financiero");
  const evaluacionesAprobadas = evaluaciones.filter(e => e.resultado === "aprobado" || e.resultado === "aprobado_condiciones");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreProducto: "",
      categoria: "epp",
      marca: "",
      modelo: "",
      referencia: "",
      serial: "",
      cantidad: 1,
      unidad: "unidades",
      precioUnitario: undefined,
      resourceAllocationId: "none",
      fichaTecnicaUrl: "",
      hojaSeguridadUrl: "",
      especificacionesSst: "",
      normasAplicables: "",
      vidaUtilMeses: undefined,
      fechaVencimiento: undefined,
      fechaCompra: undefined,
      observaciones: "",
      estado: "activo",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAdquisicionItem) => {
      const res = await apiRequest("POST", "/api/adquisicion-items", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisicion-items"] });
      toast({ title: "Item creado exitosamente" });
      setItemDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAdquisicionItem> }) => {
      const res = await apiRequest("PATCH", `/api/adquisicion-items/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisicion-items"] });
      toast({ title: "Item actualizado exitosamente" });
      setItemDialogOpen(false);
      setEditingItem(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/adquisicion-items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/adquisicion-items"] });
      toast({ title: "Item eliminado exitosamente" });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredItems = filtroCategoria === "todas"
    ? items
    : items.filter(item => item.categoria === filtroCategoria);

  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return "$0";
    return '$' + new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenItemDialog = (item?: AdquisicionItem) => {
    setAutoFillFromEvaluacion(false);
    setSelectedEvaluacionId(null);
    if (item) {
      setEditingItem(item);
      form.reset({
        nombreProducto: item.nombreProducto,
        categoria: item.categoria as any,
        marca: item.marca || "",
        modelo: item.modelo || "",
        referencia: item.referencia || "",
        serial: item.serial || "",
        cantidad: item.cantidad || 1,
        unidad: item.unidad || "unidades",
        precioUnitario: item.precioUnitario || undefined,
        resourceAllocationId: item.resourceAllocationId || 'none',
        fichaTecnicaUrl: item.fichaTecnicaUrl || "",
        hojaSeguridadUrl: item.hojaSeguridadUrl || "",
        especificacionesSst: item.especificacionesSst || "",
        normasAplicables: item.normasAplicables || "",
        vidaUtilMeses: item.vidaUtilMeses || undefined,
        fechaVencimiento: item.fechaVencimiento ? new Date(item.fechaVencimiento) : undefined,
        fechaCompra: item.fechaCompra ? new Date(item.fechaCompra) : undefined,
        observaciones: item.observaciones || "",
        estado: item.estado || "activo",
      });
    } else {
      setEditingItem(null);
      form.reset();
    }
    setItemDialogOpen(true);
  };

  const handleAutoFillFromEvaluacion = (evaluacionId: string) => {
    if (evaluacionId === "none") {
      setAutoFillFromEvaluacion(false);
      setSelectedEvaluacionId(null);
      form.reset();
      return;
    }

    const evaluacion = evaluaciones.find(e => e.id === evaluacionId);
    if (!evaluacion) return;

    const solicitud = solicitudes.find(s => s.id === evaluacion.solicitudId);
    if (!solicitud) return;

    setSelectedEvaluacionId(evaluacionId);
    setAutoFillFromEvaluacion(true);

    const descripcionCorta = solicitud.descripcion.split('\n')[0].substring(0, 100);
    const categoria = tipoToCategoria[solicitud.tipoAdquisicion] || "otros";
    const vidaUtil = solicitud.tipoAdquisicion === "epp" ? 12 : undefined;

    form.setValue("nombreProducto", descripcionCorta);
    form.setValue("categoria", categoria as any);
    form.setValue("normasAplicables", evaluacion.normasAplicables || "");
    form.setValue("especificacionesSst", evaluacion.especificacionesSst || "");
    if (vidaUtil) {
      form.setValue("vidaUtilMeses", vidaUtil);
    }
    if (solicitud.cantidad) {
      form.setValue("cantidad", solicitud.cantidad);
    }
    if (solicitud.unidad) {
      form.setValue("unidad", solicitud.unidad);
    }
  };

  const getEvaluacionLabel = (evaluacionId: string) => {
    const evaluacion = evaluaciones.find(e => e.id === evaluacionId);
    if (!evaluacion) return "";
    const solicitud = solicitudes.find(s => s.id === evaluacion.solicitudId);
    return solicitud?.numeroSolicitud || evaluacionId.substring(0, 8);
  };

  const onSubmit = (values: FormValues) => {
    const data: InsertAdquisicionItem = {
      ...values,
      resourceAllocationId: values.resourceAllocationId === "none" ? undefined : values.resourceAllocationId,
      precioTotal: values.precioUnitario ? values.precioUnitario * (values.cantidad || 1) : undefined,
    };

    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getCategoryIcon = (categoria: string) => {
    const config = categoriaConfig[categoria] || categoriaConfig.otros;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  const mainContent = (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="items" data-testid="tab-items">Items de Adquisición</TabsTrigger>
            <TabsTrigger value="resumen" data-testid="tab-resumen">Resumen</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-[200px]" data-testid="select-filtro-categoria">
                  <SelectValue placeholder="Filtrar por categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {Object.entries(categoriaConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        {getCategoryIcon(key)}
                        {config.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={() => handleOpenItemDialog()} data-testid="button-agregar-item">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>

            {loadingItems ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No hay items de adquisición registrados.
                </CardContent>
              </Card>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead>Fecha Compra</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => {
                      const catConfig = categoriaConfig[item.categoria] || categoriaConfig.otros;
                      const CatIcon = catConfig.icon;
                      return (
                        <TableRow key={item.id} data-testid={`row-item-${item.id}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.nombreProducto}</p>
                              {item.marca && (
                                <p className="text-xs text-muted-foreground">{item.marca} {item.modelo}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={catConfig.color}>
                              <CatIcon className="h-3 w-3 mr-1" />
                              {catConfig.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.cantidad} {item.unidad}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.precioTotal || (item.precioUnitario ? item.precioUnitario * (item.cantidad || 1) : 0))}
                          </TableCell>
                          <TableCell>
                            {item.fechaCompra ? format(new Date(item.fechaCompra), "dd/MM/yyyy", { locale: es }) : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              item.estado === "activo" ? "default" : 
                              item.estado === "rechazado" ? "destructive" : 
                              "secondary"
                            }>
                              {item.estado === "activo" ? "activo" :
                               item.estado === "rechazado" ? "rechazado" :
                               item.estado === "inactivo" ? "inactivo" :
                               item.estado}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {item.fichaTecnicaUrl && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  asChild
                                  data-testid={`button-ficha-${item.id}`}
                                >
                                  <a href={item.fichaTecnicaUrl} target="_blank" rel="noopener noreferrer">
                                    <FileText className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenItemDialog(item)}
                                data-testid={`button-editar-${item.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setItemToDelete(item);
                                  setDeleteDialogOpen(true);
                                }}
                                data-testid={`button-eliminar-${item.id}`}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="resumen" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Total Gastado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600" data-testid="text-gasto-total">
                    {formatCurrency(resumen?.gastoTotal || items.reduce((sum, item) => sum + (item.precioTotal || 0), 0))}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-blue-600" data-testid="text-total-items">
                    {items.length}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-orange-600" />
                    Recursos Vinculados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-600" data-testid="text-recursos-vinculados">
                    {items.filter(i => i.resourceAllocationId).length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Gasto por Categoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(categoriaConfig).map(([key, config]) => {
                    const categoryItems = items.filter(i => i.categoria === key);
                    const categoryTotal = categoryItems.reduce((sum, item) => sum + (item.precioTotal || 0), 0);
                    const CatIcon = config.icon;
                    if (categoryItems.length === 0) return null;
                    return (
                      <div key={key} className="flex items-center justify-between" data-testid={`category-row-${key}`}>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={config.color}>
                            <CatIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ({categoryItems.length} items)
                          </span>
                        </div>
                        <span className="font-medium">{formatCurrency(categoryTotal)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardHat className="h-4 w-4 text-green-600" />
                  Trazabilidad EPP (Estándar 2.9.1)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">Total Entregas EPP</p>
                    <p className="text-xl font-bold text-green-600" data-testid="text-epp-entregas">
                      {resumenIntegrado?.epp.totalEntregas || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">Trabajadores con EPP</p>
                    <p className="text-xl font-bold text-blue-600" data-testid="text-epp-trabajadores">
                      {resumenIntegrado?.epp.trabajadoresConEpp || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">EPP Adquiridos</p>
                    <p className="text-xl font-bold text-purple-600" data-testid="text-epp-adquiridos">
                      {items.filter(i => i.categoria === 'epp').reduce((sum, i) => sum + (i.cantidad || 0), 0)}
                    </p>
                  </div>
                </div>
                
                {resumenIntegrado?.epp.ultimasEntregas && resumenIntegrado.epp.ultimasEntregas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Últimas Entregas de EPP</p>
                    <div className="space-y-2">
                      {resumenIntegrado.epp.ultimasEntregas.slice(0, 3).map((entrega, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-md border text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span>{entrega.eppNombre}</span>
                            <Badge variant="outline" className="text-xs">{entrega.eppCategoria}</Badge>
                          </div>
                          <span className="text-muted-foreground text-xs">
                            {entrega.fechaEntrega ? format(new Date(entrega.fechaEntrega), 'dd/MM/yyyy', { locale: es }) : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Link href="/entrega-epp" className="block">
                  <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-ir-epp">
                    <HardHat className="h-4 w-4" />
                    Ver Módulo EPP Completo
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  Recursos Financieros (Estándar 1.1.3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">Presupuesto Total</p>
                    <p className="text-xl font-bold text-blue-600" data-testid="text-presupuesto-total">
                      {formatCurrency(resumenIntegrado?.recursosFinancieros.total || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">Monto Ejecutado</p>
                    <p className="text-xl font-bold text-green-600" data-testid="text-monto-ejecutado">
                      {formatCurrency(resumenIntegrado?.recursosFinancieros.ejecutado || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-gray-900 rounded-md border">
                    <p className="text-xs text-muted-foreground">% Ejecución</p>
                    <p className="text-xl font-bold text-purple-600" data-testid="text-porcentaje-ejecucion">
                      {resumenIntegrado?.recursosFinancieros.porcentajeEjecucion || 0}%
                    </p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Progreso de ejecución presupuestal</span>
                    <span className="font-medium">{resumenIntegrado?.recursosFinancieros.porcentajeEjecucion || 0}%</span>
                  </div>
                  <Progress value={resumenIntegrado?.recursosFinancieros.porcentajeEjecucion || 0} className="h-2" />
                </div>
                
                <Link href="/asignacion-recursos" className="block">
                  <Button variant="outline" size="sm" className="w-full gap-2" data-testid="button-ir-recursos">
                    <DollarSign className="h-4 w-4" />
                    Ver Recursos Financieros
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      <Dialog open={itemDialogOpen} onOpenChange={(open) => {
        setItemDialogOpen(open);
        if (!open) {
          setAutoFillFromEvaluacion(false);
          setSelectedEvaluacionId(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar Item de Adquisición" : "Nuevo Item de Adquisición"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!editingItem && evaluacionesAprobadas.length > 0 && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Vincular con Evaluación Aprobada</label>
                    <Select
                      value={selectedEvaluacionId || "none"}
                      onValueChange={handleAutoFillFromEvaluacion}
                    >
                      <SelectTrigger data-testid="select-evaluacion-aprobada">
                        <SelectValue placeholder="Seleccione una evaluación (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sin vincular (ingreso manual)</SelectItem>
                        {evaluacionesAprobadas.map((evaluacion) => {
                          const solicitud = solicitudes.find(s => s.id === evaluacion.solicitudId);
                          const descripcion = solicitud?.descripcion?.substring(0, 50) || "Sin descripción";
                          return (
                            <SelectItem key={evaluacion.id} value={evaluacion.id}>
                              {solicitud?.numeroSolicitud || "EVA"} - {descripcion}{descripcion.length >= 50 ? "..." : ""}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {autoFillFromEvaluacion && selectedEvaluacionId && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4" data-testid="autofill-indicator">
                      <div className="flex items-start gap-3">
                        <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Datos pre-llenados automáticamente
                          </p>
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            Datos pre-llenados desde evaluación <span className="font-semibold">{getEvaluacionLabel(selectedEvaluacionId)}</span>. Puede modificar los valores según sea necesario.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombreProducto"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nombre del Producto *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Casco de seguridad industrial" data-testid="input-nombre-producto" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoría *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-categoria">
                            <SelectValue placeholder="Seleccione categoría" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(categoriaConfig).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              <span className="flex items-center gap-2">
                                {getCategoryIcon(key)}
                                {config.label}
                              </span>
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
                  name="marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: 3M" data-testid="input-marca" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: H-700" data-testid="input-modelo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="referencia"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referencia</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Código de referencia" data-testid="input-referencia" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de serie" data-testid="input-serial" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cantidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={1} 
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onBlur={() => { if (field.value === '' || field.value == null) field.onChange(1); }}
                          data-testid="input-cantidad" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unidad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="unidades" data-testid="input-unidad" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precioUnitario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio Unitario ($)</FormLabel>
                      <FormControl>
                        <CurrencyInput 
                          value={field.value}
                          onChange={field.onChange}
                          data-testid="input-precio-unitario" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="resourceAllocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recurso Financiero (1.1.3)</FormLabel>
                      <Select value={field.value || ""} onValueChange={(v) => field.onChange(v || undefined)}>
                        <FormControl>
                          <SelectTrigger data-testid="select-recurso-financiero">
                            <SelectValue placeholder="Vincular presupuesto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">Sin vincular</SelectItem>
                          {recursosFinancieros.map((recurso) => {
                            const monto = parseInt(String(recurso.inversionEstimada).replace(/[^\d]/g, ''), 10) || 0;
                            return (
                              <SelectItem key={recurso.id} value={recurso.id}>
                                Presupuesto SST - {formatCurrency(monto)}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Compra</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-fecha-compra" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vidaUtilMeses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vida Útil (meses)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min={0} 
                          {...field} 
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          data-testid="input-vida-util" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fechaVencimiento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Vencimiento</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-fecha-vencimiento" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fichaTecnicaUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Ficha Técnica</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-ficha-tecnica-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hojaSeguridadUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Hoja de Seguridad (MSDS)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." data-testid="input-hoja-seguridad-url" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="normasAplicables"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Normas Aplicables</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: NTC-ISO 14001, ANSI Z89.1" data-testid="input-normas" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="especificacionesSst"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Especificaciones SST</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Requisitos de seguridad específicos del producto"
                          rows={2}
                          data-testid="textarea-especificaciones-sst" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Observaciones adicionales"
                          rows={2}
                          data-testid="textarea-observaciones" 
                        />
                      </FormControl>
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
                      <Select value={field.value || "activo"} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger data-testid="select-estado">
                            <SelectValue placeholder="Seleccione estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                          <SelectItem value="rechazado">Rechazado (Devolución)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setItemDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-guardar-item"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar el item "{itemToDelete?.nombreProducto}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => itemToDelete && deleteMutation.mutate(itemToDelete.id)}
              disabled={deleteMutation.isPending}
              data-testid="button-confirmar-eliminar"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );

  if (embedded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Inventario de Items Adquiridos</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Administre los items de adquisición con fichas técnicas según el Estándar 2.9.1 (Resolución 0312/2019)
        </p>
        {mainContent}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Gestión de Adquisiciones SST
          </DialogTitle>
          <DialogDescription>
            Administre los items de adquisición con fichas técnicas según el Estándar 2.9.1 (Resolución 0312/2019)
          </DialogDescription>
        </DialogHeader>
        {mainContent}
      </DialogContent>
    </Dialog>
  );
}
