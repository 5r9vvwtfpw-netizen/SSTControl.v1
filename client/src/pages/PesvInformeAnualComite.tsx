import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText, TriangleAlert } from "lucide-react";
import { Link } from "wouter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCompanyContext } from "@/hooks/use-company-context";
import { openCompanyDocument } from "@/lib/company-context-url";
import { formatDateCO } from "@/lib/utils/formatters";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ActoAdministrativoPesv, ComiteIntegrantePesv, PesvInformeAnualEvidencia } from "@shared/schema";

type AnnualEvidenceState = {
  companyName: string;
  companyNit: string | null;
  evidence: PesvInformeAnualEvidencia | null;
};

export default function PesvInformeAnualComite() {
  const { selectedCompany } = useCompanyContext();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);
  const { data: acts = [], isLoading: actsLoading, isError: actsError } = useQuery<ActoAdministrativoPesv[]>({
    queryKey: ["/api/pesv/comite/actos-administrativos"],
  });
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useQuery<ComiteIntegrantePesv[]>({
    queryKey: ["/api/pesv/comite/integrantes"],
  });
  const { data: evidenceState, isLoading: evidenceLoading } = useQuery<AnnualEvidenceState>({
    queryKey: ["/api/pesv/informes-anuales/comite-seguridad-vial/evidencia"],
  });

  const currentAct = useMemo(
    () => acts.filter((act) => act.estado === "vigente").sort((a, b) => b.fechaExpedicion.localeCompare(a.fechaExpedicion))[0],
    [acts],
  );
  const activeMembers = members.filter((member) => member.estado === "activo");
  const evidence = evidenceState?.evidence;
  const loading = actsLoading || membersLoading || evidenceLoading;
  const hasError = actsError || membersError;
  const uploadEvidence = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploadingFile(true);
    try {
      const response = await fetch("/api/pesv/informes-anuales/comite-seguridad-vial/evidencia", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "No fue posible guardar el PDF.");
      }
      await queryClient.invalidateQueries({ queryKey: ["/api/pesv/informes-anuales/comite-seguridad-vial/evidencia"] });
      toast({ title: "Evidencia guardada", description: "El PDF quedó asociado a este punto del informe anual." });
    } catch (error) {
      toast({ title: "No se pudo guardar la evidencia", description: error instanceof Error ? error.message : "Error inesperado.", variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6" data-testid="annual-pesv-committee-report">
      <Button variant="ghost" asChild>
        <Link href="/pesv/informes-anuales"><ArrowLeft className="mr-2 h-4 w-4" />Volver a informes anuales</Link>
      </Button>
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">PESV · Informe anual SISI/PESV</p>
        <h1 className="text-2xl font-bold md:text-3xl">Existencia del Comité de Seguridad Vial</h1>
        <p className="max-w-3xl text-muted-foreground">
          Revisa la conformación registrada en el PESV y consulta la evidencia exacta que solicita el informe: copia del acta del máximo órgano social en PDF.
        </p>
      </header>

      {hasError ? (
        <Alert variant="destructive">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>No se pudieron consultar los registros</AlertTitle>
          <AlertDescription>Vuelve a intentarlo o abre el módulo de conformación del equipo PESV.</AlertDescription>
        </Alert>
      ) : loading ? (
        <Card><CardContent className="p-6 text-muted-foreground">Consultando los registros del comité…</CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle>{evidenceState?.companyName || selectedCompany?.name || "Empresa"}</CardTitle>
                  <CardDescription>
                    {evidenceState?.companyNit ? `NIT ${evidenceState.companyNit} · ` : ""}
                    Información de conformación tomada de P01; la evidencia se conserva en este informe anual.
                  </CardDescription>
                </div>
                {currentAct && activeMembers.length > 0
                  ? <Badge>Conformación registrada</Badge>
                  : <Badge variant="secondary">Registro incompleto</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Integrantes activos registrados</p>
                  <p className="text-2xl font-semibold">{activeMembers.length}</p>
                </div>
                <div className="rounded-md border p-4">
                  <p className="text-sm text-muted-foreground">Acto administrativo vigente</p>
                  <p className="font-semibold">{currentAct ? `${currentAct.tipoDocumento} No. ${currentAct.numeroDocumento}` : "No registrado"}</p>
                  {currentAct && <p className="text-sm text-muted-foreground">Expedido el {formatDateCO(currentAct.fechaExpedicion)}</p>}
                </div>
              </div>

              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Documento solicitado por el informe</AlertTitle>
                <AlertDescription>
                  La evidencia debe ser el acta original del máximo órgano social de la empresa. El acto administrativo PESV generado por el sistema y las actas de reuniones del comité no reemplazan ese documento.
                  El PDF original se conserva sin cambios; los documentos que genera el sistema siguen la estandarización institucional.
                </AlertDescription>
              </Alert>

              {evidence?.fileUrl ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-green-600/30 bg-green-50/50 p-4">
                  <div>
                    <p className="font-medium">Evidencia adjunta a este punto anual</p>
                    <p className="text-sm text-muted-foreground">{evidence.fileName}</p>
                  </div>
                  <Button onClick={() => openCompanyDocument(evidence.fileUrl)}>
                    <FileText className="mr-2 h-4 w-4" />Abrir PDF
                  </Button>
                </div>
              ) : (
                <Alert>
                  <TriangleAlert className="h-4 w-4" />
                  <AlertTitle>No hay un PDF adjunto a este punto</AlertTitle>
                  <AlertDescription>
                    Adjunta aquí la copia del acta del máximo órgano social. Esto no modifica el acto administrativo ni las actas del módulo PESV.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2 rounded-md border p-4">
                <Label htmlFor="annual-committee-evidence">Copia del acta del máximo órgano social (PDF)</Label>
                <Input
                  id="annual-committee-evidence"
                  data-testid="annual-committee-evidence-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  disabled={uploadingFile}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (!file) return;
                    if (file.type !== "application/pdf" || !file.name.toLowerCase().endsWith(".pdf")) {
                      toast({ title: "Archivo no válido", description: "Selecciona un documento PDF.", variant: "destructive" });
                      return;
                    }
                    void uploadEvidence(file);
                  }}
                />
                <p className="text-xs text-muted-foreground">El sistema guarda el documento en este informe y conserva el original sin modificarlo. Si ya hay un archivo, la nueva carga lo reemplazará.</p>
                <div className="flex justify-end">
                  <Button variant="outline" asChild>
                    <Link href="/pesv/comite?tab=acto-administrativo">Consultar conformación del comité en P01</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}
