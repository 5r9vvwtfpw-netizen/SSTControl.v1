import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle2, Mail, XCircle, Sparkles, Eye, EyeOff } from "lucide-react";
import { Redirect, useLocation, Link } from "wouter";
import sstLogoPath from "@assets/SST-Colombia-logo-3_1768408022586.png";

// Plan names - NO se muestra capítulo aquí, el capítulo se calcula después de crear la empresa
// basándose en número de trabajadores + nivel de riesgo (Resolución 0312/2019)

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ 
    username: "", 
    password: "", 
    fullName: "",
    email: "",
    // Plan se determinará automáticamente basándose en el número de trabajadores
    // El capítulo se calcula después de crear la empresa según Resolución 0312/2019
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const urlPlan = searchParams.get("plan");
  const urlWorkers = searchParams.get("workers");
  const urlQuote = searchParams.get("quote");
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

  // Verificar y guardar datos del quote JWT desde landing page
  useEffect(() => {
    const verifyAndStoreQuote = async () => {
      if (!urlQuote) return;
      
      try {
        const response = await fetch('/api/verify-quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: urlQuote })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.valid && result.data) {
            sessionStorage.setItem('sst_quote_data', JSON.stringify(result.data));
            sessionStorage.setItem('sst_quote_token', urlQuote);
            console.log('[Quote] Datos guardados:', result.data);
            
            // Pre-llenar nombre de empresa desde el JWT
            if (result.data.companyName) {
              setRegisterData(prev => ({ ...prev, fullName: result.data.companyName }));
            }
          }
        }
      } catch (err) {
        console.error('[Quote] Error al verificar:', err);
      }
    };
    
    verifyAndStoreQuote();
  }, [urlQuote]);

  // Guardar workers en sessionStorage para uso en crear-empresa
  useEffect(() => {
    if (urlWorkers) {
      sessionStorage.setItem('sst_onboarding_workers', urlWorkers);
    }
  }, [urlWorkers]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") {
      setActiveTab("register");
    }
    // Si viene desde página de marketing o landing page con parámetros, mostrar registro
    if (urlPlan || urlWorkers || urlQuote) {
      setActiveTab("register");
    }
  }, [urlPlan, urlWorkers, urlQuote]);

  useEffect(() => {
    if (verified === "true") {
      setActiveTab("login");
      const verifiedUser = searchParams.get("user");
      if (verifiedUser) {
        setLoginData(prev => ({ ...prev, username: verifiedUser }));
      }
    }
  }, [verified]);

  if (user) {
    // Si es superusuario sin empresa -> siempre redirigir a crear empresa
    // Esto aplica tanto para nuevos registros como para usuarios que no completaron el proceso
    if (user.role === 'superusuario' && !user.companyId) {
      sessionStorage.removeItem('sst_new_registration');
      return <Redirect to="/crear-empresa" />;
    }
    // Si ya tiene empresa -> Panel de Control
    sessionStorage.removeItem('sst_new_registration');
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate(registerData, {
      onSuccess: (data: any) => {
        // Marcar como nuevo registro para redirigir al onboarding después del login
        sessionStorage.setItem('sst_new_registration', 'true');
        
        // Trazabilidad: guardar datos del registro para pre-llenar formulario de creación de empresa
        // Esto evita que el cliente tenga que volver a escribir nombre de empresa y correo
        if (registerData.fullName) {
          sessionStorage.setItem('sst_registration_company_name', registerData.fullName);
        }
        if (registerData.email) {
          sessionStorage.setItem('sst_registration_email', registerData.email);
        }
        
        // Si el usuario fue auto-verificado (modo desarrollo), cambiar a login
        if (data?.autoVerified) {
          // Pre-llenar el username en el formulario de login
          setLoginData(prev => ({ ...prev, username: registerData.username }));
          setActiveTab("login");
          // No mostrar el mensaje de "revisa tu correo"
        } else {
          setRegistrationSuccess(true);
        }
        setRegisterData({ username: "", password: "", fullName: "", email: "" });
      },
    });
  };

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

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={sstLogoPath} 
                alt="SST Colombia Logo" 
                className="h-16 w-16 rounded-md object-cover"
              />
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

            {registrationSuccess && (
              <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
                <Mail className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800 dark:text-blue-200">Revisa tu correo</AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  Hemos enviado un enlace de verificación a tu correo electrónico. 
                  Por favor verifica tu cuenta para poder iniciar sesión.
                  <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950 rounded text-amber-800 dark:text-amber-200 text-sm">
                    <strong>¿No encuentras el correo?</strong> Revisa las carpetas de <strong>Spam</strong>, <strong>Promociones</strong> o <strong>Actualizaciones</strong> de tu bandeja de entrada.
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Registrarse</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
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
                        type={showLoginPassword ? "text" : "password"}
                        placeholder="Ingrese su contraseña"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        className="pr-10"
                        data-testid="input-login-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-login-password"
                        aria-label={showLoginPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                  </Button>
                  <div className="text-center pt-2">
                    <Link 
                      href="/recuperar-contrasena" 
                      className="text-sm text-muted-foreground hover:text-primary hover:underline"
                      data-testid="link-forgot-password-auth"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-fullname">Nombre de empresa</Label>
                    <Input
                      id="register-fullname"
                      placeholder="Ingrese el nombre de su empresa"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({ ...registerData, fullName: e.target.value })}
                      required
                      data-testid="input-register-fullname"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo empresarial</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="contacto@empresa.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      data-testid="input-register-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Usuario</Label>
                    <Input
                      id="register-username"
                      placeholder="Elija un nombre de usuario"
                      value={registerData.username}
                      onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                      required
                      data-testid="input-register-username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <div className="relative">
                      <Input
                        id="register-password"
                        type={showRegisterPassword ? "text" : "password"}
                        placeholder="Cree una contraseña segura"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        minLength={6}
                        className="pr-10"
                        data-testid="input-register-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
                        data-testid="button-toggle-register-password"
                        aria-label={showRegisterPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 dark:text-green-300">
                      7 días de prueba gratis - Sin tarjeta de crédito
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    {registerMutation.isPending ? "Registrando..." : "Crear cuenta gratis"}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    Al registrarte aceptas nuestros{" "}
                    <Link href="/terminos-servicio" className="underline hover:text-primary">
                      Términos de servicio
                    </Link>{" "}
                    y{" "}
                    <Link href="/politica-privacidad" className="underline hover:text-primary">
                      Política de privacidad
                    </Link>
                  </p>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
                Volver a la página de inicio
              </Link>
            </div>
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
              <Sparkles className="h-6 w-6 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Prueba Gratuita</h3>
                <p className="opacity-80">7 días para probar todas las funcionalidades sin compromiso</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
