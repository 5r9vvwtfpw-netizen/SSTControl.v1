import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Pencil, Trash2, Building2, Upload, Image, AlertTriangle, Loader2, Users, GraduationCap, AlertCircle, ClipboardCheck, BarChart3, Wrench, RefreshCw, Settings2, CheckCircle2, Info, CreditCard, Tag } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation, useRouter } from "wouter";
import { Company, insertCompanySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { 
  calculateChapter, 
  getChapterDescription, 
  getChapterStandards,
  getRiskLevelLabel,
  getRiskLevelExamples 
} from "@shared/utils";
import { hasCompanyAdminAccess, hasGlobalAccess } from "@shared/permissions";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CIIU_CODES, CIIU_SECTIONS, getCiiuLabel } from "@/lib/ciiu-codes";
import { compressLogoImage, compressSignatureImage } from "@/lib/imageCompression";
import { AnimatedWarningIcon } from "@/components/animated-warning-icon";

// Tipo para estadísticas de empresas (solo visible para superadmin)
type CompanyStats = {
  companyId: string;
  companyName: string;
  nit: string;
  declaredWorkers: number;
  riskLevel: string;
  calculatedChapter: string;
  stats: {
    workersRegistered: number;
    usersCount: number;
    trainingsCount: number;
    accidentsCount: number;
    inspectionsCount: number;
  };
  subscription?: {
    status: string;
    planId: string;
    couponCode: string | null;
    couponUsed: boolean;
    source: string;
  } | null;
};

// Lista de ciudades principales de Colombia para documentos oficiales
const colombianCities = [
  "Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
  "Pereira", "Manizales", "Santa Marta", "Ibagué", "Cúcuta", "Villavicencio",
  "Pasto", "Montería", "Neiva", "Armenia", "Popayán", "Sincelejo", "Valledupar",
  "Tunja", "Riohacha", "Florencia", "Quibdó", "Yopal", "Mocoa", "Leticia",
  "San José del Guaviare", "Inírida", "Puerto Carreño", "Mitú", "Arauca",
  "Soacha", "Bello", "Soledad", "Itagüí", "Floridablanca", "Envigado",
  "Palmira", "Dosquebradas", "Rionegro", "Zipaquirá", "Chía", "Facatativá",
  "Girardot", "Barrancabermeja", "Sogamoso", "Duitama", "Tuluá"
];

type CompanyFormData = {
  name: string;
  nit: string;
  city: string;
  ciiuCode: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  legalRepName: string;
  legalRepId: string;
  legalRepPosition: string;
  numberOfWorkers: number;
  numberOfVehicles: number;
  riskLevel: "I" | "II" | "III" | "IV" | "V";
};

const getPesvLevel = (vehicles: number): { level: string; description: string; color: string } => {
  if (vehicles === 0) {
    return { level: "N/A", description: "Sin vehículos - PESV no requerido", color: "text-muted-foreground" };
  } else if (vehicles >= 1 && vehicles <= 10) {
    return { level: "Básico", description: "1-10 vehículos - PESV Nivel Básico", color: "text-blue-600" };
  } else if (vehicles >= 11 && vehicles <= 50) {
    return { level: "Estándar", description: "11-50 vehículos - PESV Nivel Estándar", color: "text-amber-600" };
  } else {
    return { level: "Avanzado", description: "50+ vehículos - PESV Nivel Avanzado", color: "text-red-600" };
  }
};

const initialFormData: CompanyFormData = {
  name: "",
  nit: "",
  city: "",
  ciiuCode: "",
  address: "",
  contactPhone: "",
  contactEmail: "",
  legalRepName: "",
  legalRepId: "",
  legalRepPosition: "",
  numberOfWorkers: 1,
  numberOfVehicles: 0,
  riskLevel: "I",
};

export default function CompanyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [pricingChangeDialogOpen, setPricingChangeDialogOpen] = useState(false);
  const [pendingPricingUpdate, setPendingPricingUpdate] = useState<{ changedFields: string[] } | null>(null);
  
  // Estados para diagnóstico de empresas (superadmin)
  const [diagnosticoEmpresasOpen, setDiagnosticoEmpresasOpen] = useState(false);
  const [diagnosticoEmpresasData, setDiagnosticoEmpresasData] = useState<any>(null);
  const [corrigiendoEmpresas, setCorrigiendoEmpresas] = useState(false);

  const { data: companies = [], isLoading: companiesLoading } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Solo superadmin puede ver estadísticas de todas las empresas
  const isSuperAdmin = user ? hasGlobalAccess(user.role) : false;
  const { data: companyStats = [] } = useQuery<CompanyStats[]>({
    queryKey: ["/api/companies/stats/all"],
    enabled: !!isSuperAdmin,
  });

  // Helper para obtener stats de una empresa específica
  const getCompanyStats = (companyId: string): CompanyStats["stats"] | null => {
    const found = companyStats.find((s: CompanyStats) => s.companyId === companyId);
    return found?.stats || null;
  };

  // Helper para obtener info de suscripción/cupón
  const getCompanySubscription = (companyId: string): CompanyStats["subscription"] | null => {
    const found = companyStats.find((s: CompanyStats) => s.companyId === companyId);
    return found?.subscription || null;
  };

  const createCompanyMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/companies", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      // Note: Toast is now handled in handleSubmit to account for logo upload status
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCompanyMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const res = await apiRequest("PATCH", `/api/companies/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      // Note: Toast is now handled in handleSubmit to account for logo upload status
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recalculateQuoteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyFormData> }) => {
      const res = await apiRequest("POST", `/api/companies/${id}/recalculate-quote`, data);
      return res.json();
    },
    onError: (error: Error) => {
      console.warn('[Quote-Recalculate] Error recalculating quote:', error.message);
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/companies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      toast({
        title: "Empresa eliminada",
        description: "La empresa se ha eliminado exitosamente",
        className: "bg-yellow-50 border-yellow-200",
      });
    },
    onError: (error: Error) => {
      if (error.message?.includes("no encontrada") || error.message?.includes("not found") || error.message?.includes("404")) {
        queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
        setDeleteDialogOpen(false);
        setCompanyToDelete(null);
        toast({
          title: "Empresa ya eliminada",
          description: "La empresa ya no existe en el sistema. La lista se ha actualizado.",
          className: "bg-yellow-50 border-yellow-200",
        });
        return;
      }
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Eliminación completa con todos los datos (solo superadmin)
  const fullDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/companies/${id}/full-delete`);
      return res.json();
    },
    onSuccess: (data: { message: string; totalRecordsDeleted: number }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
      toast({
        title: "Empresa eliminada completamente",
        description: `${data.message}. Se eliminaron ${data.totalRecordsDeleted} registros.`,
        className: "bg-red-50 border-red-200",
      });
    },
    onError: (error: Error) => {
      if (error.message?.includes("no encontrada") || error.message?.includes("not found") || error.message?.includes("404")) {
        queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
        setDeleteDialogOpen(false);
        setCompanyToDelete(null);
        toast({
          title: "Empresa ya eliminada",
          description: "La empresa ya no existe en el sistema. La lista se ha actualizado.",
          className: "bg-yellow-50 border-yellow-200",
        });
        return;
      }
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadLogoMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('logo', file);
      
      const res = await fetch(`/api/companies/${id}/logo`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al subir el logo');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: () => {},
  });

  const uploadSignatureMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('signature', file);
      
      const res = await fetch(`/api/companies/${id}/signature`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al subir la firma');
      }
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
    },
    onError: () => {},
  });

  const detectPricingChanges = (): string[] => {
    if (!editingCompany) return [];
    const changes: string[] = [];
    if (formData.numberOfWorkers !== (editingCompany.numberOfWorkers ?? 1)) {
      changes.push(`Trabajadores: ${editingCompany.numberOfWorkers ?? 1} → ${formData.numberOfWorkers}`);
    }
    if (formData.numberOfVehicles !== (editingCompany.numberOfVehicles ?? 0)) {
      changes.push(`Vehículos: ${editingCompany.numberOfVehicles ?? 0} → ${formData.numberOfVehicles}`);
    }
    if (formData.ciiuCode !== (editingCompany.ciiuCode ?? "")) {
      changes.push(`Código CIIU: ${editingCompany.ciiuCode || 'Sin definir'} → ${formData.ciiuCode}`);
    }
    if (formData.riskLevel !== (editingCompany.riskLevel ?? "I")) {
      changes.push(`Nivel de Riesgo: ${editingCompany.riskLevel || 'I'} → ${formData.riskLevel}`);
    }
    return changes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCompany) {
      const pricingChanges = detectPricingChanges();
      if (pricingChanges.length > 0) {
        setPendingPricingUpdate({ changedFields: pricingChanges });
        setPricingChangeDialogOpen(true);
        return;
      }
    }

    await executeUpdate();
  };

  const executeUpdate = async () => {
    let logoUploadFailed = false;
    let signatureUploadFailed = false;
    
    try {
      if (editingCompany) {
        const updateResult = await updateCompanyMutation.mutateAsync({ id: editingCompany.id, data: formData });

        const hasPricingChanges = pendingPricingUpdate !== null;
        if (hasPricingChanges) {
          recalculateQuoteMutation.mutate(
            { id: editingCompany.id, data: formData },
            {
              onSuccess: (result) => {
                if (result?.success && result.newBaseMonthlyPrice) {
                  toast({
                    title: "Precio actualizado",
                    description: `El nuevo precio mensual es $${result.newBaseMonthlyPrice.toLocaleString('es-CO')} COP. Se reflejará en su próxima factura.`,
                    duration: 10000,
                  });
                }
              },
              onError: () => {
                toast({
                  title: "Aviso sobre precio",
                  description: "No se pudo recalcular el precio automáticamente. El ajuste se realizará manualmente o en su próxima factura.",
                  duration: 10000,
                });
              }
            }
          );
          setPendingPricingUpdate(null);
        }
        
        // Upload logo if a new file was selected (optional - don't fail if upload fails)
        if (logoFile) {
          try {
            const compressedLogo = await compressLogoImage(logoFile);
            await uploadLogoMutation.mutateAsync({ id: editingCompany.id, file: compressedLogo });
          } catch (logoError) {
            console.warn('Logo upload failed, but company was updated successfully:', logoError);
            logoUploadFailed = true;
          }
        }
        
        // Upload signature if a new file was selected
        if (signatureFile) {
          try {
            const compressedSignature = await compressSignatureImage(signatureFile);
            await uploadSignatureMutation.mutateAsync({ id: editingCompany.id, file: compressedSignature });
          } catch (sigError) {
            console.warn('Signature upload failed:', sigError);
            signatureUploadFailed = true;
          }
        }
        
        // Show appropriate success message
        setDialogOpen(false);
        resetForm();
        if (logoUploadFailed || signatureUploadFailed) {
          toast({
            title: "Empresa actualizada (con advertencias)",
            description: `La empresa se actualizó exitosamente pero ${logoUploadFailed ? 'no se pudo subir el logo' : ''}${logoUploadFailed && signatureUploadFailed ? ' ni ' : ''}${signatureUploadFailed ? 'no se pudo subir la firma' : ''}.`,
            className: "bg-yellow-50 border-yellow-200",
          });
        } else {
          toast({
            title: "Empresa actualizada",
            description: "Los datos se han actualizado exitosamente",
            className: "bg-yellow-50 border-yellow-200",
          });
        }

        // PESV Level Migration: Notificar y ofrecer upgrade de facturación (Resolución 40595/2022)
        if (updateResult?.pesvMigration?.migrated) {
          const migration = updateResult.pesvMigration;
          const nivelLabels: Record<string, string> = {
            'basico': 'Básico',
            'estandar': 'Estándar', 
            'avanzado': 'Avanzado'
          };
          
          // Notificación de migración inmediata
          setTimeout(() => {
            toast({
              title: `Nivel PESV migrado: ${nivelLabels[migration.oldNivel] || 'Sin PESV'} → ${nivelLabels[migration.newNivel]}`,
              description: `${migration.evaluacionesMigradas.length} evaluación(es) actualizada(s) inmediatamente. ${migration.isUpgrade ? `Se desbloquearon ${migration.newPasos - migration.oldPasos} pasos adicionales.` : 'Los pasos han sido ajustados.'}`,
              duration: 10000,
            });
          }, 500);

          // Mensaje informativo sobre ajuste de facturación en próxima factura
          if (migration.isUpgrade && migration.diferenciaMensual > 0) {
            setTimeout(() => {
              toast({
                title: "Información de facturación PESV",
                description: `Su plan PESV pasó de $${migration.oldCostoMensual.toLocaleString('es-CO')} a $${migration.newCostoMensual.toLocaleString('es-CO')} COP/mes. La diferencia de $${migration.diferenciaMensual.toLocaleString('es-CO')} COP se aplicará automáticamente en su próxima factura mensual. No requiere acción adicional.`,
                duration: 20000,
              });
            }, 2000);
          } else if (migration.diferenciaMensual < 0) {
            setTimeout(() => {
              toast({
                title: "Ajuste de facturación PESV",
                description: `Su plan PESV se redujo a $${migration.newCostoMensual.toLocaleString('es-CO')} COP/mes. El ajuste se reflejará en su próxima factura mensual.`,
                duration: 15000,
              });
            }, 2000);
          }
        }
      } else {
        const newCompany = await createCompanyMutation.mutateAsync(formData);
        
        // Upload logo if a file was selected (optional - don't fail if upload fails)
        if (logoFile && newCompany) {
          try {
            const compressedLogo = await compressLogoImage(logoFile);
            await uploadLogoMutation.mutateAsync({ id: newCompany.id, file: compressedLogo });
          } catch (logoError) {
            console.warn('Logo upload failed, but company was created successfully:', logoError);
            logoUploadFailed = true;
          }
        }
        
        // Upload signature if a file was selected
        if (signatureFile && newCompany) {
          try {
            const compressedSignature = await compressSignatureImage(signatureFile);
            await uploadSignatureMutation.mutateAsync({ id: newCompany.id, file: compressedSignature });
          } catch (sigError) {
            console.warn('Signature upload failed:', sigError);
            signatureUploadFailed = true;
          }
        }
        
        // Show appropriate success message
        setDialogOpen(false);
        resetForm();
        if (logoUploadFailed || signatureUploadFailed) {
          toast({
            title: "Empresa creada (con advertencias)",
            description: `La empresa se creó exitosamente pero ${logoUploadFailed ? 'no se pudo subir el logo' : ''}${logoUploadFailed && signatureUploadFailed ? ' ni ' : ''}${signatureUploadFailed ? 'no se pudo subir la firma' : ''}.`,
            className: "bg-yellow-50 border-yellow-200",
          });
        } else {
          toast({
            title: "Empresa creada",
            description: "La empresa se ha registrado exitosamente",
            className: "bg-yellow-50 border-yellow-200",
          });
        }
      }
    } catch (error) {
      // Main mutations already handle their own errors via onError
      console.error('Error in handleSubmit:', error);
    }
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    const quoteDataRaw = typeof window !== 'undefined' ? localStorage.getItem('sst_quote_data') : null;
    const quoteData = quoteDataRaw ? JSON.parse(quoteDataRaw) : null;
    const quoteVehicles = quoteData?.vehicles ? parseInt(String(quoteData.vehicles), 10) : 0;
    setFormData({
      name: company.name,
      nit: company.nit,
      city: company.city || "",
      ciiuCode: company.ciiuCode || "",
      address: company.address || "",
      contactPhone: company.contactPhone || "",
      contactEmail: company.contactEmail || "",
      legalRepName: company.legalRepName || "",
      legalRepId: company.legalRepId || "",
      legalRepPosition: company.legalRepPosition || "",
      numberOfWorkers: company.numberOfWorkers,
      numberOfVehicles: company.numberOfVehicles || quoteVehicles || 0,
      riskLevel: company.riskLevel,
    });
    setLogoPreview(company.logoUrl || null);
    setSignaturePreview(company.legalRepSignatureUrl || null);
    setDialogOpen(true);
  };

  const handleDelete = (company: Company) => {
    setCompanyToDelete(company);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = (fullDelete: boolean) => {
    if (!companyToDelete) return;
    
    if (fullDelete) {
      fullDeleteMutation.mutate(companyToDelete.id);
    } else {
      deleteCompanyMutation.mutate(companyToDelete.id);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingCompany(null);
    setLogoFile(null);
    setLogoPreview(null);
    setSignatureFile(null);
    setSignaturePreview(null);
  };

  const handleSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignaturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculatedChapter = calculateChapter(formData.numberOfWorkers, formData.riskLevel);
  const chapterStandards = getChapterStandards(calculatedChapter);

  // Verificar acceso: superadmin, superusuario, o admin
  const hasAccess = user?.role && hasCompanyAdminAccess(user.role);
  
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
            <CardDescription>Solo los administradores de empresa pueden gestionar empresas</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Gestión de Empresas</h1>
          <p className="text-muted-foreground">
            Configure empresas según Resolución 0312/2019 con cálculo automático
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Botón de diagnóstico (solo superadmin) */}
          {isSuperAdmin && (
            <Button
              variant="outline"
              onClick={async () => {
                setDiagnosticoEmpresasOpen(true);
                try {
                  const res = await fetch('/api/diagnostico/empresas', { credentials: 'include' });
                  const data = await res.json();
                  setDiagnosticoEmpresasData(data);
                } catch (err) {
                  console.error('Error loading diagnostic:', err);
                }
              }}
              data-testid="button-diagnostico-empresas"
            >
              <Wrench className="h-4 w-4 mr-2" />
              Diagnóstico
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCompany ? "Editar Empresa" : "Registrar Nueva Empresa"}</DialogTitle>
              <DialogDescription>Complete la información de la empresa para asignación automática de estándares según Res. 0312</DialogDescription>
            </DialogHeader>
            
            <Alert variant="warning" data-testid="alert-sgsst-professional">
              <AnimatedWarningIcon />
              <AlertTitle className="text-foreground font-bold">Requisito: Profesional en Seguridad y Salud en el Trabajo (SST)</AlertTitle>
              <AlertDescription className="text-foreground space-y-3">
                <p>Los documentos generados por este sistema requieren la firma de un profesional en salud ocupacional con licencia vigente según la Resolución 0312/2019.</p>
                
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">Requisitos según el número de trabajadores:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>11 a 49 trabajadores:</strong> Se requiere profesional en SST (Capítulo 2-3 de Res. 0312)</li>
                    <li><strong>50 o más trabajadores:</strong> Se requiere profesional en SST con dedicación exclusiva y especialista</li>
                  </ul>
                </div>

                <div className="flex gap-2 mt-3">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-warning text-warning-foreground hover:bg-warning/90 font-semibold"
                    onClick={() => {
                      window.location.href = "/asignar-lso-externo";
                    }}
                    data-testid="button-find-professionals"
                  >
                    Encontrar Profesionales Certificados
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            
            <form onSubmit={handleSubmit} className="space-y-4 pb-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre de la Empresa *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Acme Corporation S.A.S."
                    data-testid="input-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nit">NIT *</Label>
                  <Input
                    id="nit"
                    value={formData.nit}
                    onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                    required
                    placeholder="900123456-7"
                    data-testid="input-nit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad *</Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData({ ...formData, city: value })}
                  >
                    <SelectTrigger data-testid="select-city">
                      <SelectValue placeholder="Seleccione ciudad" />
                    </SelectTrigger>
                    <SelectContent>
                      {colombianCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="ciiuCode">Actividad Económica (CIIU) *</Label>
                  <Select
                    value={formData.ciiuCode}
                    onValueChange={(value) => setFormData({ ...formData, ciiuCode: value })}
                  >
                    <SelectTrigger data-testid="select-ciiu">
                      <SelectValue placeholder="Seleccione código CIIU" />
                    </SelectTrigger>
                    <SelectContent className="max-h-80">
                      {Object.entries(CIIU_SECTIONS).map(([section, sectionName]) => (
                        <div key={section}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                            {section} - {sectionName}
                          </div>
                          {CIIU_CODES.filter(c => c.section === section).map((ciiu) => (
                            <SelectItem key={ciiu.code} value={ciiu.code}>
                              {ciiu.code} - {ciiu.description}
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Calle 123 #45-67"
                    data-testid="input-address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="601 234 5678"
                    data-testid="input-contact-phone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Correo Electrónico *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contacto@empresa.com"
                    required
                    data-testid="input-contact-email"
                  />
                </div>
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Representante Legal</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepName">Nombre del Representante Legal</Label>
                  <Input
                    id="legalRepName"
                    value={formData.legalRepName}
                    onChange={(e) => setFormData({ ...formData, legalRepName: e.target.value })}
                    placeholder="Ej: Juan Carlos Pérez"
                    data-testid="input-legal-rep-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalRepId">Cédula del Representante Legal</Label>
                  <Input
                    id="legalRepId"
                    value={formData.legalRepId}
                    onChange={(e) => setFormData({ ...formData, legalRepId: e.target.value })}
                    placeholder="Ej: 1.234.567.890"
                    data-testid="input-legal-rep-id"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="legalRepPosition">Cargo del Representante Legal</Label>
                  <Input
                    id="legalRepPosition"
                    value={formData.legalRepPosition}
                    onChange={(e) => setFormData({ ...formData, legalRepPosition: e.target.value })}
                    placeholder="Ej: Gerente General"
                    data-testid="input-legal-rep-position"
                  />
                </div>
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Archivos de la Empresa</p>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="logo">Logo de la Empresa</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                        onChange={handleLogoChange}
                        data-testid="input-logo"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: JPG, PNG, SVG. Máximo 5MB
                      </p>
                    </div>
                    {logoPreview && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-20 border rounded-md flex items-center justify-center bg-muted overflow-hidden">
                          <img 
                            src={logoPreview} 
                            alt="Preview logo" 
                            className="max-w-full max-h-full object-contain"
                            data-testid="img-logo-preview"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="signature">Firma del Representante Legal</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        id="signature"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleSignatureChange}
                        data-testid="input-signature"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: JPG, PNG. Máximo 2MB. Se usará en documentos oficiales.
                      </p>
                    </div>
                    {signaturePreview && (
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-12 border rounded-md flex items-center justify-center bg-white overflow-hidden">
                          <img 
                            src={signaturePreview} 
                            alt="Preview firma" 
                            className="max-w-full max-h-full object-contain"
                            data-testid="img-signature-preview"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfWorkers">Número de Trabajadores *</Label>
                  <Input
                    id="numberOfWorkers"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.numberOfWorkers === 0 ? "" : formData.numberOfWorkers}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        setFormData({ ...formData, numberOfWorkers: val === "" ? 0 : parseInt(val, 10) });
                      }
                    }}
                    onBlur={(e) => {
                      // Asegurar mínimo de 1 trabajador al salir del campo
                      if (!e.target.value || parseInt(e.target.value, 10) < 1) {
                        setFormData({ ...formData, numberOfWorkers: 1 });
                      }
                    }}
                    required
                    data-testid="input-number-of-workers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Nivel de Riesgo *</Label>
                  <Select
                    value={formData.riskLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, riskLevel: value })}
                  >
                    <SelectTrigger id="riskLevel" data-testid="select-risk-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">Riesgo I (Mínimo) - Oficinas</SelectItem>
                      <SelectItem value="II">Riesgo II (Bajo) - Comercio</SelectItem>
                      <SelectItem value="III">Riesgo III (Medio) - Manufactura</SelectItem>
                      <SelectItem value="IV">Riesgo IV (Alto) - Construcción</SelectItem>
                      <SelectItem value="V">Riesgo V (Máximo) - Minería</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{getRiskLevelExamples(formData.riskLevel)}</p>
                </div>
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <p className="text-sm font-medium text-muted-foreground mb-3">Plan Estratégico de Seguridad Vial (PESV)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numberOfVehicles">Número de Vehículos (PESV)</Label>
                  <Input
                    id="numberOfVehicles"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={formData.numberOfVehicles === 0 ? "" : formData.numberOfVehicles}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === "" || /^\d+$/.test(val)) {
                        setFormData({ ...formData, numberOfVehicles: val === "" ? 0 : parseInt(val, 10) });
                      }
                    }}
                    placeholder="0"
                    data-testid="input-number-of-vehicles"
                  />
                  <p className="text-xs text-muted-foreground">Cantidad de vehículos propios o en uso (Resolución 40595/2022)</p>
                </div>
                <div className="space-y-2">
                  <Label>Nivel PESV Asignado</Label>
                  <div className={`flex items-center h-10 px-3 rounded-md border bg-muted ${getPesvLevel(formData.numberOfVehicles).color}`}>
                    <span className="font-medium">{getPesvLevel(formData.numberOfVehicles).level}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{getPesvLevel(formData.numberOfVehicles).description}</p>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createCompanyMutation.isPending || updateCompanyMutation.isPending} 
                  data-testid="button-submit-company"
                >
                  {editingCompany ? "Actualizar Empresa" : "Crear Empresa"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-name">Empresa</TableHead>
              <TableHead data-testid="header-nit">NIT</TableHead>
              <TableHead data-testid="header-workers">Trabajadores</TableHead>
              <TableHead data-testid="header-risk">Riesgo</TableHead>
              <TableHead data-testid="header-standards">Estándares</TableHead>
              {isSuperAdmin && (
                <TableHead data-testid="header-stats" className="min-w-[250px]">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    Resumen Datos
                  </div>
                </TableHead>
              )}
              {isSuperAdmin && (
                <TableHead data-testid="header-subscription" className="min-w-[140px]">
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-4 w-4" />
                    Suscripción
                  </div>
                </TableHead>
              )}
              <TableHead data-testid="header-actions">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {companiesLoading ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 8 : 6} className="text-center" data-testid="text-loading">
                  Cargando empresas...
                </TableCell>
              </TableRow>
            ) : companies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isSuperAdmin ? 8 : 6} className="text-center" data-testid="text-no-companies">
                  No hay empresas registradas. Cree la primera empresa para comenzar.
                </TableCell>
              </TableRow>
            ) : (
              companies.map((company) => {
                const stats = getCompanyStats(company.id);
                return (
                  <TableRow key={company.id} data-testid={`row-company-${company.id}`}>
                    <TableCell data-testid={`text-name-${company.id}`}>
                      <Link href={`/empresas/${company.id}`}>
                        <div className="flex items-center gap-2 hover-elevate rounded-md px-2 py-1 -mx-2 -my-1 cursor-pointer">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-primary hover:underline" data-testid={`link-company-${company.id}`}>{company.name}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell data-testid={`text-nit-${company.id}`}>{company.nit}</TableCell>
                    <TableCell data-testid={`text-workers-${company.id}`}>{company.numberOfWorkers}</TableCell>
                    <TableCell data-testid={`text-risk-${company.id}`}>{company.riskLevel}</TableCell>
                    <TableCell data-testid={`text-standards-${company.id}`}>
                      {getChapterStandards(company.calculatedChapter)} estándares
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell data-testid={`stats-${company.id}`}>
                        {stats ? (
                          <div className="flex flex-wrap gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-help" data-testid={`badge-workers-${company.id}`}>
                                  <Users className="h-3 w-3 mr-1" />
                                  {stats.workersRegistered}/{company.numberOfWorkers}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stats.workersRegistered} trabajadores registrados de {company.numberOfWorkers} declarados</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-help" data-testid={`badge-users-${company.id}`}>
                                  <Users className="h-3 w-3 mr-1" />
                                  {stats.usersCount} usr
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stats.usersCount} usuarios del sistema</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-help" data-testid={`badge-trainings-${company.id}`}>
                                  <GraduationCap className="h-3 w-3 mr-1" />
                                  {stats.trainingsCount}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stats.trainingsCount} capacitaciones</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant={stats.accidentsCount > 0 ? "destructive" : "outline"} 
                                  className="text-xs cursor-help" 
                                  data-testid={`badge-accidents-${company.id}`}
                                >
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  {stats.accidentsCount}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stats.accidentsCount} accidentes/incidentes</p>
                              </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-help" data-testid={`badge-inspections-${company.id}`}>
                                  <ClipboardCheck className="h-3 w-3 mr-1" />
                                  {stats.inspectionsCount}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{stats.inspectionsCount} inspecciones</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Cargando...</span>
                        )}
                      </TableCell>
                    )}
                    {isSuperAdmin && (
                      <TableCell data-testid={`subscription-${company.id}`}>
                        {(() => {
                          const sub = getCompanySubscription(company.id);
                          if (!sub) return <span className="text-xs text-muted-foreground">Sin suscripción</span>;
                          const statusColors: Record<string, string> = {
                            active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                            trial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                            past_due: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                            blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                            cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
                          };
                          return (
                            <div className="flex flex-col gap-1">
                              <Badge className={`text-xs ${statusColors[sub.status] || ''}`}>
                                {sub.status}
                              </Badge>
                              {sub.couponCode && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs cursor-help">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {sub.couponCode}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Cupón aplicado: {sub.couponCode}</p>
                                    <p>Fuente: {sub.source === 'landing_page' ? 'Landing Page' : 'Registro directo'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          );
                        })()}
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(company)}
                          data-testid={`button-edit-${company.id}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user?.role === 'superadmin' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(company)}
                            disabled={deleteCompanyMutation.isPending || fullDeleteMutation.isPending}
                            data-testid={`button-delete-${company.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={pricingChangeDialogOpen} onOpenChange={(open) => {
        setPricingChangeDialogOpen(open);
        if (!open) setPendingPricingUpdate(null);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              Cambio en la Facturación
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  Los siguientes cambios afectan el precio de su suscripción:
                </p>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                  <ul className="list-disc list-inside space-y-1 text-foreground">
                    {pendingPricingUpdate?.changedFields.map((field, i) => (
                      <li key={i}>{field}</li>
                    ))}
                  </ul>
                </div>
                <p className="text-sm text-muted-foreground">
                  El nuevo precio se calculará automáticamente y se reflejará en su <strong>próxima factura mensual</strong>. No se realizará ningún cobro adicional inmediato.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={updateCompanyMutation.isPending || recalculateQuoteMutation.isPending}
              data-testid="button-cancel-pricing-change"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setPricingChangeDialogOpen(false);
                executeUpdate();
              }}
              disabled={updateCompanyMutation.isPending || recalculateQuoteMutation.isPending}
              data-testid="button-confirm-pricing-change"
            >
              {(updateCompanyMutation.isPending || recalculateQuoteMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Confirmar y Actualizar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar Empresa
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                ¿Está seguro de eliminar la empresa <strong>"{companyToDelete?.name}"</strong>?
              </p>
              {user?.role === 'superadmin' && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
                  <p className="font-medium text-destructive mb-1">Opciones de eliminación:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li><strong>Eliminación simple:</strong> Solo elimina la empresa si no tiene datos asociados</li>
                    <li><strong>Eliminación completa:</strong> Elimina la empresa y TODOS sus datos (trabajadores, capacitaciones, accidentes, etc.)</li>
                  </ul>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              disabled={deleteCompanyMutation.isPending || fullDeleteMutation.isPending}
              data-testid="button-cancel-delete"
            >
              Cancelar
            </AlertDialogCancel>
            {user?.role === 'superadmin' ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => confirmDelete(false)}
                  disabled={deleteCompanyMutation.isPending || fullDeleteMutation.isPending}
                  data-testid="button-simple-delete"
                >
                  {deleteCompanyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Eliminación Simple
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => confirmDelete(true)}
                  disabled={deleteCompanyMutation.isPending || fullDeleteMutation.isPending}
                  data-testid="button-full-delete"
                >
                  {fullDeleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Eliminar Todo
                </Button>
              </>
            ) : (
              <AlertDialogAction
                onClick={() => confirmDelete(false)}
                disabled={deleteCompanyMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
                data-testid="button-confirm-delete"
              >
                {deleteCompanyMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Diagnóstico de Empresas (solo superadmin) */}
      {isSuperAdmin && (
        <Dialog open={diagnosticoEmpresasOpen} onOpenChange={setDiagnosticoEmpresasOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Diagnóstico de Empresas
              </DialogTitle>
              <DialogDescription>
                Verificar y corregir configuración de estándares y plan según Resolución 0312/2019
              </DialogDescription>
            </DialogHeader>
            
            {diagnosticoEmpresasData ? (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Empresas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{diagnosticoEmpresasData.summary?.totalCompanies || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Con Problemas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-destructive">
                        {diagnosticoEmpresasData.summary?.companiesWithIssues || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Estándares Incorrectos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-500">
                        {diagnosticoEmpresasData.summary?.chapterMismatches || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Plan Incorrecto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-500">
                        {diagnosticoEmpresasData.summary?.planMismatches || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de empresas con problemas */}
                {diagnosticoEmpresasData.companies?.filter((c: any) => c.hasIssues).length > 0 ? (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      Empresas con configuración incorrecta:
                    </h4>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Empresa</TableHead>
                            <TableHead>Trabajadores</TableHead>
                            <TableHead>Riesgo</TableHead>
                            <TableHead>Estándares Actual</TableHead>
                            <TableHead>Estándares Correcto</TableHead>
                            <TableHead>Plan Actual</TableHead>
                            <TableHead>Plan Correcto</TableHead>
                            <TableHead>Acción</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {diagnosticoEmpresasData.companies?.filter((c: any) => c.hasIssues).map((company: any) => (
                            <TableRow key={company.id}>
                              <TableCell className="font-medium">{company.name}</TableCell>
                              <TableCell>{company.numberOfWorkers}</TableCell>
                              <TableCell>{company.riskLevel}</TableCell>
                              <TableCell>
                                <Badge variant={company.chapterMismatch ? "destructive" : "default"}>
                                  {company.currentChapter === "1" ? "7" : company.currentChapter === "2" ? "21" : "61"} est.
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{company.expectedChapter === "1" ? "7" : company.expectedChapter === "2" ? "21" : "61"} est.</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={company.planMismatch ? "destructive" : "default"}>
                                  {company.currentPlanName}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{company.expectedPlanId}</Badge>
                              </TableCell>
                              <TableCell>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={async () => {
                                    try {
                                      await fetch(`/api/diagnostico/corregir-empresa/${company.id}`, {
                                        method: 'POST',
                                        credentials: 'include'
                                      });
                                      const res = await fetch('/api/diagnostico/empresas', { credentials: 'include' });
                                      const data = await res.json();
                                      setDiagnosticoEmpresasData(data);
                                      toast({ title: "Empresa corregida", description: `${company.name} actualizada correctamente` });
                                    } catch (err) {
                                      toast({ title: "Error", description: "No se pudo corregir", variant: "destructive" });
                                    }
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Corregir
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">
                        Todas las empresas están configuradas correctamente
                      </p>
                      <p className="text-sm text-muted-foreground">
                        No se detectaron problemas de estándares o plan de suscripción
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Cargando diagnóstico...
              </div>
            )}
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setDiagnosticoEmpresasOpen(false)}>
                Cerrar
              </Button>
              {diagnosticoEmpresasData?.summary?.companiesWithIssues > 0 && (
                <Button 
                  variant="destructive"
                  disabled={corrigiendoEmpresas}
                  onClick={async () => {
                    setCorrigiendoEmpresas(true);
                    try {
                      const res = await fetch('/api/diagnostico/corregir-todas-empresas', { 
                        method: 'POST',
                        credentials: 'include' 
                      });
                      const data = await res.json();
                      toast({
                        title: "Corrección completada",
                        description: data.mensaje || "Empresas corregidas exitosamente",
                      });
                      const diagRes = await fetch('/api/diagnostico/empresas', { credentials: 'include' });
                      const diagData = await diagRes.json();
                      setDiagnosticoEmpresasData(diagData);
                    } catch (err: any) {
                      toast({
                        title: "Error",
                        description: err.message || "No se pudo corregir las empresas",
                        variant: "destructive",
                      });
                    } finally {
                      setCorrigiendoEmpresas(false);
                    }
                  }}
                >
                  {corrigiendoEmpresas ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Corrigiendo...
                    </>
                  ) : (
                    <>
                      <Wrench className="h-4 w-4 mr-2" />
                      Corregir Todas
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
