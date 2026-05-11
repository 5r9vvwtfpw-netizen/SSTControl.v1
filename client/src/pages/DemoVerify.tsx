import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const MAX_RETRIES = 10;
const RETRY_DELAY_MS = 3000;

export default function DemoVerify() {
  const [status, setStatus] = useState<"loading" | "redirecting" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Preparando tu demo...");
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectedRef = useRef(false);

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const errorParam = params.get("error");
  const statusParam = params.get("status");
  const apiParam = params.get("api");

  useEffect(() => {
    if (errorParam) {
      setStatus("error");
      setErrorMessage(decodeURIComponent(errorParam));
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("No se proporcionó un token de verificación.");
      return;
    }

    // LSO fallback flow: api param present means we must exchange the LSO token
    if (apiParam) {
      handleLsoTokenExchange(token, apiParam);
      return;
    }

    if (statusParam === "preparing") {
      retryCountRef.current = 0;
      pollUntilReady(token);
      return;
    }

    if (!redirectedRef.current) {
      redirectedRef.current = true;
      setStatus("redirecting");
      setStatusMessage("Iniciando sesión...");
      window.location.href = `/api/demo/verify-redirect?token=${encodeURIComponent(token)}`;
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token, errorParam, statusParam, apiParam]);

  async function handleLsoTokenExchange(lsoToken: string, apiBase: string) {
    setStatus("loading");
    setStatusMessage("Verificando acceso al demo...");

    try {
      const response = await fetch(`${apiBase}/api/demo/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: lsoToken }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.redirectPath) {
        setStatus("redirecting");
        setStatusMessage("Acceso verificado. Redirigiendo...");
        window.location.href = `${apiBase}${data.redirectPath}`;
        return;
      }

      const errorMessages: Record<string, string> = {
        invalid_token: "El token de verificación no es válido.",
        not_found: "El token de verificación no existe.",
        expired: "El token de verificación ha expirado.",
        server_error: "Error interno del servidor. Intente de nuevo.",
      };

      setStatus("error");
      setErrorMessage(errorMessages[data.code] || "No se pudo verificar el acceso al demo.");
    } catch {
      setStatus("error");
      setErrorMessage("Error de conexión al verificar el token. Intente de nuevo.");
    }
  }

  async function pollUntilReady(tokenValue: string) {
    setStatus("loading");
    setStatusMessage(`Preparando tu demo... (${retryCountRef.current + 1}/${MAX_RETRIES})`);

    try {
      const response = await fetch("/api/demo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await response.json();

      if (response.status === 202 && data.retry) {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          const delay = (data.retryAfter || 3) * 1000;
          timerRef.current = setTimeout(() => pollUntilReady(tokenValue), delay);
          return;
        }
        setStatus("error");
        setErrorMessage("La demo tardó demasiado en prepararse. Intente de nuevo.");
        return;
      }

      if (data.success || response.ok) {
        setStatus("redirecting");
        setStatusMessage("Iniciando sesión...");
        window.location.href = `/api/demo/verify-redirect?token=${encodeURIComponent(tokenValue)}`;
        return;
      }

      setStatus("error");
      setErrorMessage(data.error || "Error al verificar el token.");
    } catch (err: any) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setStatusMessage(`Reconectando... (${retryCountRef.current}/${MAX_RETRIES})`);
        timerRef.current = setTimeout(() => pollUntilReady(tokenValue), RETRY_DELAY_MS);
        return;
      }
      setStatus("error");
      setErrorMessage("Error de conexión. Por favor intente de nuevo.");
    }
  }

  function handleManualRetry() {
    if (!token) return;
    if (apiParam) {
      handleLsoTokenExchange(token, apiParam);
      return;
    }
    redirectedRef.current = false;
    retryCountRef.current = 0;
    setStatus("redirecting");
    setStatusMessage("Iniciando sesión...");
    window.location.href = `/api/demo/verify-redirect?token=${encodeURIComponent(token)}`;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4" data-testid="container-demo-verify">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle data-testid="text-demo-verify-title">
            {(status === "loading" || status === "redirecting") && "Preparando tu demo..."}
            {status === "success" && "Demo lista"}
            {status === "error" && "Error de verificación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {(status === "loading" || status === "redirecting") && (
            <div className="flex flex-col items-center gap-3" data-testid="status-loading">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-muted-foreground text-sm text-center">
                {statusMessage}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-3" data-testid="status-success">
              <CheckCircle className="h-10 w-10 text-green-500" />
              <p className="text-muted-foreground text-sm text-center">
                Redirigiendo al panel de control...
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4" data-testid="status-error">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-destructive text-sm text-center" data-testid="text-error-message">
                {errorMessage}
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                {token && (
                  <Button
                    onClick={handleManualRetry}
                    data-testid="button-retry"
                  >
                    Intentar de nuevo
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => { window.location.href = "/auth"; }}
                  data-testid="button-go-login"
                >
                  Ir al inicio de sesión
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
