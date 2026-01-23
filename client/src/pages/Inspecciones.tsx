import { InspectionCard } from "@/components/InspectionCard";
import { InspectionFormEnhanced } from "@/components/InspectionFormEnhanced";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Inspection, Company, Worker, insertInspectionSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { AutomationAssistant } from "@/components/AutomationAssistant";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [formData, setFormData] = useState<{
    companyId: string;
    area: string;
    inspector: string;
    date: string;
    findings: number | string;
    compliance: number | string;
    observations: string;
    status: "pendiente" | "completada" | "requiere_accion";
  }>({
    companyId: "",
    area: "",
    inspector: "",
    date: "",
    findings: "",
    compliance: "",
    observations: "",
    status: "pendiente",
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

  const updateInspectionMutation = useMutation({
    mutationFn: async (data: { id: string } & z.infer<typeof insertInspectionSchema>) => {
      const { id, ...updateData } = data;
      const res = await apiRequest("PATCH", `/api/inspections/${id}`, updateData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      setEditDialogOpen(false);
      setSelectedInspection(null);
      toast({
        title: "Inspección actualizada",
        description: "La inspección se ha actualizado exitosamente",
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

  const deleteInspectionMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/inspections/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inspections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setDeleteDialogOpen(false);
      setSelectedInspection(null);
      toast({
        title: "Inspección eliminada",
        description: "La inspección se ha eliminado exitosamente",
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

  const handleEdit = (id: string) => {
    const inspection = inspections.find(i => i.id === id);
    if (inspection) {
      setSelectedInspection(inspection);
      setFormData({
        companyId: inspection.companyId || "",
        area: inspection.area,
        inspector: inspection.inspector || "",
        date: inspection.date,
        findings: inspection.findings,
        compliance: inspection.compliance,
        observations: inspection.observations || "",
        status: inspection.status as "pendiente" | "completada" | "requiere_accion",
      });
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    const inspection = inspections.find(i => i.id === id);
    if (inspection) {
      setSelectedInspection(inspection);
      setDeleteDialogOpen(true);
    }
  };

  const handlePrint = async (id: string) => {
    try {
      const response = await fetch(`/api/reports/inspecciones?inspectionId=${id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al generar PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inspeccion-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({
        title: "PDF generado",
        description: "El informe de inspección se ha descargado",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo generar el PDF",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInspection) return;
    
    const findingsValue = formData.findings === '' ? 0 : Number(formData.findings);
    const complianceValue = formData.compliance === '' ? 0 : Number(formData.compliance);
    updateInspectionMutation.mutate({
      id: selectedInspection.id,
      ...formData,
      findings: findingsValue,
      compliance: complianceValue,
      observations: formData.observations || null,
    } as any);
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
    
    const findingsValue = formData.findings === '' ? 0 : Number(formData.findings);
    const complianceValue = formData.compliance === '' ? 0 : Number(formData.compliance);
    createInspectionMutation.mutate({
      ...formData,
      findings: findingsValue,
      compliance: complianceValue,
      observations: formData.observations || null,
    } as any);
  };

  const filteredInspections = inspections.filter((inspection) => {
    const matchesSearch = inspection.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || inspection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
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
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Inspecciones de Seguridad</h1>
          <p className="text-muted-foreground">Auditorías y verificaciones de cumplimiento</p>
        </div>
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-inspection">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Inspección
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Nueva Inspección</DialogTitle>
                <DialogDescription>Complete los datos de la inspección. El sistema calculará automáticamente hallazgos y cumplimiento.</DialogDescription>
              </DialogHeader>
              <InspectionFormEnhanced
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                isPending={createInspectionMutation.isPending}
                isSuperadmin={isSuperadmin}
                companies={companies}
                workers={workers || []}
                onCancel={() => setDialogOpen(false)}
              />
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
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPrint={handlePrint}
              showActions={isAdmin}
            />
          ))}
        </div>
      )}

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Inspección</DialogTitle>
            <DialogDescription>Modifique los datos de la inspección.</DialogDescription>
          </DialogHeader>
          <InspectionFormEnhanced
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleEditSubmit}
            isPending={updateInspectionMutation.isPending}
            isSuperadmin={isSuperadmin}
            companies={companies}
            workers={workers || []}
            onCancel={() => setEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Inspección</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar la inspección de "{selectedInspection?.area}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => selectedInspection && deleteInspectionMutation.mutate(selectedInspection.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
