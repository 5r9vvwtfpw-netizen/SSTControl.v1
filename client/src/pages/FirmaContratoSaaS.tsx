import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, FileSignature, Loader2, MailCheck, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContratoSaaSContent } from "@/pages/ContratoSaaS";
import { SAAS_CONTRACT_VERSION } from "@shared/saas-contract";

type ApprovedInvitation = {
  id: string;
  companyName?: string;
  company?: { name?: string; nit?: string };
  signerName: string;
  signerEmail?: string;
  capacity: "legal_representative" | "attorney";
  contractVersion: string;
  sourceSha256?: string;
  contractHtml?: string;
};

type SigningResult = {
  status?: string;
  signed?: boolean;
  testOnly?: boolean;
  signedAt?: string;
  message?: string;
};

async function readResponse(response: Response) {
  const text = await response.text();
  let body: any = {};
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }
  if (!response.ok) {
    throw new Error(body.message || body.error || response.statusText || "No se pudo completar la solicitud.");
  }
  return body;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return `${name.slice(0, 1)}••••@${domain}`;
}

export default function FirmaContratoSaaS() {
  const invitationId = useMemo(
    () => new URLSearchParams(window.location.search).get("id") || "",
    [],
  );
  const [code, setCode] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [signing, setSigning] = useState(false);
  const [result, setResult] = useState<SigningResult | null>(null);
  const [actionError, setActionError] = useState("");

  const { data: invitation, isLoading, isError, error } = useQuery<ApprovedInvitation>({
    queryKey: ["/api/saas-signing/invite", invitationId],
    enabled: Boolean(invitationId),
    queryFn: async () => {
      const response = await fetch(`/api/saas-signing/invite/${encodeURIComponent(invitationId)}`, {
        credentials: "include",
      });
      return readResponse(response);
    },
  });

  const versionMatches = invitation?.contractVersion === SAAS_CONTRACT_VERSION;
  const hasFrozenContract = Boolean(invitation?.contractHtml?.trim());
  const canSignVersion = hasFrozenContract || versionMatches;
  const testOnlyResult = result?.status === "test_signed" || result?.testOnly === true;
  const alreadySigned =
    result?.signed === true &&
    result.status === "signed" &&
    result.testOnly !== true;

  const requestCode = async () => {
    if (!invitationId) return;
    setSendingCode(true);
    setActionError("");
    setCodeSent(false);
    setCode("");
    try {
      await readResponse(await fetch(`/api/saas-signing/invite/${encodeURIComponent(invitationId)}/code`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }));
      setCodeSent(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo enviar el código.");
    } finally {
      setSendingCode(false);
    }
  };

  const signContract = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!invitationId || !accepted || !codeSent || !/^\d{6}$/.test(code) || !canSignVersion) return;
    setSigning(true);
    setActionError("");
    try {
      const response = await fetch(`/api/saas-signing/invite/${encodeURIComponent(invitationId)}/sign`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, accepted: true }),
      });
      const body = await readResponse(response) as SigningResult;
      setResult(body);
      if (body.status !== "signed" || body.signed !== true || body.testOnly === true) {
        if (body.status === "test_signed" || body.testOnly === true) return;
        setActionError(body.message || "La plataforma todavía no confirma la firma. Consulta el estado con la empresa antes de volver a intentarlo.");
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "No se pudo completar la firma.");
    } finally {
      setSigning(false);
    }
  };

  if (!invitationId) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>El enlace de firma no contiene una invitación válida.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground" role="status">
          <Loader2 className="h-5 w-5 animate-spin" />
          Verificando la invitación…
        </div>
      </div>
    );
  }

  if (isError || !invitation) {
    return (
      <div className="container mx-auto max-w-4xl p-4 py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : "La invitación no está disponible o no ha sido aprobada."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <main className="container mx-auto max-w-5xl space-y-5 p-4 py-8" data-testid="page-saas-contract-signature">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Firma del contrato de servicios SaaS
          </CardTitle>
          <CardDescription>
            Revisa el contrato completo antes de continuar. El código de verificación se envía al correo registrado para esta invitación.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="font-medium">Empresa:</span> {invitation.company?.name || invitation.companyName || "Empresa"}</p>
          {invitation.company?.nit && <p><span className="font-medium">NIT:</span> {invitation.company.nit}</p>}
          <p><span className="font-medium">Firmante:</span> {invitation.signerName}</p>
          <p>
            <span className="font-medium">Calidad:</span>{" "}
            {invitation.capacity === "attorney" ? "Apoderado autorizado" : "Representante legal"}
          </p>
          <p><span className="font-medium">Versión del contrato:</span> {invitation.contractVersion}</p>
        </CardContent>
      </Card>

      {testOnlyResult ? (
        <Alert className="border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20" data-testid="alert-test-signature">
          <AlertCircle className="h-4 w-4 text-amber-700" />
          <AlertDescription>
            Prueba técnica completada. Este registro está marcado como <strong>SIN EFECTO CONTRACTUAL</strong>; no constituye una firma real ni una aceptación contractual.
          </AlertDescription>
        </Alert>
      ) : alreadySigned ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/20" data-testid="alert-contract-signed">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            La plataforma confirmó que el contrato quedó firmado{result?.signedAt ? ` el ${new Date(result.signedAt).toLocaleString("es-CO")}` : ""}.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {!canSignVersion && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Esta invitación corresponde a la versión {invitation.contractVersion}, pero aquí está disponible la versión {SAAS_CONTRACT_VERSION}. No firmes hasta que soporte confirme la versión correcta.
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documento para revisión</CardTitle>
              <CardDescription>Contrato SaaS versión {invitation.contractVersion}</CardDescription>
            </CardHeader>
            <CardContent>
              {hasFrozenContract ? (
                <iframe
                  title={`Contrato SaaS versión ${invitation.contractVersion}`}
                  srcDoc={invitation.contractHtml}
                  sandbox=""
                  className="h-[55vh] w-full rounded-md border bg-white"
                  data-testid="iframe-frozen-contract"
                />
              ) : (
                <ScrollArea className="h-[55vh] rounded-md border p-4">
                  <ContratoSaaSContent />
                </ScrollArea>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5" />
                Verificación y consentimiento
              </CardTitle>
              <CardDescription>
                Revisa que tus datos y la calidad indicada sean correctos. El código acredita acceso al correo de la invitación, pero no sustituye la revisión de tus facultades.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={requestCode} disabled={sendingCode || !canSignVersion} data-testid="button-send-signing-code">
                  {sendingCode
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    : <MailCheck className="mr-2 h-4 w-4" />}
                  {codeSent ? "Enviar otro código" : "Enviar código de verificación"}
                </Button>
                {codeSent && (
                  <span className="text-sm text-muted-foreground">
                    Código enviado al correo registrado para esta invitación{invitation.signerEmail ? ` (${maskEmail(invitation.signerEmail)})` : ""}.
                  </span>
                )}
              </div>

              <form onSubmit={signContract} className="space-y-4">
                <label className="flex items-start gap-3 text-sm leading-relaxed">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(event) => setAccepted(event.target.checked)}
                    disabled={alreadySigned}
                    className="mt-1 h-4 w-4 accent-primary"
                    data-testid="checkbox-signing-accept"
                  />
                  <span>
                    He leído el contrato completo versión {invitation.contractVersion}, mis datos y la calidad indicada son correctos, y manifiesto expresamente mi decisión de firmarlo por la empresa.
                  </span>
                </label>

                <label className="block max-w-sm space-y-1 text-sm font-medium">
                  Código de seis dígitos
                  <input
                    required
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center font-mono text-lg tracking-[0.3em]"
                    data-testid="input-signing-code"
                  />
                </label>

                {actionError && (
                  <Alert variant="destructive" data-testid="alert-signing-error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{actionError}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={!accepted || !codeSent || code.length !== 6 || signing || !canSignVersion}
                  data-testid="button-submit-contract-signature"
                >
                  {signing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {signing ? "Enviando…" : "Firmar contrato"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
}