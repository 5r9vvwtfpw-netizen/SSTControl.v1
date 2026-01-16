import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Droplet, Sun, Thermometer, FlaskConical, Wind, Activity, Download, CalendarDays } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EnvironmentalMeasurement, Company, insertEnvironmentalMeasurementSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const normativaMediciones = [
  {
    codigo: 'RES-2400-1979',
    norma: 'Resolución 2400/1979',
    articulo: 'Estatuto de Seguridad Industrial',
    descripcion: 'Normas sobre vivienda, higiene y seguridad en establecimientos de trabajo',
    requisitos: [
      'Límites permisibles para ruido ocupacional',
      'Niveles de iluminación por área',
      'Control de temperatura y ventilación',
      'Monitoreo de contaminantes químicos'
    ],
    obligatorio: true
  },
  {
    codigo: 'DEC-1072-2.2.4.6.24',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.24',
    descripcion: 'Medidas de prevención y control - Mediciones ambientales',
    requisitos: [
      'Mediciones higiénicas periódicas',
      'Comparación con límites permisibles',
      'Implementación de controles según resultados',
      'Seguimiento a la eficacia de controles'
    ],
    obligatorio: true
  }
];

const measurementTypeIcons: Record<string, typeof Droplet> = {
  "ruido": Activity,
  "iluminacion": Sun,
  "temperatura": Thermometer,
  "agente_quimico": FlaskConical,
  "material_particulado": Wind,
  "vibraciones": Activity,
};

const measurementTypeLabels: Record<string, string> = {
  "ruido": "Ruido",
  "iluminacion": "Iluminación",
  "temperatura": "Temperatura",
  "agente_quimico": "Agente Químico",
  "material_particulado": "Material Particulado",
  "vibraciones": "Vibraciones",
};

export default function MedicionesAmbientales() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? hasCompanyAdminAccess(user.role) : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    companyId: "",
    measurementType: "ruido" as const,
    area: "",
    measurementDate: "",
    valueNumeric: "",
    unit: "",
    legalLimit: "",
    status: "pendiente_analisis" as const,
    measuredBy: "",
    observations: "",
  });

  const { data: measurements = [], isLoading: measurementsLoading } = useQuery<EnvironmentalMeasurement[]>({
    queryKey: ["/api/environmental-measurements"],
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
    enabled: isSuperadmin,
  });

  const createMeasurementMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertEnvironmentalMeasurementSchema>) => {
      const payload = isSuperadmin && formData.companyId 
        ? { ...data, companyId: formData.companyId }
        : data;
      const res = await apiRequest("POST", "/api/environmental-measurements", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/environmental-measurements"] });
      setDialogOpen(false);
      setFormData({
        companyId: "",
        measurementType: "ruido",
        area: "",
        measurementDate: "",
        valueNumeric: "",
        unit: "",
        legalLimit: "",
        status: "pendiente_analisis",
        measuredBy: "",
        observations: "",
      });
      toast({
        title: "Medición registrada",
        description: "La medición ambiental se ha registrado exitosamente",
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

  const deleteMeasurementMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/environmental-measurements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/environmental-measurements"] });
      toast({
        title: "Medición eliminada",
        description: "La medición se ha eliminado exitosamente",
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
    
    createMeasurementMutation.mutate({
      ...formData,
      legalLimit: formData.legalLimit || undefined,
      observations: formData.observations || undefined,
    });
  };

  const filteredMeasurements = measurements.filter((measurement) => {
    const matchesSearch = measurement.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "todas" || measurement.measurementType === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO");
  };

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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Mediciones Ambientales Ocupacionales</h1>
          <p className="text-muted-foreground">Monitoreo de factores de riesgo físicos y químicos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-measurement">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Medición
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Medición Ambiental</DialogTitle>
              <DialogDescription>Complete los datos de la medición ocupacional</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="measurementType">Tipo de Medición</Label>
                  <Select
                    value={formData.measurementType}
                    onValueChange={(value: any) => setFormData({ ...formData, measurementType: value })}
                  >
                    <SelectTrigger id="measurementType" data-testid="select-measurement-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ruido">Ruido</SelectItem>
                      <SelectItem value="iluminacion">Iluminación</SelectItem>
                      <SelectItem value="temperatura">Temperatura</SelectItem>
                      <SelectItem value="agente_quimico">Agente Químico</SelectItem>
                      <SelectItem value="material_particulado">Material Particulado</SelectItem>
                      <SelectItem value="vibraciones">Vibraciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area">Área</Label>
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
                  <Label htmlFor="measurementDate">Fecha de Medición</Label>
                  <Input
                    id="measurementDate"
                    type="date"
                    value={formData.measurementDate}
                    onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })}
                    required
                    data-testid="input-measurement-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valueNumeric">Valor Medido</Label>
                  <Input
                    id="valueNumeric"
                    value={formData.valueNumeric}
                    onChange={(e) => setFormData({ ...formData, valueNumeric: e.target.value })}
                    placeholder="Ej: 85.5"
                    data-testid="input-value-numeric"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unidad de Medida</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Ej: dB, lux, °C, mg/m³"
                    data-testid="input-unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalLimit">Límite Legal (Opcional)</Label>
                  <Input
                    id="legalLimit"
                    value={formData.legalLimit}
                    onChange={(e) => setFormData({ ...formData, legalLimit: e.target.value })}
                    placeholder="Ej: 85 dB"
                    data-testid="input-legal-limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="measuredBy">Medido Por</Label>
                  <Input
                    id="measuredBy"
                    value={formData.measuredBy}
                    onChange={(e) => setFormData({ ...formData, measuredBy: e.target.value })}
                    required
                    placeholder="Nombre del técnico"
                    data-testid="input-measured-by"
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
                      <SelectItem value="conforme">Conforme</SelectItem>
                      <SelectItem value="no_conforme">No Conforme</SelectItem>
                      <SelectItem value="pendiente_analisis">Pendiente Análisis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="observations">Observaciones (opcional)</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                    placeholder="Observaciones, condiciones ambientales, recomendaciones"
                    data-testid="input-observations"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMeasurementMutation.isPending} data-testid="button-submit-measurement">
                  {createMeasurementMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant
        titulo="Mediciones Ambientales"
        estandar="2.2.1"
        descripcion="Monitoreo de factores de riesgo físicos y químicos ocupacionales"
        normativaAplicable={normativaMediciones}
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
            data-testid="input-search-measurements"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[220px]" data-testid="select-type-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los tipos</SelectItem>
            <SelectItem value="ruido">Ruido</SelectItem>
            <SelectItem value="iluminacion">Iluminación</SelectItem>
            <SelectItem value="temperatura">Temperatura</SelectItem>
            <SelectItem value="agente_quimico">Agente Químico</SelectItem>
            <SelectItem value="material_particulado">Material Particulado</SelectItem>
            <SelectItem value="vibraciones">Vibraciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {measurementsLoading ? (
          <div className="col-span-full text-center text-muted-foreground">Cargando mediciones...</div>
        ) : filteredMeasurements.length === 0 ? (
          <div className="col-span-full text-center text-muted-foreground" data-testid="text-no-measurements">
            No se encontraron mediciones ambientales
          </div>
        ) : (
          filteredMeasurements.map((measurement) => {
            const Icon = measurementTypeIcons[measurement.measurementType];
            return (
              <Card key={measurement.id} data-testid={`card-measurement-${measurement.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        measurement.status === "no_conforme" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {measurementTypeLabels[measurement.measurementType]}
                        </CardTitle>
                        <CardDescription className="text-xs">{measurement.area}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fecha:</span>
                    <span className="font-medium">{formatDate(measurement.measurementDate)}</span>
                  </div>
                  {measurement.valueNumeric && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor:</span>
                      <span className="font-bold text-lg">{measurement.valueNumeric} {measurement.unit || ""}</span>
                    </div>
                  )}
                  {measurement.legalLimit && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Límite Legal:</span>
                      <span>{measurement.legalLimit}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estado:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      measurement.status === "conforme" ? "bg-green-500/10 text-green-700 dark:text-green-300" :
                      measurement.status === "no_conforme" ? "bg-red-500/10 text-red-700 dark:text-red-300" :
                      "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
                    }`}>
                      {measurement.status === "conforme" ? "Conforme" :
                       measurement.status === "no_conforme" ? "No Conforme" :
                       "Pendiente Análisis"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Medido por:</span>
                    <span className="text-xs">{measurement.measuredBy}</span>
                  </div>
                  {measurement.observations && (
                    <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
                      {measurement.observations}
                    </div>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        window.open(`/api/environmental-measurements/${measurement.id}/pdf`, '_blank');
                      }}
                      data-testid={`button-download-pdf-${measurement.id}`}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar PDF
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => deleteMeasurementMutation.mutate(measurement.id)}
                      disabled={deleteMeasurementMutation.isPending}
                      data-testid={`button-delete-${measurement.id}`}
                    >
                      Eliminar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
