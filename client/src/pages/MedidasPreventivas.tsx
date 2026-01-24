import { PreventiveMeasureCardEnhanced } from "@/components/PreventiveMeasureCardEnhanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PreventiveMeasure } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { MedidaPreventivaFormEnhanced, MedidaPreventivaFormData } from "@/components/MedidaPreventivaFormEnhanced";

const normativaMedidasPreventivas = [
  {
    codigo: 'DEC-1072-2.2.4.6.33',
    norma: 'Decreto 1072/2015',
    articulo: 'Artículo 2.2.4.6.33',
    descripcion: 'Acciones preventivas y correctivas',
    requisitos: [
      'Identificación de causas raíz de problemas',
      'Implementación de acciones para eliminar causas',
      'Seguimiento a la eficacia de las acciones',
      'Documentación de cambios y resultados'
    ],
    obligatorio: true
  },
  {
    codigo: 'RES-0312-EST-4.1.1',
    norma: 'Resolución 0312/2019',
    articulo: 'Estándar 4.1.1',
    descripcion: 'Acciones de mejora',
    requisitos: [
      'Plan de acción con responsables y fechas',
      'Recursos asignados para implementación',
      'Verificación de cierre efectivo',
      'Retroalimentación a las partes interesadas'
    ],
    obligatorio: true
  }
];

export default function MedidasPreventivas() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMeasure, setSelectedMeasure] = useState<PreventiveMeasure | null>(null);

  const { data: measures = [], isLoading: measuresLoading } = useQuery<PreventiveMeasure[]>({
    queryKey: ["/api/preventive-measures"],
  });

  const createMeasureMutation = useMutation({
    mutationFn: async (data: MedidaPreventivaFormData) => {
      if (!user?.companyId) {
        throw new Error("Usuario sin empresa asignada");
      }
      const payload = {
        title: data.title,
        description: data.description,
        responsible: data.responsible,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        relatedArea: data.relatedArea || "",
        companyId: user.companyId,
      };
      const res = await apiRequest("POST", "/api/preventive-measures", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-measures"] });
      setDialogOpen(false);
      toast({
        title: "Medida preventiva creada",
        description: "La medida preventiva se ha registrado exitosamente",
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

  const updateMeasureMutation = useMutation({
    mutationFn: async (data: MedidaPreventivaFormData & { id: string }) => {
      const payload = {
        title: data.title,
        description: data.description,
        responsible: data.responsible,
        dueDate: data.dueDate,
        status: data.status,
        priority: data.priority,
        relatedArea: data.relatedArea || "",
      };
      const res = await apiRequest("PATCH", `/api/preventive-measures/${data.id}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-measures"] });
      setEditDialogOpen(false);
      setSelectedMeasure(null);
      toast({
        title: "Medida actualizada",
        description: "La medida preventiva se ha actualizado exitosamente",
        className: "bg-blue-50 border-blue-200",
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

  const deleteMeasureMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/preventive-measures/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/preventive-measures"] });
      setDeleteDialogOpen(false);
      setSelectedMeasure(null);
      toast({
        title: "Medida eliminada",
        description: "La medida preventiva se ha eliminado exitosamente",
        className: "bg-red-50 border-red-200",
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

  const handleFormSubmit = (data: MedidaPreventivaFormData) => {
    createMeasureMutation.mutate(data);
  };

  const handleEditSubmit = (data: MedidaPreventivaFormData) => {
    if (selectedMeasure) {
      updateMeasureMutation.mutate({ ...data, id: selectedMeasure.id });
    }
  };

  const handlePrint = async (id: string) => {
    const measure = measures.find(m => m.id === id);
    if (measure) {
      try {
        const response = await fetch(`/api/preventive-measures/${id}/pdf`);
        if (!response.ok) {
          throw new Error("Error al generar el PDF");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hallazgo-${measure.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast({
          title: "PDF generado",
          description: "El documento se ha descargado correctamente",
          className: "bg-green-50 border-green-200",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo generar el PDF",
          variant: "destructive",
        });
      }
    }
  };

  const handleEdit = (id: string) => {
    const measure = measures.find(m => m.id === id);
    if (measure) {
      setSelectedMeasure(measure);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const measure = measures.find(m => m.id === id);
    if (measure) {
      setSelectedMeasure(measure);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = () => {
    if (selectedMeasure) {
      deleteMeasureMutation.mutate(selectedMeasure.id);
    }
  };

  const filteredMeasures = measures.filter((measure) => {
    const matchesSearch = 
      measure.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measure.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measure.responsible.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || measure.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("es-CO");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Medidas Preventivas</h1>
          <p className="text-muted-foreground">Acciones de prevención y control de riesgos</p>
        </div>
        <AutomationAssistant
          titulo="Acciones Preventivas y Correctivas"
          estandar="4.1.1"
          descripcion="Gestión de medidas de prevención y control para mejora continua del SG-SST"
          normativaAplicable={normativaMedidasPreventivas}
          compact={true}
        />
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-measure">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Medida
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Formulario Inteligente de Medidas
                </DialogTitle>
              </DialogHeader>
              <MedidaPreventivaFormEnhanced
                onSubmit={handleFormSubmit}
                onCancel={() => setDialogOpen(false)}
                existingMeasuresCount={measures.length}
                isLoading={createMeasureMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar medidas..."
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
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en-progreso">En Progreso</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="vencida">Vencida</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {measuresLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Cargando medidas preventivas...</p>
        </div>
      ) : filteredMeasures.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron medidas preventivas</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredMeasures.map((measure) => (
            <PreventiveMeasureCardEnhanced
              key={measure.id}
              id={measure.id}
              title={measure.title}
              description={measure.description}
              responsible={measure.responsible}
              dueDate={formatDate(measure.dueDate)}
              status={measure.status}
              priority={measure.priority}
              relatedArea={measure.relatedArea}
              onPrint={handlePrint}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={user?.role ? hasCompanyAdminAccess(user.role) : false}
            />
          ))}
        </div>
      )}

      {/* Dialog para Editar */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Modificar Medida
            </DialogTitle>
          </DialogHeader>
          {selectedMeasure && (
            <MedidaPreventivaFormEnhanced
              onSubmit={handleEditSubmit}
              onCancel={() => setEditDialogOpen(false)}
              existingMeasuresCount={measures.length}
              isLoading={updateMeasureMutation.isPending}
              initialData={{
                title: selectedMeasure.title,
                description: selectedMeasure.description,
                responsible: selectedMeasure.responsible,
                dueDate: selectedMeasure.dueDate || undefined,
                status: selectedMeasure.status as "pendiente" | "en-progreso" | "completada" | "vencida",
                priority: selectedMeasure.priority as "baja" | "media" | "alta",
                relatedArea: selectedMeasure.relatedArea || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* AlertDialog para Eliminar */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar medida preventiva?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la medida "{selectedMeasure?.title}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMeasureMutation.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
