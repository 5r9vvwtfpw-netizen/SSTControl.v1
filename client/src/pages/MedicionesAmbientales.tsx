import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Filter, Droplet, Sun, Thermometer, FlaskConical, Wind, Activity, Download, CalendarDays, ClipboardCheck, Pencil } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { EnvironmentalMeasurement, Company, insertEnvironmentalMeasurementSchema } from "@shared/schema";
import {
  isNumericEnvironmentalMeasurementValue,
} from "@shared/environmental-measurement-catalog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { openCompanyDocument } from "@/lib/company-context-url";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess, canWrite } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { MedicionAmbientalFormEnhanced } from "@/components/MedicionAmbientalFormEnhanced";

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
  "agentes_quimicos": FlaskConical,
  "material_particulado": Wind,
  "vibraciones": Activity,
};

const measurementTypeLabels: Record<string, string> = {
  "ruido": "Ruido",
  "iluminacion": "Iluminación",
  "temperatura": "Temperatura",
  "agentes_quimicos": "Agente Químico",
  "material_particulado": "Material Particulado",
  "vibraciones": "Vibraciones",
};

export default function MedicionesAmbientales() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role ? canWrite(user.role, 'sst_management') : false;
  const isSuperadmin = user?.role ? hasGlobalAccess(user.role) : false;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<EnvironmentalMeasurement | null>(null);
  const [resultValue, setResultValue] = useState("");
  const [resultObservations, setResultObservations] = useState("");
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

  const resultMutation = useMutation({
    mutationFn: async () => {
      if (!selectedMeasurement) {
        throw new Error("No se seleccionó una medición");
      }
      const res = await apiRequest("PATCH", `/api/environmental-measurements/${selectedMeasurement.id}`, {
        valueNumeric: resultValue.trim(),
        observations: resultObservations.trim() || undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/environmental-measurements"] });
      setResultDialogOpen(false);
      setSelectedMeasurement(null);
      setResultValue("");
      setResultObservations("");
      toast({
        title: "Resultado registrado",
        description: "El resultado real quedó guardado y la medición fue evaluada.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error al registrar el resultado",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openResultDialog = (measurement: EnvironmentalMeasurement) => {
    setSelectedMeasurement(measurement);
    setResultValue(
      measurement.valueNumeric && isNumericEnvironmentalMeasurementValue(measurement.valueNumeric)
        ? measurement.valueNumeric
        : "",
    );
    setResultObservations("");
    setResultDialogOpen(true);
  };

  const submitResult = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isNumericEnvironmentalMeasurementValue(resultValue)) {
      toast({
        title: "Resultado requerido",
        description: "Ingrese el valor numérico real obtenido con el equipo de medición.",
        variant: "destructive",
      });
      return;
    }
    resultMutation.mutate();
  };

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
      measurementDate: new Date(formData.measurementDate),
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 flex-wrap">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Medición Ambiental</DialogTitle>
              <DialogDescription>Sistema inteligente con trazabilidad automática</DialogDescription>
            </DialogHeader>
            {isSuperadmin && (
              <div className="space-y-2 mb-4">
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
            <MedicionAmbientalFormEnhanced
              onSubmit={async (data) => {
                const payload = {
                  ...data,
                  companyId: isSuperadmin ? formData.companyId : user?.companyId || ""
                };
                await apiRequest("POST", "/api/environmental-measurements", payload);
                queryClient.invalidateQueries({ queryKey: ["/api/environmental-measurements"] });
                setDialogOpen(false);
                toast({ title: "Éxito", description: "Medición registrada correctamente" });
              }}
              isLoading={createMeasurementMutation.isPending}
              onCancel={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={resultDialogOpen}
          onOpenChange={(open) => {
            setResultDialogOpen(open);
            if (!open) {
              setSelectedMeasurement(null);
              setResultValue("");
              setResultObservations("");
            }
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {selectedMeasurement?.valueNumeric && isNumericEnvironmentalMeasurementValue(selectedMeasurement.valueNumeric)
                  ? "Editar resultado de medición"
                  : "Registrar resultado de medición"}
              </DialogTitle>
              <DialogDescription>
                Ingrese el valor real obtenido con el equipo. La unidad y el estado se gestionan automáticamente.
              </DialogDescription>
            </DialogHeader>
            {selectedMeasurement && (
              <form onSubmit={submitResult} className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="font-medium">
                    {measurementTypeLabels[selectedMeasurement.measurementType] || selectedMeasurement.measurementType}
                  </p>
                  <p className="text-muted-foreground">{selectedMeasurement.area}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Referencia: {selectedMeasurement.legalLimit || "Pendiente de definir"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environmental-result-value">Resultado real *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="environmental-result-value"
                      type="number"
                      step="any"
                      min="0"
                      value={resultValue}
                      onChange={(event) => setResultValue(event.target.value)}
                      placeholder="Ej.: 80"
                      autoFocus
                      data-testid="input-environmental-result"
                    />
                    <span className="min-w-fit text-sm font-medium text-muted-foreground">
                      {selectedMeasurement.unit || "unidad"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Este es el valor que debe copiar de la lectura del instrumento, no el límite legal.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="environmental-result-observations">Observaciones del resultado</Label>
                  <Textarea
                    id="environmental-result-observations"
                    value={resultObservations}
                    onChange={(event) => setResultObservations(event.target.value)}
                    placeholder="Equipo utilizado, condiciones de la medición o aclaraciones"
                    rows={3}
                    className="resize-none"
                    data-testid="input-environmental-result-observations"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setResultDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={resultMutation.isPending} data-testid="button-save-environmental-result">
                    {resultMutation.isPending ? "Guardando..." : "Guardar resultado"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <AutomationAssistant
        titulo="Mediciones Ambientales"
        estandar="4.1.4"
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
            <SelectItem value="agentes_quimicos">Agente Químico</SelectItem>
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
            const Icon = measurementTypeIcons[measurement.measurementType] || Activity;
            const hasNumericResult = isNumericEnvironmentalMeasurementValue(measurement.valueNumeric);
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
                  {hasNumericResult ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resultado:</span>
                      <span className="font-bold text-lg">{measurement.valueNumeric} {measurement.unit || ""}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resultado:</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-300">
                        Pendiente de registrar
                      </span>
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
                  <div className="mt-4">
                    <Button
                      variant={hasNumericResult ? "outline" : "default"}
                      size="sm"
                      className="w-full"
                      onClick={() => openResultDialog(measurement)}
                      data-testid={`button-register-result-${measurement.id}`}
                    >
                      {hasNumericResult ? <Pencil className="h-4 w-4 mr-2" /> : <ClipboardCheck className="h-4 w-4 mr-2" />}
                      {hasNumericResult ? "Editar resultado" : "Registrar resultado"}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        openCompanyDocument(`/api/environmental-measurements/${measurement.id}/pdf`);
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
