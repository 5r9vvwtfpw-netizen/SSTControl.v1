import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { BarChart3, Plus, Edit, Trash2, TrendingUp, ArrowLeft, Calculator, FileText, Save, Calendar, Sparkles } from "lucide-react";
import type { AccidentStatistics } from "@shared/schema";

const TREND_ANALYSIS_OPTIONS = [
  "Se observa una reducción del índice de frecuencia respecto al período anterior",
  "El índice de severidad muestra una tendencia al alza que requiere intervención",
  "Los indicadores se mantienen estables dentro de las metas establecidas",
  "Se evidencia aumento en la tasa de accidentalidad comparado con el año anterior",
  "Los días perdidos han disminuido significativamente",
  "Se identifica concentración de accidentes en un área específica",
  "Los accidentes de tránsito representan la mayor proporción del total",
  "El indicador ILI se mantiene por debajo del límite tolerable",
];

const CONCLUSIONS_OPTIONS = [
  "El SG-SST requiere reforzar las medidas de control en áreas críticas",
  "Los programas de prevención han sido efectivos en reducir la accidentalidad",
  "Se requiere capacitación adicional para el personal operativo",
  "Los EPP actuales son adecuados pero se requiere mayor supervisión de uso",
  "Las causas principales de accidentes están relacionadas con actos inseguros",
  "Se evidencia necesidad de actualizar la matriz de peligros",
  "El COPASST debe intensificar las inspecciones en zonas de alto riesgo",
  "Los controles implementados son insuficientes para el nivel de riesgo identificado",
];

const IMPROVEMENT_ACTIONS_OPTIONS = [
  "Implementar programa de observación de comportamientos seguros",
  "Reforzar capacitación en identificación de peligros y control de riesgos",
  "Actualizar procedimientos de trabajo seguro en las áreas críticas",
  "Incrementar frecuencia de inspecciones de seguridad",
  "Mejorar señalización en áreas de circulación",
  "Renovar y mejorar elementos de protección personal",
  "Implementar pausas activas y programa de prevención de lesiones músculo-esqueléticas",
  "Fortalecer programa de mantenimiento preventivo de equipos",
  "Realizar campañas de sensibilización sobre autocuidado",
  "Establecer reconocimientos para áreas con cero accidentes",
];

const formSchema = z.object({
  year: z.number().min(2020).max(2100),
  totalWorkers: z.number().min(1),
  hoursWorkedHHT: z.string().min(1, "Requerido"),
  totalAccidents: z.number().min(0),
  fatalAccidents: z.number().min(0),
  severeAccidents: z.number().min(0),
  lostDays: z.number().min(0),
  totalOccupationalDiseases: z.number().min(0),
  totalIncidents: z.number().min(0),
  trendAnalysis: z.string().optional(),
  conclusions: z.string().optional(),
  improvementActions: z.string().optional(),
  status: z.enum(["borrador", "completado", "aprobado", "cerrado"]).default("borrador"),
});

type FormData = z.infer<typeof formSchema>;

function calculateIndicators(data: { hoursWorkedHHT: number; totalAccidents: number; lostDays: number; totalWorkers: number; totalOccupationalDiseases: number }) {
  const { hoursWorkedHHT, totalAccidents, lostDays, totalWorkers, totalOccupationalDiseases } = data;
  const indicadorIF = hoursWorkedHHT > 0 ? (totalAccidents * 200000) / hoursWorkedHHT : 0;
  const indicadorIS = hoursWorkedHHT > 0 ? (lostDays * 200000) / hoursWorkedHHT : 0;
  const indicadorILI = (indicadorIF * indicadorIS) / 1000;
  const tasaAccidentalidad = (totalAccidents / totalWorkers) * 100;
  const tasaEnfermedadLaboral = (totalOccupationalDiseases / totalWorkers) * 100;
  return { indicadorIF, indicadorIS, indicadorILI, tasaAccidentalidad, tasaEnfermedadLaboral };
}

export default function IndicadoresAccidentalidad() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompanyContext();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const companyId = selectedCompany?.id || user?.companyId;
  
  // Esperar a que el contexto de empresa esté listo
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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  const { data: statistics = [], isLoading } = useQuery<AccidentStatistics[]>({
    queryKey: ["/api/accident-statistics", { companyId }],
    queryFn: async () => {
      const res = await fetch(`/api/accident-statistics?companyId=${companyId}`);
      if (!res.ok) throw new Error("Failed to fetch statistics");
      return res.json();
    },
    enabled: !!companyId,
  });
  
  const currentYearData = useMemo(() => statistics.find(s => s.year === selectedYear && !s.month), [statistics, selectedYear]);
  const previousYearData = useMemo(() => statistics.find(s => s.year === selectedYear - 1 && !s.month), [statistics, selectedYear]);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      year: currentYear,
      totalWorkers: selectedCompany?.numberOfWorkers || 1,
      hoursWorkedHHT: "",
      totalAccidents: 0,
      fatalAccidents: 0,
      severeAccidents: 0,
      lostDays: 0,
      totalOccupationalDiseases: 0,
      totalIncidents: 0,
      trendAnalysis: "",
      conclusions: "",
      improvementActions: "",
      status: "borrador",
    },
  });
  
  const watchedValues = form.watch();
  const liveIndicators = useMemo(() => {
    const hht = parseFloat(watchedValues.hoursWorkedHHT) || 0;
    return calculateIndicators({
      hoursWorkedHHT: hht,
      totalAccidents: watchedValues.totalAccidents || 0,
      lostDays: watchedValues.lostDays || 0,
      totalWorkers: watchedValues.totalWorkers || 1,
      totalOccupationalDiseases: watchedValues.totalOccupationalDiseases || 0,
    });
  }, [watchedValues]);
  
  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest("POST", "/api/accident-statistics", { ...data, companyId });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accident-statistics", { companyId }] });
      toast({ title: "Registro creado", description: "El registro estadístico se ha guardado exitosamente" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      const res = await apiRequest("PATCH", `/api/accident-statistics/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accident-statistics", { companyId }] });
      toast({ title: "Registro actualizado", description: "Los cambios se han guardado exitosamente" });
      setDialogOpen(false);
      setEditingId(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/accident-statistics/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accident-statistics", { companyId }] });
      toast({ title: "Registro eliminado" });
    },
  });
  
  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const handleEdit = (stat: AccidentStatistics) => {
    setEditingId(stat.id);
    form.reset({
      year: stat.year,
      totalWorkers: stat.totalWorkers,
      hoursWorkedHHT: stat.hoursWorkedHHT?.toString() || "",
      totalAccidents: stat.totalAccidents ?? 0,
      fatalAccidents: stat.fatalAccidents ?? 0,
      severeAccidents: stat.severeAccidents ?? 0,
      lostDays: stat.lostDays ?? 0,
      totalOccupationalDiseases: stat.totalOccupationalDiseases ?? 0,
      totalIncidents: stat.totalIncidents ?? 0,
      trendAnalysis: stat.trendAnalysis || "",
      conclusions: stat.conclusions || "",
      improvementActions: stat.improvementActions || "",
      status: stat.status as "borrador" | "completado" | "aprobado" | "cerrado",
    });
    setDialogOpen(true);
  };
  
  const handleNewRecord = () => {
    setEditingId(null);
    form.reset({
      year: currentYear,
      totalWorkers: selectedCompany?.numberOfWorkers || 1,
      hoursWorkedHHT: "",
      totalAccidents: 0,
      fatalAccidents: 0,
      severeAccidents: 0,
      lostDays: 0,
      totalOccupationalDiseases: 0,
      totalIncidents: 0,
      trendAnalysis: "",
      conclusions: "",
      improvementActions: "",
      status: "borrador",
    });
    setDialogOpen(true);
  };
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      borrador: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      completado: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      aprobado: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      cerrado: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    };
    return <Badge className={variants[status] || ""}>{status}</Badge>;
  };
  
  const formatNumber = (num: string | number | null | undefined) => {
    if (num === null || num === undefined) return "—";
    const n = typeof num === "string" ? parseFloat(num) : num;
    return isNaN(n) ? "—" : n.toFixed(2);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/evaluaciones-sst")} data-testid="button-back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-violet-600" />
              Indicadores de Accidentalidad SST
            </h1>
            <p className="text-muted-foreground">Estándar 3.2.2 - Resolución 0312/2019</p>
          </div>
        </div>
        <Button onClick={handleNewRecord} data-testid="button-new-record">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Registro Anual
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Período de Análisis
            </CardTitle>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
              <SelectTrigger className="w-32" data-testid="select-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Índice de Frecuencia (IF)</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(currentYearData?.indicadorIF)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">(AT × 200.000) / HHT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Índice de Severidad (IS)</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(currentYearData?.indicadorIS)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">(Días × 200.000) / HHT</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ILI</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(currentYearData?.indicadorILI)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">(IF × IS) / 1000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasa Accidentalidad</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(currentYearData?.tasaAccidentalidad)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">(AT / Trabajadores) × 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tasa EL</CardDescription>
            <CardTitle className="text-2xl">{formatNumber(currentYearData?.tasaEnfermedadLaboral)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">(EL / Trabajadores) × 100</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Comparativo Año Actual vs Anterior
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-right">{selectedYear - 1}</TableHead>
                <TableHead className="text-right">{selectedYear}</TableHead>
                <TableHead className="text-right">Variación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Total Accidentes de Trabajo</TableCell>
                <TableCell className="text-right">{previousYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.totalAccidents ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {currentYearData && previousYearData && previousYearData.totalAccidents ? (
                    <Badge className={(currentYearData.totalAccidents ?? 0) <= (previousYearData.totalAccidents ?? 0) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {(((currentYearData.totalAccidents ?? 0) - (previousYearData.totalAccidents ?? 0)) / (previousYearData.totalAccidents || 1) * 100).toFixed(1)}%
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Días Perdidos</TableCell>
                <TableCell className="text-right">{previousYearData?.lostDays ?? "—"}</TableCell>
                <TableCell className="text-right">{currentYearData?.lostDays ?? "—"}</TableCell>
                <TableCell className="text-right">
                  {currentYearData && previousYearData && previousYearData.lostDays ? (
                    <Badge className={(currentYearData.lostDays ?? 0) <= (previousYearData.lostDays ?? 0) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                      {(((currentYearData.lostDays ?? 0) - (previousYearData.lostDays ?? 0)) / (previousYearData.lostDays || 1) * 100).toFixed(1)}%
                    </Badge>
                  ) : "—"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Índice de Frecuencia</TableCell>
                <TableCell className="text-right">{formatNumber(previousYearData?.indicadorIF)}</TableCell>
                <TableCell className="text-right">{formatNumber(currentYearData?.indicadorIF)}</TableCell>
                <TableCell className="text-right">—</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Índice de Severidad</TableCell>
                <TableCell className="text-right">{formatNumber(previousYearData?.indicadorIS)}</TableCell>
                <TableCell className="text-right">{formatNumber(currentYearData?.indicadorIS)}</TableCell>
                <TableCell className="text-right">—</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {currentYearData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Análisis y Conclusiones - {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="font-semibold">Análisis de Tendencias</Label>
              <p className="text-sm text-muted-foreground mt-1">{currentYearData.trendAnalysis || "Sin análisis registrado"}</p>
            </div>
            <div>
              <Label className="font-semibold">Conclusiones del Estudio</Label>
              <p className="text-sm text-muted-foreground mt-1">{currentYearData.conclusions || "Sin conclusiones registradas"}</p>
            </div>
            <div>
              <Label className="font-semibold">Acciones de Mejora</Label>
              <p className="text-sm text-muted-foreground mt-1">{currentYearData.improvementActions || "Sin acciones registradas"}</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => handleEdit(currentYearData)} data-testid="button-edit-current">
              <Edit className="h-4 w-4 mr-2" />
              Editar Registro
            </Button>
          </CardFooter>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Historial de Registros</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : statistics.length === 0 ? (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay registros estadísticos</p>
              <Button className="mt-4" onClick={handleNewRecord}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Registro
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Año</TableHead>
                  <TableHead>Trabajadores</TableHead>
                  <TableHead>AT</TableHead>
                  <TableHead>Días</TableHead>
                  <TableHead>IF</TableHead>
                  <TableHead>IS</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statistics.map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell className="font-medium">{stat.year}</TableCell>
                    <TableCell>{stat.totalWorkers}</TableCell>
                    <TableCell>{stat.totalAccidents}</TableCell>
                    <TableCell>{stat.lostDays}</TableCell>
                    <TableCell>{formatNumber(stat.indicadorIF)}</TableCell>
                    <TableCell>{formatNumber(stat.indicadorIS)}</TableCell>
                    <TableCell>{getStatusBadge(stat.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(stat)} data-testid={`button-edit-${stat.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(stat.id)} data-testid={`button-delete-${stat.id}`}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {editingId ? "Editar Registro Estadístico" : "Nuevo Registro Estadístico"}
            </DialogTitle>
            <DialogDescription>Complete los datos base para el cálculo automático de indicadores SST</DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="year" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año *</FormLabel>
                    <Select value={field.value.toString()} onValueChange={(v) => field.onChange(parseInt(v))}>
                      <FormControl><SelectTrigger data-testid="input-year"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>{years.map((y) => (<SelectItem key={y} value={y.toString()}>{y}</SelectItem>))}</SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl><SelectTrigger data-testid="input-status"><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold mb-3">Datos Base para Cálculo</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="totalWorkers" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Trabajadores *</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }} data-testid="input-workers" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="hoursWorkedHHT" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Horas Hombre Trabajadas (HHT) *</FormLabel>
                      <FormControl><Input {...field} placeholder="ej: 480000" data-testid="input-hht" /></FormControl>
                      <FormDescription className="text-xs">Total horas trabajadas en el período</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="totalAccidents" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Accidentes de Trabajo</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }} data-testid="input-accidents" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fatalAccidents" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accidentes Mortales</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }} data-testid="input-fatal" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lostDays" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Días Perdidos</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }} data-testid="input-lost-days" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="totalOccupationalDiseases" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enfermedades Laborales</FormLabel>
                      <FormControl><Input type="number" {...field} value={field.value ?? ''} onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))} onBlur={() => { if (field.value === '' || field.value == null) field.onChange(0); }} data-testid="input-diseases" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800">
                <h4 className="font-semibold text-violet-700 dark:text-violet-300 mb-3 flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Indicadores Calculados (Vista Previa)
                </h4>
                <div className="grid grid-cols-5 gap-4 text-center">
                  <div><p className="text-xs text-muted-foreground">IF</p><p className="text-lg font-bold">{liveIndicators.indicadorIF.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">IS</p><p className="text-lg font-bold">{liveIndicators.indicadorIS.toFixed(2)}</p></div>
                  <div><p className="text-xs text-muted-foreground">ILI</p><p className="text-lg font-bold">{liveIndicators.indicadorILI.toFixed(4)}</p></div>
                  <div><p className="text-xs text-muted-foreground">Tasa AT</p><p className="text-lg font-bold">{liveIndicators.tasaAccidentalidad.toFixed(2)}%</p></div>
                  <div><p className="text-xs text-muted-foreground">Tasa EL</p><p className="text-lg font-bold">{liveIndicators.tasaEnfermedadLaboral.toFixed(2)}%</p></div>
                </div>
              </div>

              <div className="space-y-4">
                <FormField control={form.control} name="trendAnalysis" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Análisis de Tendencias
                    </FormLabel>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {TREND_ANALYSIS_OPTIONS.map((option, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const current = field.value || "";
                            const newValue = current ? `${current}. ${option}` : option;
                            field.onChange(newValue);
                          }}
                          data-testid={`chip-trend-${idx}`}
                        >
                          + {option.substring(0, 40)}...
                        </Badge>
                      ))}
                    </div>
                    <FormControl><Textarea {...field} placeholder="Seleccione opciones arriba o escriba aquí..." className="min-h-[80px]" data-testid="input-trend-analysis" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="conclusions" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Conclusiones del Estudio
                    </FormLabel>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {CONCLUSIONS_OPTIONS.map((option, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const current = field.value || "";
                            const newValue = current ? `${current}. ${option}` : option;
                            field.onChange(newValue);
                          }}
                          data-testid={`chip-conclusion-${idx}`}
                        >
                          + {option.substring(0, 40)}...
                        </Badge>
                      ))}
                    </div>
                    <FormControl><Textarea {...field} placeholder="Seleccione opciones arriba o escriba aquí..." className="min-h-[80px]" data-testid="input-conclusions" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="improvementActions" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      Acciones de Mejora
                    </FormLabel>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {IMPROVEMENT_ACTIONS_OPTIONS.map((option, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="cursor-pointer text-xs"
                          onClick={() => {
                            const current = field.value || "";
                            const newValue = current ? `${current}. ${option}` : option;
                            field.onChange(newValue);
                          }}
                          data-testid={`chip-action-${idx}`}
                        >
                          + {option.substring(0, 35)}...
                        </Badge>
                      ))}
                    </div>
                    <FormControl><Textarea {...field} placeholder="Seleccione opciones arriba o escriba aquí..." className="min-h-[80px]" data-testid="input-improvement-actions" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} data-testid="button-save">
                  <Save className="h-4 w-4 mr-2" />
                  {createMutation.isPending || updateMutation.isPending ? "Guardando..." : "Guardar Registro"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
