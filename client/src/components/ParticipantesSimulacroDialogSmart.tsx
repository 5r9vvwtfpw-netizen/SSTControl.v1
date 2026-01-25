import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  UserCheck, 
  Sparkles,
  Users,
  Building2,
  Check,
  Search,
  UserPlus
} from "lucide-react";

import type { Worker, ParticipanteSimulacro } from "@shared/schema";

const ROLES_SIMULACRO = [
  { valor: "evacuado", etiqueta: "Evacuado" },
  { valor: "coordinador_evacuacion", etiqueta: "Coordinador de Evacuación" },
  { valor: "brigadista", etiqueta: "Brigadista" },
  { valor: "lider_brigada", etiqueta: "Líder de Brigada" },
  { valor: "observador", etiqueta: "Observador" },
  { valor: "evaluador", etiqueta: "Evaluador Externo" },
  { valor: "apoyo", etiqueta: "Apoyo Logístico" },
];

const participanteFormSchema = z.object({
  workerId: z.string().min(1, "Seleccione un trabajador"),
  rolSimulacro: z.string().default("evacuado"),
});

type ParticipanteFormData = z.infer<typeof participanteFormSchema>;

interface ParticipantesSimulacroDialogSmartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  simulacroId: string;
  workers: Worker[];
  existingParticipants: ParticipanteSimulacro[];
}

export function ParticipantesSimulacroDialogSmart({ 
  open, 
  onOpenChange, 
  simulacroId,
  workers,
  existingParticipants
}: ParticipantesSimulacroDialogSmartProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"individual" | "area">("individual");
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<Set<string>>(new Set());
  const [bulkRole, setBulkRole] = useState<string>("evacuado");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingBulk, setIsAddingBulk] = useState(false);

  const participanteForm = useForm<ParticipanteFormData>({
    resolver: zodResolver(participanteFormSchema),
    defaultValues: {
      workerId: "",
      rolSimulacro: "evacuado",
    },
  });

  // Get active workers that are not already participants
  const existingWorkerIds = new Set(existingParticipants.map(p => p.workerId).filter(Boolean));
  const availableWorkers = workers.filter(w => 
    w.status === "activo" && !existingWorkerIds.has(w.id)
  );

  // Get unique areas/departments from workers
  const areas = useMemo(() => {
    const areaSet = new Set<string>();
    availableWorkers.forEach(w => {
      if (w.department) areaSet.add(w.department);
    });
    return Array.from(areaSet).sort();
  }, [availableWorkers]);

  // Get workers for selected area
  const workersInArea = useMemo(() => {
    if (!selectedArea) return [];
    return availableWorkers.filter(w => w.department === selectedArea);
  }, [selectedArea, availableWorkers]);

  // Filtered workers for individual selection
  const filteredWorkers = searchTerm 
    ? availableWorkers.filter(w => 
        w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.identificationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableWorkers;

  const createParticipanteMutation = useMutation({
    mutationFn: async (data: { workerId: string; rolSimulacro: string; simulacroId: string }) => {
      const res = await apiRequest("POST", "/api/participantes-simulacro", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/participantes-simulacro", simulacroId] });
    },
    onError: (error: Error) => {
      console.error('Error creating participante:', error);
    },
  });

  const handleIndividualSubmit = async (data: ParticipanteFormData) => {
    try {
      await createParticipanteMutation.mutateAsync({ 
        ...data, 
        simulacroId 
      });
      onOpenChange(false);
      participanteForm.reset();
      toast({
        title: "Participante agregado",
        description: "El participante ha sido registrado en el simulacro",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkSubmit = async () => {
    if (selectedWorkerIds.size === 0) {
      toast({
        title: "Sin selección",
        description: "Seleccione al menos un trabajador",
        variant: "destructive",
      });
      return;
    }

    setIsAddingBulk(true);
    let successCount = 0;
    let errorCount = 0;

    for (const workerId of Array.from(selectedWorkerIds)) {
      try {
        await createParticipanteMutation.mutateAsync({
          workerId,
          rolSimulacro: bulkRole,
          simulacroId,
        });
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setIsAddingBulk(false);
    queryClient.invalidateQueries({ queryKey: ["/api/participantes-simulacro", simulacroId] });
    
    if (successCount > 0) {
      toast({
        title: "Participantes agregados",
        description: `Se agregaron ${successCount} participantes${errorCount > 0 ? ` (${errorCount} errores)` : ''}`,
      });
      onOpenChange(false);
      setSelectedWorkerIds(new Set());
      setSelectedArea(null);
    } else {
      toast({
        title: "Error",
        description: "No se pudo agregar ningún participante",
        variant: "destructive",
      });
    }
  };

  const toggleWorkerSelection = (workerId: string) => {
    const newSet = new Set(selectedWorkerIds);
    if (newSet.has(workerId)) {
      newSet.delete(workerId);
    } else {
      newSet.add(workerId);
    }
    setSelectedWorkerIds(newSet);
  };

  const selectAllInArea = () => {
    const newSet = new Set(selectedWorkerIds);
    workersInArea.forEach(w => newSet.add(w.id));
    setSelectedWorkerIds(newSet);
  };

  const deselectAllInArea = () => {
    const newSet = new Set(selectedWorkerIds);
    workersInArea.forEach(w => newSet.delete(w.id));
    setSelectedWorkerIds(newSet);
  };

  const allAreaSelected = workersInArea.length > 0 && workersInArea.every(w => selectedWorkerIds.has(w.id));

  return (
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) {
        participanteForm.reset();
        setSelectedWorkerIds(new Set());
        setSelectedArea(null);
        setActiveTab("individual");
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Agregar Participantes
          </DialogTitle>
          <DialogDescription>
            Agregue participantes individualmente o por área/departamento
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "individual" | "area")} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2" data-testid="tab-individual">
              <UserPlus className="h-4 w-4" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="area" className="flex items-center gap-2" data-testid="tab-area">
              <Building2 className="h-4 w-4" />
              Por Área/Zona
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="flex-1 overflow-auto">
            <Form {...participanteForm}>
              <form onSubmit={participanteForm.handleSubmit(handleIndividualSubmit)} className="space-y-4 p-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, documento o área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                    data-testid="input-search-worker-individual"
                  />
                </div>

                <FormField 
                  control={participanteForm.control} 
                  name="workerId" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trabajador</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-worker-individual">
                            <SelectValue placeholder="Seleccione un trabajador" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filteredWorkers.length === 0 ? (
                            <div className="p-3 text-sm text-muted-foreground text-center">
                              No hay trabajadores disponibles
                            </div>
                          ) : (
                            filteredWorkers.map((w) => (
                              <SelectItem key={w.id} value={w.id}>
                                <div className="flex items-center gap-2">
                                  <UserCheck className="h-4 w-4 text-emerald-600" />
                                  <span>{w.name}</span>
                                  {w.department && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      {w.department}
                                    </Badge>
                                  )}
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

                <FormField 
                  control={participanteForm.control} 
                  name="rolSimulacro" 
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol en Simulacro</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || "evacuado"}>
                        <FormControl>
                          <SelectTrigger data-testid="select-rol-individual">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES_SIMULACRO.map((rol) => (
                            <SelectItem key={rol.valor} value={rol.valor}>{rol.etiqueta}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} 
                />

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createParticipanteMutation.isPending}
                    data-testid="button-submit-individual"
                  >
                    {createParticipanteMutation.isPending && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Agregar
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="area" className="flex-1 overflow-hidden flex flex-col">
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden p-1">
              {/* Area selector */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <FormLabel className="mb-2 block">Seleccionar Área/Departamento</FormLabel>
                  <Select value={selectedArea || ""} onValueChange={setSelectedArea}>
                    <SelectTrigger data-testid="select-area-bulk">
                      <SelectValue placeholder="Seleccione un área" />
                    </SelectTrigger>
                    <SelectContent>
                      {areas.length === 0 ? (
                        <div className="p-3 text-sm text-muted-foreground text-center">
                          No hay áreas disponibles
                        </div>
                      ) : (
                        areas.map((area) => {
                          const count = availableWorkers.filter(w => w.department === area).length;
                          return (
                            <SelectItem key={area} value={area}>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span>{area}</span>
                                <Badge variant="secondary" className="ml-auto">
                                  {count} trabajadores
                                </Badge>
                              </div>
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FormLabel className="mb-2 block">Rol para todos</FormLabel>
                  <Select value={bulkRole} onValueChange={setBulkRole}>
                    <SelectTrigger data-testid="select-rol-bulk">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_SIMULACRO.map((rol) => (
                        <SelectItem key={rol.valor} value={rol.valor}>{rol.etiqueta}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Workers in selected area */}
              {selectedArea && (
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardHeader className="py-3 border-b">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Trabajadores en {selectedArea}
                        <Badge variant="secondary">{workersInArea.length}</Badge>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          size="sm" 
                          variant="outline"
                          onClick={allAreaSelected ? deselectAllInArea : selectAllInArea}
                          data-testid="button-toggle-all-area"
                        >
                          {allAreaSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-[200px]">
                      <div className="p-2 space-y-1">
                        {workersInArea.length === 0 ? (
                          <p className="text-center text-muted-foreground py-4">
                            No hay trabajadores disponibles en esta área
                          </p>
                        ) : (
                          workersInArea.map((worker) => (
                            <div 
                              key={worker.id}
                              className={`flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                                selectedWorkerIds.has(worker.id) 
                                  ? 'bg-primary/10 border-primary' 
                                  : 'hover:bg-muted/50'
                              }`}
                              onClick={() => toggleWorkerSelection(worker.id)}
                              data-testid={`worker-checkbox-${worker.id}`}
                            >
                              <Checkbox 
                                checked={selectedWorkerIds.has(worker.id)}
                                onCheckedChange={() => toggleWorkerSelection(worker.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{worker.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {worker.position || "Sin cargo"} • {worker.identificationNumber}
                                </p>
                              </div>
                              {selectedWorkerIds.has(worker.id) && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Selection summary */}
              {selectedWorkerIds.size > 0 && (
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-primary" />
                      <span className="font-medium">
                        {selectedWorkerIds.size} trabajador{selectedWorkerIds.size > 1 ? 'es' : ''} seleccionado{selectedWorkerIds.size > 1 ? 's' : ''}
                      </span>
                    </div>
                    <Badge variant="secondary">
                      Rol: {ROLES_SIMULACRO.find(r => r.valor === bulkRole)?.etiqueta}
                    </Badge>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleBulkSubmit}
                  disabled={isAddingBulk || selectedWorkerIds.size === 0}
                  data-testid="button-submit-bulk"
                >
                  {isAddingBulk && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Agregar {selectedWorkerIds.size > 0 ? `(${selectedWorkerIds.size})` : ''}
                </Button>
              </DialogFooter>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
