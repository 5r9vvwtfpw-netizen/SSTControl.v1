import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSstDocumentSchema, type SstDocument, type InsertSstDocument, type SstDocumentVersion, type SstDocumentAccessLog, type CambioSst } from "@shared/schema";
import { Plus, FileText, Search, Filter, Edit, Trash2, Eye, History, Clock, AlertCircle, CheckCircle2, FileWarning, Archive, XCircle, Calendar, Download, Wand2, FileCheck, Users, UserCheck, Upload, Loader2, File, ChevronDown, ChevronRight, Server } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AutomationAssistant, type NormativaInfo, type PlantillaInfo } from "@/components/AutomationAssistant";
import { getEstandarByCodigo } from "@/data/planear-normativa";
import { BackToCronogramaButton } from "@/components/BackToCronogramaButton";
import { BackToEvaluationButton } from "@/components/BackToEvaluationButton";
import { useUpload } from "@/hooks/use-upload";

const categoryLabels: Record<string, string> = {
  "politica": "Política",
  "procedimiento": "Procedimiento",
  "formato": "Formato",
  "registro": "Registro",
  "manual": "Manual",
  "plan": "Plan",
  "matriz": "Matriz",
  "acta": "Acta",
  "informe": "Informe",
  "certificado": "Certificado",
  "contrato": "Contrato",
  "normativa": "Normativa",
  "capacitacion": "Capacitación",
  "otro": "Otro",
};

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  "borrador": { label: "Borrador", className: "bg-yellow-500 hover:bg-yellow-600 text-white", icon: FileWarning },
  "en_revision": { label: "En Revisión", className: "bg-blue-500 hover:bg-blue-600 text-white", icon: Clock },
  "vigente": { label: "Vigente", className: "bg-green-600 hover:bg-green-700 text-white", icon: CheckCircle2 },
  "obsoleto": { label: "Obsoleto", className: "bg-gray-500 hover:bg-gray-600 text-white", icon: XCircle },
  "archivado": { label: "Archivado", className: "bg-purple-500 hover:bg-purple-600 text-white", icon: Archive },
};

const phvaCycleLabels: Record<string, string> = {
  "PLANEAR": "Planear",
  "HACER": "Hacer",
  "VERIFICAR": "Verificar",
  "ACTUAR": "Actuar",
};

const sourceModuleLabels: Record<string, string> = {
  "designaciones": "Designaciones",
  "capacitaciones": "Capacitaciones", 
  "examenes_medicos": "Exámenes Médicos",
  "accidentes": "Accidentes",
  "inspecciones": "Inspecciones",
  "investigaciones": "Investigaciones",
  "presupuesto": "Presupuesto",
  "recursos": "Recursos",
  "politicas": "Políticas",
  "trabajadores": "Trabajadores",
  "evaluaciones": "Evaluaciones",
  "planes_trabajo": "Planes de Trabajo",
  "epp": "EPP",
  "contratos": "Contratos",
  "afiliaciones": "Afiliaciones",
  "copasst": "COPASST",
  "ausentismo": "Ausentismo",
  "emergencias": "Emergencias",
  "pesv": "PESV",
  "auditorias": "Auditorías",
  "indicadores": "Indicadores",
  "comunicaciones": "Comunicaciones",
  "induccion": "Inducción",
  "perfiles_cargo": "Perfiles de Cargo",
  "cambios": "Cambios",
  "adquisiciones": "Adquisiciones",
  "matriz_legal": "Matriz Legal",
  "vigilancia_epidemiologica": "Vigilancia Epidemiológica",
  "revisiones_direccion": "Revisiones de Dirección",
  "otros": "Otros"
};

interface SystemDocument {
  id: string;
  code: string;
  title: string;
  description: string | null;
  category: string;
  sst_standards: string[];
  phva_cycle: string;
  status: string;
  source_module: string;
  source_endpoint: string;
  source_record_id: string;
  created_at: string;
  updated_at: string;
}

// Document Acknowledgments Tab Component
interface AcknowledgmentWorkerStatus {
  workerId: string;
  workerName: string;
  workerDocument: string;
  assignedAt: string;
  dueDate: string | null;
  isRequired: boolean;
  isAcknowledged: boolean;
  acknowledgedAt: string | null;
  comments: string | null;
}

interface AcknowledgmentStats {
  totalAssigned: number;
  totalAcknowledged: number;
}

interface AcknowledgmentData {
  documentId: string;
  stats: AcknowledgmentStats;
  workers: AcknowledgmentWorkerStatus[];
}

interface Worker {
  id: string;
  name: string;
  identificationNumber: string;
}

function DocumentAcknowledgmentsTab({ documentId }: { documentId: string }) {
  const { toast } = useToast();
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [message, setMessage] = useState("");

  const { data: acknowledgments, isLoading, refetch } = useQuery<AcknowledgmentData>({
    queryKey: ["/api/document-acknowledgments", documentId],
  });

  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const assignMutation = useMutation({
    mutationFn: async (data: { documentId: string; workerIds: string[]; dueDate?: string; message?: string }) => {
      const res = await fetch("/api/document-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Error al asignar documento");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Documento asignado",
        description: data.message,
      });
      setShowAssignDialog(false);
      setSelectedWorkerIds([]);
      setDueDate(undefined);
      setMessage("");
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAssign = () => {
    if (selectedWorkerIds.length === 0) {
      toast({
        title: "Error",
        description: "Debe seleccionar al menos un trabajador",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate({
      documentId,
      workerIds: selectedWorkerIds,
      dueDate: dueDate?.toISOString(),
      message: message || undefined,
    });
  };

  const toggleWorker = (workerId: string) => {
    setSelectedWorkerIds(prev => 
      prev.includes(workerId) 
        ? prev.filter(id => id !== workerId)
        : [...prev, workerId]
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-8 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  const stats = acknowledgments?.stats || { totalAssigned: 0, totalAcknowledged: 0 };
  const workerStatus = acknowledgments?.workers || [];
  const assignedWorkerIds = new Set(workerStatus.map(w => w.workerId));
  const availableWorkers = workers.filter(w => !assignedWorkerIds.has(w.id));

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex-1 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">Asignados</p>
          <p className="text-2xl font-bold">{stats.totalAssigned}</p>
        </div>
        <div className="flex-1 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Confirmados</p>
          <p className="text-2xl font-bold text-green-600">{stats.totalAcknowledged}</p>
        </div>
        <div className="flex-1 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
          <p className="text-sm text-muted-foreground">Pendientes</p>
          <p className="text-2xl font-bold text-amber-600">{stats.totalAssigned - stats.totalAcknowledged}</p>
        </div>
      </div>

      {/* Assign Button */}
      <div className="flex justify-end">
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogTrigger asChild>
            <Button size="sm" data-testid="button-assign-document">
              <Users className="h-4 w-4 mr-2" />
              Asignar a Trabajadores
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Asignar Documento</DialogTitle>
              <DialogDescription>
                Seleccione los trabajadores que deben acusar recibo de este documento.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {availableWorkers.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  Todos los trabajadores ya tienen este documento asignado.
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Trabajadores disponibles</p>
                    {availableWorkers.map((worker) => (
                      <div 
                        key={worker.id}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md cursor-pointer border",
                          selectedWorkerIds.includes(worker.id) 
                            ? "bg-primary/10 border-primary" 
                            : "hover:bg-muted"
                        )}
                        onClick={() => toggleWorker(worker.id)}
                        data-testid={`worker-option-${worker.id}`}
                      >
                        <div className={cn(
                          "h-4 w-4 rounded-sm border flex items-center justify-center",
                          selectedWorkerIds.includes(worker.id) && "bg-primary border-primary"
                        )}>
                          {selectedWorkerIds.includes(worker.id) && (
                            <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="flex-1">{worker.name}</span>
                        <span className="text-xs text-muted-foreground">{worker.identificationNumber}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fecha límite (opcional)</p>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          {dueDate ? format(dueDate, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={dueDate}
                          onSelect={setDueDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Mensaje (opcional)</p>
                    <Textarea 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Instrucciones o comentarios..."
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAssign} 
                disabled={selectedWorkerIds.length === 0 || assignMutation.isPending}
                data-testid="button-confirm-assign"
              >
                {assignMutation.isPending ? "Asignando..." : `Asignar (${selectedWorkerIds.length})`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Worker Status List */}
      {workerStatus.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>Este documento no ha sido asignado a ningún trabajador.</p>
          <p className="text-sm">Use el botón "Asignar a Trabajadores" para comenzar.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Asignado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha Confirmación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workerStatus.map((worker) => (
              <TableRow key={worker.workerId} data-testid={`row-worker-ack-${worker.workerId}`}>
                <TableCell className="font-medium">{worker.workerName}</TableCell>
                <TableCell className="font-mono text-sm">{worker.workerDocument}</TableCell>
                <TableCell>
                  {worker.assignedAt 
                    ? format(new Date(worker.assignedAt), "dd/MM/yyyy", { locale: es })
                    : "-"}
                </TableCell>
                <TableCell>
                  {worker.dueDate 
                    ? format(new Date(worker.dueDate), "dd/MM/yyyy", { locale: es })
                    : "-"}
                </TableCell>
                <TableCell>
                  {worker.isAcknowledged ? (
                    <Badge className="bg-green-600 hover:bg-green-700 text-white">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Confirmado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-400">
                      <Clock className="h-3 w-3 mr-1" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {worker.acknowledgedAt 
                    ? format(new Date(worker.acknowledgedAt), "dd/MM/yyyy HH:mm", { locale: es })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export default function ConservacionDocumentos() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPhva, setSelectedPhva] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SstDocument | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<SstDocument | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedCambio, setSelectedCambio] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(null);

  const { uploadFile, isUploading: isUploadingFile } = useUpload({
    onSuccess: (response) => {
      setUploadedFile({
        url: response.objectPath,
        name: response.metadata.name,
      });
      form.setValue("fileUrl", response.objectPath);
      form.setValue("fileName", response.metadata.name);
      toast({
        title: "Archivo subido",
        description: "El documento se ha subido correctamente",
        className: "bg-green-50 border-green-200",
      });
    },
    onError: (error) => {
      toast({
        title: "Error al subir archivo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const { data: documents, isLoading } = useQuery<SstDocument[]>({
    queryKey: ["/api/sst-documents"],
  });

  const { data: expiringDocs } = useQuery<SstDocument[]>({
    queryKey: ["/api/sst-documents/expiring", { days: 30 }],
  });

  const { data: users } = useQuery<{ id: string; fullName: string; role: string }[]>({
    queryKey: ["/api/users/company-members"],
  });

  const { data: cambiosSst } = useQuery<CambioSst[]>({
    queryKey: ["/api/cambios-sst"],
  });

  const { data: systemDocuments, isLoading: isLoadingSystemDocs } = useQuery<SystemDocument[]>({
    queryKey: ["/api/system-documents"],
  });

  const [systemDocsOpen, setSystemDocsOpen] = useState(false);

  const { data: documentVersions } = useQuery<SstDocumentVersion[]>({
    queryKey: ["/api/sst-documents", selectedDocument?.id, "versions"],
    enabled: !!selectedDocument,
  });

  const { data: accessLog } = useQuery<SstDocumentAccessLog[]>({
    queryKey: ["/api/sst-documents", selectedDocument?.id, "access-log"],
    enabled: !!selectedDocument,
  });

  const form = useForm<InsertSstDocument>({
    resolver: zodResolver(insertSstDocumentSchema),
    defaultValues: {
      code: "",
      title: "",
      description: "",
      category: "formato",
      phvaCycle: "PLANEAR",
      status: "borrador",
      currentVersion: "1.0",
      retentionYears: 20,
      isConfidential: false,
      fileUrl: undefined,
      fileName: undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertSstDocument) =>
      apiRequest("POST", "/api/sst-documents", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sst-documents"] });
      toast({ title: "Documento creado exitosamente", className: "bg-green-50 border-green-200" });
      setDialogOpen(false);
      setUploadedFile(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error al crear documento", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertSstDocument> }) =>
      apiRequest("PATCH", `/api/sst-documents/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sst-documents"] });
      toast({ title: "Documento actualizado exitosamente", className: "bg-green-50 border-green-200" });
      setDialogOpen(false);
      setEditingItem(null);
      setUploadedFile(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error al actualizar documento", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest("DELETE", `/api/sst-documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sst-documents"] });
      toast({ title: "Documento eliminado", className: "bg-yellow-50 border-yellow-200" });
    },
    onError: (error: Error) => {
      toast({ title: "Error al eliminar documento", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = (data: InsertSstDocument) => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (item: SstDocument) => {
    setEditingItem(item);
    setUploadedFile(item.fileUrl ? { url: item.fileUrl, name: item.fileName || "Documento" } : null);
    form.reset({
      code: item.code || "",
      title: item.title,
      description: item.description || "",
      category: item.category,
      phvaCycle: item.phvaCycle || "PLANEAR",
      status: item.status,
      currentVersion: item.currentVersion,
      retentionYears: item.retentionYears,
      isConfidential: item.isConfidential || false,
      documentDate: item.documentDate ? new Date(item.documentDate) : undefined,
      effectiveDate: item.effectiveDate ? new Date(item.effectiveDate) : undefined,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
      nextReviewDate: item.nextReviewDate ? new Date(item.nextReviewDate) : undefined,
      preparedBy: item.preparedBy || undefined,
      reviewedBy: item.reviewedBy || undefined,
      approvedBy: item.approvedBy || undefined,
      sstStandards: item.sstStandards || [],
      tags: item.tags || [],
      fileUrl: item.fileUrl || undefined,
      fileName: item.fileName || undefined,
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingItem(null);
    setSelectedCambio(null);
    setUploadedFile(null);
    form.reset({
      code: "",
      title: "",
      description: "",
      category: "formato",
      phvaCycle: "PLANEAR",
      status: "borrador",
      currentVersion: "1.0",
      retentionYears: 20,
      isConfidential: false,
    });
    setDialogOpen(true);
  };

  const handleSelectCambioSst = (cambioId: string) => {
    if (cambioId === "none") {
      setSelectedCambio(null);
      return;
    }
    
    setSelectedCambio(cambioId);
    const cambio = cambiosSst?.find(c => c.id === cambioId);
    if (!cambio) return;
    
    form.setValue("title", `Documento de Cambio - ${cambio.titulo}`);
    form.setValue("description", `Documento generado a partir del cambio SST: ${cambio.descripcion}\n\nTipo: ${cambio.tipo}\nCategoría: ${cambio.categoria}`);
    form.setValue("category", "registro");
    form.setValue("phvaCycle", "ACTUAR");
    form.setValue("status", "borrador");
    
    toast({
      title: "Cambio SST vinculado",
      description: `Se han pre-rellenado los campos con la información del cambio "${cambio.titulo}"`,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleSelectPlantilla = (plantilla: PlantillaInfo) => {
    setEditingItem(null);
    
    const campos = plantilla.campos || {};
    const retencionStr = campos.retencion as string || "20 años";
    const retencionYears = parseInt(retencionStr.match(/\d+/)?.[0] || "20", 10);
    const categoria = (campos.categoria as string || "formato") as "politica" | "procedimiento" | "formato" | "registro" | "manual" | "plan" | "matriz" | "acta" | "informe" | "certificado" | "contrato" | "normativa" | "capacitacion" | "otro";
    const cicloPhva = (campos.cicloPhva as string || "PLANEAR") as "PLANEAR" | "HACER" | "VERIFICAR" | "ACTUAR";
    const esConfidencial = campos.confidencial === true;
    
    const descripcionBase = `${plantilla.descripcion}. Documento creado según ${plantilla.normativaBase}.`;
    
    form.reset({
      code: "",
      title: plantilla.nombre,
      description: descripcionBase,
      category: categoria,
      phvaCycle: cicloPhva,
      status: "borrador",
      currentVersion: "1.0",
      retentionYears: retencionYears,
      isConfidential: esConfidencial,
    });
    
    setDialogOpen(true);
    
    toast({
      title: "Plantilla aplicada",
      description: `Se ha pre-llenado el formulario con la plantilla "${plantilla.nombre}"`,
      className: "bg-green-50 border-green-200",
    });
  };

  const handleViewDetails = (doc: SstDocument) => {
    setSelectedDocument(doc);
    setDetailDialogOpen(true);
  };

  const getUserName = (userId: string | null | undefined): string => {
    if (!userId || !users) return "-";
    const user = users.find(u => u.id === userId);
    return user ? user.fullName : "-";
  };

  const getDaysUntilExpiration = (expirationDate: Date | string | null | undefined): number | null => {
    if (!expirationDate) return null;
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredData = documents?.filter((item) => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    const matchesPhva = selectedPhva === "all" || item.phvaCycle === selectedPhva;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesStatus && matchesPhva && matchesSearch;
  }) || [];

  const statusCounts = documents?.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryCounts = documents?.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando documentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <BackToEvaluationButton />
        <BackToCronogramaButton />
      </div>
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-page-title">
              Conservación de Documentos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestión documental según Estándar 2.5.1 - Resolución 0312/2019
            </p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-new-document">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Editar Documento" : "Nuevo Documento"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Modifique los detalles del documento" : "Complete la información del nuevo documento"}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                {!editingItem && (
                  <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Wand2 className="h-4 w-4 text-primary" />
                      <FormLabel className="text-sm font-medium">Vincular con Cambio SST (Opcional)</FormLabel>
                    </div>
                    <FormDescription className="text-xs">
                      Seleccione un cambio registrado para pre-rellenar el documento
                    </FormDescription>
                    <Select 
                      value={selectedCambio || "none"} 
                      onValueChange={handleSelectCambioSst}
                    >
                      <SelectTrigger data-testid="select-vincular-cambio">
                        <SelectValue placeholder="Sin vincular" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none" data-testid="option-cambio-none">Sin vincular</SelectItem>
                        {cambiosSst?.map((cambio) => (
                          <SelectItem 
                            key={cambio.id} 
                            value={cambio.id}
                            data-testid={`option-cambio-${cambio.id}`}
                          >
                            {cambio.titulo} - {cambio.tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ""} placeholder="Se genera automáticamente" data-testid="input-code" />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Si deja vacío, se genera automáticamente según la categoría
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoría *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Seleccione categoría" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre del documento" data-testid="input-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} value={field.value || ""} rows={3} placeholder="Descripción del documento" data-testid="textarea-description" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="phvaCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciclo PHVA</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-phva">
                              <SelectValue placeholder="Seleccione ciclo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(phvaCycleLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([value, { label }]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Versión</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="1.0" data-testid="input-version" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fecha del documento - para documentos históricos */}
                <FormField
                  control={form.control}
                  name="documentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Fecha del Documento</FormLabel>
                      <FormDescription className="text-xs">
                        Fecha original del documento (útil para subir documentos de años anteriores)
                      </FormDescription>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                              data-testid="button-document-date"
                            >
                              {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={field.onChange}
                            locale={es}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="effectiveDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha Vigencia</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                data-testid="button-effective-date"
                              >
                                {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={field.onChange}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha Vencimiento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                data-testid="button-expiration-date"
                              >
                                {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={field.onChange}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextReviewDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Próxima Revisión</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                data-testid="button-review-date"
                              >
                                {field.value ? format(new Date(field.value), "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                                <Calendar className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={field.value ? new Date(field.value) : undefined}
                              onSelect={field.onChange}
                              locale={es}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="preparedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Elaborado por</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-prepared-by">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reviewedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Revisado por</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-reviewed-by">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="approvedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aprobado por</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ""}>
                          <FormControl>
                            <SelectTrigger data-testid="select-approved-by">
                              <SelectValue placeholder="Seleccionar" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users?.map((user) => (
                              <SelectItem key={user.id} value={user.id}>
                                {user.fullName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="retentionYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Período de Retención (años)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          value={field.value ?? ''}
                          onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                          onBlur={() => { if (field.value === '' || field.value == null) field.onChange(20); }}
                          data-testid="input-retention-years" 
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Resolución 0312/2019 requiere mínimo 20 años de conservación
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel>Archivo del Documento (PDF/Imagen)</FormLabel>
                  <div className="flex items-center gap-2">
                    {uploadedFile || editingItem?.fileUrl ? (
                      <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30 flex-1">
                        <File className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate flex-1">{uploadedFile?.name || editingItem?.fileName || "Documento subido"}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setUploadedFile(null);
                            form.setValue("fileUrl", undefined);
                            form.setValue("fileName", undefined);
                          }}
                          data-testid="button-remove-document-sst"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileUpload}
                          disabled={isUploadingFile}
                          className="cursor-pointer"
                          data-testid="input-upload-document-sst"
                        />
                      </div>
                    )}
                    {isUploadingFile && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Subiendo...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Suba el archivo del documento SST para conservación digital
                  </p>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending || updateMutation.isPending}
                    data-testid="button-submit-document"
                  >
                    {editingItem ? "Actualizar" : "Crear"} Documento
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {(() => {
        const estandar = getEstandarByCodigo('2.5.1');
        const normativaAplicable: NormativaInfo[] = [
          {
            codigo: 'DEC-1072-2.2.4.6.13',
            norma: 'Decreto 1072/2015',
            articulo: 'Art. 2.2.4.6.13',
            descripcion: 'Conservación de documentos del SG-SST',
            requisitos: [
              'Mantener documentos legibles, protegidos y fácilmente identificables',
              'Conservación mínima de 20 años desde la fecha de desvinculación',
              'Historiales médicos ocupacionales deben guardarse con confidencialidad',
              'Control y gestión de documentos obsoletos',
              'Proteger documentos contra daño, deterioro o pérdida'
            ],
            obligatorio: true
          }
        ];
        const plantillasDocumentos: PlantillaInfo[] = [
          {
            id: 'politica-sst',
            nombre: 'Política SST',
            descripcion: 'Política de Seguridad y Salud en el Trabajo de la organización',
            campos: { retencion: '20 años', categoria: 'politica', cicloPhva: 'PLANEAR' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.5'
          },
          {
            id: 'matriz-peligros',
            nombre: 'Matriz de Peligros (IPERC)',
            descripcion: 'Identificación de peligros, evaluación y valoración de riesgos',
            campos: { retencion: '20 años', categoria: 'matriz', cicloPhva: 'PLANEAR' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.15'
          },
          {
            id: 'plan-trabajo-anual',
            nombre: 'Plan de Trabajo Anual',
            descripcion: 'Plan anual de trabajo del Sistema de Gestión SST',
            campos: { retencion: '20 años', categoria: 'plan', cicloPhva: 'PLANEAR' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.17'
          },
          {
            id: 'programa-capacitacion',
            nombre: 'Programa de Capacitación',
            descripcion: 'Programa anual de capacitación en seguridad y salud en el trabajo',
            campos: { retencion: '20 años', categoria: 'plan', cicloPhva: 'HACER' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.11'
          },
          {
            id: 'procedimiento-sst',
            nombre: 'Procedimientos de SST',
            descripcion: 'Procedimientos operativos de seguridad y salud en el trabajo',
            campos: { retencion: '20 años', categoria: 'procedimiento', cicloPhva: 'HACER' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.12'
          },
          {
            id: 'registro-inspecciones',
            nombre: 'Registros de Inspecciones',
            descripcion: 'Registro de inspecciones de seguridad realizadas',
            campos: { retencion: '20 años', categoria: 'registro', cicloPhva: 'VERIFICAR' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.22'
          },
          {
            id: 'investigacion-accidentes',
            nombre: 'Investigaciones de Accidentes',
            descripcion: 'Informe de investigación de accidentes e incidentes de trabajo',
            campos: { retencion: '20 años', categoria: 'informe', cicloPhva: 'ACTUAR' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.32'
          },
          {
            id: 'historial-medico',
            nombre: 'Historiales Médicos Ocupacionales',
            descripcion: 'Historia clínica ocupacional del trabajador - CONFIDENCIAL',
            campos: { retencion: '30 años', categoria: 'registro', cicloPhva: 'HACER', confidencial: true },
            normativaBase: 'Resolución 2346/2007 y Ley 1581/2012'
          },
          {
            id: 'actas-copasst',
            nombre: 'Actas COPASST',
            descripcion: 'Actas de reuniones del Comité Paritario de Seguridad y Salud en el Trabajo',
            campos: { retencion: '20 años', categoria: 'acta', cicloPhva: 'VERIFICAR' },
            normativaBase: 'Decreto 1072/2015 y Resolución 2013/1986'
          },
          {
            id: 'actas-convivencia',
            nombre: 'Actas Comité Convivencia',
            descripcion: 'Actas de reuniones del Comité de Convivencia Laboral',
            campos: { retencion: '20 años', categoria: 'acta', cicloPhva: 'VERIFICAR' },
            normativaBase: 'Resolución 652/2012 y Resolución 1356/2012'
          },
          {
            id: 'contratos-laborales',
            nombre: 'Contratos Laborales',
            descripcion: 'Contratos de trabajo y sus anexos relacionados con SST',
            campos: { retencion: '20 años', categoria: 'contrato', cicloPhva: 'HACER' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.13'
          },
          {
            id: 'certificados-capacitacion',
            nombre: 'Certificados de Capacitación',
            descripcion: 'Certificados de asistencia y aprobación de capacitaciones SST',
            campos: { retencion: '20 años', categoria: 'certificado', cicloPhva: 'HACER' },
            normativaBase: 'Decreto 1072/2015, Art. 2.2.4.6.11'
          }
        ];
        
        return (
          <AutomationAssistant
            titulo="Conservación de Documentos"
            estandar="2.5.1"
            descripcion="Archivo y retención documental del SG-SST según Decreto 1072/2015"
            normativaAplicable={normativaAplicable}
            compact={true}
          />
        );
      })()}

      {expiringDocs && expiringDocs.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="h-5 w-5" />
              Documentos Próximos a Vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {expiringDocs.slice(0, 6).map((doc) => {
                const daysLeft = getDaysUntilExpiration(doc.expirationDate);
                return (
                  <div 
                    key={doc.id} 
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border"
                    data-testid={`card-expiring-doc-${doc.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{doc.code}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.title}</p>
                    </div>
                    <Badge variant="outline" className={cn(
                      "ml-2 shrink-0",
                      daysLeft !== null && daysLeft <= 7 ? "bg-red-100 text-red-700 border-red-300" : 
                      daysLeft !== null && daysLeft <= 15 ? "bg-orange-100 text-orange-700 border-orange-300" :
                      "bg-yellow-100 text-yellow-700 border-yellow-300"
                    )}>
                      {daysLeft !== null ? `${daysLeft} días` : "-"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const StatusIcon = config.icon;
          return (
            <Card key={status} className="cursor-pointer hover-elevate" onClick={() => setSelectedStatus(status === selectedStatus ? "all" : status)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{config.label}</p>
                    <p className="text-2xl font-bold" data-testid={`text-count-${status}`}>
                      {statusCounts[status] || 0}
                    </p>
                  </div>
                  <StatusIcon className={cn("h-8 w-8", status === selectedStatus ? "text-primary" : "text-muted-foreground")} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Listado de Documentos ({filteredData.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-48"
                  data-testid="input-search"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40" data-testid="filter-category">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label} ({categoryCounts[value] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPhva} onValueChange={setSelectedPhva}>
                <SelectTrigger className="w-36" data-testid="filter-phva">
                  <SelectValue placeholder="Ciclo PHVA" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los ciclos</SelectItem>
                  {Object.entries(phvaCycleLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fecha Doc.</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Versión</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>PHVA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No se encontraron documentos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((doc) => {
                    const statusInfo = statusConfig[doc.status] || statusConfig.borrador;
                    const daysLeft = getDaysUntilExpiration(doc.expirationDate);
                    return (
                      <TableRow key={doc.id} data-testid={`row-document-${doc.id}`}>
                        <TableCell className="font-mono text-sm">{doc.code}</TableCell>
                        <TableCell className="max-w-xs truncate" title={doc.title}>{doc.title}</TableCell>
                        <TableCell>
                          {doc.documentDate 
                            ? format(new Date(doc.documentDate), "dd/MM/yyyy", { locale: es })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>{categoryLabels[doc.category] || doc.category}</TableCell>
                        <TableCell>{doc.currentVersion}</TableCell>
                        <TableCell>
                          <Badge className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {doc.effectiveDate 
                            ? format(new Date(doc.effectiveDate), "dd/MM/yyyy", { locale: es })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          {doc.expirationDate ? (
                            <div className="flex flex-col">
                              <span>{format(new Date(doc.expirationDate), "dd/MM/yyyy", { locale: es })}</span>
                              {daysLeft !== null && daysLeft <= 30 && (
                                <span className={cn(
                                  "text-xs",
                                  daysLeft <= 7 ? "text-red-600" : 
                                  daysLeft <= 15 ? "text-orange-600" : "text-yellow-600"
                                )}>
                                  ({daysLeft} días)
                                </span>
                              )}
                            </div>
                          ) : "-"}
                        </TableCell>
                        <TableCell>
                          {doc.phvaCycle ? (
                            <Badge variant="outline">{phvaCycleLabels[doc.phvaCycle] || doc.phvaCycle}</Badge>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleViewDetails(doc)}
                              data-testid={`button-view-${doc.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleEdit(doc)}
                              data-testid={`button-edit-${doc.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => {
                                if (confirm("¿Está seguro de eliminar este documento?")) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                              data-testid={`button-delete-${doc.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Documentos del Sistema Section */}
      <Card className="mt-6">
        <Collapsible open={systemDocsOpen} onOpenChange={setSystemDocsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover-elevate">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {systemDocsOpen ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                  <Server className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Documentos del Sistema</CardTitle>
                  <Badge variant="secondary" className="ml-2">
                    {systemDocuments?.length || 0}
                  </Badge>
                </div>
              </div>
              <CardDescription className="ml-11">
                PDFs generados automáticamente por los diferentes módulos del sistema
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {isLoadingSystemDocs ? (
                <div className="space-y-2">
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 bg-muted animate-pulse rounded" />
                </div>
              ) : !systemDocuments || systemDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Server className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay documentos del sistema registrados.</p>
                  <p className="text-sm">Los PDFs generados en otros módulos aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Módulo</TableHead>
                        <TableHead>Ciclo PHVA</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemDocuments.map((doc) => (
                        <TableRow key={doc.id} data-testid={`row-system-doc-${doc.id}`}>
                          <TableCell className="font-mono text-sm">{doc.code}</TableCell>
                          <TableCell className="font-medium max-w-[300px] truncate" title={doc.title}>
                            {doc.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {sourceModuleLabels[doc.source_module] || doc.source_module}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {doc.phva_cycle ? (
                              <Badge variant="outline">{phvaCycleLabels[doc.phva_cycle] || doc.phva_cycle}</Badge>
                            ) : "-"}
                          </TableCell>
                          <TableCell>
                            {doc.created_at 
                              ? format(new Date(doc.created_at), "dd/MM/yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(doc.source_endpoint, "_blank")}
                              data-testid={`button-download-system-doc-${doc.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar PDF
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Document Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDocument && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedDocument.code} - {selectedDocument.title}
                </DialogTitle>
                <DialogDescription>
                  Detalles completos del documento
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="info" data-testid="tab-info">Información</TabsTrigger>
                  <TabsTrigger value="versions" data-testid="tab-versions">
                    <History className="h-4 w-4 mr-2" />
                    Versiones
                  </TabsTrigger>
                  <TabsTrigger value="access" data-testid="tab-access" className="text-xs">
                    <Eye className="h-4 w-4 mr-2" />
                    Accesos
                  </TabsTrigger>
                  <TabsTrigger value="acknowledgments" data-testid="tab-acknowledgments" className="text-xs">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Acuse Recibo
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Código</p>
                        <p className="font-mono">{selectedDocument.code}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Categoría</p>
                        <p>{categoryLabels[selectedDocument.category]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Estado</p>
                        <Badge className={statusConfig[selectedDocument.status]?.className}>
                          {statusConfig[selectedDocument.status]?.label}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Versión Actual</p>
                        <p>{selectedDocument.currentVersion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ciclo PHVA</p>
                        <p>{selectedDocument.phvaCycle ? phvaCycleLabels[selectedDocument.phvaCycle] : "-"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha del Documento</p>
                        <p>{selectedDocument.documentDate 
                          ? format(new Date(selectedDocument.documentDate), "dd/MM/yyyy", { locale: es })
                          : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha Vigencia</p>
                        <p>{selectedDocument.effectiveDate 
                          ? format(new Date(selectedDocument.effectiveDate), "dd/MM/yyyy", { locale: es })
                          : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Fecha Vencimiento</p>
                        <p>{selectedDocument.expirationDate 
                          ? format(new Date(selectedDocument.expirationDate), "dd/MM/yyyy", { locale: es })
                          : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Próxima Revisión</p>
                        <p>{selectedDocument.nextReviewDate 
                          ? format(new Date(selectedDocument.nextReviewDate), "dd/MM/yyyy", { locale: es })
                          : "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Retención</p>
                        <p>{selectedDocument.retentionYears} años</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Confidencial</p>
                        <p>{selectedDocument.isConfidential ? "Sí" : "No"}</p>
                      </div>
                    </div>
                  </div>

                  {selectedDocument.description && (
                    <div>
                      <p className="text-sm text-muted-foreground">Descripción</p>
                      <p className="mt-1">{selectedDocument.description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">Elaborado por</p>
                      <p>{getUserName(selectedDocument.preparedBy)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Revisado por</p>
                      <p>{getUserName(selectedDocument.reviewedBy)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Aprobado por</p>
                      <p>{getUserName(selectedDocument.approvedBy)}</p>
                    </div>
                  </div>

                  {selectedDocument.sstStandards && selectedDocument.sstStandards.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Estándares SST Asociados</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.sstStandards.map((std) => (
                          <Badge key={std} variant="outline">{std}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-2">Etiquetas</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="versions">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Versión</TableHead>
                        <TableHead>Tipo Cambio</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Estado Anterior</TableHead>
                        <TableHead>Nuevo Estado</TableHead>
                        <TableHead>Creado por</TableHead>
                        <TableHead>Fecha</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!documentVersions || documentVersions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No hay versiones registradas
                          </TableCell>
                        </TableRow>
                      ) : (
                        documentVersions.map((version) => (
                          <TableRow key={version.id}>
                            <TableCell className="font-mono">{version.versionNumber}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{version.changeType === 'major' ? 'Mayor' : 'Menor'}</Badge>
                            </TableCell>
                            <TableCell>{version.changeDescription || "-"}</TableCell>
                            <TableCell>{version.previousStatus ? statusConfig[version.previousStatus]?.label : "-"}</TableCell>
                            <TableCell>{version.newStatus ? statusConfig[version.newStatus]?.label : "-"}</TableCell>
                            <TableCell>{getUserName(version.createdBy)}</TableCell>
                            <TableCell>
                              {format(new Date(version.createdAt!), "dd/MM/yyyy HH:mm", { locale: es })}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="access">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuario</TableHead>
                        <TableHead>Tipo de Acceso</TableHead>
                        <TableHead>Fecha/Hora</TableHead>
                        <TableHead>Dirección IP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!accessLog || accessLog.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No hay registros de acceso
                          </TableCell>
                        </TableRow>
                      ) : (
                        accessLog.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>{getUserName(log.userId)}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {log.accessType === 'view' ? 'Visualización' : 
                                 log.accessType === 'download' ? 'Descarga' : 
                                 log.accessType === 'edit' ? 'Edición' : log.accessType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(log.accessedAt!), "dd/MM/yyyy HH:mm:ss", { locale: es })}
                            </TableCell>
                            <TableCell className="font-mono text-sm">{log.ipAddress || "-"}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="acknowledgments" className="space-y-4">
                  <DocumentAcknowledgmentsTab documentId={selectedDocument.id} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
