import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Bot, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { Company, Worker } from "@shared/schema";
import { inspeccionesSstPredefinidas, getInspeccionByCodigo, categoriaInspeccionLabels, InspeccionPredefinida } from "@/data/inspecciones-sst-predefinidas";
import { cn } from "@/lib/utils";

interface InspectionFormData {
  companyId: string;
  area: string;
  inspector: string;
  date: string;
  findings: number | string;
  compliance: number | string;
  observations: string;
  status: "pendiente" | "completada" | "requiere_accion";
}

interface VerificationItem {
  id: number;
  text: string;
  conforme: boolean | null;
}

interface InspectionFormEnhancedProps {
  formData: InspectionFormData;
  setFormData: (data: InspectionFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  isSuperadmin: boolean;
  companies: Company[];
  workers: Worker[];
  onCancel: () => void;
}

export function InspectionFormEnhanced({
  formData,
  setFormData,
  onSubmit,
  isPending,
  isSuperadmin,
  companies,
  workers,
  onCancel,
}: InspectionFormEnhancedProps) {
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const initialTemplate = useMemo(() => {
    if (formData.area) {
      const match = inspeccionesSstPredefinidas.find(i => i.area === formData.area);
      return match?.codigo || "";
    }
    return "";
  }, [formData.area]);

  const [selectedPredefInspeccion, setSelectedPredefInspeccion] = useState<string>(initialTemplate);
  const [currentInspeccion, setCurrentInspeccion] = useState<InspeccionPredefinida | null>(
    initialTemplate ? getInspeccionByCodigo(initialTemplate) || null : null
  );
  const [verificationItems, setVerificationItems] = useState<VerificationItem[]>([]);
  const [showItemsList, setShowItemsList] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (initialTemplate && !hasInitialized) {
      setSelectedPredefInspeccion(initialTemplate);
      const inspeccion = getInspeccionByCodigo(initialTemplate);
      if (inspeccion) {
        setCurrentInspeccion(inspeccion);
      }
      setHasInitialized(true);
    }
  }, [initialTemplate, hasInitialized]);

  useEffect(() => {
    if (!formData.area && !formData.inspector && !formData.date) {
      setSelectedPredefInspeccion("");
      setCurrentInspeccion(null);
      setVerificationItems([]);
      setShowItemsList(false);
      setHasInitialized(false);
    }
  }, [formData.area, formData.inspector, formData.date]);

  const handleAutoFillFromPredefinido = (codigo: string) => {
    const inspeccion = getInspeccionByCodigo(codigo);
    if (!inspeccion) {
      setCurrentInspeccion(null);
      setVerificationItems([]);
      setShowItemsList(false);
      return;
    }

    setCurrentInspeccion(inspeccion);
    setShowItemsList(true);

    const items: VerificationItem[] = inspeccion.itemsVerificacion.map((text, idx) => ({
      id: idx,
      text,
      conforme: null,
    }));
    setVerificationItems(items);

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const currentFormData = formDataRef.current;
    setFormData({
      ...currentFormData,
      area: inspeccion.area,
      observations: inspeccion.descripcion,
      findings: 0,
      compliance: 100,
      date: currentFormData.date || today,
    });
  };

  const handleItemChange = (itemId: number, conforme: boolean) => {
    setVerificationItems(prev => {
      const updated = prev.map(item => 
        item.id === itemId ? { ...item, conforme } : item
      );
      return updated;
    });
  };

  useEffect(() => {
    if (verificationItems.length === 0) return;

    const evaluatedItems = verificationItems.filter(item => item.conforme !== null);
    const nonConformItems = verificationItems.filter(item => item.conforme === false);
    const conformItems = verificationItems.filter(item => item.conforme === true);
    const totalItems = verificationItems.length;

    const findingsCount = nonConformItems.length;
    
    let compliancePercentage = 100;
    if (evaluatedItems.length > 0) {
      compliancePercentage = Math.round((conformItems.length / totalItems) * 100);
    }

    setFormData({
      ...formDataRef.current,
      findings: findingsCount,
      compliance: compliancePercentage,
    });
  }, [verificationItems]);

  const stats = useMemo(() => {
    const total = verificationItems.length;
    const evaluated = verificationItems.filter(i => i.conforme !== null).length;
    const conforme = verificationItems.filter(i => i.conforme === true).length;
    const noConforme = verificationItems.filter(i => i.conforme === false).length;
    const pending = verificationItems.filter(i => i.conforme === null).length;
    return { total, evaluated, conforme, noConforme, pending };
  }, [verificationItems]);

  const complianceColor = useMemo(() => {
    const compliance = Number(formData.compliance) || 0;
    if (compliance >= 90) return "text-green-600 dark:text-green-400";
    if (compliance >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  }, [formData.compliance]);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
        <div className="flex items-start gap-3">
          <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Asistente Inteligente</p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Seleccione una inspección predefinida. El sistema calculará automáticamente los hallazgos y cumplimiento según la norma.
              </p>
            </div>
            <div className="flex gap-2">
              <Select 
                value={selectedPredefInspeccion} 
                onValueChange={(value) => {
                  setSelectedPredefInspeccion(value);
                  handleAutoFillFromPredefinido(value);
                }}
              >
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

      {currentInspeccion && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <div className="flex items-center gap-2 text-sm">
            <Info className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-amber-800 dark:text-amber-200">
              Base Legal: {currentInspeccion.normativa || 'Decreto 1072/2015'}
            </span>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
            Frecuencia recomendada: {currentInspeccion.frecuencia} | 
            Criticidad: <span className={cn(
              currentInspeccion.criticidad === 'alta' && 'text-red-600 font-semibold',
              currentInspeccion.criticidad === 'media' && 'text-yellow-600 font-semibold',
              currentInspeccion.criticidad === 'baja' && 'text-green-600 font-semibold'
            )}>{currentInspeccion.criticidad.toUpperCase()}</span>
          </p>
        </div>
      )}

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
          <Label htmlFor="status">Estado</Label>
          <Select
            value={formData.status}
            onValueChange={(value: "pendiente" | "completada" | "requiere_accion") => 
              setFormData({ ...formData, status: value })
            }
          >
            <SelectTrigger id="status" data-testid="select-status">
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="completada">Completada</SelectItem>
              <SelectItem value="requiere_accion">Requiere Acción</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {showItemsList && verificationItems.length > 0 && (
        <div className="border rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-medium text-sm">Ítems de Verificación ({stats.total})</h4>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="text-green-600 border-green-300">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {stats.conforme} Conforme
              </Badge>
              <Badge variant="outline" className="text-red-600 border-red-300">
                <XCircle className="h-3 w-3 mr-1" />
                {stats.noConforme} No Conforme
              </Badge>
              <Badge variant="outline" className="text-gray-500 border-gray-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {stats.pending} Sin evaluar
              </Badge>
            </div>
          </div>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-md px-3 py-2 text-xs text-muted-foreground flex items-center gap-4">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              <strong>C</strong> = Conforme (cumple el requisito) | <strong>NC</strong> = No Conforme (hallazgo/incumplimiento)
            </span>
          </div>
          
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {verificationItems.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "flex items-start gap-3 p-2 rounded-md border transition-colors",
                  item.conforme === true && "bg-green-50 dark:bg-green-950/20 border-green-200",
                  item.conforme === false && "bg-red-50 dark:bg-red-950/20 border-red-200",
                  item.conforme === null && "bg-gray-50 dark:bg-gray-900 border-gray-200"
                )}
              >
                <span className="text-sm flex-1">{item.text}</span>
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant={item.conforme === true ? "default" : "outline"}
                    className={cn(
                      "h-7 px-2",
                      item.conforme === true && "bg-green-600 hover:bg-green-700"
                    )}
                    onClick={() => handleItemChange(item.id, true)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                    C
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={item.conforme === false ? "default" : "outline"}
                    className={cn(
                      "h-7 px-2",
                      item.conforme === false && "bg-red-600 hover:bg-red-700"
                    )}
                    onClick={() => handleItemChange(item.id, false)}
                  >
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    NC
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="findings">Número de Hallazgos (No Conformes)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="findings"
              type="number"
              min="0"
              value={formData.findings}
              onChange={(e) => setFormData({ ...formData, findings: e.target.value === '' ? '' : e.target.value })}
              required
              data-testid="input-findings"
              readOnly={showItemsList && verificationItems.length > 0}
              className={showItemsList ? "bg-gray-100 dark:bg-gray-800" : ""}
            />
            {showItemsList && (
              <Badge variant="secondary" className="shrink-0">
                Auto
              </Badge>
            )}
          </div>
          {showItemsList && (
            <p className="text-xs text-muted-foreground">
              Calculado automáticamente según ítems no conformes
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="compliance">Cumplimiento (%)</Label>
          <div className="flex items-center gap-2">
            <Input
              id="compliance"
              type="number"
              min="0"
              max="100"
              value={formData.compliance}
              onChange={(e) => setFormData({ ...formData, compliance: e.target.value === '' ? '' : e.target.value })}
              required
              data-testid="input-compliance"
              readOnly={showItemsList && verificationItems.length > 0}
              className={cn(
                showItemsList ? "bg-gray-100 dark:bg-gray-800" : "",
                complianceColor,
                "font-bold text-lg"
              )}
            />
            {showItemsList && (
              <Badge variant="secondary" className="shrink-0">
                Auto
              </Badge>
            )}
          </div>
          {showItemsList && (
            <p className="text-xs text-muted-foreground">
              Fórmula: (Conformes / Total) × 100 = ({stats.conforme} / {stats.total}) × 100
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observaciones (opcional)</Label>
        <Textarea
          id="observations"
          value={formData.observations}
          onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
          placeholder="Detalle observaciones adicionales..."
          rows={3}
          data-testid="input-observations"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={isPending || (showItemsList && stats.pending > 0)}
          data-testid="button-submit-inspection"
        >
          {isPending ? "Guardando..." : "Guardar Inspección"}
        </Button>
      </div>

      {showItemsList && stats.pending > 0 && (
        <p className="text-xs text-amber-600 text-center">
          Debe evaluar todos los ítems antes de guardar ({stats.pending} pendientes)
        </p>
      )}
    </form>
  );
}
