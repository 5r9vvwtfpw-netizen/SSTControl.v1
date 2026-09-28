import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, Download, FileSignature, FileText, Loader2, Upload } from "lucide-react";
import { apiRequest, buildHeaders, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SAAS_CONTRACT_VERSION } from "@shared/saas-contract";

type SigningRequest = {
  id: string;
  status: string;
  testOnly?: boolean;
  signatureRequired?: boolean;
  signerName: string;
  signerEmail: string;
  capacity: "legal_representative" | "attorney";
  contractVersion: string;
  signedAt: string | null;
  createdAt: string;
};

type CompanySigningResponse = {
  requests: SigningRequest[];
  currentVersion: string;
  representative: { name: string; identification: string };
};

function getStatusLabel(status: string) {
  switch (status) {
    case "pending_review":
      return "Pendiente de revisión";
    case "approved":
    case "pending_signature":
      return "Aprobada; pendiente de firma";
    case "signed":
      return "Firmado";
    case "test_signed":
      return "PRUEBA · SIN EFECTO CONTRACTUAL";
    case "rejected":
      return "Requiere corrección";
    default:
      return status;
  }
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "signed") return "default";
  if (status === "rejected") return "destructive";
  if (status === "pending_review" || status === "approved" || status === "pending_signature") return "secondary";
  return "outline";
}

export function SolicitudFirmaContratoSaaS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<CompanySigningResponse>({
    queryKey: ["/api/saas-signing/company"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/saas-signing/company");
      return response.json();
    },
  });

  const requests = data?.requests ?? [];
  const hasOpenRequest = useMemo(
    () => requests.some((request) =>
      ["pending_review", "approved", "pending_signature"].includes(request.status)
    ),
    [requests],
  );
  const hasCurrentSignedContract = requests.some(
    (request) =>
      request.status === "signed" &&
      !request.testOnly &&
      request.capacity === "legal_representative" &&
      request.signatureRequired === true &&
      request.contractVersion === data?.currentVersion,
  );
  const canSubmit = ["admin", "superusuario"].includes(user?.role || "");

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !signatureFile || hasOpenRequest || hasCurrentSignedContract) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("accepted", "true");
      formData.append("signature", signatureFile);
      const response = await fetch("/api/saas-signing/company/sign", {
        method: "POST",
        headers: buildHeaders(false),
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo firmar el contrato.");
      }
      toast({
        title: import.meta.env.DEV ? "Firma de prueba registrada" : "Contrato firmado",
        description: import.meta.env.DEV
          ? "El registro de desarrollo no tiene efecto contractual."
          : "Puedes descargar el contrato firmado desde esta sección.",
      });
      setSignatureFile(null);
      await queryClient.invalidateQueries({ queryKey: ["/api/saas-signing/company"] });
    } catch (submitError) {
      toast({
        title: "No se pudo firmar el contrato",
        description: submitError instanceof Error ? submitError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSignedPdf = async (request: SigningRequest, kind: "reading-copy" | "original") => {
    setDownloadingId(`${request.id}:${kind}`);
    try {
      const response = await apiRequest(
        "GET",
        `/api/saas-signing/company/${encodeURIComponent(request.id)}/${kind === "reading-copy" ? "reading-copy" : "pdf"}`,
      );
      const pdf = await response.blob();
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = kind === "reading-copy" ? "Contrato-SaaS-copia-de-lectura.pdf" : "Contrato-SaaS-original-firmado.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) {
      toast({
        title: "No se pudo descargar el contrato",
        description: downloadError instanceof Error ? downloadError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (!canSubmit) return null;

  return (
    <Card className="mb-6" data-testid="card-saas-contract-signing">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSignature className="h-5 w-5" />
          Firma del contrato SaaS
        </CardTitle>
        <CardDescription>
          Adjunta aquí la firma del representante legal para este contrato. Esta imagen queda independiente de la firma registrada en Empresas; no se envían enlaces ni códigos.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Versión vigente: {data?.currentVersion || SAAS_CONTRACT_VERSION}</Badge>
          <a
            href="/contrato-saas"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary underline underline-offset-4"
          >
            <FileText className="h-4 w-4" />
            Revisar contrato vigente
          </a>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
            <Loader2 className="h-4 w-4 animate-spin" />
            Consultando solicitudes de firma…
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "No se pudo consultar el estado de la firma."}
            </AlertDescription>
          </Alert>
        )}
        {import.meta.env.DEV && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              En desarrollo, las firmas se guardan como pruebas sin efecto contractual.
            </AlertDescription>
          </Alert>
        )}

        {requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((request) => {
              const isTestOnly = request.testOnly === true || request.status === "test_signed";
              const isRealSigned = request.status === "signed" && !isTestOnly;
              const canDownload = isRealSigned || (import.meta.env.DEV && request.status === "test_signed");
              return (
                <div key={request.id} className="rounded-lg border p-4 space-y-3" data-testid={`signing-request-${request.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{request.signerName}</p>
                      {request.signerEmail && <p className="text-sm text-muted-foreground">{request.signerEmail}</p>}
                    </div>
                    <Badge variant={isTestOnly ? "destructive" : getStatusVariant(request.status)}>
                      {isTestOnly ? "PRUEBA · SIN EFECTO CONTRACTUAL" : getStatusLabel(request.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {request.capacity === "attorney" ? "Apoderado autorizado" : "Representante legal"}
                    {" · "}Contrato v{request.contractVersion}
                    {" · "}Solicitud {formatDate(request.createdAt)}
                    {request.signedAt ? ` · Firmado ${formatDate(request.signedAt)}` : ""}
                  </p>
                  {request.status === "pending_review" && (
                    <p className="text-sm text-muted-foreground">
                      Solicitud del flujo anterior, ya no disponible.
                    </p>
                  )}
                  {isTestOnly && (
                    <p className="text-sm font-medium text-destructive">
                      Registro de prueba: no representa una firma real y no tiene efecto contractual.
                    </p>
                  )}
                  {canDownload && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSignedPdf(request, "reading-copy")}
                        disabled={downloadingId !== null}
                      >
                        {downloadingId === `${request.id}:reading-copy`
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Download className="mr-2 h-4 w-4" />}
                        Descargar copia legible
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadSignedPdf(request, "original")}
                        disabled={downloadingId !== null}
                      >
                        {downloadingId === `${request.id}:original`
                          ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          : <Download className="mr-2 h-4 w-4" />}
                        {isTestOnly ? "Original de prueba" : "Original firmado"}
                      </Button>
                      <p className="w-full text-xs text-muted-foreground">
                        La copia facilita la lectura; el PDF firmado original permanece sin cambios.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {hasCurrentSignedContract ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription>La plataforma registra un contrato firmado para la versión vigente.</AlertDescription>
          </Alert>
        ) : hasOpenRequest ? (
          <Alert>
            <Clock3 className="h-4 w-4" />
            <AlertDescription>
              Existe una solicitud anterior en curso. Al actualizar el flujo quedará cerrada para permitir la firma directa.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4 border-t pt-5" data-testid="form-saas-signing-request">
            <div>
              <h3 className="font-semibold">Firmar contrato</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Representante legal: {data?.representative?.name || "No registrado"} · Identificación: {data?.representative?.identification || "No registrada"}.
                La imagen que cargues aquí se conservará con esta versión del contrato.
              </p>
            </div>
            <label className="block max-w-md space-y-1 text-sm font-medium">
              Firma del representante legal para este contrato (PNG o JPG, máximo 1 MB)
              <input
                type="file"
                required
                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  if (file && (!["image/png", "image/jpeg"].includes(file.type) || file.size > 1024 * 1024)) {
                    event.target.value = "";
                    setSignatureFile(null);
                    toast({ title: "Firma no válida", description: "Selecciona una imagen PNG o JPG de máximo 1 MB.", variant: "destructive" });
                    return;
                  }
                  setSignatureFile(file);
                }}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal file:mr-4 file:border-0 file:bg-muted file:px-3 file:py-1.5"
                data-testid="input-contract-signature-image"
              />
            </label>
            <p className="text-sm text-muted-foreground">
              Al firmar, confirmas que cuentas con autorización para aportar esta imagen y aceptar el contrato vigente en nombre de la empresa.
            </p>
            <Button
              type="submit"
              disabled={submitting || isLoading || isError || !signatureFile || !data?.representative?.name || !data?.representative?.identification}
              data-testid="button-submit-signing-request"
            >
              {submitting
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Upload className="mr-2 h-4 w-4" />}
              {submitting ? "Registrando firma…" : "Firmar contrato con esta imagen"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}