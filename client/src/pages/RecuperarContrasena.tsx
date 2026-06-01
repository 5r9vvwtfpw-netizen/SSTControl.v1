import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const portal = urlParams.get("portal");
  const isLso = portal === "lso";

  const backHref = isLso ? "/auth" : "/auth";
  const backLabel = isLso ? "Volver al Portal de Licenciados" : "Volver al inicio de sesión";

  const requestResetMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest("POST", "/api/auth/request-password-reset", { email, portal: portal ?? undefined });
    },
    onSuccess: () => {
      setEmailSent(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestResetMutation.mutate(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Shield className="h-10 w-10" />
            </div>
          </div>
          <CardTitle className="text-2xl">Recuperar Contraseña</CardTitle>
          <CardDescription>
            {emailSent
              ? "Revisa tu correo electrónico"
              : isLso
                ? "Ingresa el correo de tu cuenta de profesional licenciado"
                : "Ingresa tu correo para recibir un enlace de recuperación"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailSent ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 dark:text-green-200">
                Correo enviado
              </AlertTitle>
              <AlertDescription className="text-green-700 dark:text-green-300">
                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un correo con las instrucciones para restablecer tu contraseña.
                <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-amber-800 dark:text-amber-200 text-sm">
                  <strong>¿No encuentras el correo?</strong> Revisa las carpetas de <strong>Spam</strong>, <strong>Promociones</strong> o <strong>Actualizaciones</strong> de tu bandeja de entrada.
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    data-testid="input-recovery-email"
                  />
                </div>
              </div>

              {requestResetMutation.isError && (
                <Alert variant="destructive">
                  <AlertDescription>
                    Ocurrió un error. Por favor intenta de nuevo.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={requestResetMutation.isPending || !email}
                data-testid="button-send-recovery"
              >
                {requestResetMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar enlace de recuperación
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button asChild variant="ghost" className="w-full">
            <Link href={backHref} data-testid="link-back-to-login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
