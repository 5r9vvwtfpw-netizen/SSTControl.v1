import { InspectionCard } from "@/components/InspectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Filter, Bot, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Inspection, Company, Worker, insertInspectionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { inspeccionesSstPredefinidas, getInspeccionByCodigo, categoriaInspeccionLabels } from "@/data/inspecciones-sst-predefinidas";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaInspecciones = [
  {
    codigo: 'DEC-1072-2.2.4.6.12',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.12',
    descripcion: 'Documentación del SG-SST - Inspecciones de seguridad',
    requisitos: [
      'Mantener registro de las inspecciones de seguridad',
      'Documentar hallazgos y acciones correctivas',
      'Seguimiento a la implementación de mejoras',
      'Participación del COPASST en inspecciones'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-2.4.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 2.4.1',
    descripcion: 'Inspecciones de seguridad programadas',
    requisitos: [
      'Programa de inspecciones de seguridad',
      'Cronograma de inspecciones periódicas',
      'Registro de condiciones inseguras',
      'Plan de acción para corrección de hallazgos'
    ],
    obligatorio: true
  }
];

export default function Inspecciones() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPredefInspeccion, setSelectedPredefInspeccion] = useState<string>("");
  const [formData, setFormData] = useState({
    companyId: "",
    area: "",
    inspector: "",
    date: "",
    findings: "" as number | string,
    compliance: "" as number | string,
    observations: "",
    status: "pendiente" as const,
  });

  const { data: inspections = [], isLoading: inspectionsLoading } = useQuery<Inspection[]>({
    queryKey: ["/api/inspections"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const { data: workers } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const handleAutoFillFromPredefinido = (codigo: string) => {
    const inspeccion = getInspeccionByCodigo(codigo);
    if (!inspeccion) return;

    setFormData({
      ...formData,
      area: inspeccion.area,
      observations: inspeccion.descripcion,
    });

    toast({
      title: "Campos auto-rellenados",
      description: `Los campos se han rellenado con la inspección predefinida "${inspeccion.area}"`,
      className: "bg-green-50 border-green-200",
    });
  };

  const createInspectionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertInspectionSchema>) => {
      const payload = isSuperadmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/inspections", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDialogOpen(false);
      setFormData({
        companyId: "",
        area: "",
        inspector: "",
        date: "",
        findings: "",
        compliance: "",
        observations: "",
        status: "pendiente",
      });
      toast({
        title: "Inspección registrada",
        description: "La inspección se ha registrado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSuperadmin && !formData.companyId) {
      toast({
        title: "Error",
        description: "Debe seleccionar una empresa",
        variant: "destructive",
      });
      return;
    }
    
    const findingsValue = formData.findings === '' ? 0 : Number(formData.findings);
    const complianceValue = formData.compliance === '' ? 0 : Number(formData.compliance);
    createInspectionMutation.mutate({
      ...formData,
      findings: findingsValue,
      compliance: complianceValue,
      observations: formData.observations || undefined,
    });
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const [lastPlanTrabajoId, setLastPlanTrabajoId] = useState<string | null>(null);
  const [lastCronogramaMes, setLastCronogramaMes] = useState<string | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("lastPlanTrabajoId");
    const savedMes = localStorage.getItem("lastCronogramaMes");
    
    // Always show the link first, then validate in background
    if (savedId) {
      setLastPlanTrabajoId(savedId);
    }
    if (savedMes) {
      setLastCronogramaMes(savedMes);
    }
  }, []);

  return (
    <div className="space-y-6">
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Inspecciones de Seguridad</h1>
          <p className="text-muted-foreground">Auditorías y verificaciones de cumplimiento</p>
        </div>
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedPredefInspeccion("");
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-inspection">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Inspección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Inspección</DialogTitle>
                <DialogDescription>Complete los datos de la inspección</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">Seleccione una inspección predefinida para auto-rellenar los campos</p>
                      </div>
                      <div className="flex gap-2">
                        <Select value={selectedPredefInspeccion} onValueChange={(value) => {
                          setSelectedPredefInspeccion(value);
                          handleAutoFillFromPredefinido(value);
                        }}>
                          <SelectTrigger className="flex-1 bg-white dark:bg-gray-950" data-testid="select-inspeccion-predefinida">
                            <SelectValue placeholder="Seleccione una inspección predefinida..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[400px]">
                            {Object.entries(categoriaInspeccionLabels).map(([categoria, label]) => (
                              <div key={categoria}>
                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{label}</div>
                                {inspeccionesSstPredefinidas.filter(i => i.categoria === categoria).map((insp) => (
                                  <SelectItem key={insp.codigo} value={insp.codigo}>
                                    {insp.codigo} - {insp.area}
                                  </SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {isSuperadmin && (
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="companyId">Empresa *</Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                      >
                        <SelectTrigger id="companyId" data-testid="select-company">
                          <SelectValue placeholder="Seleccione empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="area">Área Inspeccionada</Label>
                    <Input
                      id="area"
                      value={formData.area}
                      onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      required
                      placeholder="Ej: Planta de Producción"
                      data-testid="input-area"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inspector">Inspector</Label>
                    <Select
                      value={formData.inspector}
                      onValueChange={(value) => setFormData({ ...formData, inspector: value })}
                    >
                      <SelectTrigger id="inspector" data-testid="select-inspector">
                        <SelectValue placeholder="Seleccione un inspector" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers?.map((worker) => (
                          <SelectItem key={worker.id} value={`${worker.name} - ${worker.position}`}>
                            {worker.name} - {worker.position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha de Inspección</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      data-testid="input-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings">Número de Hallazgos</Label>
                    <Input
                      id="findings"
                      type="number"
                      min="0"
                      value={formData.findings}
                      onChange={(e) => setFormData({ ...formData, findings: e.target.value === '' ? '' : e.target.value })}
                      required
                      data-testid="input-findings"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compliance">Cumplimiento (%)</Label>
                    <Input
                      id="compliance"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.compliance}
                      onChange={(e) => setFormData({ ...formData, compliance: e.target.value === '' ? '' : e.target.value })}
                      required
                      data-testid="input-compliance"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="observations">Observaciones (opcional)</Label>
                    <Textarea
                      id="observations"
                      value={formData.observations}
                      onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                      placeholder="Observaciones generales de la inspección"
                      data-testid="input-observations"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={createInspectionMutation.isPending} data-testid="button-submit-inspection">
                    {createInspectionMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <AutomationAssistant
        titulo="Inspecciones de Seguridad"
        estandar="2.4.1"
        descripcion="Programa de inspecciones de seguridad y auditorías de cumplimiento"
        normativaAplicable={normativaInspecciones}
        compact={true}
      />

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por área..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-inspections"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="aprobada">Aprobada</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="rechazada">Rechazada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {inspectionsLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando inspecciones...</p>
        </div>
      ) : filteredInspections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron inspecciones</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInspections.map((inspection) => (
            <InspectionCard
              key={inspection.id}
              id={inspection.id}
              area={inspection.area}
              date={formatDate(inspection.date)}
              findings={inspection.findings}
              compliance={inspection.compliance}
              status={inspection.status}
            />
          ))}
        </div>
      )}
    </div>
  );
}
