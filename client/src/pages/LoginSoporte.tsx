import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import CaptchaSST from "@/components/CaptchaSST";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Headset, XCircle, Shield, Eye, EyeOff } from "lucide-react";
import { Redirect, Link } from "wouter";
import type { User } from "@shared/schema";

export default function LoginSoporte() {
  const { user } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Dedicated support login mutation - uses /api/support-login endpoint
  const supportLoginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/support-login", credentials);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error de autenticación");
      }
      return await res.json();
    },
    onSuccess: (userData: User) => {
      queryClient.setQueryData(["/api/user"], userData);
      setLoginError(null);
    },
    onError: (error: Error) => {
      setLoginError(error.message);
    },
  });

  if (user) {
    if (user.role === "soporte" || user.role === "superadmin") {
      return <Redirect to="/soporte/tickets" />;
    }
    // If a non-support user somehow accesses this page, redirect to home
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    supportLoginMutation.mutate(loginData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-blue-600 text-white">
                <Headset className="h-10 w-10" />
              </div>
            </div>
            <CardTitle className="text-2xl">Portal de Soporte</CardTitle>
            <CardDescription>Sistema de Gestión de Tickets SST Colombia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(supportLoginMutation.isError || loginError) && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error de inicio de sesión</AlertTitle>
                <AlertDescription>
                  {loginError || "Usuario o contraseña incorrectos. Por favor intenta de nuevo."}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Usuario</Label>
                <Input
                  id="login-username"
                  placeholder="Ingrese su usuario de soporte"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  data-testid="input-soporte-username"
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
                    data-testid="input-soporte-password"
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
              <CaptchaSST onVerified={() => setCaptchaVerified(true)} />
              <Button 
                type="submit" 
                id="btn-login"
                className="w-full" 
                disabled={!captchaVerified || supportLoginMutation.isPending}
                data-testid="button-soporte-login"
              >
                {supportLoginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
              <div className="text-center pt-2">
                <Link 
                  href="/recuperar-contrasena" 
                  className="text-sm text-muted-foreground hover:text-blue-600 hover:underline"
                  data-testid="link-forgot-password-soporte"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-blue-600 p-12">
        <div className="max-w-lg text-white space-y-6">
          <h2 className="text-4xl font-bold">Centro de Soporte</h2>
          <p className="text-lg opacity-90">
            Portal exclusivo para el equipo de soporte técnico de SST Colombia.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Headset className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Gestión de Tickets</h3>
                <p className="opacity-80">Administra y resuelve solicitudes de soporte de clientes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Acceso Seguro</h3>
                <p className="opacity-80">Portal dedicado con permisos limitados a soporte</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
