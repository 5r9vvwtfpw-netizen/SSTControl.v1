import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Clock3, Download, FileSignature, FileText, Loader2, Upload } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerId, setSignerId] = useState("");
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
  const mailDisabledHere = import.meta.env.DEV;

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || hasOpenRequest || hasCurrentSignedContract) return;

    setSubmitting(true);
    try {
      await apiRequest("POST", "/api/saas-signing/company", {
        signerName: signerName.trim(),
        signerEmail: signerEmail.trim(),
        signerId: signerId.trim(),
        capacity: "legal_representative",
      });
      toast({
        title: "Invitación enviada",
        description: "El representante legal podrá adjuntar su firma y solicitar el código desde el enlace recibido.",
      });
      setSignerName("");
      setSignerEmail("");
      setSignerId("");
      await queryClient.invalidateQueries({ queryKey: ["/api/saas-signing/company"] });
    } catch (submitError) {
      toast({
        title: "No se pudo enviar la solicitud",
        description: submitError instanceof Error ? submitError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const downloadSignedPdf = async (request: SigningRequest) => {
    setDownloadingId(request.id);
    try {
      const response = await apiRequest(
        "GET",
        `/api/saas-signing/company/${encodeURIComponent(request.id)}/pdf`,
      );
      const pdf = await response.blob();
      const url = URL.createObjectURL(pdf);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Contrato-SaaS-${request.contractVersion}.pdf`;
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
          Invita al representante legal registrado en la empresa. Recibirá un enlace para adjuntar su firma PNG o JPG y verificarla mediante un código enviado a su correo.
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
        {mailDisabledHere && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              En este entorno de desarrollo no se envían invitaciones ni códigos de firma. Los registros marcados como prueba no tienen efecto contractual. El envío real corresponde a la aplicación publicada.
            </AlertDescription>
          </Alert>
        )}

        {requests.length > 0 && (
          <div className="space-y-3">
            {requests.map((request) => {
              const isApproved = ["approved", "pending_signature"].includes(request.status);
              const isTestOnly = request.testOnly === true || request.status === "test_signed";
              const isRealSigned = request.status === "signed" && !isTestOnly;
              const invitationUrl = `${window.location.origin}/firma-contrato-saas?id=${encodeURIComponent(request.id)}`;
              return (
                <div key={request.id} className="rounded-lg border p-4 space-y-3" data-testid={`signing-request-${request.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{request.signerName}</p>
                      <p className="text-sm text-muted-foreground">{request.signerEmail}</p>
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
                      Solicitud del flujo anterior, ya no disponible. Registra una nueva invitación para el representante legal.
                    </p>
                  )}
                  {isApproved && (
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={invitationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-primary underline underline-offset-4"
                      >
                        Abrir enlace de firma
                      </a>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(invitationUrl);
                            toast({ title: "Enlace copiado", description: "Compártelo únicamente con la persona firmante." });
                          } catch {
                            toast({ title: "No se pudo copiar el enlace", description: "Ábrelo y copia la dirección desde el navegador.", variant: "destructive" });
                          }
                        }}
                      >
                        Copiar enlace de firma
                      </Button>
                    </div>
                  )}
                  {isTestOnly && (
                    <p className="text-sm font-medium text-destructive">
                      Registro de prueba: no representa una firma real y no tiene efecto contractual.
                    </p>
                  )}
                  {isRealSigned && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => downloadSignedPdf(request)}
                      disabled={downloadingId === request.id}
                    >
                      {downloadingId === request.id
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <Download className="mr-2 h-4 w-4" />}
                      Descargar contrato firmado
                    </Button>
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
              Ya existe una solicitud en curso. Podrás iniciar otra cuando esta solicitud sea resuelta.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4 border-t pt-5" data-testid="form-saas-signing-request">
            <div>
              <h3 className="font-semibold">Solicitar firma</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                El nombre y la identificación deben coincidir con los del representante legal en Empresas. No se requiere revisión manual.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm font-medium">
                Nombre completo del firmante
                <input
                  required
                  autoComplete="name"
                  value={signerName}
                  onChange={(event) => setSignerName(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
                  data-testid="input-signer-name"
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Correo electrónico del firmante
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={signerEmail}
                  onChange={(event) => setSignerEmail(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
                  data-testid="input-signer-email"
                />
              </label>
              <label className="space-y-1 text-sm font-medium">
                Número de identificación
                <input
                  required
                  value={signerId}
                  onChange={(event) => setSignerId(event.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
                  data-testid="input-signer-id"
                />
              </label>
            </div>
            <Button
              type="submit"
              disabled={submitting || isLoading || isError || mailDisabledHere}
              data-testid="button-submit-signing-request"
            >
              {submitting
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Upload className="mr-2 h-4 w-4" />}
              {submitting ? "Enviando invitación…" : "Invitar al representante legal"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}