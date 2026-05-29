import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle2, Loader2, Shield, MapPin, Phone, Mail, Sparkles, Briefcase, ArrowRight, ArrowLeft, AlertTriangle, Users, Factory, Pencil, Truck, FileText, ShieldAlert, RefreshCw, UserCheck } from "lucide-react";
import type { User } from "@shared/schema";
import { calculateChapter } from "@shared/utils";
import { CIIU_CODES, CIIU_SECTIONS } from "@/lib/ciiu-codes";
import { getRiskLevelFromCiiu, getCiiuClassification } from "@shared/ciiu-risk-classification";

const chapterInfo: Record<string, { name: string; standards: number; description: string; color: string; bgColor: string }> = {
  "1": {
    name: "Estándares Mínimos",
    standards: 7,
    description: "Empresas de 1-10 trabajadores con Riesgo I, II o III",
    color: "text-blue-700 dark:text-blue-300",
    bgColor: "bg-blue-500/10 border-blue-200 dark:border-blue-800"
  },
  "2": {
    name: "Estándares Intermedios", 
    standards: 21,
    description: "Empresas de 11-50 trabajadores con Riesgo I, II o III",
    color: "text-emerald-700 dark:text-emerald-300",
    bgColor: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800"
  },
  "3": {
    name: "Estándares Completos",
    standards: 61,
    description: "Empresas con más de 50 trabajadores o con Riesgo IV/V",
    color: "text-purple-700 dark:text-purple-300",
    bgColor: "bg-purple-500/10 border-purple-200 dark:border-purple-800"
  }
};

const riskLevelInfo: Record<string, { name: string; description: string; color: string }> = {
  "I": { name: "Riesgo Mínimo", description: "Actividades de oficina, comercio menor", color: "text-green-600 dark:text-green-400" },
  "II": { name: "Riesgo Bajo", description: "Servicios, educación, comercio", color: "text-blue-600 dark:text-blue-400" },
  "III": { name: "Riesgo Medio", description: "Manufactura liviana, transporte", color: "text-yellow-600 dark:text-yellow-400" },
  "IV": { name: "Riesgo Alto", description: "Construcción, agricultura, industria", color: "text-orange-600 dark:text-orange-400" },
  "V": { name: "Riesgo Máximo", description: "Minería, trabajo en alturas, explosivos", color: "text-red-600 dark:text-red-400" }
};

const pstTarifas: Record<string, { precio: number; label: string }> = {
  "I":   { precio: 150000, label: "Nivel I — Bajo" },
  "II":  { precio: 250000, label: "Nivel II — Medio" },
  "III": { precio: 350000, label: "Nivel III — Medio-Alto" },
  "IV":  { precio: 450000, label: "Nivel IV — Alto" },
  "V":   { precio: 550000, label: "Nivel V — Muy Alto" },
};

function formatCOP(n: number) {
  return "$" + n.toLocaleString("es-CO") + "/mes";
}

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

const createCompanySchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  nit: z.string().transform(v => v.replace(/[\s.\-]/g, '')).pipe(z.string().min(9, "El NIT debe tener al menos 9 caracteres").max(15, "El NIT no puede tener más de 15 caracteres")),
  city: z.string().min(1, "La ciudad es obligatoria"),
  ciiuCode: z.string().min(1, "El código CIIU es obligatorio"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  contactPhone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  contactEmail: z.string().email("Debe ser un correo electrónico válido"),
  numberOfWorkers: z.coerce.number().min(1, "Debe tener al menos 1 trabajador"),
  riskLevel: z.enum(["I", "II", "III", "IV", "V"]).default("I"),
  // Número de vehículos desde quote JWT (PESV - Resolución 40595/2022)
  numberOfVehicles: z.coerce.number().min(0).optional().default(0),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

// ── Validación NIT colombiano (DIAN - dígito de verificación) ────────────
function validateNIT(nit: string): { valid: boolean; hasCheckDigit: boolean } {
  const clean = nit.replace(/[\s.\-]/g, '');
  if (!/^\d{9,10}$/.test(clean)) return { valid: false, hasCheckDigit: false };
  if (clean.length === 9) return { valid: true, hasCheckDigit: false };
  const base = clean.slice(0, 9);
  const checkDigit = parseInt(clean[9]);
  const weights = [3, 7, 13, 17, 19, 23, 29, 37, 41, 43, 47, 53, 59, 67, 71];
  let sum = 0;
  for (let i = 0; i < base.length; i++) {
    sum += parseInt(base[base.length - 1 - i]) * weights[i];
  }
  const remainder = sum % 11;
  const expected = remainder <= 1 ? remainder : 11 - remainder;
  return { valid: checkDigit === expected, hasCheckDigit: true };
}
// ─────────────────────────────────────────────────────────────────────────

export default function CrearEmpresaCiiuFirst() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsViewed, setTermsViewed] = useState(false);
  const [policyViewed, setPolicyViewed] = useState(false);
  const bothDocsViewed = termsViewed && policyViewed;
  const [legalDialogOpen, setLegalDialogOpen] = useState(false);
  const [legalDialogType, setLegalDialogType] = useState<"terms" | "ip-policy" | "privacy">("terms");
  // Security states
  const [nitInvalidDialogOpen, setNitInvalidDialogOpen] = useState(false);
  const [emailVerifDialogOpen, setEmailVerifDialogOpen] = useState(false);
  const [verifyCodeInput, setVerifyCodeInput] = useState("");
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<CreateCompanyForm | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  const openLegalDialog = (type: "terms" | "ip-policy" | "privacy") => {
    setLegalDialogType(type);
    setLegalDialogOpen(true);
    if (type === "terms") setTermsViewed(true);
    if (type === "ip-policy") setPolicyViewed(true);
  };
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  useEffect(() => {
    if (user?.companyId) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const searchParams = new URLSearchParams(window.location.search);
  const urlWorkers = searchParams.get("workers");
  const storedWorkers = typeof window !== 'undefined' ? sessionStorage.getItem('sst_onboarding_workers') : null;
  const workersParam = urlWorkers || storedWorkers;
  const initialWorkers = workersParam ? parseInt(workersParam, 10) : 1;

  // Read all data sources first, before deciding the initial step
  const storedQuote = typeof window !== 'undefined' ? localStorage.getItem('sst_quote_data') : null;
  const quoteData = storedQuote ? (() => { try { return JSON.parse(storedQuote); } catch { return null; } })() : null;

  const regCompanyName = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_company_name') : null;
  const regEmail = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_email') : null;
  const regNit = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_nit') : null;
  const regCity = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_city') : null;
  const regCiiu = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_ciiu') : null;
  const regWorkers = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_workers') : null;
  const regVehicles = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_vehicles') : null;
  const regAddress = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_address') : null;
  const regPhone = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_phone') : null;
  const regRisk = typeof window !== 'undefined' ? localStorage.getItem('sst_registration_risk') : null;

  // Check if CIIU is available from ANY source (registration localStorage OR quote JWT)
  const hasRegistrationData = !!(regCiiu || quoteData?.ciiuCode);

  // Check if ALL required company data is available from any combination of sources
  const hasAllRegistrationData = !!(
    (regCiiu || quoteData?.ciiuCode) &&
    (regCompanyName || quoteData?.companyName) &&
    regNit &&
    regCity &&
    regAddress &&
    regPhone &&
    (regEmail || quoteData?.email)
  );

  const [currentStep, setCurrentStep] = useState(hasRegistrationData ? 2 : 1);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    sessionStorage.removeItem('sst_new_registration');
  }, []);

  const parsedRegWorkers = regWorkers ? parseInt(regWorkers, 10) : NaN;
  const parsedRegVehicles = regVehicles ? parseInt(regVehicles, 10) : NaN;

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: quoteData?.companyName || regCompanyName || "",
      nit: regNit || "",
      city: regCity || "",
      ciiuCode: quoteData?.ciiuCode || regCiiu || "",
      address: regAddress || "",
      contactPhone: regPhone || "",
      contactEmail: regEmail || "",
      numberOfWorkers: quoteData?.employees || (!isNaN(parsedRegWorkers) && parsedRegWorkers >= 1 ? parsedRegWorkers : (isNaN(initialWorkers) || initialWorkers < 1 ? 1 : initialWorkers)),
      riskLevel: (quoteData?.riskLevel || regRisk || "I") as "I" | "II" | "III" | "IV" | "V",
      numberOfVehicles: quoteData?.vehicles || (!isNaN(parsedRegVehicles) ? parsedRegVehicles : 0),
    },
  });

  // Pre-llenar email de contacto cuando el usuario esté disponible (fallback si no hay dato de registro)
  useEffect(() => {
    if (user?.email && !form.getValues("contactEmail")) {
      form.setValue("contactEmail", user.email);
    }
  }, [user, form]);

  const watchedWorkers = form.watch("numberOfWorkers");
  const watchedCiiu = form.watch("ciiuCode");
  const watchedRisk = form.watch("riskLevel");
  const watchedName = form.watch("name");
  const watchedNit = form.watch("nit");
  const watchedCity = form.watch("city");
  const watchedAddress = form.watch("address");
  const watchedPhone = form.watch("contactPhone");
  const watchedEmail = form.watch("contactEmail");
  const watchedVehicles = form.watch("numberOfVehicles");

  useEffect(() => {
    if (watchedCiiu) {
      const autoRisk = getRiskLevelFromCiiu(watchedCiiu);
      if (autoRisk) {
        form.setValue("riskLevel", autoRisk);
      }
    }
  }, [watchedCiiu, form]);

  const ciiuClassification = watchedCiiu ? getCiiuClassification(watchedCiiu) : null;
  const currentChapter = calculateChapter(watchedWorkers || 1, watchedRisk || "I");
  const currentChapterInfo = chapterInfo[currentChapter];
  const currentRiskInfo = riskLevelInfo[watchedRisk || "I"];
  const isHighRisk = watchedRisk === "IV" || watchedRisk === "V";
  const step1Valid = watchedCiiu && watchedWorkers && watchedWorkers >= 1;

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyForm) => {
      const payload: Record<string, any> = { ...data };
      if (quoteData) {
        if (quoteData.baseMonthlyPrice) payload.quoteBaseMonthlyPrice = quoteData.baseMonthlyPrice;
        if (quoteData.currentPeriodPrice) payload.quoteCurrentPeriodPrice = quoteData.currentPeriodPrice;
        if (quoteData.discountDurationMonths) payload.quoteDiscountDurationMonths = quoteData.discountDurationMonths;
        if (quoteData.couponCode) payload.quoteCouponCode = quoteData.couponCode;
        if (quoteData.referrerId) payload.quoteReferrerId = quoteData.referrerId;
      }
      const response = await apiRequest("POST", "/api/my-company", payload);
      return response.json();
    },
    onSuccess: (data) => {
      sessionStorage.removeItem('sst_onboarding_workers');
      localStorage.removeItem('sst_quote_data');
      localStorage.removeItem('sst_quote_token');
      localStorage.removeItem('sst_registration_company_name');
      localStorage.removeItem('sst_registration_email');
      localStorage.removeItem('sst_registration_username');
      localStorage.removeItem('sst_registration_nit');
      localStorage.removeItem('sst_registration_city');
      localStorage.removeItem('sst_registration_ciiu');
      localStorage.removeItem('sst_registration_workers');
      localStorage.removeItem('sst_registration_vehicles');
      localStorage.removeItem('sst_registration_address');
      localStorage.removeItem('sst_registration_phone');
      localStorage.removeItem('sst_registration_risk');
      toast({
        title: "¡Bienvenido a SST Colombia!",
        description: data.message || "Tu período de prueba de 7 días ha comenzado. Explora tu panel de control.",
      });
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      window.location.href = "/dashboard";
    },
    onError: (error: Error) => {
      toast({
        title: "Error al crear empresa",
        description: error.message || "No se pudo crear la empresa. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const sendVerificationCode = async (email: string) => {
    setIsSendingCode(true);
    try {
      const res = await apiRequest("POST", "/api/auth/send-verification", { email });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "No se pudo enviar el código");
      }
      toast({ title: "Código enviado", description: `Revisa tu correo ${email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSendingCode(false);
    }
  };

  const confirmVerificationCode = async () => {
    if (!pendingFormData) return;
    setIsVerifyingCode(true);
    try {
      const res = await apiRequest("POST", "/api/auth/verify-code", {
        email: pendingFormData.contactEmail,
        code: verifyCodeInput,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Código incorrecto");
      }
      setEmailVerified(true);
      setEmailVerifDialogOpen(false);
      createCompanyMutation.mutate(pendingFormData);
    } catch (err: any) {
      toast({ title: "Error de verificación", description: err.message, variant: "destructive" });
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleNitBlur = (nitValue: string) => {
    const clean = nitValue.replace(/[\s.\-]/g, '');
    if (clean.length < 9) return;
    const result = validateNIT(clean);
    if (result.hasCheckDigit && !result.valid) {
      setNitInvalidDialogOpen(true);
    }
  };

  const onSubmit = (data: CreateCompanyForm) => {
    // If email already verified (resend path), go directly
    if (emailVerified) {
      createCompanyMutation.mutate(data);
      return;
    }
    // Store form data and start email verification
    setPendingFormData(data);
    setVerifyCodeInput("");
    setEmailVerifDialogOpen(true);
    sendVerificationCode(data.contactEmail);
  };

  const goToStep2 = () => {
    if (step1Valid) {
      setCurrentStep(2);
    }
  };

  const goToStep1 = () => {
    setCurrentStep(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Building2 className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-onboarding">
            {currentStep === 1 
              ? "Identifica tu Actividad Económica" 
              : (hasAllRegistrationData && !editMode)
                ? "Confirma los Datos de tu Empresa"
                : "Completa los Datos de tu Empresa"}
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {currentStep === 1 
              ? "Tu código CIIU determina automáticamente el nivel de riesgo y los estándares que aplican según la Resolución 0312/2019"
              : (hasAllRegistrationData && !editMode)
                ? "Verifica que la información sea correcta antes de crear tu empresa"
                : "Información requerida para cumplir con la normativa colombiana en SST"}
          </p>
        </div>

        {!(hasAllRegistrationData && !editMode && currentStep === 2) && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              1
            </div>
            <div className={`w-16 h-1 rounded ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
              2
            </div>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <>
                <Card data-testid="card-step1-ciiu">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="h-5 w-5 text-primary" />
                      Paso 1: Actividad Económica y Trabajadores
                    </CardTitle>
                    <CardDescription>
                      Tu código CIIU determina automáticamente el nivel de riesgo según Decreto 1607/2002
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="ciiuCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-base">
                            <Briefcase className="h-4 w-4" />
                            Actividad Económica (CIIU) *
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-ciiu" className="h-12">
                                <SelectValue placeholder="Selecciona tu actividad económica principal" />
                              </SelectTrigger>
                            </FormControl>
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
                          <FormDescription>
                            Código CIIU según clasificación DANE - determina automáticamente tu nivel de riesgo
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numberOfWorkers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1 text-base">
                            <Users className="h-4 w-4" />
                            Número de Trabajadores *
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min={1}
                              placeholder="¿Cuántos trabajadores tiene tu empresa?" 
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => field.onChange(e.target.value === '' ? 1 : parseInt(e.target.value, 10))}
                              onBlur={() => { if (!field.value || field.value < 1) field.onChange(1); }}
                              data-testid="input-num-workers"
                              className="h-12 text-lg"
                            />
                          </FormControl>
                          <FormDescription>
                            Junto con el nivel de riesgo, determina cuántos estándares aplican (7, 21 o 61)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <input type="hidden" {...form.register("riskLevel")} />

                    {watchedCiiu && ciiuClassification && (
                      <Card className={`border-2 ${isHighRisk ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-950/20' : 'border-green-400 bg-green-50/50 dark:bg-green-950/20'}`} data-testid="card-risk-result">
                        <CardContent className="pt-6">
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-full ${isHighRisk ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                                <Shield className={`h-5 w-5 ${isHighRisk ? 'text-orange-600' : 'text-green-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-2">
                                  <h3 className="font-semibold">Nivel de Riesgo Calculado:</h3>
                                  <Badge variant="outline" className={`text-sm ${currentRiskInfo.color}`}>
                                    Riesgo {watchedRisk} - {currentRiskInfo.name}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-3">
                                  {ciiuClassification.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={currentChapterInfo.bgColor}>
                                    {currentChapterInfo.name}
                                  </Badge>
                                  <Badge variant="secondary">
                                    {currentChapterInfo.standards} estándares obligatorios
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    7 días gratis
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {isHighRisk && watchedCiiu && (
                      <Alert variant="destructive" className="border-orange-300 bg-orange-50 dark:bg-orange-950/30" data-testid="alert-high-risk">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Actividad de Alto Riesgo Detectada</AlertTitle>
                        <AlertDescription className="text-sm">
                          Las empresas con actividades de Riesgo IV o V deben cumplir con los <strong>61 estándares completos</strong> de la Resolución 0312/2019, independientemente del número de trabajadores. Esto incluye requisitos adicionales de vigilancia epidemiológica, programas de prevención y controles más estrictos.
                        </AlertDescription>
                      </Alert>
                    )}

                    {watchedCiiu && watchedRisk && pstTarifas[watchedRisk] && (
                      <div className="rounded-md border-2 border-green-600 bg-green-50 dark:bg-green-950/30 p-4 space-y-3" data-testid="card-pst-tarifa">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-full bg-green-100 dark:bg-green-900/40 shrink-0">
                            <UserCheck className="h-4 w-4 text-green-700 dark:text-green-400" />
                          </div>
                          <p className="font-bold text-green-800 dark:text-green-200 text-sm uppercase tracking-wide">
                            SAGDI sugiere un Profesional SST Aliado
                          </p>
                          <Badge className="bg-green-600 text-white text-xs shrink-0">Opcional</Badge>
                        </div>

                        <p className="text-sm text-green-900 dark:text-green-300 leading-relaxed">
                          Como parte de nuestro ecosistema, <strong>SST Colombia pone a tu disposición un Profesional en Seguridad y Salud en el Trabajo de confianza</strong>, vinculado a nuestra red de aliados. Este profesional conoce la plataforma, atiende tu empresa directamente y firma los documentos que exige la ley.
                        </p>

                        <div className="bg-white dark:bg-green-950/50 rounded border border-green-200 dark:border-green-800 p-3">
                          <p className="text-xs text-green-700 dark:text-green-400 mb-1">
                            Tarifa de referencia para tu empresa — {pstTarifas[watchedRisk].label}
                          </p>
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-2xl font-bold text-green-700 dark:text-green-300" data-testid="text-pst-precio">
                              {formatCOP(pstTarifas[watchedRisk].precio)}
                            </span>
                            <Badge variant="outline" className="text-xs border-green-500 text-green-700 dark:text-green-400">
                              Pago directo al Profesional · No a SAGDI
                            </Badge>
                          </div>
                        </div>

                        <div className="text-xs text-green-800 dark:text-green-400 space-y-1">
                          <p>✓ <strong>Sugerido por SAGDI</strong> — no es una imposición. Eres libre de contratar al profesional de tu preferencia.</p>
                          <p>✓ <strong>Dos pagos independientes:</strong> la suscripción a la plataforma se paga a SAGDI; los honorarios profesionales, directamente al Profesional SST.</p>
                          <p>✓ El profesional que gestione el software debe tener 5 años de carrera profesional certificada en SST, y licencia vigente.</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Button 
                  type="button" 
                  className="w-full" 
                  size="lg"
                  onClick={goToStep2}
                  disabled={!step1Valid}
                  data-testid="button-continue-step2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Card className={`border-2 ${currentChapterInfo.bgColor}`} data-testid="card-summary">
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        CIIU: {watchedCiiu}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {watchedWorkers} trabajadores
                      </Badge>
                      <Badge variant="outline" className={`text-xs ${currentRiskInfo.color}`}>
                        Riesgo {watchedRisk}
                      </Badge>
                      <Badge className={currentChapterInfo.bgColor}>
                        {currentChapterInfo.standards} estándares
                      </Badge>
                      {(watchedVehicles || 0) > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Truck className="h-3 w-3 mr-1" />
                          {watchedVehicles} vehículos (PESV)
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        <Sparkles className="h-3 w-3 mr-1" />
                        7 días gratis
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {hasAllRegistrationData && !editMode ? (
                  <Card data-testid="card-confirmation">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Datos de tu Empresa
                        </CardTitle>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditMode(true)}
                          data-testid="button-edit-data"
                        >
                          <Pencil className="mr-2 h-3 w-3" />
                          Editar datos
                        </Button>
                      </div>
                      <CardDescription>
                        Información registrada desde tu cuenta
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-xs text-muted-foreground">Nombre de la Empresa</p>
                          <p className="font-medium" data-testid="text-confirm-name">{watchedName}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">NIT</p>
                          <p className="font-medium" data-testid="text-confirm-nit">{watchedNit}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> Ciudad</p>
                          <p className="font-medium" data-testid="text-confirm-city">{watchedCity}</p>
                        </div>
                        <div className="md:col-span-2 space-y-1">
                          <p className="text-xs text-muted-foreground">Dirección</p>
                          <p className="font-medium" data-testid="text-confirm-address">{watchedAddress}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Teléfono</p>
                          <p className="font-medium" data-testid="text-confirm-phone">{watchedPhone}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Correo</p>
                          <p className="font-medium" data-testid="text-confirm-email">{watchedEmail}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Briefcase className="h-3 w-3" /> CIIU</p>
                          <p className="font-medium" data-testid="text-confirm-ciiu">{watchedCiiu}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><Users className="h-3 w-3" /> Trabajadores</p>
                          <p className="font-medium" data-testid="text-confirm-workers">{watchedWorkers}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                <Card data-testid="card-step2-company">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      Paso 2: Datos de la Empresa
                    </CardTitle>
                    <CardDescription>
                      Información requerida para cumplir con la Resolución 0312/2019
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Nombre de la Empresa *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Constructora ABC S.A.S." 
                                {...field} 
                                data-testid="input-company-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>NIT *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: 900123456-7" 
                                {...field}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/[\s.]/g, '');
                                  field.onChange(cleaned);
                                }}
                                onBlur={() => handleNitBlur(field.value)}
                                data-testid="input-nit"
                              />
                            </FormControl>
                            <FormDescription>
                              Número de Identificación Tributaria
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              Ciudad *
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-city">
                                  <SelectValue placeholder="Selecciona la ciudad" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {colombianCities.map((city) => (
                                  <SelectItem key={city} value={city}>
                                    {city}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dirección *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: Calle 100 # 15-20" 
                                {...field} 
                                data-testid="input-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              Teléfono de Contacto *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Ej: 3001234567" 
                                {...field} 
                                data-testid="input-contact-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              Correo de Contacto *
                            </FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Ej: empresa@correo.com" 
                                {...field} 
                                data-testid="input-contact-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
                )}

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    Tu período de prueba gratuito incluye:
                  </div>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                    <li>7 días de acceso completo a todas las funcionalidades</li>
                    <li>Sin necesidad de tarjeta de crédito</li>
                    <li>Soporte técnico incluido</li>
                  </ul>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      id="accept-terms" 
                      checked={acceptedTerms}
                      disabled={!bothDocsViewed}
                      onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                      data-testid="checkbox-accept-terms"
                      className="mt-0.5"
                    />
                    <Label 
                      htmlFor="accept-terms" 
                      className={`text-sm leading-relaxed ${bothDocsViewed ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                    >
                      Acepto los{" "}
                      <button
                        type="button"
                        className={`underline ${termsViewed ? 'text-muted-foreground' : 'text-primary font-semibold'} hover:text-primary/80`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLegalDialog("terms");
                        }}
                        data-testid="link-terms-of-service"
                      >
                        Términos de Servicio
                      </button>{" "}
                      y la{" "}
                      <button
                        type="button"
                        className={`underline ${policyViewed ? 'text-muted-foreground' : 'text-primary font-semibold'} hover:text-primary/80`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openLegalDialog("ip-policy");
                        }}
                        data-testid="link-ip-policy"
                      >
                        Política de Propiedad Intelectual
                      </button>{" "}
                      <span className="font-semibold">(DNDA 13-197-177)</span>
                    </Label>
                  </div>
                  {!bothDocsViewed && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 ml-6">
                      Debes abrir y leer los documentos antes de aceptar los términos
                    </p>
                  )}
                  {bothDocsViewed && !acceptedTerms && (
                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                      Debes aceptar los términos para continuar
                    </p>
                  )}
                </div>

                <div className="flex gap-3">
                  {editMode ? (
                    <Button 
                      type="button" 
                      variant="outline"
                      size="lg"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                      data-testid="button-cancel-edit"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  ) : (
                    <Button 
                      type="button" 
                      variant="outline"
                      size="lg"
                      onClick={goToStep1}
                      className="flex-1"
                      data-testid="button-back-step1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Volver
                    </Button>
                  )}
                  <Button 
                    type="submit" 
                    className="flex-[2]" 
                    size="lg"
                    disabled={createCompanyMutation.isPending || !acceptedTerms}
                    data-testid="button-create-company"
                  >
                    {createCompanyMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando empresa...
                      </>
                    ) : (
                      <>
                        <Building2 className="mr-2 h-4 w-4" />
                        Crear Empresa y Comenzar Prueba
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </form>
        </Form>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>
            Al crear tu empresa, aceptas los{" "}
            <button
              type="button"
              className="underline hover:text-foreground font-medium"
              onClick={() => openLegalDialog("terms")}
              data-testid="link-terms-register"
            >
              Términos de Servicio
            </button>,{" "}
            la{" "}
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => openLegalDialog("privacy")}
              data-testid="link-privacy-register"
            >
              Política de Privacidad
            </button>{" "}
            y la{" "}
            <button
              type="button"
              className="underline hover:text-foreground"
              onClick={() => openLegalDialog("ip-policy")}
              data-testid="link-intellectual-property-register"
            >
              Política de Propiedad Intelectual
            </button>
          </p>
          <p className="text-muted-foreground/70">
            SST Colombia - Todos los derechos reservados
          </p>
        </div>
      </div>

      <Dialog open={legalDialogOpen} onOpenChange={setLegalDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0" data-testid="dialog-legal-document">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center gap-2">
              {legalDialogType === "privacy" ? (
                <Shield className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-primary shrink-0" />
              )}
              <DialogTitle className="text-xl">
                {legalDialogType === "terms" && "Términos y Condiciones de Servicio"}
                {legalDialogType === "ip-policy" && "Propiedad Intelectual y Protección de Activos Digitales"}
                {legalDialogType === "privacy" && "Política de Privacidad"}
              </DialogTitle>
            </div>
            <DialogDescription>
              SST Colombia - Última actualización: 11 de noviembre de 2025
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-4" data-testid="dialog-legal-scroll-area">
            <div className="space-y-6 text-sm">
              {legalDialogType === "terms" && (
                <>
                  <section>
                    <h2 className="text-lg font-semibold mb-3">1. Aceptación de los Términos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Al acceder y utilizar la plataforma SST Colombia (en adelante, "la Plataforma"), 
                      el usuario (en adelante, "el Cliente") acepta estar obligado por estos Términos y 
                      Condiciones de Servicio, todas las leyes y regulaciones aplicables, y acepta que es 
                      responsable del cumplimiento de todas las leyes locales aplicables.
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">2. Definiciones</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>2.1 Plataforma:</strong> Sistema web SST Colombia para gestión de Sistemas de Gestión de Seguridad y Salud en el Trabajo (SG-SST).</p>
                      <p><strong>2.2 Cliente:</strong> Empresa o persona jurídica que contrata los servicios de la Plataforma.</p>
                      <p><strong>2.3 Usuario:</strong> Persona autorizada por el Cliente para acceder a la Plataforma.</p>
                      <p><strong>2.4 Datos Personales:</strong> Información de trabajadores y empleados almacenada en la Plataforma según Ley 1581/2012.</p>
                      <p><strong>2.5 SG-SST:</strong> Sistema de Gestión de la Seguridad y Salud en el Trabajo según Decreto 1072/2015.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">3. Descripción del Servicio</h2>
                    <div className="space-y-3 text-muted-foreground">
                      <p><strong>3.1 Servicios Incluidos:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Gestión de información de trabajadores y datos ocupacionales</li>
                        <li>Registro y seguimiento de accidentes e incidentes laborales (FURAT/FUREL)</li>
                        <li>Matrices de identificación de peligros y evaluación de riesgos (IPERC)</li>
                        <li>Gestión de capacitaciones y exámenes médicos ocupacionales</li>
                        <li>Auditorías internas y revisiones por dirección</li>
                        <li>Dashboards ejecutivos del ciclo PHVA</li>
                        <li>Generación de reportes normativos para autoridades competentes</li>
                        <li>Almacenamiento seguro en la nube con respaldos diarios</li>
                      </ul>
                      <p><strong>3.2 Nivel de Servicio:</strong></p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Disponibilidad objetivo: 99.5% mensual</li>
                        <li>Mantenimientos programados: Se notificarán con 48 horas de anticipación</li>
                        <li>Soporte técnico: Horario laboral Colombia (Lunes a Viernes 8:00-17:00)</li>
                      </ul>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">4. Obligaciones del Cliente</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>4.1 Uso Apropiado:</strong> El Cliente se compromete a usar la Plataforma exclusivamente para fines relacionados con la gestión de SST conforme a la legislación colombiana.</p>
                      <p><strong>4.2 Información Veraz:</strong> El Cliente garantiza que toda la información ingresada en la Plataforma es veraz, actualizada y completa.</p>
                      <p><strong>4.3 Seguridad de Credenciales:</strong> El Cliente es responsable de mantener la confidencialidad de sus credenciales de acceso.</p>
                      <p><strong>4.4 Cumplimiento Legal:</strong> El Cliente se compromete a cumplir con toda la normatividad SST colombiana vigente.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">5. Propiedad Intelectual</h2>
                    <div className="space-y-3 text-muted-foreground">
                      <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                        <p><strong>5.1 PROPIEDAD INTELECTUAL:</strong> El Software, incluyendo su código fuente, arquitectura de datos, interfaces de usuario, diseños, y la metodología de filtrado lógico de estándares, son propiedad exclusiva de SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                      </div>
                      <p><strong>5.2 Registro Legal:</strong> Protegidos por las leyes de derecho de autor con registro oficial ante la DNDA bajo el número 13-197-177.</p>
                      <p><strong>5.3 Licencia de Uso:</strong> Se otorga al Cliente una licencia no exclusiva, no transferible y revocable.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">6. Protección de Datos Personales</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>6.1 Marco Legal:</strong> El tratamiento se rige por la Ley 1581 de 2012, Decreto 1377 de 2013 y el GDPR.</p>
                      <p><strong>6.2</strong> El Cliente actúa como Responsable del Tratamiento de los datos personales de sus trabajadores.</p>
                      <p><strong>6.3</strong> SST Colombia actúa como Encargado del Tratamiento bajo instrucciones documentadas del Cliente.</p>
                      <p><strong>6.6 Seguridad:</strong> Cifrado TLS 1.3 y AES-256, RBAC, auditoría completa, respaldos diarios encriptados.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">7. Tarifas y Pagos</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>7.1</strong> Los servicios se facturan mensualmente o anualmente según el plan contratado.</p>
                      <p><strong>7.3</strong> Renovación automática salvo notificación de cancelación con 30 días de anticipación.</p>
                      <p><strong>7.5</strong> SST Colombia se reserva el derecho de suspender el acceso tras 15 días de mora en el pago.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">8-13. Disposiciones Adicionales</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Cancelación:</strong> El Cliente puede cancelar con 30 días de anticipación. Tras terminación, tiene 30 días para exportar sus datos.</p>
                      <p><strong>Limitación de Responsabilidad:</strong> La Plataforma se proporciona "tal cual". SST Colombia no será responsable por daños indirectos superiores al monto pagado en los últimos 12 meses.</p>
                      <p><strong>Ley Aplicable:</strong> Estos Términos se rigen por las leyes de la República de Colombia. Jurisdicción: Bogotá D.C.</p>
                      <p><strong>Modificaciones:</strong> Los cambios materiales se notificarán por correo electrónico con 30 días de anticipación.</p>
                    </div>
                  </section>
                  <Separator />
                  <section className="bg-muted/50 p-4 rounded-lg">
                    <h2 className="text-lg font-semibold mb-3">Declaración de Aceptación</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      <strong>AL CREAR UNA CUENTA Y UTILIZAR LA PLATAFORMA SST COLOMBIA, USTED RECONOCE HABER LEÍDO, 
                      COMPRENDIDO Y ACEPTADO ESTOS TÉRMINOS Y CONDICIONES DE SERVICIO EN SU TOTALIDAD.</strong>
                    </p>
                  </section>
                </>
              )}

              {legalDialogType === "ip-policy" && (
                <>
                  <section>
                    <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
                      <p className="text-muted-foreground"><strong>PROPIEDAD INTELECTUAL:</strong> El Cliente reconoce y acepta que el Software, incluyendo pero no limitado a su código fuente, arquitectura de datos, interfaces de usuario, diseños, y muy especialmente <strong>la metodología de filtrado lógico de estándares y la curaduría legal de contenidos basada en la Resolución 0312 de 2019</strong>, son propiedad exclusiva de SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Registro Legal</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Dichos activos se encuentran protegidos por las leyes de derecho de autor y tratados internacionales, contando con el <strong>registro oficial ante la Dirección Nacional de Derecho de Autor (DNDA) bajo el número 13-197-177</strong>.
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Licencia de Uso</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Se otorga al Cliente una licencia no exclusiva, no transferible y revocable para usar la Plataforma durante la vigencia del contrato.
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Propiedad de Datos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Los datos ingresados por el Cliente permanecen como propiedad del Cliente. SST Colombia actúa únicamente como procesador de datos según GDPR Art. 28 y Ley 1581/2012.
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/30">
                      <p className="font-semibold text-destructive mb-2">PROHIBICIÓN DE INGENIERÍA INVERSA</p>
                      <p className="text-muted-foreground mb-2">Queda expresamente prohibido al Cliente, a sus empleados, contratistas o cualquier tercero relacionado:</p>
                      <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                        <li>Intentar descompilar, descifrar o realizar ingeniería inversa para extraer la lógica de asignación de estándares.</li>
                        <li>Utilizar scripts, "bots" o técnicas de scraping para la extracción masiva de la base de datos de estándares curados.</li>
                        <li>Duplicar la estructura funcional del software para el desarrollo de productos competidores.</li>
                        <li>Copiar, modificar, distribuir o crear obras derivadas del Software sin autorización expresa.</li>
                      </ul>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/30">
                      <p className="text-muted-foreground"><strong>Consecuencias por Infracción:</strong> Cualquier infracción dará lugar a las <strong>acciones civiles y penales correspondientes</strong> conforme a la Ley 23 de 1982 (Derechos de Autor) y Código Penal Colombiano, así como a la <strong>terminación inmediata del servicio sin lugar a reembolsos</strong>.</p>
                    </div>
                  </section>
                </>
              )}

              {legalDialogType === "privacy" && (
                <>
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Política de Privacidad y Protección de Datos</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      SISTEMA AUTOMATIZADO DE GESTIÓN INTEGRAL S.A.S. se compromete a proteger la privacidad de los usuarios de la plataforma, en cumplimiento de la Ley 1581 de 2012 (Ley de Protección de Datos Personales) y su Decreto Reglamentario 1377 de 2013.
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Datos que Recopilamos</h2>
                    <div className="space-y-2 text-muted-foreground">
                      <p><strong>Datos de la Empresa:</strong> Razón social, NIT, dirección, teléfono, correo electrónico, número de trabajadores, código CIIU, nivel de riesgo ARL.</p>
                      <p><strong>Datos de Trabajadores:</strong> Nombres, identificación, cargos, datos de contacto, información de salud ocupacional, historial de capacitaciones.</p>
                      <p><strong>Datos de Uso:</strong> Registros de acceso, acciones realizadas en la plataforma, información técnica del dispositivo.</p>
                    </div>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Finalidades del Tratamiento</h2>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Gestión del Sistema de Seguridad y Salud en el Trabajo (SG-SST)</li>
                      <li>Cumplimiento de obligaciones legales (Resolución 0312/2019, Decreto 1072/2015)</li>
                      <li>Generación de reportes para autoridades competentes</li>
                      <li>Mejora continua del servicio y soporte técnico</li>
                    </ul>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Medidas de Seguridad</h2>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Cifrado de datos en tránsito (TLS 1.3) y en reposo (AES-256-GCM)</li>
                      <li>Control de acceso basado en roles (RBAC) con múltiples niveles de autorización</li>
                      <li>Auditoría completa de operaciones sobre datos regulados</li>
                      <li>Respaldos diarios encriptados con retención de 20 años</li>
                      <li>Derivación de claves por campo para datos sensibles</li>
                    </ul>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Derechos del Titular</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Conforme a la Ley 1581/2012, los titulares de datos personales tienen derecho a: Acceso, Rectificación, Cancelación y Oposición (derechos ARCO). Para ejercer estos derechos, contactar a: dpo@sst-colombia.com
                    </p>
                  </section>
                  <Separator />
                  <section>
                    <h2 className="text-lg font-semibold mb-3">Contacto</h2>
                    <div className="space-y-1 text-muted-foreground">
                      <p><strong>Oficial de Protección de Datos:</strong> dpo@sst-colombia.com</p>
                      <p><strong>Soporte:</strong> soporte@sst-colombia.com</p>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
          <div className="px-6 py-4 border-t shrink-0 flex justify-end">
            <Button
              variant="default"
              onClick={() => setLegalDialogOpen(false)}
              data-testid="button-close-legal-dialog"
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: NIT inválido ─────────────────────────────────────── */}
      <Dialog open={nitInvalidDialogOpen} onOpenChange={setNitInvalidDialogOpen}>
        <DialogContent className="max-w-md" data-testid="dialog-nit-invalid">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              NIT no válido
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              El NIT ingresado no supera la validación oficial de la DIAN. Es posible que el número esté incompleto o tenga un error.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/50 rounded-md p-4 space-y-2 text-sm">
            <p className="font-medium">¿Necesitas un presupuesto o tienes dudas?</p>
            <p className="text-muted-foreground">Contáctanos directamente y te ayudamos a configurar tu empresa:</p>
            <a
              href="mailto:admin@sst-colombia.com"
              className="flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Mail className="h-4 w-4" />
              admin@sst-colombia.com
            </a>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setNitInvalidDialogOpen(false)} data-testid="button-nit-dialog-close">
              Corregir NIT
            </Button>
            <Button
              variant="default"
              onClick={() => { setNitInvalidDialogOpen(false); }}
              data-testid="button-nit-dialog-continue"
            >
              Continuar de todas formas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Dialog: Verificación de correo ──────────────────────────── */}
      <Dialog open={emailVerifDialogOpen} onOpenChange={(open) => { if (!isVerifyingCode) setEmailVerifDialogOpen(open); }}>
        <DialogContent className="max-w-sm" data-testid="dialog-email-verif">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Verifica tu correo
            </DialogTitle>
            <DialogDescription className="text-sm pt-1">
              Enviamos un código de 6 dígitos a{" "}
              <strong className="text-foreground">{pendingFormData?.contactEmail}</strong>.
              Revisa tu bandeja de entrada (y spam).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="_ _ _ _ _ _"
              maxLength={6}
              value={verifyCodeInput}
              onChange={(e) => setVerifyCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="text-center text-2xl font-bold tracking-widest h-14"
              data-testid="input-verification-code"
              onKeyDown={(e) => { if (e.key === 'Enter' && verifyCodeInput.length === 6) confirmVerificationCode(); }}
            />

            <Button
              className="w-full"
              onClick={confirmVerificationCode}
              disabled={verifyCodeInput.length !== 6 || isVerifyingCode}
              data-testid="button-confirm-code"
            >
              {isVerifyingCode ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Verificando...</>
              ) : (
                <><CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar código</>
              )}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                disabled={isSendingCode || !pendingFormData}
                onClick={() => pendingFormData && sendVerificationCode(pendingFormData.contactEmail)}
                data-testid="button-resend-code"
              >
                {isSendingCode ? (
                  <><RefreshCw className="h-3.5 w-3.5 mr-1 animate-spin" /> Enviando...</>
                ) : (
                  <><RefreshCw className="h-3.5 w-3.5 mr-1" /> Reenviar código</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
