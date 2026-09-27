import { useMemo, useRef, useState } from "react";
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

type SigningCapacity = "legal_representative" | "attorney";

type SigningRequest = {
  id: string;
  status: string;
  testOnly?: boolean;
  signerName: string;
  signerEmail: string;
  capacity: SigningCapacity;
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

async function responseError(response: Response) {
  const text = await response.text();
  if (!text) return response.statusText || "No se pudo completar la solicitud.";
  try {
    const body = JSON.parse(text);
    return body.message || body.error || response.statusText || "No se pudo completar la solicitud.";
  } catch {
    return text;
  }
}

export function SolicitudFirmaContratoSaaS() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [signerId, setSignerId] = useState("");
  const [capacity, setCapacity] = useState<SigningCapacity>("legal_representative");
  const [proof, setProof] = useState<File | null>(null);
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
      request.contractVersion === data?.currentVersion,
  );
  const canSubmit = ["admin", "superusuario"].includes(user?.role || "");

  const handleProofChange = (file?: File) => {
    if (!file) {
      setProof(null);
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Formato no permitido",
        description: "Adjunta el poder o soporte en PDF, JPG o PNG.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setProof(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo debe pesar máximo 5 MB.",
        variant: "destructive",
      });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setProof(null);
      return;
    }
    setProof(file);
  };

  const submitRequest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!proof || !canSubmit || hasOpenRequest || hasCurrentSignedContract) return;

    const formData = new FormData();
    formData.append("signerName", signerName.trim());
    formData.append("signerEmail", signerEmail.trim());
    formData.append("signerId", signerId.trim());
    formData.append("capacity", capacity);
    formData.append("proof", proof);

    setSubmitting(true);
    try {
      const response = await fetch("/api/saas-signing/company", {
        method: "POST",
        credentials: "include",
        headers: buildHeaders(false),
        body: formData,
      });
      if (!response.ok) throw new Error(await responseError(response));
      toast({
        title: "Solicitud enviada",
        description: "Revisaremos la identidad y la facultad para firmar antes de enviar el código.",
      });
      setSignerName("");
      setSignerEmail("");
      setSignerId("");
      setCapacity("legal_representative");
      setProof(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
          Registra a la persona facultada para firmar por la empresa. La firma se habilita después de revisar los datos y el soporte presentado.
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
                      La revisión está pendiente. El firmante todavía no recibirá un código para firmar.
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
                La persona firmante recibirá un código por correo únicamente después de que el soporte sea revisado.
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
              <label className="space-y-1 text-sm font-medium">
                Calidad en que firma
                <select
                  value={capacity}
                  onChange={(event) => setCapacity(event.target.value as SigningCapacity)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal"
                  data-testid="select-signer-capacity"
                >
                  <option value="legal_representative">Representante legal</option>
                  <option value="attorney">Apoderado autorizado</option>
                </select>
              </label>
            </div>
            <label className="block space-y-1 text-sm font-medium">
              Soporte de facultad para firmar
              <input
                ref={fileInputRef}
                required
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={(event) => handleProofChange(event.target.files?.[0])}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-normal file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm"
                data-testid="input-signing-proof"
              />
              <span className="block text-xs font-normal text-muted-foreground">
                PDF, JPG, PNG o WEBP; máximo 5 MB. Si firma un apoderado, adjunta el poder correspondiente.
              </span>
              {proof && <span className="block text-xs font-normal text-muted-foreground">Archivo seleccionado: {proof.name}</span>}
            </label>
            <Button
              type="submit"
              disabled={submitting || isLoading || isError || !proof}
              data-testid="button-submit-signing-request"
            >
              {submitting
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Upload className="mr-2 h-4 w-4" />}
              {submitting ? "Enviando solicitud…" : "Enviar a revisión"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}