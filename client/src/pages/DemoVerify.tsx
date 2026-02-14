import { useEffect, useState, useRef } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const MAX_RETRIES = 15;
const RETRY_DELAY_MS = 3000;

export default function DemoVerify() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("Preparando tu demo...");
  const retryCountRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No se proporcionó un token de verificación.");
      return;
    }

    retryCountRef.current = 0;
    verifyToken(token);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [token]);

  async function verifyToken(tokenValue: string) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/demo/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: tokenValue }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        setStatusMessage("Redirigiendo al panel de control...");
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }

      if (data.retry && retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setStatusMessage(`Preparando tu demo... (${retryCountRef.current}/${MAX_RETRIES})`);
        const delay = (data.retryAfter || 3) * 1000;
        timerRef.current = setTimeout(() => verifyToken(tokenValue), delay);
        return;
      }

      setStatus("error");
      setErrorMessage(data.error || "Error al verificar el token.");
    } catch (err: any) {
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setStatusMessage(`Reconectando... (${retryCountRef.current}/${MAX_RETRIES})`);
        timerRef.current = setTimeout(() => verifyToken(tokenValue), RETRY_DELAY_MS);
        return;
      }
      setStatus("error");
      setErrorMessage("Error de conexión. Por favor intente de nuevo.");
    }
  }

  function handleManualRetry() {
    if (!token) return;
    retryCountRef.current = 0;
    verifyToken(token);
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4" data-testid="container-demo-verify">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle data-testid="text-demo-verify-title">
            {status === "loading" && "Preparando tu demo..."}
            {status === "success" && "Demo lista"}
            {status === "error" && "Error de verificación"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && (
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
