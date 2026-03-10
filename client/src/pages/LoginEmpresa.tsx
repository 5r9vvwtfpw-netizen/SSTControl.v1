import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { Redirect, Link } from "wouter";
import SimpleCaptcha from "@/components/SimpleCaptcha";

export default function LoginEmpresa() {
  const { user, loginMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState<number | null>(null);
  const handleCaptchaVerified = useCallback((token: string, answer: number) => {
    setCaptchaToken(token);
    setCaptchaAnswer(answer);
  }, []);
  const handleCaptchaReset = useCallback(() => {
    setCaptchaToken("");
    setCaptchaAnswer(null);
  }, []);

  const searchParams = new URLSearchParams(window.location.search);
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case "invalid_token":
        return "El enlace de verificación no es válido. Por favor solicita uno nuevo.";
      case "token_expired":
        return "El enlace de verificación ha expirado. Por favor solicita uno nuevo.";
      case "verification_failed":
        return "Hubo un error al verificar tu correo. Por favor intenta de nuevo.";
      default:
        return null;
    }
  };

  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ ...loginData, captchaToken, captchaAnswer });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Shield className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-2xl">SST Colombia</CardTitle>
            <CardDescription>Sistema de Salud y Seguridad en el Trabajo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {verified === "true" && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">Correo verificado</AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
                </AlertDescription>
              </Alert>
            )}

            {error && getErrorMessage(error) && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error de verificación</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            )}

            {loginMutation.isError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error de inicio de sesión</AlertTitle>
                <AlertDescription>
                  Usuario o contraseña incorrectos. Por favor intenta de nuevo.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Usuario</Label>
                <Input
                  id="login-username"
                  placeholder="Ingrese su usuario"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  data-testid="input-login-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className="pr-10"
                    data-testid="input-login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    data-testid="button-toggle-password"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <SimpleCaptcha
                onVerified={handleCaptchaVerified}
                onReset={handleCaptchaReset}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending || !captchaToken || captchaAnswer === null}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="text-center pt-2">
                <Link 
                  href="/recuperar-contrasena" 
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                  data-testid="link-forgot-password"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-primary p-12">
        <div className="max-w-lg text-primary-foreground space-y-6">
          <h2 className="text-4xl font-bold">Gestión Integral de SST</h2>
          <p className="text-lg opacity-90">
            Sistema completo para la gestión de Salud y Seguridad en el Trabajo conforme a la Resolución 0312 de 2019.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Cumplimiento Normativo</h3>
                <p className="opacity-80">Cumple con los estándares mínimos según el tamaño de tu empresa</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Gestión Completa</h3>
                <p className="opacity-80">Trabajadores, capacitaciones, inspecciones y más</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Acceso Seguro</h3>
                <p className="opacity-80">Portal exclusivo para empleados de tu empresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
