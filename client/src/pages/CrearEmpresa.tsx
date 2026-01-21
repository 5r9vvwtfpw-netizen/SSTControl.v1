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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Building2, CheckCircle2, Loader2, Shield, MapPin, Phone, Mail, Sparkles, Briefcase, ArrowRight, ArrowLeft, AlertTriangle, Users, Factory } from "lucide-react";
import type { User } from "@shared/schema";
import { calculateChapter } from "@shared/utils";
import { CIIU_CODES, CIIU_SECTIONS } from "@/lib/ciiu-codes";
import { getRiskLevelFromCiiu, getCiiuClassification } from "@shared/ciiu-risk-classification";

// Información de estándares según Resolución 0312/2019 - basado en trabajadores y riesgo
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

// Información de niveles de riesgo
const riskLevelInfo: Record<string, { name: string; description: string; color: string }> = {
  "I": { name: "Riesgo Mínimo", description: "Actividades de oficina, comercio menor", color: "text-green-600 dark:text-green-400" },
  "II": { name: "Riesgo Bajo", description: "Servicios, educación, comercio", color: "text-blue-600 dark:text-blue-400" },
  "III": { name: "Riesgo Medio", description: "Manufactura liviana, transporte", color: "text-yellow-600 dark:text-yellow-400" },
  "IV": { name: "Riesgo Alto", description: "Construcción, agricultura, industria", color: "text-orange-600 dark:text-orange-400" },
  "V": { name: "Riesgo Máximo", description: "Minería, trabajo en alturas, explosivos", color: "text-red-600 dark:text-red-400" }
};

// Lista de ciudades principales de Colombia para documentos oficiales
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
  nit: z.string().min(9, "El NIT debe tener al menos 9 caracteres").max(15, "El NIT no puede tener más de 15 caracteres"),
  city: z.string().min(1, "La ciudad es obligatoria"),
  ciiuCode: z.string().min(1, "El código CIIU es obligatorio"),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  contactPhone: z.string().min(7, "El teléfono debe tener al menos 7 dígitos"),
  contactEmail: z.string().email("Debe ser un correo electrónico válido"),
  numberOfWorkers: z.coerce.number().min(1, "Debe tener al menos 1 trabajador"),
  riskLevel: z.enum(["I", "II", "III", "IV", "V"]).default("I"),
});

type CreateCompanyForm = z.infer<typeof createCompanySchema>;

export default function CrearEmpresa() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Get current user
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Leer parámetro workers desde URL o sessionStorage (desde página de marketing)
  const searchParams = new URLSearchParams(window.location.search);
  const urlWorkers = searchParams.get("workers");
  const storedWorkers = typeof window !== 'undefined' ? sessionStorage.getItem('sst_onboarding_workers') : null;
  const workersParam = urlWorkers || storedWorkers;
  const initialWorkers = workersParam ? parseInt(workersParam, 10) : 1;

  useEffect(() => {
    sessionStorage.removeItem('sst_new_registration');
  }, []);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: "",
      nit: "",
      city: "",
      ciiuCode: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      numberOfWorkers: isNaN(initialWorkers) || initialWorkers < 1 ? 1 : initialWorkers,
      riskLevel: "I",
    },
  });

  // Watch form values for real-time chapter calculation
  const watchedWorkers = form.watch("numberOfWorkers");
  const watchedCiiu = form.watch("ciiuCode");
  const watchedRisk = form.watch("riskLevel");

  // Auto-calculate risk level from CIIU code
  useEffect(() => {
    if (watchedCiiu) {
      const autoRisk = getRiskLevelFromCiiu(watchedCiiu);
      if (autoRisk) {
        form.setValue("riskLevel", autoRisk);
      }
    }
  }, [watchedCiiu, form]);

  // Get CIIU classification details
  const ciiuClassification = watchedCiiu ? getCiiuClassification(watchedCiiu) : null;
  
  // Calculate chapter dynamically based on current form values (Resolución 0312/2019)
  const currentChapter = calculateChapter(watchedWorkers || 1, watchedRisk || "I");
  const currentChapterInfo = chapterInfo[currentChapter];
  const currentRiskInfo = riskLevelInfo[watchedRisk || "I"];

  // Check if high risk (IV or V)
  const isHighRisk = watchedRisk === "IV" || watchedRisk === "V";

  // Validate step 1 fields
  const step1Valid = watchedCiiu && watchedWorkers && watchedWorkers >= 1;

  const createCompanyMutation = useMutation({
    mutationFn: async (data: CreateCompanyForm) => {
      const response = await apiRequest("POST", "/api/my-company", data);
      return response.json();
    },
    onSuccess: (data) => {
      // Limpiar sessionStorage del onboarding
      sessionStorage.removeItem('sst_onboarding_workers');
      
      toast({
        title: "¡Bienvenido a SST Colombia!",
        description: data.message || "Tu período de prueba de 7 días ha comenzado. Explora tu panel de control.",
      });
      
      // CRITICAL: Update user cache immediately with the new companyId
      // This prevents ProtectedRoute from redirecting back to /crear-empresa
      if (data.user) {
        queryClient.setQueryData(["/api/user"], data.user);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/company/current"] });
      
      // Navigate to dashboard using window.location for full page reload
      // This ensures all state is fresh
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear empresa",
        description: error.message || "No se pudo crear la empresa. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCompanyForm) => {
    createCompanyMutation.mutate(data);
  };

  const handleNextStep = () => {
    if (step1Valid) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
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
            Configura tu Empresa
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {currentStep === 1 
              ? "Primero, identifica tu actividad económica para determinar los estándares que aplican"
              : "Ahora completa los datos de tu empresa"
            }
          </p>
          
          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className={`h-2 w-16 rounded-full transition-colors ${currentStep >= 1 ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`h-2 w-16 rounded-full transition-colors ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
          </div>
          <p className="text-xs text-muted-foreground">
            Paso {currentStep} de 2
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            
            {/* PASO 1: CIIU + Trabajadores */}
            {currentStep === 1 && (
              <Card data-testid="card-step1-ciiu">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Factory className="h-5 w-5 text-primary" />
                    Actividad Económica y Tamaño
                  </CardTitle>
                  <CardDescription>
                    Con esta información determinamos los estándares SST obligatorios según Resolución 0312/2019
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* CIIU Code - PRIMERO */}
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

                  {/* Número de Trabajadores - SEGUNDO */}
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
                            onChange={(e) => field.onChange(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            onBlur={() => { if (field.value == null || isNaN(field.value)) field.onChange(1); }}
                            data-testid="input-num-workers"
                            className="h-12 text-lg"
                          />
                        </FormControl>
                        <FormDescription>
                          Total de trabajadores directos e indirectos
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Resultado: Nivel de Riesgo Calculado */}
                  {watchedCiiu && (
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Resultado del Análisis
                      </h3>
                      
                      {/* CIIU Info */}
                      {ciiuClassification && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-primary/10 shrink-0">
                              <Briefcase className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{ciiuClassification.description}</p>
                              <p className="text-sm text-muted-foreground">Código CIIU: {ciiuClassification.code}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Risk Level - Auto-calculated */}
                      <div className={`p-4 rounded-lg border-2 ${isHighRisk ? 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30' : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/30'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full shrink-0 ${isHighRisk ? 'bg-orange-100 dark:bg-orange-900' : 'bg-green-100 dark:bg-green-900'}`}>
                            <Shield className={`h-4 w-4 ${currentRiskInfo.color}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold ${currentRiskInfo.color}`}>
                                Nivel {watchedRisk} - {currentRiskInfo.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                Decreto 1607/2002
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{currentRiskInfo.description}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              Calculado automáticamente según tu código CIIU
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Alert for High Risk */}
                      {isHighRisk && (
                        <Alert variant="destructive" className="border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-200">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Actividad de Alto Riesgo</AlertTitle>
                          <AlertDescription>
                            Por tener una actividad económica clasificada como Riesgo {watchedRisk}, 
                            tu empresa debe cumplir con los <strong>61 estándares completos</strong> del SG-SST,
                            sin importar el número de trabajadores. Esto es un requisito legal según la Resolución 0312/2019.
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Chapter / Standards Info */}
                      <Card className={`border-2 ${currentChapterInfo.bgColor}`} data-testid="card-calculated-chapter">
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-full bg-primary/10">
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`font-bold text-lg ${currentChapterInfo.color}`}>
                                    {currentChapterInfo.standards} Estándares Obligatorios
                                  </h3>
                                </div>
                                <p className="text-sm font-medium">{currentChapterInfo.name}</p>
                                <p className="text-sm text-muted-foreground">{currentChapterInfo.description}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Trial badge */}
                      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">7 días de prueba gratuita incluidos</span>
                      </div>
                    </div>
                  )}

                  {/* Button to continue */}
                  <Button 
                    type="button"
                    onClick={handleNextStep}
                    disabled={!step1Valid}
                    className="w-full"
                    size="lg"
                    data-testid="button-next-step"
                  >
                    Continuar con Datos de Empresa
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* PASO 2: Datos de la Empresa */}
            {currentStep === 2 && (
              <Card data-testid="card-step2-company">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        Datos de la Empresa
                      </CardTitle>
                      <CardDescription>
                        Información requerida para cumplir con la Resolución 0312/2019
                      </CardDescription>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handlePrevStep}
                      data-testid="button-prev-step"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Volver
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Summary of Step 1 */}
                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <h4 className="font-medium text-sm">Resumen de tu clasificación:</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        CIIU: {watchedCiiu}
                      </Badge>
                      <Badge variant="secondary">
                        {watchedWorkers} trabajadores
                      </Badge>
                      <Badge className={`${isHighRisk ? 'bg-orange-100 text-orange-800 hover:bg-orange-100 dark:bg-orange-900 dark:text-orange-200' : 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200'}`}>
                        Riesgo {watchedRisk}
                      </Badge>
                      <Badge variant="outline" className={currentChapterInfo.color}>
                        {currentChapterInfo.standards} estándares
                      </Badge>
                    </div>
                  </div>

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
                          <FormDescription>
                            Para documentos oficiales del SG-SST
                          </FormDescription>
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

                  {/* Hidden risk level field - auto-calculated */}
                  <input type="hidden" {...form.register("riskLevel")} />

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
                        onCheckedChange={(checked) => setAcceptedTerms(checked === true)}
                        data-testid="checkbox-accept-terms"
                        className="mt-0.5"
                      />
                      <Label 
                        htmlFor="accept-terms" 
                        className="text-sm leading-relaxed cursor-pointer"
                      >
                        Acepto los{" "}
                        <a 
                          href="/terminos-servicio" 
                          target="_blank" 
                          className="text-primary underline hover:text-primary/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Términos de Servicio
                        </a>{" "}
                        y la{" "}
                        <a 
                          href="/terminos-servicio#propiedad-intelectual" 
                          target="_blank" 
                          className="text-primary underline hover:text-primary/80"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Política de Propiedad Intelectual
                        </a>{" "}
                        <span className="font-semibold">(DNDA 13-197-177)</span>
                      </Label>
                    </div>
                    {!acceptedTerms && (
                      <p className="text-xs text-muted-foreground mt-2 ml-6">
                        Debes aceptar los términos para continuar
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
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
                </CardContent>
              </Card>
            )}
          </form>
        </Form>

        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>
            Al crear tu empresa, aceptas los{" "}
            <a 
              href="/terminos-servicio" 
              target="_blank"
              className="underline hover:text-foreground font-medium"
              data-testid="link-terms-register"
            >
              Términos de Servicio
            </a>,{" "}
            la{" "}
            <a 
              href="/politica-privacidad" 
              target="_blank"
              className="underline hover:text-foreground"
              data-testid="link-privacy-register"
            >
              Política de Privacidad
            </a>{" "}
            y la{" "}
            <a 
              href="/terminos-servicio#propiedad-intelectual" 
              target="_blank"
              className="underline hover:text-foreground font-medium"
              data-testid="link-ip-register"
            >
              Política de Propiedad Intelectual (DNDA 13-197-177)
            </a>
          </p>
          <p className="text-muted-foreground/70">
            © 2026 SST Colombia | Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}
