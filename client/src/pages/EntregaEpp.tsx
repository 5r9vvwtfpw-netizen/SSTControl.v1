import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, Edit, Trash2, HardHat, Glasses, Search, Filter,
  Wind, Footprints, Shirt, ShieldCheck, ArrowLeft, Sparkles, Bot,
  UserPlus, CalendarDays, RefreshCw, AlertTriangle, Clock, ArrowUpDown, Briefcase, FileText
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation, Link } from "wouter";
import { LuEar, LuHand } from "react-icons/lu";
import type { EppDelivery, EppCatalog, Worker } from "@shared/schema";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const formSchema = z.object({
  workerId: z.string().min(1, "Seleccione un trabajador"),
  eppCatalogId: z.string().optional(),
  eppName: z.string().min(1, "Nombre del EPP requerido"),
  eppCategory: z.enum(["proteccion_cabeza", "proteccion_visual", "proteccion_auditiva", "proteccion_respiratoria", "proteccion_manos", "proteccion_pies", "proteccion_corporal", "proteccion_caidas", "proteccion_facial", "otro"]),
  deliveryDate: z.string().min(1, "Fecha requerida"),
  quantity: z.coerce.number().min(1, "Mínimo 1"),
  size: z.string().optional(),
  deliveryReason: z.string().optional(),
  workerSignature: z.boolean().default(false),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

const eppCategories: Record<string, { label: string; icon: any; color: string }> = {
  proteccion_cabeza: { label: "Cabeza", icon: HardHat, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  proteccion_visual: { label: "Visual", icon: Glasses, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  proteccion_facial: { label: "Facial", icon: Glasses, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  proteccion_auditiva: { label: "Auditiva", icon: LuEar, color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  proteccion_respiratoria: { label: "Respiratoria", icon: Wind, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  proteccion_manos: { label: "Manos", icon: LuHand, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  proteccion_pies: { label: "Pies", icon: Footprints, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  proteccion_corporal: { label: "Corporal", icon: Shirt, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  proteccion_caidas: { label: "Caídas", icon: ShieldCheck, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  otro: { label: "Otros", icon: ShieldCheck, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
};

const deliveryReasonOptions: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  dotacion_inicial: { 
    label: "Dotación Inicial", 
    description: "Primera entrega al ingresar a la empresa",
    icon: UserPlus
  },
  dotacion_periodica: { 
    label: "Dotación Periódica", 
    description: "Entrega programada cada 4 meses (Art. 230 CST)",
    icon: CalendarDays
  },
  reposicion_desgaste: { 
    label: "Reposición por Desgaste", 
    description: "Desgaste natural por uso según vida útil",
    icon: RefreshCw
  },
  reposicion_dano: { 
    label: "Reposición por Daño", 
    description: "Daño durante labores que lo hace inservible",
    icon: AlertTriangle
  },
  vencimiento: { 
    label: "Vencimiento de Vida Útil", 
    description: "EPP ha cumplido su período de vida útil",
    icon: Clock
  },
  perdida: { 
    label: "Pérdida", 
    description: "EPP extraviado o robado",
    icon: Search
  },
  cambio_size: { 
    label: "Cambio de Talla", 
    description: "Cambio por size inadecuada",
    icon: ArrowUpDown
  },
  cambio_puesto: { 
    label: "Cambio de Puesto", 
    description: "Nuevo EPP por cambio de funciones",
    icon: Briefcase
  },
  actualizacion_normativa: { 
    label: "Actualización Normativa", 
    description: "Nueva norma técnica exige EPP diferente",
    icon: FileText
  },
};

export default function EntregaEpp() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompanyContext();
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("todos");
  const [manualEntry, setManualEntry] = useState(false);
  const [catalogSearchTerm, setCatalogSearchTerm] = useState("");
  const [workerSearchTerm, setWorkerSearchTerm] = useState("");

  const companyId = selectedCompany?.id || user?.companyId;

  const { data: deliveries = [], isLoading } = useQuery<EppDelivery[]>({
    queryKey: ["/api/epp/deliveries", { companyId }],
    queryFn: async () => {
      const res = await fetch("/api/epp/deliveries", { credentials: "include" });
      if (!res.ok) throw new Error("Error al cargar entregas");
      return res.json();
    },
    enabled: !!companyId,
  });

  const { data: catalog = [] } = useQuery<EppCatalog[]>({
    queryKey: ["/api/epp/catalog"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
    enabled: !!companyId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: "",
      eppCatalogId: "",
      eppName: "",
      eppCategory: "proteccion_cabeza",
      deliveryDate: new Date().toISOString().split('T')[0],
      quantity: 1,
      size: "",
      deliveryReason: "dotacion_inicial",
      workerSignature: true,
      observations: "",
    },
  });

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((delivery: any) => {
      const workerName = delivery.worker?.name || "";
      const matchesSearch = workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.eppName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "todos" || delivery.eppCategory === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [deliveries, searchTerm, categoryFilter]);

  const filteredWorkers = useMemo(() => {
    if (!workerSearchTerm.trim()) return workers;
    const term = workerSearchTerm.toLowerCase();
    return workers.filter(w => 
      w.name?.toLowerCase().includes(term) || 
      w.position?.toLowerCase().includes(term) ||
      w.identificationNumber?.toLowerCase().includes(term)
    );
  }, [workers, workerSearchTerm]);

  const filteredCatalog = useMemo(() => {
    if (!catalogSearchTerm.trim()) return catalog;
    const term = catalogSearchTerm.toLowerCase();
    return catalog.filter(c => 
      c.name?.toLowerCase().includes(term) || 
      eppCategories[c.category]?.label.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term)
    );
  }, [catalog, catalogSearchTerm]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        companyId,
        eppCatalogId: data.eppCatalogId || null,
      };
      const res = await apiRequest("POST", "/api/epp/deliveries", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epp/deliveries"] });
      toast({ title: "Entrega registrada", description: "El registro se ha guardado exitosamente" });
      setDialogOpen(false);
      form.reset();
      setManualEntry(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      const payload = {
        ...data,
        eppCatalogId: data.eppCatalogId || null,
      };
      const res = await apiRequest("PATCH", `/api/epp/deliveries/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epp/deliveries"] });
      toast({ title: "Entrega actualizada", description: "Los cambios se han guardado exitosamente" });
      setDialogOpen(false);
      setEditingId(null);
      form.reset();
      setManualEntry(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/epp/deliveries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epp/deliveries"] });
      toast({ title: "Entrega eliminada" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (delivery: EppDelivery) => {
    setEditingId(delivery.id);
    const hasManualEntry = !delivery.eppCatalogId;
    setManualEntry(hasManualEntry);
    form.reset({
      workerId: delivery.workerId,
      eppCatalogId: delivery.eppCatalogId || "",
      eppName: delivery.eppName,
      eppCategory: delivery.eppCategory as any,
      deliveryDate: delivery.deliveryDate,
      quantity: delivery.quantity || 1,
      size: delivery.size || "",
      deliveryReason: delivery.deliveryReason || "",
      workerSignature: delivery.workerSignature ?? true,
      observations: delivery.observations || "",
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    setManualEntry(false);
    form.reset({
      workerId: "",
      eppCatalogId: "",
      eppName: "",
      eppCategory: "proteccion_cabeza",
      deliveryDate: new Date().toISOString().split('T')[0],
      quantity: 1,
      size: "",
      deliveryReason: "dotacion_inicial",
      workerSignature: true,
      observations: "",
    });
    setDialogOpen(true);
  };

  const handleCatalogSelect = (catalogId: string) => {
    if (catalogId === "manual") {
      setManualEntry(true);
      form.setValue("eppCatalogId", "");
      form.setValue("eppName", "");
      form.setValue("eppCategory", "proteccion_cabeza");
      return;
    }
    
    setManualEntry(false);
    const selectedEpp = catalog.find(c => c.id === catalogId);
    if (selectedEpp) {
      form.setValue("eppCatalogId", catalogId);
      form.setValue("eppName", selectedEpp.name);
      form.setValue("eppCategory", selectedEpp.category as any);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("es-CO");
  };

  if (isCompanyLoading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
 <div className="flex items-center gap-4 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/evaluaciones-sst")}
            data-testid="button-back-evaluacion"
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HardHat className="h-6 w-6 text-primary" />
              Entrega de EPP
            </h1>
            <p className="text-muted-foreground text-sm">
              Registro y control de elementos de protección personal
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleNew} data-testid="button-new-delivery">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Entrega
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg">Registro de Entregas</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar trabajador o EPP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {Object.entries(eppCategories).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <HardHat className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay entregas registradas</p>
              <Button variant="outline" className="mt-4" onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera entrega
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>EPP</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead>Talla</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((delivery: any) => {
                    const categoryInfo = eppCategories[delivery.eppCategory] || eppCategories.otro;
                    const CategoryIcon = categoryInfo?.icon || ShieldCheck;

                    return (
                      <TableRow key={delivery.id} data-testid={`row-delivery-${delivery.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{delivery.worker?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{delivery.worker?.position || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{delivery.eppName}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${categoryInfo?.color || 'bg-gray-100 text-gray-700'} flex items-center gap-1 w-fit`}>
                            <CategoryIcon className="h-3 w-3" />
                            {categoryInfo?.label || delivery.eppCategory}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(delivery.deliveryDate)}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold">{delivery.quantity || 1}</span>
                        </TableCell>
                        <TableCell>{delivery.size || "—"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(delivery)}
                              data-testid={`button-edit-${delivery.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(delivery.id)}
                              data-testid={`button-delete-${delivery.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Entrega de EPP" : "Nueva Entrega de EPP"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form validation errors:", errors))} className="space-y-4">
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador *</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setWorkerSearchTerm(""); }} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-worker">
                          <SelectValue placeholder="Seleccione trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <div className="px-2 pb-2 sticky top-0 bg-popover z-10">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              placeholder="Buscar trabajador..."
                              value={workerSearchTerm}
                              onChange={(e) => setWorkerSearchTerm(e.target.value)}
                              className="pl-7 h-8 text-sm"
                              data-testid="input-search-worker"
                            />
                          </div>
                        </div>
                        {filteredWorkers.length === 0 ? (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No se encontraron trabajadores
                          </div>
                        ) : (
                          filteredWorkers.map(w => (
                            <SelectItem key={w.id} value={w.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{w.name}</span>
                                <span className="text-xs text-muted-foreground">{w.position || "Sin cargo"}</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="rounded-lg border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 p-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 shrink-0">
                    <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Asistente Inteligente de EPP</h3>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Seleccione del catálogo con {catalog.length} elementos de protección según normativa colombiana (Decreto 1072/2015, Resolución 2400/1979, normas NTC/ANSI/EN).
                      </p>
                    </div>
                    <Select 
                      onValueChange={(value) => { handleCatalogSelect(value); setCatalogSearchTerm(""); }} 
                      value={manualEntry ? "manual" : form.watch("eppCatalogId") || ""}
                    >
                      <SelectTrigger data-testid="select-catalog" className="bg-white dark:bg-slate-900">
                        <SelectValue placeholder="Busque o seleccione EPP del catálogo" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] z-50 overflow-hidden" position="popper" sideOffset={5}>
                        <div className="px-2 py-2 border-b bg-popover">
                          <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                              placeholder="Buscar EPP por nombre o categoría..."
                              value={catalogSearchTerm}
                              onChange={(e) => setCatalogSearchTerm(e.target.value)}
                              className="pl-7 h-8 text-sm"
                              data-testid="input-search-catalog"
                            />
                          </div>
                        </div>
                        <div className="max-h-[240px] overflow-y-auto">
                        <SelectItem value="manual" className="border-b mb-1">
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Agregar manualmente (EPP no está en catálogo)</span>
                          </div>
                        </SelectItem>
                        {filteredCatalog.length === 0 ? (
                          <div className="py-4 text-center text-sm text-muted-foreground">
                            No se encontraron EPP en el catálogo
                          </div>
                        ) : (
                          filteredCatalog.map(c => {
                            const catInfo = eppCategories[c.category];
                            const CatIcon = catInfo?.icon || ShieldCheck;
                            return (
                              <SelectItem key={c.id} value={c.id}>
                                <div className="flex items-center gap-2">
                                  <CatIcon className={`h-4 w-4 ${catInfo?.color?.split(' ')[1] || 'text-muted-foreground'}`} />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{c.name}</span>
                                    <span className="text-xs text-muted-foreground">{catInfo?.label || c.category}</span>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })
                        )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {!manualEntry && form.watch("eppCatalogId") ? (
                (() => {
                  const selectedEpp = catalog.find(c => c.id === form.watch("eppCatalogId"));
                  const catInfo = selectedEpp ? eppCategories[selectedEpp.category] : null;
                  const CatIcon = catInfo?.icon || ShieldCheck;
                  return selectedEpp ? (
                    <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${catInfo?.color?.split(' ')[0] || 'bg-gray-100'}`}>
                          <CatIcon className={`h-5 w-5 ${catInfo?.color?.split(' ')[1] || 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{selectedEpp.name}</h4>
                          <p className="text-sm text-muted-foreground">{catInfo?.label || selectedEpp.category}</p>
                          {selectedEpp.description && (
                            <p className="text-xs text-muted-foreground mt-1">{selectedEpp.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {selectedEpp.normaAplicable && (
                          <div className="bg-background rounded p-2">
                            <span className="text-muted-foreground block">Norma:</span>
                            <span className="font-medium">{selectedEpp.normaAplicable}</span>
                          </div>
                        )}
                        {selectedEpp.material && (
                          <div className="bg-background rounded p-2">
                            <span className="text-muted-foreground block">Material:</span>
                            <span className="font-medium">{selectedEpp.material}</span>
                          </div>
                        )}
                        {selectedEpp.vidaUtil && (
                          <div className="bg-background rounded p-2">
                            <span className="text-muted-foreground block">Vida útil:</span>
                            <span className="font-medium">{selectedEpp.vidaUtil}</span>
                          </div>
                        )}
                        {selectedEpp.tallasDisponibles && selectedEpp.tallasDisponibles.length > 0 && (
                          <div className="bg-background rounded p-2">
                            <span className="text-muted-foreground block">Tallas:</span>
                            <span className="font-medium">{selectedEpp.tallasDisponibles.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="eppName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del EPP *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Ej: Casco de seguridad" 
                            data-testid="input-epp-nombre"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eppCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-categoria">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(eppCategories).map(([key, val]) => (
                              <SelectItem key={key} value={key}>{val.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="deliveryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Entrega *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-fecha-entrega" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cantidad *</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} data-testid="input-quantity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => {
                    const selectedEpp = catalog.find(c => c.id === form.watch("eppCatalogId"));
                    const tallasDisponibles = selectedEpp?.tallasDisponibles || [];
                    const hasTallas = !manualEntry && tallasDisponibles.length > 0;
                    
                    return (
                      <FormItem>
                        <FormLabel>Talla</FormLabel>
                        {hasTallas ? (
                          <Select onValueChange={field.onChange} value={field.value || ""}>
                            <FormControl>
                              <SelectTrigger data-testid="select-size">
                                <SelectValue placeholder="Seleccione size" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {tallasDisponibles.map((size: string) => (
                                <SelectItem key={size} value={size}>{size}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <FormControl>
                            <Input {...field} placeholder="Ej: M, L, 42" data-testid="input-size" />
                          </FormControl>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                  control={form.control}
                  name="deliveryReason"
                  render={({ field }) => {
                    const selectedMotivo = field.value ? deliveryReasonOptions[field.value] : null;
                    return (
                      <FormItem>
                        <FormLabel>Motivo de Entrega *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-motivo">
                              <SelectValue placeholder="Seleccione motivo">
                                {selectedMotivo && (
                                  <div className="flex items-center gap-2">
                                    <selectedMotivo.icon className="h-4 w-4 text-muted-foreground" />
                                    <span>{selectedMotivo.label}</span>
                                  </div>
                                )}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-[300px]">
                            {Object.entries(deliveryReasonOptions).map(([key, val]) => {
                              const OptionIcon = val.icon;
                              return (
                                <SelectItem key={key} value={key} className="py-2.5">
                                  <div className="flex items-start gap-3">
                                    <OptionIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                    <div className="flex flex-col gap-0.5">
                                      <span className="font-medium">{val.label}</span>
                                      <span className="text-xs text-muted-foreground">{val.description}</span>
                                    </div>
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

              <FormField
                control={form.control}
                name="workerSignature"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-capacitacion"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Capacitación de uso proporcionada</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        El trabajador recibió instrucciones sobre el uso correcto del EPP
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Notas adicionales..." data-testid="input-observations" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} data-testid="button-cancel">
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-delivery"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
