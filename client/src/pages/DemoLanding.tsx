import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Play,
  Shield,
  Eye,
  Clock,
  CheckCircle,
  Monitor,
} from "lucide-react";

export default function DemoLanding() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartDemo = async () => {
    setLoading(true);
    setError("");

    try {
      const body: Record<string, string> = {};
      if (email.trim()) {
        body.email = email.trim();
      }

      const res = await fetch("/api/demo/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Error al iniciar la demo");
        setLoading(false);
        return;
      }

      if (data.verifyUrl) {
        const url = data.verifyUrl.startsWith("http")
          ? new URL(data.verifyUrl).pathname + new URL(data.verifyUrl).search
          : data.verifyUrl;
        window.location.href = url;
      } else if (data.token) {
        window.location.href = `/demo/verify?token=${encodeURIComponent(data.token)}`;
      } else {
        setError("No se recibió un enlace de verificación.");
        setLoading(false);
      }
    } catch (err: any) {
      setError("Error de conexión. Intente de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Monitor className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="text-demo-title">
            Demo Interactiva
          </h1>
          <p className="text-muted-foreground text-lg">
            SG-SST Colombia - Sistema de Gestión de Seguridad y Salud en el Trabajo
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">Explore el sistema completo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-muted/50">
                <Eye className="h-5 w-5 text-blue-500" />
                <span className="text-xs text-center text-muted-foreground">Solo lectura</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-muted/50">
                <Clock className="h-5 w-5 text-orange-500" />
                <span className="text-xs text-center text-muted-foreground">Acceso hasta las 2 AM</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-3 rounded-md bg-muted/50">
                <Shield className="h-5 w-5 text-green-500" />
                <span className="text-xs text-center text-muted-foreground">Sin registro</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-email">Correo electrónico (opcional)</Label>
              <Input
                id="demo-email"
                type="email"
                placeholder="su@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-demo-email"
              />
              <p className="text-xs text-muted-foreground">
                Si lo proporciona, podremos enviarle información sobre el sistema.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <Button
              onClick={handleStartDemo}
              disabled={loading}
              className="w-full"
              data-testid="button-start-demo"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Preparando demo...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Iniciar Demo Gratuita
                </>
              )}
            </Button>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-medium text-muted-foreground text-center">Lo que verá en la demo:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "Evaluación Resolución 0312",
                  "Gestión de Trabajadores",
                  "Capacitaciones SST",
                  "Plan de Trabajo Anual",
                  "Investigación de Accidentes",
                  "Inspecciones de Seguridad",
                  "Módulo PESV",
                  "Informes PDF",
                ].map((item) => (
                  <Badge key={item} variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          SADGI S.A.S. - NIT 902.036.337-4 - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
