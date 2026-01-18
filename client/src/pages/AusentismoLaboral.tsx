import { useState, useMemo, useEffect } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useCompanyContext } from "@/hooks/use-company-context";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, Edit, Trash2, Calendar, FileText, Download, Search, Filter, 
  ChevronDown, ChevronUp, AlertTriangle, Clock, UserMinus, Activity,
  TrendingDown, Briefcase, Heart, Baby, Home, CalendarDays
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import type { WorkerAbsence, Worker, Accident } from "@shared/schema";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const formSchema = z.object({
  workerId: z.string().min(1, "Seleccione un trabajador"),
  absenceType: z.enum([
    "incapacidad_at", "incapacidad_el", "incapacidad_comun",
    "licencia_maternidad", "licencia_paternidad", "licencia_luto",
    "permiso_personal", "calamidad_domestica", "suspension", "otro"
  ]),
  startDate: z.string().min(1, "Fecha de inicio requerida"),
  endDate: z.string().optional(),
  diagnosis: z.string().optional(),
  cie10Code: z.string().optional(),
  incapacityNumber: z.string().optional(),
  issuerEntity: z.string().optional(),
  accidentId: z.string().optional(),
  epsFollowup: z.boolean().default(false),
  arlFollowup: z.boolean().default(false),
  observations: z.string().optional(),
  status: z.enum(["activa", "finalizada", "prorroga", "reubicacion"]).default("activa"),
});

type FormData = z.infer<typeof formSchema>;

const absenceTypeLabels: Record<string, { label: string; icon: any; color: string }> = {
  incapacidad_at: { label: "Accidente de Trabajo", icon: AlertTriangle, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  incapacidad_el: { label: "Enfermedad Laboral", icon: Activity, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  incapacidad_comun: { label: "Enfermedad Común", icon: Heart, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  licencia_maternidad: { label: "Licencia Maternidad", icon: Baby, color: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  licencia_paternidad: { label: "Licencia Paternidad", icon: Baby, color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" },
  licencia_luto: { label: "Licencia Luto", icon: Heart, color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
  permiso_personal: { label: "Permiso Personal", icon: UserMinus, color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  calamidad_domestica: { label: "Calamidad Doméstica", icon: Home, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  suspension: { label: "Suspensión", icon: Briefcase, color: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400" },
  otro: { label: "Otro", icon: Clock, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  activa: { label: "Activa", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  finalizada: { label: "Finalizada", color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  prorroga: { label: "En Prórroga", color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  reubicacion: { label: "Reubicación", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#6b7280', '#06b6d4', '#f59e0b', '#64748b', '#84cc16'];

export default function AusentismoLaboral() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedCompany, isLoading: isCompanyLoading } = useCompanyContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todos");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expandedStats, setExpandedStats] = useState(true);

  const companyId = selectedCompany?.id || user?.companyId;
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  const { data: absences = [], isLoading } = useQuery<WorkerAbsence[]>({
    queryKey: ["/api/absences", companyId],
    enabled: !!companyId,
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
    enabled: !!companyId,
  });

  const { data: accidents = [] } = useQuery<Accident[]>({
    queryKey: ["/api/accidents", companyId],
    enabled: !!companyId,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: "",
      absenceType: "incapacidad_comun",
      startDate: "",
      endDate: "",
      diagnosis: "",
      cie10Code: "",
      incapacityNumber: "",
      issuerEntity: "",
      accidentId: "",
      epsFollowup: false,
      arlFollowup: false,
      observations: "",
      status: "activa",
    },
  });

  const watchedType = form.watch("absenceType");

  const statistics = useMemo(() => {
    const yearAbsences = absences.filter(a => {
      const year = new Date(a.startDate).getFullYear();
      return year === selectedYear;
    });

    const totalDaysLost = yearAbsences.reduce((sum, a) => sum + (a.daysLost || 0), 0);
    const daysLostAT = yearAbsences.filter(a => a.absenceType === "incapacidad_at").reduce((sum, a) => sum + (a.daysLost || 0), 0);
    const daysLostEL = yearAbsences.filter(a => a.absenceType === "incapacidad_el").reduce((sum, a) => sum + (a.daysLost || 0), 0);
    const daysLostCommon = yearAbsences.filter(a => a.absenceType === "incapacidad_comun").reduce((sum, a) => sum + (a.daysLost || 0), 0);

    const totalCases = yearAbsences.length;
    const casesAT = yearAbsences.filter(a => a.absenceType === "incapacidad_at").length;
    const casesEL = yearAbsences.filter(a => a.absenceType === "incapacidad_el").length;
    const casesCommon = yearAbsences.filter(a => a.absenceType === "incapacidad_comun").length;

    const totalWorkers = selectedCompany?.numberOfWorkers || workers.length || 1;
    const scheduledDays = totalWorkers * 240;
    const absenteeismRate = scheduledDays > 0 ? (totalDaysLost / scheduledDays) * 100 : 0;
    const averageDuration = totalCases > 0 ? totalDaysLost / totalCases : 0;
    const frequencyRate = totalWorkers > 0 ? (totalCases / totalWorkers) * 100 : 0;

    return {
      totalDaysLost, daysLostAT, daysLostEL, daysLostCommon,
      totalCases, casesAT, casesEL, casesCommon,
      absenteeismRate, averageDuration, frequencyRate, totalWorkers
    };
  }, [absences, selectedYear, selectedCompany, workers]);

  const chartDataByType = useMemo(() => {
    const yearAbsences = absences.filter(a => new Date(a.startDate).getFullYear() === selectedYear);
    const grouped: Record<string, number> = {};
    yearAbsences.forEach(a => {
      const type = a.absenceType || "otro";
      grouped[type] = (grouped[type] || 0) + (a.daysLost || 0);
    });
    return Object.entries(grouped).map(([type, days]) => ({
      name: absenceTypeLabels[type]?.label || type,
      dias: days,
      type
    }));
  }, [absences, selectedYear]);

  const chartDataByMonth = useMemo(() => {
    const yearAbsences = absences.filter(a => new Date(a.startDate).getFullYear() === selectedYear);
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    return months.map((name, i) => {
      const monthAbsences = yearAbsences.filter(a => new Date(a.startDate).getMonth() === i);
      return {
        name,
        casos: monthAbsences.length,
        dias: monthAbsences.reduce((sum, a) => sum + (a.daysLost || 0), 0)
      };
    });
  }, [absences, selectedYear]);

  const pieChartData = useMemo(() => {
    return chartDataByType.map((item, i) => ({
      ...item,
      color: COLORS[i % COLORS.length]
    }));
  }, [chartDataByType]);

  const filteredAbsences = useMemo(() => {
    return absences.filter(absence => {
      const worker = workers.find(w => w.id === absence.workerId);
      const workerName = worker?.name || "";
      const matchesSearch = workerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        absence.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === "todos" || absence.absenceType === typeFilter;
      const matchesStatus = statusFilter === "todos" || absence.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [absences, workers, searchTerm, typeFilter, statusFilter]);

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        companyId,
        epsFollowup: data.epsFollowup ? 1 : 0,
        arlFollowup: data.arlFollowup ? 1 : 0,
        accidentId: data.accidentId || null,
      };
      const res = await apiRequest("POST", "/api/absences", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/absences"] });
      toast({ title: "Ausencia registrada", description: "El registro se ha guardado exitosamente" });
      setDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FormData> }) => {
      const payload = {
        ...data,
        epsFollowup: data.epsFollowup ? 1 : 0,
        arlFollowup: data.arlFollowup ? 1 : 0,
      };
      const res = await apiRequest("PATCH", `/api/absences/${id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/absences"] });
      toast({ title: "Ausencia actualizada", description: "Los cambios se han guardado exitosamente" });
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
      await apiRequest("DELETE", `/api/absences/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/absences"] });
      toast({ title: "Ausencia eliminada" });
    },
  });

  const onSubmit = (data: FormData) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (absence: WorkerAbsence) => {
    setEditingId(absence.id);
    form.reset({
      workerId: absence.workerId,
      absenceType: absence.absenceType as any,
      startDate: absence.startDate,
      endDate: absence.endDate || "",
      diagnosis: absence.diagnosis || "",
      cie10Code: absence.cie10Code || "",
      incapacityNumber: absence.incapacityNumber || "",
      issuerEntity: absence.issuerEntity || "",
      accidentId: absence.accidentId || "",
      epsFollowup: absence.epsFollowup === 1,
      arlFollowup: absence.arlFollowup === 1,
      observations: absence.observations || "",
      status: absence.status as any,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingId(null);
    form.reset();
    setDialogOpen(true);
  };

  const downloadPdf = async () => {
    try {
      const response = await fetch(`/api/absences/statistics/pdf?year=${selectedYear}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error("Error al generar PDF");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Estadisticas-Ausentismo-${selectedYear}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo generar el PDF", variant: "destructive" });
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
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        {lastPlanTrabajoId ? (
          <Link 
            href={`/planes-trabajo-anual/${lastPlanTrabajoId}?tab=mensual${lastCronogramaMes ? `&mes=${lastCronogramaMes}` : ''}`} 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al cronograma
            <CalendarDays className="h-4 w-4" />
          </Link>
        ) : (
          <Link 
            href="/planes-trabajo-anual" 
            className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm" 
            data-testid="link-volver-cronograma"
          >
            Volver al Plan Anual
            <CalendarDays className="h-4 w-4" />
          </Link>
        )}
      </div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserMinus className="h-6 w-6 text-primary" />
            Control de Ausentismo Laboral
          </h1>
          <p className="text-muted-foreground text-sm">
            Estándar 3.2.3 - Resolución 0312/2019 | Gestión y análisis de ausencias laborales
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-[120px]" data-testid="select-year">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={downloadPdf} data-testid="button-download-pdf">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleNew} data-testid="button-new-absence">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Ausencia
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <Collapsible open={expandedStats} onOpenChange={setExpandedStats}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-2 h-auto" data-testid="button-toggle-stats">
            <span className="font-semibold flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Estadísticas de Ausentismo {selectedYear}
            </span>
            {expandedStats ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-total-days">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Días Perdidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{statistics.totalDaysLost}</div>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <div>AT: {statistics.daysLostAT} | EL: {statistics.daysLostEL}</div>
                  <div>Común: {statistics.daysLostCommon}</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-cases">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Casos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{statistics.totalCases}</div>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <div>AT: {statistics.casesAT} | EL: {statistics.casesEL}</div>
                  <div>Común: {statistics.casesCommon}</div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-absenteeism-rate">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tasa Ausentismo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{statistics.absenteeismRate.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground mt-1">
                  (Días perdidos / Días programados) × 100
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-duration">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Duración Promedio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{statistics.averageDuration.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Días por caso
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Días Perdidos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartDataByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="dias" fill="#1e7e34" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Tendencia Mensual</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartDataByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="casos" stroke="#f97316" name="Casos" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="dias" stroke="#3b82f6" name="Días" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-lg">Registro de Ausencias</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                  data-testid="input-search"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  {Object.entries(absenceTypeLabels).map(([key, val]) => (
                    <SelectItem key={key} value={key}>{val.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {Object.entries(statusLabels).map(([key, val]) => (
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
          ) : filteredAbsences.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserMinus className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay ausencias registradas</p>
              <Button variant="outline" className="mt-4" onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar primera ausencia
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trabajador</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Inicio</TableHead>
                    <TableHead>Fecha Fin</TableHead>
                    <TableHead className="text-center">Días</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Vinculado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAbsences.map((absence) => {
                    const worker = workers.find(w => w.id === absence.workerId);
                    const typeInfo = absenceTypeLabels[absence.absenceType] || absenceTypeLabels.otro;
                    const statusInfo = statusLabels[absence.status] || statusLabels.activa;
                    const linkedAccident = absence.accidentId ? accidents.find(a => a.id === absence.accidentId) : null;
                    const TypeIcon = typeInfo.icon;

                    return (
                      <TableRow key={absence.id} data-testid={`row-absence-${absence.id}`}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{worker?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{worker?.position || ""}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${typeInfo.color} flex items-center gap-1 w-fit`}>
                            <TypeIcon className="h-3 w-3" />
                            {typeInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(absence.startDate)}</TableCell>
                        <TableCell>{formatDate(absence.endDate)}</TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-lg">{absence.daysLost || 0}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {linkedAccident ? (
                            <Badge variant="outline" className="text-xs">
                              AT #{linkedAccident.id.substring(0, 6)}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(absence)}
                              data-testid={`button-edit-${absence.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(absence.id)}
                              data-testid={`button-delete-${absence.id}`}
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

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Ausencia" : "Nueva Ausencia"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="workerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trabajador *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-worker">
                            <SelectValue placeholder="Seleccione trabajador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {workers.map(w => (
                            <SelectItem key={w.id} value={w.id}>{w.name} - {w.position}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="absenceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Ausencia *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-absence-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(absenceTypeLabels).map(([key, val]) => (
                            <SelectItem key={key} value={key}>{val.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Inicio *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Fin</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-end-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {(watchedType === "incapacidad_at" || watchedType === "incapacidad_el") && (
                <FormField
                  control={form.control}
                  name="accidentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vincular con Accidente (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-accident">
                            <SelectValue placeholder="Seleccione accidente relacionado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">Sin vincular</SelectItem>
                          {accidents.map(a => {
                            const accWorker = workers.find(w => w.id === a.workerId);
                            return (
                              <SelectItem key={a.id} value={a.id}>
                                {formatDate(a.date)} - {accWorker?.name || "Trabajador"} - {a.type}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="diagnosis"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Diagnóstico</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: Lumbalgia" data-testid="input-diagnosis" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cie10Code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código CIE-10</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ej: M54.5" data-testid="input-cie10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="incapacityNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>No. Incapacidad</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de documento" data-testid="input-incapacity-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="issuerEntity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entidad Emisora</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EPS/ARL que emite" data-testid="input-issuer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([key, val]) => (
                          <SelectItem key={key} value={key}>{val.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
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
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-submit-absence"
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
