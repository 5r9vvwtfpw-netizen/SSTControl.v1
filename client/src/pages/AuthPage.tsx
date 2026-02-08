import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, AlertCircle, CheckCircle2, Mail, XCircle, Sparkles, Eye, EyeOff, Building2, Briefcase, Users, MapPin, Phone, AlertTriangle, Truck } from "lucide-react";
import { Redirect, useLocation, Link } from "wouter";
import sstLogoPath from "@assets/SST-Colombia-logo-3_1768408022586.png";
import { CIIU_CODES, CIIU_SECTIONS } from "@/lib/ciiu-codes";
import { getRiskLevelFromCiiu, getCiiuClassification } from "@shared/ciiu-risk-classification";
import { calculateChapter } from "@shared/utils";

const chapterInfo: Record<string, { name: string; standards: number; description: string }> = {
  "1": { name: "Estándares Mínimos", standards: 7, description: "Empresas de 1-10 trabajadores con Riesgo I, II o III" },
  "2": { name: "Estándares Intermedios", standards: 21, description: "Empresas de 11-50 trabajadores con Riesgo I, II o III" },
  "3": { name: "Estándares Completos", standards: 61, description: "Empresas con más de 50 trabajadores o con Riesgo IV/V" }
};

const riskLevelInfo: Record<string, { name: string; color: string }> = {
  "I": { name: "Riesgo Mínimo", color: "text-green-600 dark:text-green-400" },
  "II": { name: "Riesgo Bajo", color: "text-blue-600 dark:text-blue-400" },
  "III": { name: "Riesgo Medio", color: "text-yellow-600 dark:text-yellow-400" },
  "IV": { name: "Riesgo Alto", color: "text-orange-600 dark:text-orange-400" },
  "V": { name: "Riesgo Máximo", color: "text-red-600 dark:text-red-400" }
};

const colombianCities = [
  "Bogotá D.C.", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
  "Pereira", "Manizales", "Santa Marta", "Ibagué", "Cúcuta", "Villavicencio",
  "Pasto", "Montería", "Neiva", "Armenia", "Popayán", "Sincelejo", "Valledupar",
  "Tunja", "Riohacha", "Florencia", "Quibdó", "Yopal", "Mocoa", "Leticia",
  "San José del Guaviare", "Inírida", "Puerto Carreño", "Mitú", "Arauca",
  "Soacha", "Bello", "Soledad", "Itagüí", "Floridablanca", "Envigado",
  "Palmira", "Dosquebradas", "Rionegro", "Zipaquirá", "Chía", "Facatativá",
  "Girardot", "Barrancabermeja", "Sogamoso", "Duitama", "Tuluá"
];

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
  });
  const [companyData, setCompanyData] = useState({
    nit: "",
    city: "",
    ciiuCode: "",
    numberOfWorkers: 1,
    numberOfVehicles: 0,
    address: "",
    contactPhone: "",
  });
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  const searchParams = new URLSearchParams(window.location.search);
  const urlPlan = searchParams.get("plan");
  const urlWorkers = searchParams.get("workers");
  const urlQuote = searchParams.get("quote");
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");

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
            
            if (result.data.companyName) {
              setRegisterData(prev => ({ ...prev, fullName: result.data.companyName }));
            }
            if (result.data.ciiuCode) {
              setCompanyData(prev => ({ ...prev, ciiuCode: result.data.ciiuCode }));
            }
            if (result.data.employees) {
              setCompanyData(prev => ({ ...prev, numberOfWorkers: result.data.employees }));
            }
            if (result.data.vehicles) {
              setCompanyData(prev => ({ ...prev, numberOfVehicles: result.data.vehicles }));
            }
          }
        }
      } catch (err) {
        console.error('[Quote] Error al verificar:', err);
      }
    };
    
    verifyAndStoreQuote();
  }, [urlQuote]);

  useEffect(() => {
    if (urlWorkers) {
      sessionStorage.setItem('sst_onboarding_workers', urlWorkers);
      const parsed = parseInt(urlWorkers, 10);
      if (!isNaN(parsed) && parsed >= 1) {
        setCompanyData(prev => ({ ...prev, numberOfWorkers: parsed }));
      }
    }
  }, [urlWorkers]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "register") {
      setActiveTab("register");
    }
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

  const calculatedRisk = companyData.ciiuCode ? getRiskLevelFromCiiu(companyData.ciiuCode) : null;
  const ciiuClassification = companyData.ciiuCode ? getCiiuClassification(companyData.ciiuCode) : null;
  const currentRisk = calculatedRisk || "I";
  const currentChapter = calculateChapter(companyData.numberOfWorkers || 1, currentRisk as "I" | "II" | "III" | "IV" | "V");
  const currentChapterInfo = chapterInfo[currentChapter];
  const currentRiskInfo = riskLevelInfo[currentRisk];
  const isHighRisk = currentRisk === "IV" || currentRisk === "V";

  const step1Valid = registerData.username && registerData.password && registerData.password.length >= 6 && registerData.fullName && registerData.email;
  const step2Valid = companyData.ciiuCode && companyData.numberOfWorkers >= 1 && companyData.nit && companyData.nit.length >= 9 && companyData.city && companyData.address && companyData.address.length >= 5 && companyData.contactPhone && companyData.contactPhone.length >= 7;

  if (user) {
    if (user.role === 'superusuario' && !user.companyId) {
      sessionStorage.removeItem('sst_new_registration');
      return <Redirect to="/crear-empresa" />;
    }
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
        sessionStorage.setItem('sst_new_registration', 'true');
        
        localStorage.setItem('sst_registration_company_name', registerData.fullName);
        localStorage.setItem('sst_registration_email', registerData.email);
        localStorage.setItem('sst_registration_username', registerData.username);
        localStorage.setItem('sst_registration_nit', companyData.nit);
        localStorage.setItem('sst_registration_city', companyData.city);
        localStorage.setItem('sst_registration_ciiu', companyData.ciiuCode);
        localStorage.setItem('sst_registration_workers', String(companyData.numberOfWorkers));
        localStorage.setItem('sst_registration_vehicles', String(companyData.numberOfVehicles));
        localStorage.setItem('sst_registration_address', companyData.address);
        localStorage.setItem('sst_registration_phone', companyData.contactPhone);
        if (calculatedRisk) {
          localStorage.setItem('sst_registration_risk', calculatedRisk);
        }
        
        if (data?.autoVerified) {
          setLoginData(prev => ({ ...prev, username: registerData.username }));
          setActiveTab("login");
          setRegisterStep(1);
        } else {
          setRegistrationSuccess(true);
          setRegisterStep(1);
        }
        setRegisterData({ username: "", password: "", fullName: "", email: "" });
        setCompanyData({ nit: "", city: "", ciiuCode: "", numberOfWorkers: 1, numberOfVehicles: 0, address: "", contactPhone: "" });
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
      <div className="flex items-center justify-center p-4 sm:p-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1 text-center pb-4">
            <div className="flex justify-center mb-3">
              <img 
                src={sstLogoPath} 
                alt="SST Colombia Logo" 
                className="h-14 w-14 rounded-md object-cover"
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

            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setRegisterStep(1); }} className="w-full">
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
                  
                  {registerStep === 1 && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">1</div>
                        <span className="text-sm font-medium">Datos de la Cuenta</span>
                        <div className="flex-1 h-0.5 bg-muted rounded" />
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium">2</div>
                        <span className="text-sm text-muted-foreground">Empresa</span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-fullname">Nombre de empresa *</Label>
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
                        <Label htmlFor="register-email">Correo empresarial *</Label>
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
                        <Label htmlFor="register-username">Usuario *</Label>
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
                        <Label htmlFor="register-password">Contraseña *</Label>
                        <div className="relative">
                          <Input
                            id="register-password"
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="Mínimo 6 caracteres"
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
                      
                      <Button 
                        type="button" 
                        className="w-full" 
                        onClick={() => setRegisterStep(2)}
                        disabled={!step1Valid}
                        data-testid="button-continue-step2"
                      >
                        Continuar - Datos de Empresa
                      </Button>
                    </>
                  )}

                  {registerStep === 2 && (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-sm text-muted-foreground">Cuenta</span>
                        <div className="flex-1 h-0.5 bg-primary rounded" />
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">2</div>
                        <span className="text-sm font-medium">Empresa</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5" />
                          Actividad Económica (CIIU) *
                        </Label>
                        <Select 
                          value={companyData.ciiuCode} 
                          onValueChange={(val) => setCompanyData({ ...companyData, ciiuCode: val })}
                        >
                          <SelectTrigger data-testid="select-register-ciiu">
                            <SelectValue placeholder="Selecciona tu actividad económica" />
                          </SelectTrigger>
                          <SelectContent className="max-h-80">
                            {Object.entries(CIIU_SECTIONS).map(([section, sectionName]) => (
                              <SelectGroup key={section}>
                                <SelectLabel className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                                  {section} - {sectionName}
                                </SelectLabel>
                                {CIIU_CODES.filter(c => c.section === section).map((ciiu) => (
                                  <SelectItem key={ciiu.code} value={ciiu.code}>
                                    {ciiu.code} - {ciiu.description}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            Trabajadores *
                          </Label>
                          <Input 
                            type="number"
                            min={1}
                            placeholder="Ej: 25" 
                            value={companyData.numberOfWorkers || ''}
                            onChange={(e) => setCompanyData({ ...companyData, numberOfWorkers: e.target.value === '' ? 1 : parseInt(e.target.value, 10) })}
                            data-testid="input-register-workers"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <Truck className="h-3.5 w-3.5" />
                            Vehículos (PESV)
                          </Label>
                          <Input 
                            type="number"
                            min={0}
                            placeholder="Ej: 5" 
                            value={companyData.numberOfVehicles || ''}
                            onChange={(e) => setCompanyData({ ...companyData, numberOfVehicles: e.target.value === '' ? 0 : parseInt(e.target.value, 10) })}
                            data-testid="input-register-vehicles"
                          />
                        </div>
                      </div>

                      {companyData.ciiuCode && ciiuClassification && (
                        <div className={`p-3 rounded-lg border-2 ${isHighRisk ? 'border-orange-300 bg-orange-50/50 dark:bg-orange-950/20' : 'border-green-300 bg-green-50/50 dark:bg-green-950/20'}`} data-testid="card-risk-result-register">
                          <div className="flex items-start gap-2">
                            <Shield className={`h-4 w-4 mt-0.5 ${isHighRisk ? 'text-orange-600' : 'text-green-600'}`} />
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium">Riesgo:</span>
                                <Badge variant="outline" className={`text-xs ${currentRiskInfo.color}`}>
                                  Clase {currentRisk} - {currentRiskInfo.name}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{ciiuClassification.description}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="secondary" className="text-xs">
                                  {currentChapterInfo.standards} estándares
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {currentChapterInfo.name}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isHighRisk && companyData.ciiuCode && (
                        <Alert variant="destructive" className="border-orange-300 bg-orange-50 dark:bg-orange-950/30 py-2" data-testid="alert-high-risk-register">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            Actividad de <strong>Alto Riesgo</strong>: aplican los 61 estándares completos de la Resolución 0312/2019, independientemente del número de trabajadores.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>NIT *</Label>
                          <Input 
                            placeholder="Ej: 900123456-7" 
                            value={companyData.nit}
                            onChange={(e) => setCompanyData({ ...companyData, nit: e.target.value })}
                            data-testid="input-register-nit"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            Ciudad *
                          </Label>
                          <Select 
                            value={companyData.city} 
                            onValueChange={(val) => setCompanyData({ ...companyData, city: val })}
                          >
                            <SelectTrigger data-testid="select-register-city">
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              {colombianCities.map((city) => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Dirección *</Label>
                        <Input 
                          placeholder="Ej: Calle 100 # 15-20" 
                          value={companyData.address}
                          onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                          data-testid="input-register-address"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5" />
                          Teléfono de Contacto *
                        </Label>
                        <Input 
                          placeholder="Ej: 3001234567" 
                          value={companyData.contactPhone}
                          onChange={(e) => setCompanyData({ ...companyData, contactPhone: e.target.value })}
                          data-testid="input-register-phone"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <Sparkles className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          7 días de prueba gratis - Sin tarjeta de crédito
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setRegisterStep(1)}
                          className="flex-1"
                          data-testid="button-back-step1"
                        >
                          Volver
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-[2]" 
                          disabled={registerMutation.isPending || !step2Valid}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? "Registrando..." : "Crear cuenta gratis"}
                        </Button>
                      </div>

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
                    </>
                  )}
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
