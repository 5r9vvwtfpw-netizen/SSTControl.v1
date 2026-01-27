import { OccupationalDiseaseCard } from "@/components/OccupationalDiseaseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Search, Filter } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OccupationalDisease, Worker, insertOccupationalDiseaseSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";

const formSchema = insertOccupationalDiseaseSchema.extend({
  diagnosisDate: z.string().min(1, "La fecha de diagnóstico es obligatoria"),
  exposureFactor: z.string().optional(),
  treatment: z.string().optional(),
  followUpDate: z.string().optional(),
});

export default function SaludOcupacional() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workerId: "",
      diseaseName: "",
      diagnosis: "",
      diagnosisDate: "",
      exposureFactor: "",
      status: "activo",
      treatment: "",
      followUpDate: "",
    },
  });

  const { data: diseases = [], isLoading: diseasesLoading } = useQuery<OccupationalDisease[]>({
    queryKey: ["/api/occupational-diseases"],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const createDiseaseMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest("POST", "/api/occupational-diseases", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/occupational-diseases"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: "Enfermedad ocupacional registrada",
        description: "El caso se ha registrado exitosamente",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createDiseaseMutation.mutate({
      ...values,
      exposureFactor: values.exposureFactor || undefined,
      treatment: values.treatment || undefined,
      followUpDate: values.followUpDate || undefined,
    });
  };

  const filteredDiseases = diseases.filter((disease) => {
    const worker = workers.find(w => w.id === disease.workerId);
    const matchesSearch = 
      disease.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || disease.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  const getWorkerName = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker?.name || "Trabajador no encontrado";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Salud Ocupacional</h1>
          <p className="text-muted-foreground">Registro de enfermedades ocupacionales</p>
        </div>
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-disease">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Caso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Enfermedad Ocupacional</DialogTitle>
                <DialogDescription>Complete los datos del caso. Los campos marcados con (*) son obligatorios.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, () => {
                  toast({
                    title: "Error de validación",
                    description: "Por favor complete todos los campos requeridos marcados con (*)",
                    variant: "destructive",
                  });
                })} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="workerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trabajador Afectado *</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Auto-fill factor de exposición basado en el cargo
                            const selectedWorker = workers.find(w => w.id === value);
                            if (selectedWorker && selectedWorker.position) {
                              const position = selectedWorker.position.toLowerCase();
                              // Sugerir factores de exposición comunes según el cargo
                              const exposureFactors: Record<string, string> = {
                                'operario': 'Ruido industrial, vibraciones, movimientos repetitivos',
                                'soldador': 'Radiaciones no ionizantes, humos metálicos, altas temperaturas',
                                'conductor': 'Posturas prolongadas, vibraciones de cuerpo entero, estrés',
                                'electricista': 'Riesgo eléctrico, posturas forzadas, trabajo en alturas',
                                'vigilante': 'Trabajo nocturno, estrés laboral, riesgo público',
                                'administrativo': 'Pantallas de visualización, posturas sedentarias, carga mental',
                                'almacenista': 'Manipulación manual de cargas, posturas forzadas',
                                'mecánico': 'Ruido, vibraciones, sustancias químicas',
                              };
                              
                              const matchingFactor = Object.entries(exposureFactors).find(([key]) => 
                                position.includes(key)
                              );
                              
                              // Solo mostrar toast si no hay factor ya asignado
                              const currentFactor = form.getValues("exposureFactor");
                              if (matchingFactor && !currentFactor) {
                                form.setValue("exposureFactor", matchingFactor[1]);
                                toast({
                                  title: "Factor de exposición sugerido",
                                  description: `Se ha sugerido un factor de exposición basado en el cargo de ${selectedWorker.position}`,
                                  className: "bg-blue-50 border-blue-200",
                                });
                              }
                            }
                          }} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger data-testid="select-worker">
                              <SelectValue placeholder="Seleccionar trabajador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {workers.map((worker) => (
                              <SelectItem key={worker.id} value={worker.id}>
                                {worker.name} - {worker.position} ({worker.department})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="diseaseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Enfermedad *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Ej: Hipoacusia ocupacional" 
                              data-testid="input-disease-name"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="diagnosisDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Diagnóstico *</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-diagnosis-date"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Diagnóstico Médico *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el diagnóstico médico"
                            data-testid="input-diagnosis"
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="exposureFactor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Factor de Exposición (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Ej: Ruido industrial constante >85dB" 
                            data-testid="input-exposure-factor"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="treatment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tratamiento (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describa el tratamiento prescrito"
                            data-testid="input-treatment"
                            rows={2}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
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
                              <SelectItem value="activo">Activo</SelectItem>
                              <SelectItem value="en-tratamiento">En Tratamiento</SelectItem>
                              <SelectItem value="recuperado">Recuperado</SelectItem>
                              <SelectItem value="incapacidad">Incapacidad</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="followUpDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Seguimiento (opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              data-testid="input-followup-date"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createDiseaseMutation.isPending}
                      data-testid="button-submit"
                    >
                      {createDiseaseMutation.isPending ? "Guardando..." : "Guardar Caso"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar casos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="en-tratamiento">En Tratamiento</SelectItem>
            <SelectItem value="recuperado">Recuperado</SelectItem>
            <SelectItem value="incapacidad">Incapacidad</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {diseasesLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando casos...</p>
        </div>
      ) : filteredDiseases.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron casos registrados</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDiseases.map((disease) => (
            <OccupationalDiseaseCard
              key={disease.id}
              workerName={getWorkerName(disease.workerId)}
              diseaseName={disease.diseaseName}
              diagnosis={disease.diagnosis}
              diagnosisDate={formatDate(disease.diagnosisDate)}
              exposureFactor={disease.exposureFactor}
              status={disease.status}
              treatment={disease.treatment}
              followUpDate={formatDate(disease.followUpDate)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
