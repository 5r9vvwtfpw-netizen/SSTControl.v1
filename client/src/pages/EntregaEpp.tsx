import { useState, useMemo } from "react";
import { getTodayDateString } from "@/lib/utils/formatters";
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
import { queryClient, apiRequest, buildHeaders } from "@/lib/queryClient";
import { Plus, Edit, Trash2, HardHat, Glasses, Search, Filter, Wind, Footprints, Shirt, ShieldCheck, ArrowLeft, Bot, UserPlus, CalendarDays, RefreshCw, AlertTriangle, Clock, ArrowUpDown, Briefcase, FileText, FileDown, Printer, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useLocation } from "wouter";
import { LuEar, LuHand } from "react-icons/lu";
import type { EppCatalog, Worker } from "@shared/schema";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const categories = ["proteccion_cabeza", "proteccion_visual", "proteccion_auditiva", "proteccion_respiratoria", "proteccion_manos", "proteccion_pies", "proteccion_corporal", "proteccion_caidas", "proteccion_facial", "otro"] as const;
const formSchema = z.object({
  workerId: z.string().min(1, "Seleccione un trabajador"),
  deliveryDate: z.string().min(1, "Fecha requerida"),
  deliveryReason: z.string().min(1, "Seleccione un motivo"),
  workerSignature: z.boolean().default(false),
  observations: z.string().optional(),
});
type FormData = z.infer<typeof formSchema>;
type ActItem = { id?: string; eppCatalogId?: string | null; eppName: string; eppCategory: string; quantity: number; size?: string; serialNumber?: string; lotNumber?: string; expirationDate?: string };
type DeliveryAct = { id: string; deliveryGroupId?: string; companyId?: string; workerId: string; deliveryDate: string; deliveryReason?: string; workerSignature?: boolean; observations?: string; deliveredBy?: string; worker?: Worker; items: ActItem[] };

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
const reasons: Record<string, { label: string; description: string; icon: LucideIcon }> = {
  dotacion_inicial: { label: "Dotación Inicial", description: "Primera entrega al ingresar a la empresa", icon: UserPlus },
  dotacion_periodica: { label: "Dotación Periódica", description: "Entrega programada cada 4 meses", icon: CalendarDays },
  reposicion_desgaste: { label: "Reposición por Desgaste", description: "Desgaste natural por uso", icon: RefreshCw },
  reposicion_dano: { label: "Reposición por Daño", description: "Daño durante labores", icon: AlertTriangle },
  vencimiento: { label: "Vencimiento de Vida Útil", description: "Cumplió su período de vida útil", icon: Clock },
  perdida: { label: "Pérdida", description: "EPP extraviado o robado", icon: Search },
  cambio_size: { label: "Cambio de Talla", description: "Cambio por talla inadecuada", icon: ArrowUpDown },
  cambio_puesto: { label: "Cambio de Puesto", description: "Nuevo EPP por cambio de funciones", icon: Briefcase },
  actualizacion_normativa: { label: "Actualización Normativa", description: "Nueva norma técnica", icon: FileText },
};

export default function EntregaEpp() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedCompany, isLoading: companyLoading } = useCompanyContext();
  const [, setLocation] = useLocation();
  const companyId = selectedCompany?.id || user?.companyId;
  const [dialogOpen, setDialogOpen] = useState(false), [editingId, setEditingId] = useState<string | null>(null);
  const [items, setItems] = useState<ActItem[]>([]), [manualEntry, setManualEntry] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""), [categoryFilter, setCategoryFilter] = useState("todos");
  const [catalogSearchTerm, setCatalogSearchTerm] = useState(""), [workerSearchTerm, setWorkerSearchTerm] = useState("");
  const [draft, setDraft] = useState<ActItem>({ eppName: "", eppCategory: "proteccion_cabeza", quantity: 1, size: "" });
  const { data: deliveries = [], isLoading } = useQuery<DeliveryAct[]>({ queryKey: ["/api/epp/deliveries", { companyId }], queryFn: async () => { const r = await fetch("/api/epp/deliveries", { credentials: "include", headers: buildHeaders(false) }); if (!r.ok) throw new Error("Error al cargar actas"); return r.json(); }, enabled: !!companyId });
  const { data: catalog = [] } = useQuery<EppCatalog[]>({ queryKey: ["/api/epp/catalog"] });
  const { data: workers = [] } = useQuery<Worker[]>({ queryKey: ["/api/workers"], enabled: !!companyId });
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { workerId: "", deliveryDate: getTodayDateString(), deliveryReason: "dotacion_inicial", workerSignature: true, observations: "" } });

  const filteredWorkers = useMemo(() => { const t = workerSearchTerm.toLowerCase(); return t ? workers.filter(w => w.name?.toLowerCase().includes(t) || w.position?.toLowerCase().includes(t) || w.identificationNumber?.toLowerCase().includes(t)) : workers; }, [workers, workerSearchTerm]);
  const filteredCatalog = useMemo(() => { const t = catalogSearchTerm.toLowerCase(); return t ? catalog.filter(c => c.name?.toLowerCase().includes(t) || eppCategories[c.category]?.label.toLowerCase().includes(t) || c.description?.toLowerCase().includes(t)) : catalog; }, [catalog, catalogSearchTerm]);
  const filteredDeliveries = useMemo(() => deliveries.filter(d => {
    const names = d.items?.map(i => i.eppName).join(" ") || "";
    return (d.worker?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || names.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === "";
  }).filter(d => categoryFilter === "todos" || d.items?.some(i => i.eppCategory === categoryFilter)), [deliveries, searchTerm, categoryFilter]);

  const resetEditor = () => { form.reset({ workerId: "", deliveryDate: getTodayDateString(), deliveryReason: "dotacion_inicial", workerSignature: true, observations: "" }); setItems([]); setDraft({ eppName: "", eppCategory: "proteccion_cabeza", quantity: 1, size: "" }); setManualEntry(false); };
  const closeEditor = () => { setDialogOpen(false); setEditingId(null); resetEditor(); };
  const mutation = useMutation({
    mutationFn: async (data: { id?: string; form: FormData; items: ActItem[] }) => {
      if (!data.items.length) throw new Error("Agregue al menos un elemento al acta");
      const payload = {
        ...data.form,
        companyId,
        items: data.items.map(item => ({
          ...item,
          eppCatalogId: item.eppCatalogId || null,
        })),
      };
      const r = await apiRequest(data.id ? "PATCH" : "POST", data.id ? `/api/epp/deliveries/${data.id}` : "/api/epp/deliveries", payload); return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/epp/deliveries"] }); toast({ title: editingId ? "Acta actualizada" : "Acta registrada", description: "Los cambios se guardaron exitosamente" }); closeEditor(); },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });
  const deleteMutation = useMutation({ mutationFn: (id: string) => apiRequest("DELETE", `/api/epp/deliveries/${id}`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/epp/deliveries"] }); toast({ title: "Acta eliminada" }); } });
  const handleNew = () => { resetEditor(); setEditingId(null); setDialogOpen(true); };
  const handleEdit = (act: DeliveryAct) => { setEditingId(act.id); form.reset({ workerId: act.workerId, deliveryDate: act.deliveryDate?.slice(0, 10), deliveryReason: act.deliveryReason || "dotacion_inicial", workerSignature: act.workerSignature ?? true, observations: act.observations || "" }); setItems(act.items || []); setDialogOpen(true); };
  const selectCatalog = (id: string) => { if (id === "manual") { setManualEntry(true); setDraft({ eppName: "", eppCategory: "proteccion_cabeza", quantity: 1, size: "" }); } else { const c = catalog.find(x => x.id === id); if (c) { setManualEntry(false); setDraft({ eppName: c.name, eppCategory: c.category, quantity: 1, size: "", eppCatalogId: c.id }); } } setCatalogSearchTerm(""); };
  const addItem = () => { if (!draft.eppName.trim() || !draft.quantity || draft.quantity < 1) { toast({ title: "Complete el elemento", description: "Nombre y cantidad son requeridos", variant: "destructive" }); return; } setItems(old => [...old, { ...draft, quantity: Number(draft.quantity) }]); setDraft({ eppName: "", eppCategory: "proteccion_cabeza", quantity: 1, size: "" }); setManualEntry(false); };
  const formatDate = (date?: string) => date ? new Date(date).toLocaleDateString("es-CO") : "—";
  const download = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, { credentials: "include", headers: buildHeaders(false) });
      if (!response.ok) throw new Error((await response.text()) || "No fue posible generar el PDF");
      const objectUrl = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error: any) {
      toast({ title: "Error al descargar", description: error.message, variant: "destructive" });
    }
  };

  if (companyLoading) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center py-6">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-6">
      <div className="flex flex-wrap items-center gap-4">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/evaluaciones-sst")}
            data-testid="button-back-evaluacion"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <HardHat className="h-6 w-6 text-primary" />
              Actas de EPP
            </h1>
            <p className="text-sm text-muted-foreground">
              Registro y control de elementos de protección personal
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => download("/api/epp/deliveries/pdf", "actas-epp.pdf")}
            data-testid="button-download-epp-pdf"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button onClick={handleNew} data-testid="button-new-delivery">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Acta
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-lg">Registro de Actas</CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar trabajador o EPP..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-[220px] pl-9"
                  data-testid="input-search"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[190px]" data-testid="select-category-filter">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las categorías</SelectItem>
                  {Object.entries(eppCategories).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">Cargando...</div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <HardHat className="mx-auto mb-4 h-12 w-12 opacity-20" />
              <p>No hay actas registradas</p>
              <Button variant="outline" className="mt-4" onClick={handleNew}>
                <Plus className="mr-2 h-4 w-4" />
                Registrar primera acta
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Elementos</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.map((act) => {
                    const total = act.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
                    return (
                      <TableRow key={act.id} data-testid={`row-delivery-${act.id}`}>
                        <TableCell>
                          <div className="font-medium">{act.worker?.name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{act.worker?.position || ""}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {act.items?.[0]?.eppName || "—"}
                            {(act.items?.length || 0) > 1 && (
                              <span className="text-muted-foreground"> + {(act.items?.length || 0) - 1} más</span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {act.items?.length || 0} elemento(s)
                          </div>
                        </TableCell>
                        <TableCell>{reasons[act.deliveryReason || ""]?.label || act.deliveryReason || "—"}</TableCell>
                        <TableCell>{formatDate(act.deliveryDate)}</TableCell>
                        <TableCell className="text-center font-bold">{total}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => download(`/api/epp/deliveries/${act.id}/pdf`, `acta-epp-${act.id}.pdf`)}
                              data-testid={`button-pdf-${act.id}`}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(act)} data-testid={`button-edit-${act.id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(act.id)} data-testid={`button-delete-${act.id}`}>
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

      <Dialog open={dialogOpen} onOpenChange={(open) => open ? setDialogOpen(true) : closeEditor()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Acta de EPP" : "Nueva Acta de EPP"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate({ id: editingId || undefined, form: data, items }))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="workerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador *</FormLabel>
                    <Select onValueChange={(value) => { field.onChange(value); setWorkerSearchTerm(""); }} value={field.value}>
                      <FormControl><SelectTrigger data-testid="select-worker"><SelectValue placeholder="Seleccione trabajador" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <div className="sticky top-0 bg-popover p-2">
                          <Input placeholder="Buscar trabajador..." value={workerSearchTerm} onChange={(event) => setWorkerSearchTerm(event.target.value)} data-testid="input-search-worker" />
                        </div>
                        {filteredWorkers.map((worker) => (
                          <SelectItem key={worker.id} value={worker.id}>
                            <div><div className="font-medium">{worker.name}</div><div className="text-xs text-muted-foreground">{worker.position || "Sin cargo"}</div></div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                  <FormItem><FormLabel>Fecha del Acta *</FormLabel><FormControl><Input type="date" {...field} data-testid="input-fecha-entrega" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="deliveryReason" render={({ field }) => (
                  <FormItem><FormLabel>Motivo *</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger data-testid="select-motivo"><SelectValue placeholder="Seleccione motivo" /></SelectTrigger></FormControl><SelectContent>{Object.entries(reasons).map(([key, reason]) => <SelectItem key={key} value={key}><div className="font-medium">{reason.label}<div className="text-xs text-muted-foreground">{reason.description}</div></div></SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                )} />
              </div>

              <div className="space-y-3 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 dark:bg-blue-950/20">
                <div className="flex items-center gap-2"><Bot className="h-5 w-5 text-blue-600" /><h3 className="font-semibold">Agregar elemento al acta</h3></div>
                <Select onValueChange={selectCatalog} value={manualEntry ? "manual" : draft.eppCatalogId || ""}>
                  <SelectTrigger data-testid="select-catalog"><SelectValue placeholder="Busque o seleccione EPP del catálogo" /></SelectTrigger>
                  <SelectContent className="max-h-[320px]">
                    <div className="sticky top-0 bg-popover p-2"><Input placeholder="Buscar EPP..." value={catalogSearchTerm} onChange={(event) => setCatalogSearchTerm(event.target.value)} data-testid="input-search-catalog" /></div>
                    <SelectItem value="manual"><Plus className="mr-2 inline h-4 w-4" />Agregar manualmente</SelectItem>
                    {filteredCatalog.map((entry) => <SelectItem key={entry.id} value={entry.id}>{entry.name} — {eppCategories[entry.category]?.label || entry.category}</SelectItem>)}
                  </SelectContent>
                </Select>
                {manualEntry && (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input placeholder="Nombre del EPP *" value={draft.eppName} onChange={(event) => setDraft((value) => ({ ...value, eppName: event.target.value }))} data-testid="input-epp-nombre" />
                    <Select value={draft.eppCategory} onValueChange={(value) => setDraft((draftValue) => ({ ...draftValue, eppCategory: value }))}>
                      <SelectTrigger data-testid="select-categoria"><SelectValue placeholder="Categoría" /></SelectTrigger>
                      <SelectContent>{categories.map((category) => <SelectItem key={category} value={category}>{eppCategories[category].label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                )}
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Input type="number" min={1} placeholder="Cantidad *" value={draft.quantity} onChange={(event) => setDraft((value) => ({ ...value, quantity: Number(event.target.value) }))} data-testid="input-quantity" />
                  {(() => {
                    const selected = catalog.find((entry) => entry.id === draft.eppCatalogId);
                    const sizes = selected?.tallasDisponibles || [];
                    return sizes.length > 0 ? (
                      <Select value={draft.size || ""} onValueChange={(size) => setDraft((value) => ({ ...value, size }))}>
                        <SelectTrigger data-testid="select-size"><SelectValue placeholder="Seleccione talla" /></SelectTrigger>
                        <SelectContent>{sizes.map((size) => <SelectItem key={size} value={size}>{size}</SelectItem>)}</SelectContent>
                      </Select>
                    ) : <Input placeholder="Talla (opcional)" value={draft.size || ""} onChange={(event) => setDraft((value) => ({ ...value, size: event.target.value }))} data-testid="input-size" />;
                  })()}
                  <Button type="button" onClick={addItem} data-testid="button-add-item"><Plus className="mr-2 h-4 w-4" />Agregar elemento</Button>
                </div>
              </div>

              <div className="space-y-2">
                <FormLabel>Elementos del acta ({items.length}) *</FormLabel>
                {items.length === 0 ? <div className="rounded border border-dashed p-4 text-center text-sm text-muted-foreground">Agregue al menos un elemento</div> : (
                  <div className="overflow-x-auto rounded border"><Table><TableHeader><TableRow><TableHead>EPP</TableHead><TableHead>Categoría</TableHead><TableHead>Cantidad</TableHead><TableHead>Talla</TableHead><TableHead /></TableRow></TableHeader><TableBody>
                    {items.map((item, index) => <TableRow key={`${item.id || "new"}-${index}`}><TableCell>{item.eppName}</TableCell><TableCell><Badge className={eppCategories[item.eppCategory]?.color}>{eppCategories[item.eppCategory]?.label || item.eppCategory}</Badge></TableCell><TableCell>{item.quantity}</TableCell><TableCell>{item.size || "—"}</TableCell><TableCell><Button type="button" variant="ghost" size="icon" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} data-testid={`button-remove-item-${index}`}><X className="h-4 w-4 text-red-500" /></Button></TableCell></TableRow>)}
                  </TableBody></Table></div>
                )}
              </div>

              <FormField control={form.control} name="workerSignature" render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} data-testid="checkbox-capacitacion" /></FormControl><div><FormLabel>Capacitación de uso proporcionada</FormLabel><p className="text-sm text-muted-foreground">El trabajador recibió instrucciones sobre el uso correcto del EPP</p></div></FormItem>
              )} />
              <FormField control={form.control} name="observations" render={({ field }) => (
                <FormItem><FormLabel>Observaciones</FormLabel><FormControl><Textarea {...field} placeholder="Notas adicionales..." data-testid="input-observations" /></FormControl></FormItem>
              )} />
              <DialogFooter><Button type="button" variant="outline" onClick={closeEditor} data-testid="button-cancel">Cancelar</Button><Button type="submit" disabled={mutation.isPending || items.length === 0} data-testid="button-submit-delivery">{mutation.isPending ? "Guardando..." : editingId ? "Actualizar acta" : "Guardar acta"}</Button></DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}