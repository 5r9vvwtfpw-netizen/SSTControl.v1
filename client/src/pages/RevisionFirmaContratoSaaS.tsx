import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { AlertCircle, Check, Clock3, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils/formatters";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type ReviewRequest = {
  id: string;
  status: string;
  companyName?: string;
  companyNit?: string;
  signerName: string;
  signerEmail: string;
  signerId?: string;
  capacity: "legal_representative" | "attorney";
  contractVersion: string;
  createdAt: string;
  proofFileName?: string;
  proofMimeType?: string;
  proofUrl?: string;
};

type ReviewResponse = {
  requests: ReviewRequest[];
};

export default function RevisionFirmaContratoSaaS() {
  const { user, isLoading: isLoadingUser } = useAuth();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery<ReviewResponse>({
    queryKey: ["/api/saas-signing/review"],
    enabled: user?.role === "superadmin",
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/saas-signing/review");
      return response.json();
    },
  });

  const reviewRequest = async (request: ReviewRequest, action: "approve" | "reject") => {
    let rejectionReason = "";
    if (action === "reject" && !window.confirm(`¿Rechazar la solicitud de ${request.signerName} para ${request.companyName || "esta empresa"}?`)) {
      return;
    }
    if (action === "reject") {
      rejectionReason = window.prompt("Indica el motivo del rechazo para que la empresa sepa qué debe corregir.")?.trim() || "";
      if (!rejectionReason) return;
    }
    setProcessingId(request.id);
    try {
      const response = await apiRequest(
        "POST",
        `/api/saas-signing/review/${encodeURIComponent(request.id)}/${action}`,
        action === "reject" ? { reason: rejectionReason } : {},
      );
      const body = await response.json().catch(() => ({}));
      toast({
        title: action === "approve" ? "Solicitud aprobada" : "Solicitud rechazada",
        description: body.message || (action === "approve"
          ? "La invitación de firma quedó habilitada."
          : "La empresa deberá corregir la solicitud para continuar."),
      });
      await queryClient.invalidateQueries({ queryKey: ["/api/saas-signing/review"] });
    } catch (reviewError) {
      toast({
        title: "No se pudo actualizar la solicitud",
        description: reviewError instanceof Error ? reviewError.message : "Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }
  if (!user) return <Redirect to="/auth" />;
  if (user.role !== "superadmin") {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Solo el superadministrador puede revisar estas solicitudes.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-6xl space-y-5 p-4 py-8" data-testid="page-saas-signing-review">
      <div>
        <h1 className="text-2xl font-bold">Revisión de firmas de contratos SaaS</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comprueba la identidad declarada y el soporte de representación antes de habilitar la firma.
        </p>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "No se pudieron cargar las solicitudes."}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando solicitudes…
        </div>
      ) : !data?.requests?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
            <Clock3 className="h-8 w-8" />
            <p>No hay solicitudes pendientes de revisión.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.requests.map((request) => (
            <Card key={request.id} data-testid={`review-request-${request.id}`}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{request.companyName || "Empresa"}{request.companyNit ? ` · NIT ${request.companyNit}` : ""}</CardTitle>
                    <CardDescription>
                      Solicitud creada {formatDate(request.createdAt)} · Contrato v{request.contractVersion}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pendiente de revisión</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 text-sm md:grid-cols-2">
                  <p><span className="font-medium">Firmante:</span> {request.signerName}</p>
                  <p><span className="font-medium">Correo:</span> {request.signerEmail}</p>
                  <p><span className="font-medium">Identificación:</span> {request.signerId || "No disponible"}</p>
                  <p><span className="font-medium">Facultad:</span> {request.capacity === "attorney" ? "Apoderado autorizado" : "Representante legal"}</p>
                </div>
                {request.proofUrl ? (
                  <div className="space-y-2 rounded-md border p-3">
                    <p className="text-sm font-medium">
                      Soporte de representación{request.proofFileName ? `: ${request.proofFileName}` : ""}
                    </p>
                    {request.proofMimeType?.startsWith("image/") ? (
                      <img
                        src={request.proofUrl}
                        alt={`Soporte de representación de ${request.signerName}`}
                        className="max-h-96 max-w-full rounded-md border object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <>
                        <iframe
                          title={`Soporte de representación de ${request.signerName}`}
                          src={request.proofUrl}
                          sandbox=""
                          className="h-96 w-full rounded-md border bg-white"
                          loading="lazy"
                        />
                        <a
                          href={request.proofUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline underline-offset-4"
                        >
                          Abrir soporte en otra pestaña
                        </a>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    Se adjuntó un soporte de representación, pero no está disponible un enlace de vista previa.
                  </div>
                )}
                {request.status === "pending_review" && (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      onClick={() => reviewRequest(request, "approve")}
                      disabled={processingId === request.id}
                      data-testid={`button-approve-signing-${request.id}`}
                    >
                      {processingId === request.id
                        ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        : <Check className="mr-2 h-4 w-4" />}
                      Aprobar y habilitar código
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => reviewRequest(request, "reject")}
                      disabled={processingId === request.id}
                      data-testid={`button-reject-signing-${request.id}`}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Rechazar solicitud
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}