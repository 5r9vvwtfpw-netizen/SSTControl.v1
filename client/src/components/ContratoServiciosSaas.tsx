import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Scale, CheckCircle2 } from "lucide-react";
import { ColombianFlag } from "./ColombianFlag";
import { ContratoSaaSContent } from "@/pages/ContratoSaaS";
import { SAAS_CONTRACT_VERSION } from "@shared/saas-contract";

export interface ContractAcceptanceData {
  acceptedTerms: boolean;
  acceptedDataTreatment: boolean;
  acceptedAt: string;
  planName: string;
}

interface ContratoServiciosSaasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (data: ContractAcceptanceData) => void;
  planName: string;
  companyName?: string;
  isLoading?: boolean;
}

export function ContratoServiciosSaas({
  open,
  onOpenChange,
  onAccept,
  planName,
  companyName,
  isLoading = false,
}: ContratoServiciosSaasProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedDataTreatment, setAcceptedDataTreatment] = useState(false);
  const canAccept = acceptedTerms && acceptedDataTreatment;

  const handleAccept = () => {
    if (!canAccept) return;
    onAccept({
      acceptedTerms,
      acceptedDataTreatment,
      acceptedAt: new Date().toISOString(),
      planName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" data-testid="dialog-contrato-saas">
        <DialogHeader className="shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl" data-testid="text-contrato-titulo">
                Contrato de Prestación de Servicios SaaS
              </DialogTitle>
              <DialogDescription>
                Lee y acepta el mismo contrato publicado en Documentos Legales.
              </DialogDescription>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <ColombianFlag width={16} height={12} showBorder={false} />
              Colombia
            </Badge>
            <Badge variant="secondary">{companyName || planName}</Badge>
            <Badge variant="outline">Versión {SAAS_CONTRACT_VERSION}</Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0 pr-4" data-testid="scroll-contrato">
          <div className="py-4">
            <ContratoSaaSContent />
          </div>
        </ScrollArea>

        <div className="shrink-0 space-y-4 pt-4 border-t">
          <div className="space-y-3 bg-muted/30 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                data-testid="checkbox-accept-terms"
              />
              <Label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed">
                He leído y acepto el contrato de prestación de servicios SaaS, versión {SAAS_CONTRACT_VERSION}.
              </Label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="data"
                checked={acceptedDataTreatment}
                onCheckedChange={(checked) => setAcceptedDataTreatment(checked === true)}
                data-testid="checkbox-accept-data"
              />
              <Label htmlFor="data" className="text-sm cursor-pointer leading-relaxed">
                Declaro que la empresa cuenta con las autorizaciones necesarias para tratar los datos personales
                que ingrese a la plataforma, de acuerdo con el contrato y la política de privacidad.
              </Label>
            </div>
          </div>

          {!canAccept && (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Debes confirmar ambas declaraciones para continuar.</span>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel-contrato">
              Cancelar
            </Button>
            <Button onClick={handleAccept} disabled={!canAccept || isLoading} data-testid="button-accept-contrato">
              {isLoading ? "Procesando..." : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aceptar contrato y continuar
                </>
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ContratoServiciosSaas;