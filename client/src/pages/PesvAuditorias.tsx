import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Search, Eye, Trash2, ArrowLeft, FileDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { PesvAudit, insertPesvAuditSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { hasCompanyAdminAccess } from "@shared/permissions";
import { BackToPesvEvaluationButton } from "@/components/BackToPesvEvaluationButton";
import { Link } from "wouter";
import { TrazabilidadPesvBanner } from "@/components/pesv/TrazabilidadPesvBanner";

type AuditFormData = {
  auditDate: string;
  auditor: string;
  auditorEntity: string;
  scope: string;
  step1Leader: number;
  step2Committee: number;
  step3Policy: number;
  step4Leadership: number;
  step5Diagnosis: number;
  step6RiskAssessment: number;
  step7Objectives: number;
  step8CriticalRisks: number;
  step9AnnualPlan: number;
  step10Training: number;
  step11Fatigue: number;
  step12Emergency: number;
  step13Investigation: number;
  step14SafeRoads: number;
  step15DriverSelection: number;
  step16VehicleInspection: number;
  step17Maintenance: number;
  step18ChangeManagement: number;
  step19Procurement: number;
  step20Indicators: number;
  step21Supervision: number;
  step22Audit: number;
  step23Improvement: number;
  step24Communication: number;
  policyCompliance: number;
  planningCompliance: number;
  implementationCompliance: number;
  verificationCompliance: number;
  improvementCompliance: number;
  totalScore: number;
  compliancePercentage: number;
  result: "cumple" | "cumple-parcialmente" | "no-cumple";
  findings: string;
  recommendations: string;
  actionPlan: string;
  status: "programada" | "en-curso" | "completada";
};

const initialFormData: AuditFormData = {
  auditDate: "",
  auditor: "",
  auditorEntity: "",
  scope: "",
  step1Leader: 0,
  step2Committee: 0,
  step3Policy: 0,
  step4Leadership: 0,
  step5Diagnosis: 0,
  step6RiskAssessment: 0,
  step7Objectives: 0,
  step8CriticalRisks: 0,
  step9AnnualPlan: 0,
  step10Training: 0,
  step11Fatigue: 0,
  step12Emergency: 0,
  step13Investigation: 0,
  step14SafeRoads: 0,
  step15DriverSelection: 0,
  step16VehicleInspection: 0,
  step17Maintenance: 0,
  step18ChangeManagement: 0,
  step19Procurement: 0,
  step20Indicators: 0,
  step21Supervision: 0,
  step22Audit: 0,
  step23Improvement: 0,
  step24Communication: 0,
  policyCompliance: 0,
  planningCompliance: 0,
  implementationCompliance: 0,
  verificationCompliance: 0,
  improvementCompliance: 0,
  totalScore: 0,
  compliancePercentage: 0,
  result: "cumple",
  findings: "",
  recommendations: "",
  actionPlan: "",
  status: "programada",
};

export default function PesvAuditorias() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<PesvAudit | null>(null);
  const [formData, setFormData] = useState<AuditFormData>(initialFormData);

  const { data: audits = [], isLoading: auditsLoading } = useQuery<PesvAudit[]>({
    queryKey: ["/api/pesv-audits"],
  });

  // Auto-calculate aggregate scores from 24 individual steps
  useEffect(() => {
    const planear = [
      formData.step1Leader,
      formData.step2Committee,
      formData.step3Policy,
      formData.step4Leadership,
      formData.step5Diagnosis,
      formData.step6RiskAssessment,
      formData.step7Objectives,
      formData.step8CriticalRisks,
    ];
    
    const hacer = [
      formData.step9AnnualPlan,
      formData.step10Training,
      formData.step11Fatigue,
      formData.step12Emergency,
      formData.step13Investigation,
      formData.step14SafeRoads,
      formData.step15DriverSelection,
      formData.step16VehicleInspection,
      formData.step17Maintenance,
      formData.step18ChangeManagement,
      formData.step19Procurement,
    ];
    
    const verificar = [
      formData.step20Indicators,
      formData.step21Supervision,
      formData.step22Audit,
    ];
    
    const actuar = [
      formData.step23Improvement,
      formData.step24Communication,
    ];

    const avgPlanear = Math.round(planear.reduce((a, b) => a + b, 0) / planear.length);
    const avgHacer = Math.round(hacer.reduce((a, b) => a + b, 0) / hacer.length);
    const avgVerificar = Math.round(verificar.reduce((a, b) => a + b, 0) / verificar.length);
    const avgActuar = Math.round(actuar.reduce((a, b) => a + b, 0) / actuar.length);

    const allSteps = [...planear, ...hacer, ...verificar, ...actuar];
    const total = allSteps.reduce((a, b) => a + b, 0);
    const avgAll = Math.round(total / allSteps.length);

    setFormData(prev => ({
      ...prev,
      policyCompliance: avgPlanear,
      planningCompliance: avgPlanear, // Same as policy for consistency
      implementationCompliance: avgHacer,
      verificationCompliance: avgVerificar,
      improvementCompliance: avgActuar,
      totalScore: total,
      compliancePercentage: avgAll,
    }));
  }, [
    formData.step1Leader, formData.step2Committee, formData.step3Policy, formData.step4Leadership,
    formData.step5Diagnosis, formData.step6RiskAssessment, formData.step7Objectives, formData.step8CriticalRisks,
    formData.step9AnnualPlan, formData.step10Training, formData.step11Fatigue, formData.step12Emergency,
    formData.step13Investigation, formData.step14SafeRoads, formData.step15DriverSelection,
    formData.step16VehicleInspection, formData.step17Maintenance, formData.step18ChangeManagement,
    formData.step19Procurement, formData.step20Indicators, formData.step21Supervision, formData.step22Audit,
    formData.step23Improvement, formData.step24Communication,
  ]);

  const createAuditMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertPesvAuditSchema>) => {
      const res = await apiRequest("POST", "/api/pesv-audits", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv-audits"] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: "Auditoría creada",
        description: "La auditoría PESV se ha registrado exitosamente",
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

  const deleteAuditMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/pesv-audits/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/pesv-audits"] });
      toast({
        title: "Auditoría eliminada",
        description: "La auditoría se ha eliminado exitosamente",
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
    const data = {
      ...formData,
      auditorEntity: formData.auditorEntity || undefined,
      findings: formData.findings || undefined,
      recommendations: formData.recommendations || undefined,
      actionPlan: formData.actionPlan || undefined,
    };
    createAuditMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta auditoría?")) {
      deleteAuditMutation.mutate(id);
    }
  };

  const handleViewDetail = (audit: PesvAudit) => {
    setSelectedAudit(audit);
    setDetailDialogOpen(true);
  };

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const updateStep = (step: keyof AuditFormData, value: number) => {
    setFormData(prev => ({ ...prev, [step]: value }));
  };

  const getResultLabel = (result: string) => {
    const labels: Record<string, string> = {
      cumple: "Cumple",
      "cumple-parcialmente": "Cumple Parcialmente",
      "no-cumple": "No Cumple",
    };
    return labels[result] || result;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      programada: "Programada",
      "en-curso": "En Curso",
      completada: "Completada",
    };
    return labels[status] || status;
  };

  const filteredAudits = audits.filter((audit) => {
    const searchLower = searchTerm.toLowerCase();
    return audit.auditor.toLowerCase().includes(searchLower);
  });

  const StepInput = ({ step, label, value }: { step: keyof AuditFormData; label: string; value: number }) => (
    <div className="space-y-2">
      <Label htmlFor={step} className="text-sm">{label}</Label>
      <Input
        id={step}
        type="number"
        min="0"
        max="100"
        value={value === 0 ? '' : value}
        onChange={(e) => updateStep(step, e.target.value === '' ? '' as any : parseInt(e.target.value, 10))}
        onBlur={(e) => { if (e.target.value === '') updateStep(step, 0); }}
        required
        className="h-9"
        data-testid={`input-${step}`}
      />
    </div>
  );

  const handleDownloadPdf = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link href="/pesv">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Plan Estratégico de Seguridad Vial
          </Button>
        </Link>
        <BackToPesvEvaluationButton />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Auditorías PESV</h1>
          <p className="text-muted-foreground">
            Auditorías anuales obligatorias según Resolución 40595/2022 - Evaluación 24 pasos PHVA
          </p>
        </div>
      </div>
      
      <TrazabilidadPesvBanner codigoPaso="V01" compacto />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        {user?.role && hasCompanyAdminAccess(user.role) && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-audit">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Auditoría
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Registrar Auditoría PESV - 24 Pasos</DialogTitle>
                <DialogDescription>Complete la evaluación de los 24 pasos del ciclo PHVA según Resolución 40595/2022</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auditDate">Fecha de Auditoría *</Label>
                    <Input
                      id="auditDate"
                      type="date"
                      value={formData.auditDate}
                      onChange={(e) => setFormData({ ...formData, auditDate: e.target.value })}
                      required
                      data-testid="input-audit-date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditor">Auditor *</Label>
                    <Input
                      id="auditor"
                      value={formData.auditor}
                      onChange={(e) => setFormData({ ...formData, auditor: e.target.value })}
                      required
                      placeholder="Nombre del auditor"
                      data-testid="input-auditor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auditorEntity">Entidad Auditora</Label>
                    <Input
                      id="auditorEntity"
                      value={formData.auditorEntity}
                      onChange={(e) => setFormData({ ...formData, auditorEntity: e.target.value })}
                      placeholder="Nombre de la entidad"
                      data-testid="input-auditor-entity"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger id="status" data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="programada">Programada</SelectItem>
                        <SelectItem value="en-curso">En Curso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="scope">Alcance de la Auditoría *</Label>
                    <Textarea
                      id="scope"
                      value={formData.scope}
                      onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                      required
                      placeholder="Descripción del alcance de la auditoría"
                      data-testid="input-scope"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Evaluación 24 Pasos - Resolución 40595/2022</h3>
                    <p className="text-xs text-muted-foreground">Calificación 0-100 para cada paso</p>
                  </div>

                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="planear">
                      <AccordionTrigger className="text-sm font-semibold">
                        1. PLANEAR (8 pasos) - Promedio: {formData.policyCompliance}%
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <StepInput step="step1Leader" label="Paso 1: Líder del PESV" value={formData.step1Leader} />
                          <StepInput step="step2Committee" label="Paso 2: Comité de Seguridad Vial" value={formData.step2Committee} />
                          <StepInput step="step3Policy" label="Paso 3: Política de Seguridad Vial" value={formData.step3Policy} />
                          <StepInput step="step4Leadership" label="Paso 4: Liderazgo y compromiso" value={formData.step4Leadership} />
                          <StepInput step="step5Diagnosis" label="Paso 5: Diagnóstico" value={formData.step5Diagnosis} />
                          <StepInput step="step6RiskAssessment" label="Paso 6: Caracterización de riesgos" value={formData.step6RiskAssessment} />
                          <StepInput step="step7Objectives" label="Paso 7: Objetivos y metas" value={formData.step7Objectives} />
                          <StepInput step="step8CriticalRisks" label="Paso 8: Programa riesgos críticos" value={formData.step8CriticalRisks} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="hacer">
                      <AccordionTrigger className="text-sm font-semibold">
                        2. HACER (11 pasos) - Promedio: {formData.implementationCompliance}%
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <StepInput step="step9AnnualPlan" label="Paso 9: Plan anual de trabajo" value={formData.step9AnnualPlan} />
                          <StepInput step="step10Training" label="Paso 10: Competencia y formación" value={formData.step10Training} />
                          <StepInput step="step11Fatigue" label="Paso 11: Fatiga y somnolencia" value={formData.step11Fatigue} />
                          <StepInput step="step12Emergency" label="Paso 12: Preparación emergencias" value={formData.step12Emergency} />
                          <StepInput step="step13Investigation" label="Paso 13: Investigación siniestros" value={formData.step13Investigation} />
                          <StepInput step="step14SafeRoads" label="Paso 14: Vías seguras" value={formData.step14SafeRoads} />
                          <StepInput step="step15DriverSelection" label="Paso 15: Selección conductores" value={formData.step15DriverSelection} />
                          <StepInput step="step16VehicleInspection" label="Paso 16: Inspección vehículos" value={formData.step16VehicleInspection} />
                          <StepInput step="step17Maintenance" label="Paso 17: Mantenimiento" value={formData.step17Maintenance} />
                          <StepInput step="step18ChangeManagement" label="Paso 18: Gestión del cambio" value={formData.step18ChangeManagement} />
                          <StepInput step="step19Procurement" label="Paso 19: Adquisición bienes" value={formData.step19Procurement} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="verificar">
                      <AccordionTrigger className="text-sm font-semibold">
                        3. VERIFICAR (3 pasos) - Promedio: {formData.verificationCompliance}%
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <StepInput step="step20Indicators" label="Paso 20: Indicadores mínimos" value={formData.step20Indicators} />
                          <StepInput step="step21Supervision" label="Paso 21: Supervisión del PESV" value={formData.step21Supervision} />
                          <StepInput step="step22Audit" label="Paso 22: Auditoría anual (obligatoria)" value={formData.step22Audit} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="actuar">
                      <AccordionTrigger className="text-sm font-semibold">
                        4. ACTUAR (2 pasos) - Promedio: {formData.improvementCompliance}%
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                          <StepInput step="step23Improvement" label="Paso 23: Mejora continua" value={formData.step23Improvement} />
                          <StepInput step="step24Communication" label="Paso 24: Comunicación y participación" value={formData.step24Communication} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  
                  <div className="p-4 border rounded-lg bg-muted">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-semibold">Score Total (24 pasos):</p>
                        <p className="text-2xl font-bold" data-testid="text-total-score">{formData.totalScore}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Cumplimiento Promedio:</p>
                        <p className="text-2xl font-bold" data-testid="text-compliance-percentage">{formData.compliancePercentage}%</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Máximo Posible:</p>
                        <p className="text-2xl font-bold">2400</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="result">Resultado de la Auditoría *</Label>
                    <Select
                      value={formData.result}
                      onValueChange={(value: any) => setFormData({ ...formData, result: value })}
                    >
                      <SelectTrigger id="result" data-testid="select-result">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cumple">Cumple</SelectItem>
                        <SelectItem value="cumple-parcialmente">Cumple Parcialmente</SelectItem>
                        <SelectItem value="no-cumple">No Cumple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings">Hallazgos</Label>
                    <Textarea
                      id="findings"
                      value={formData.findings}
                      onChange={(e) => setFormData({ ...formData, findings: e.target.value })}
                      placeholder="No conformidades y observaciones encontradas"
                      data-testid="input-findings"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="recommendations">Recomendaciones</Label>
                    <Textarea
                      id="recommendations"
                      value={formData.recommendations}
                      onChange={(e) => setFormData({ ...formData, recommendations: e.target.value })}
                      placeholder="Recomendaciones para mejora"
                      data-testid="input-recommendations"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actionPlan">Plan de Acción</Label>
                    <Textarea
                      id="actionPlan"
                      value={formData.actionPlan}
                      onChange={(e) => setFormData({ ...formData, actionPlan: e.target.value })}
                      placeholder="Plan de acción para abordar hallazgos"
                      data-testid="input-action-plan"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createAuditMutation.isPending} 
                    data-testid="button-submit-audit"
                  >
                    {createAuditMutation.isPending ? "Guardando..." : "Guardar Auditoría"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por auditor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead data-testid="header-date">Fecha</TableHead>
              <TableHead data-testid="header-auditor">Auditor</TableHead>
              <TableHead data-testid="header-result">Resultado</TableHead>
              <TableHead data-testid="header-compliance">Cumplimiento %</TableHead>
              <TableHead data-testid="header-status">Estado</TableHead>
              <TableHead data-testid="header-actions">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditsLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-loading">
                  Cargando auditorías...
                </TableCell>
              </TableRow>
            ) : filteredAudits.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center" data-testid="text-no-audits">
                  No se encontraron auditorías
                </TableCell>
              </TableRow>
            ) : (
              filteredAudits.map((audit) => (
                <TableRow key={audit.id} data-testid={`row-audit-${audit.id}`}>
                  <TableCell data-testid={`text-date-${audit.id}`}>
                    {new Date(audit.auditDate).toLocaleDateString("es-CO")}
                  </TableCell>
                  <TableCell data-testid={`text-auditor-${audit.id}`}>{audit.auditor}</TableCell>
                  <TableCell data-testid={`text-result-${audit.id}`}>{getResultLabel(audit.result)}</TableCell>
                  <TableCell data-testid={`text-compliance-${audit.id}`}>{audit.compliancePercentage}%</TableCell>
                  <TableCell data-testid={`text-status-${audit.id}`}>{getStatusLabel(audit.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(audit)}
                        data-testid={`button-view-${audit.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDownloadPdf(`/api/auditorias-pesv/${audit.id}/pdf`, `auditoria-pesv-${audit.codigo || audit.id}.pdf`)}
                        data-testid={`button-download-auditoria-pdf-${audit.id}`}
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                      {user?.role && hasCompanyAdminAccess(user.role) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(audit.id)}
                          disabled={deleteAuditMutation.isPending}
                          data-testid={`button-delete-${audit.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de Auditoría PESV - 24 Pasos</DialogTitle>
            <DialogDescription>
              Fecha: {selectedAudit && new Date(selectedAudit.auditDate).toLocaleDateString("es-CO")}
            </DialogDescription>
          </DialogHeader>
          {selectedAudit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">Auditor:</p>
                  <p>{selectedAudit.auditor}</p>
                </div>
                {selectedAudit.auditorEntity && (
                  <div>
                    <p className="font-semibold">Entidad Auditora:</p>
                    <p>{selectedAudit.auditorEntity}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold">Estado:</p>
                  <p>{getStatusLabel(selectedAudit.status)}</p>
                </div>
                <div>
                  <p className="font-semibold">Resultado:</p>
                  <p>{getResultLabel(selectedAudit.result)}</p>
                </div>
              </div>
              <div>
                <p className="font-semibold">Alcance:</p>
                <p className="text-sm">{selectedAudit.scope}</p>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold">Score Total:</p>
                    <p className="text-2xl font-bold">{selectedAudit.totalScore} / 2400</p>
                  </div>
                  <div>
                    <p className="font-semibold">Cumplimiento:</p>
                    <p className="text-2xl font-bold">{selectedAudit.compliancePercentage}%</p>
                  </div>
                  <div>
                    <p className="font-semibold">Pasos Evaluados:</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-semibold">Evaluación Detallada por Paso:</p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="planear-detail">
                    <AccordionTrigger className="text-sm">
                      PLANEAR (8 pasos) - Promedio: {selectedAudit.policyCompliance}%
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>1. Líder del PESV: {selectedAudit.step1Leader}%</p>
                        <p>2. Comité SV: {selectedAudit.step2Committee}%</p>
                        <p>3. Política SV: {selectedAudit.step3Policy}%</p>
                        <p>4. Liderazgo: {selectedAudit.step4Leadership}%</p>
                        <p>5. Diagnóstico: {selectedAudit.step5Diagnosis}%</p>
                        <p>6. Riesgos: {selectedAudit.step6RiskAssessment}%</p>
                        <p>7. Objetivos: {selectedAudit.step7Objectives}%</p>
                        <p>8. Riesgos críticos: {selectedAudit.step8CriticalRisks}%</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="hacer-detail">
                    <AccordionTrigger className="text-sm">
                      HACER (11 pasos) - Promedio: {selectedAudit.implementationCompliance}%
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>9. Plan anual: {selectedAudit.step9AnnualPlan}%</p>
                        <p>10. Formación: {selectedAudit.step10Training}%</p>
                        <p>11. Fatiga: {selectedAudit.step11Fatigue}%</p>
                        <p>12. Emergencias: {selectedAudit.step12Emergency}%</p>
                        <p>13. Investigación: {selectedAudit.step13Investigation}%</p>
                        <p>14. Vías seguras: {selectedAudit.step14SafeRoads}%</p>
                        <p>15. Selección: {selectedAudit.step15DriverSelection}%</p>
                        <p>16. Inspección: {selectedAudit.step16VehicleInspection}%</p>
                        <p>17. Mantenimiento: {selectedAudit.step17Maintenance}%</p>
                        <p>18. Cambio: {selectedAudit.step18ChangeManagement}%</p>
                        <p>19. Adquisición: {selectedAudit.step19Procurement}%</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="verificar-detail">
                    <AccordionTrigger className="text-sm">
                      VERIFICAR (3 pasos) - Promedio: {selectedAudit.verificationCompliance}%
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>20. Indicadores: {selectedAudit.step20Indicators}%</p>
                        <p>21. Supervisión: {selectedAudit.step21Supervision}%</p>
                        <p>22. Auditoría: {selectedAudit.step22Audit}%</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="actuar-detail">
                    <AccordionTrigger className="text-sm">
                      ACTUAR (2 pasos) - Promedio: {selectedAudit.improvementCompliance}%
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p>23. Mejora continua: {selectedAudit.step23Improvement}%</p>
                        <p>24. Comunicación: {selectedAudit.step24Communication}%</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {selectedAudit.findings && (
                <div>
                  <p className="font-semibold">Hallazgos:</p>
                  <p className="text-sm">{selectedAudit.findings}</p>
                </div>
              )}
              {selectedAudit.recommendations && (
                <div>
                  <p className="font-semibold">Recomendaciones:</p>
                  <p className="text-sm">{selectedAudit.recommendations}</p>
                </div>
              )}
              {selectedAudit.actionPlan && (
                <div>
                  <p className="font-semibold">Plan de Acción:</p>
                  <p className="text-sm">{selectedAudit.actionPlan}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
