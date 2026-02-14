import { useEffect, useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function DemoVerify() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const token = new URLSearchParams(window.location.search).get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("No se proporcionó un token de verificación.");
      return;
    }

    verifyToken(token);
  }, [token]);

  async function verifyToken(tokenValue: string) {
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await apiRequest("POST", "/api/demo/verify", { token: tokenValue });
      const data = await response.json();

      if (data.success) {
        setStatus("success");
        await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Error al verificar el token.");
      }
    } catch (err: any) {
      setStatus("error");
      try {
        const errorData = await err?.json?.();
        setErrorMessage(errorData?.error || "Error al verificar el token.");
      } catch {
        setErrorMessage("Error de conexión. Por favor intente de nuevo.");
      }
    }
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
                Estamos configurando tu entorno de demostración. Esto solo tomará un momento...
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
                    onClick={() => verifyToken(token)}
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
